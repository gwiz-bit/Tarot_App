import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { z } from "zod";
import type { AiDebug, ProviderName } from "../ai-metadata";
import { ProviderFailure, ValidationFailure } from "./errors";
import { ProviderHealth } from "./health/provider-health";
import type { AIProvider, AiTask } from "./providers/types";
import { groqProvider } from "./providers/groq";
import { geminiProvider } from "./providers/gemini";

type RoutingMode = "balanced" | "groq_primary" | "gemini_primary";
type Session = {
  id: string;
  preferredProvider: ProviderName;
  activeProvider: ProviderName;
  currentProvider: ProviderName | "local";
  requestCount: number;
  cacheHits: number;
  failoverCount: number;
  expiresAt: number;
};
type Outcome = { value: object; provider: ProviderName | "local" };
type Pending = {
  promise: Promise<Outcome>;
  controller: AbortController;
  subscribers: number;
};
type RouterOptions = {
  enabled: boolean;
  mode: RoutingMode;
  demo: boolean;
  debug: boolean;
  now?: () => number;
  providers: Record<ProviderName, AIProvider>;
};
type Operation<S extends z.ZodType, R extends object> = {
  task: AiTask;
  sessionId?: string;
  fingerprint: string;
  schema: S;
  data: unknown;
  systemInstruction: string;
  maxOutputTokens: number;
  transform: (value: z.infer<S>) => R;
  local: (reason: "disabled" | "unavailable") => R;
  signal?: AbortSignal;
};

/** One process owns rotation, health, bounded caches and reading assignments. */
export class AiRouter {
  readonly health: ProviderHealth;
  private readonly now: () => number;
  private next: ProviderName = "groq";
  private sessions = new Map<string, Session>();
  private cache = new Map<
    string,
    Outcome & { expiresAt: number; bytes: number }
  >();
  private cacheBytes = 0;
  private pending = new Map<string, Pending>();
  private inFlight = 0;
  constructor(private readonly options: RouterOptions) {
    this.now = options.now ?? Date.now;
    this.health = new ProviderHealth(
      {
        groq: options.enabled && options.providers.groq.configured(),
        gemini: options.enabled && options.providers.gemini.configured(),
      },
      this.now,
    );
  }

  refreshProviders(providers: RouterOptions["providers"]) {
    this.options.providers = providers;
  }

  private getSession(
    id: string = randomUUID(),
    cachedProvider?: ProviderName,
  ): Session {
    for (const [key, entry] of this.sessions)
      if (entry.expiresAt <= this.now()) this.sessions.delete(key);
    let session = this.sessions.get(id);
    if (!session) {
      let provider = cachedProvider;
      if (!provider) {
        const primary =
          this.options.mode === "groq_primary" ? "groq" : "gemini";
        const first = this.options.mode === "balanced" ? this.next : primary;
        const second = first === "groq" ? "gemini" : "groq";
        provider = this.health.eligible(first)
          ? first
          : this.health.eligible(second)
            ? second
            : first;
        if (this.options.mode === "balanced")
          this.next = provider === "groq" ? "gemini" : "groq";
      }
      session = {
        id,
        preferredProvider: provider,
        activeProvider: provider,
        currentProvider: "local",
        requestCount: 0,
        cacheHits: 0,
        failoverCount: 0,
        expiresAt: 0,
      };
    }
    session.expiresAt = this.now() + 24 * 60 * 60 * 1000;
    this.sessions.delete(id);
    this.sessions.set(id, session);
    while (this.sessions.size > 512)
      this.sessions.delete(this.sessions.keys().next().value!);
    return session;
  }

  private decorate<R extends object>(
    outcome: Outcome,
    session: Session,
    cacheHit = false,
    deduplicated = false,
  ) {
    session.currentProvider = outcome.provider;
    const aiDebug: AiDebug = {
      provider: session.currentProvider,
      health: {
        groq: this.health.snapshot("groq"),
        gemini: this.health.snapshot("gemini"),
      },
      requestCount: session.requestCount,
      cacheHits: session.cacheHits,
      failoverCount: session.failoverCount,
      cacheHit,
      deduplicated,
    };
    return {
      ...outcome.value,
      readingSessionId: session.id,
      ...(this.options.debug ? { aiDebug } : {}),
    } as R & { readingSessionId: string; aiDebug?: AiDebug };
  }

  private remember(key: string, outcome: Outcome) {
    if (
      outcome.provider === "local" ||
      !("source" in outcome.value) ||
      outcome.value.source !== "ai"
    )
      return;
    const bytes = Buffer.byteLength(JSON.stringify(outcome.value));
    const old = this.cache.get(key);
    if (old) this.cacheBytes -= old.bytes;
    this.cache.delete(key);
    this.cache.set(key, {
      ...outcome,
      bytes,
      expiresAt: this.now() + 30 * 60 * 1000,
    });
    this.cacheBytes += bytes;
    while (this.cache.size > 256 || this.cacheBytes > 2 * 1024 * 1024) {
      const first = this.cache.keys().next().value!;
      this.cacheBytes -= this.cache.get(first)!.bytes;
      this.cache.delete(first);
    }
  }

  async run<S extends z.ZodType, R extends object>(operation: Operation<S, R>) {
    operation.signal?.throwIfAborted();
    const key = createHash("sha256")
      .update(operation.fingerprint)
      .digest("hex");
    const cached = this.options.enabled ? this.cache.get(key) : undefined;
    if (cached && cached.expiresAt > this.now()) {
      const session = this.getSession(
        operation.sessionId,
        cached.provider === "local" ? undefined : cached.provider,
      );
      session.cacheHits++;
      this.cache.delete(key);
      this.cache.set(key, cached);
      return this.decorate<R>(cached, session, true);
    }
    if (cached) {
      this.cache.delete(key);
      this.cacheBytes -= cached.bytes;
    }
    const session = this.getSession(operation.sessionId);
    let pending = this.pending.get(key);
    const deduplicated = Boolean(pending);
    if (!pending) {
      const controller = new AbortController();
      const entry: Pending = {
        controller,
        subscribers: 0,
        promise: Promise.resolve({ value: {}, provider: "local" }),
      };
      entry.promise = this.execute(operation, session, controller.signal)
        .then((outcome) => {
          if (!controller.signal.aborted) this.remember(key, outcome);
          return outcome;
        })
        .finally(() => {
          if (this.pending.get(key) === entry) this.pending.delete(key);
        });
      this.pending.set(key, entry);
      pending = entry;
    }
    const outcome = await this.subscribe(pending, key, operation.signal);
    if (
      deduplicated &&
      session.requestCount === 0 &&
      outcome.provider !== "local"
    )
      session.activeProvider = outcome.provider;
    if (deduplicated) session.cacheHits++;
    return this.decorate<R>(outcome, session, false, deduplicated);
  }

  private subscribe(
    pending: Pending,
    key: string,
    signal?: AbortSignal,
  ): Promise<Outcome> {
    pending.subscribers++;
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (cancelled = false) => {
        if (settled) return false;
        settled = true;
        signal?.removeEventListener("abort", abort);
        pending.subscribers--;
        if (cancelled && pending.subscribers === 0) {
          pending.controller.abort();
          if (this.pending.get(key) === pending) this.pending.delete(key);
        }
        return true;
      };
      const abort = () => {
        if (finish(true)) reject(new DOMException("Cancelled", "AbortError"));
      };
      if (signal?.aborted) {
        abort();
        return;
      }
      signal?.addEventListener("abort", abort, { once: true });
      pending.promise.then(
        (value) => {
          if (finish()) resolve(value);
        },
        (error) => {
          if (finish()) reject(error);
        },
      );
    });
  }

  private async execute<S extends z.ZodType, R extends object>(
    operation: Operation<S, R>,
    session: Session,
    signal: AbortSignal,
  ): Promise<Outcome> {
    const local = () => ({
      value: operation.local(this.options.enabled ? "unavailable" : "disabled"),
      provider: "local" as const,
    });
    if (!this.options.enabled || this.inFlight >= 4 || this.pending.size >= 64)
      return local();
    const budget = this.options.demo ? 16000 : 26000;
    const deadline = Date.now() + budget;
    const first = session.activeProvider;
    const order: ProviderName[] = [first, first === "groq" ? "gemini" : "groq"];
    let failed = false;
    for (const provider of order) {
      signal.throwIfAborted();
      const lease = this.health.claim(provider);
      if (!lease) continue;
      if (this.inFlight >= 4) {
        this.health.cancel(lease);
        return local();
      }
      if (failed || provider !== session.activeProvider)
        session.failoverCount++;
      // Reserve an equal slot for the other provider. Corrections share this slot.
      const providerDeadline = Math.min(deadline, Date.now() + budget / 2);
      let repairReason: string | undefined;
      this.inFlight++;
      try {
        for (let attempt = 0; attempt < 2; attempt++) {
          const remaining = providerDeadline - Date.now();
          if (remaining < 500 || !this.health.canContinue(lease))
            throw new ProviderFailure("timeout");
          session.requestCount++;
          try {
            const raw = await this.options.providers[provider].generate({
              task: operation.task,
              schema: operation.schema,
              data: operation.data,
              systemInstruction: operation.systemInstruction,
              maxOutputTokens: operation.maxOutputTokens,
              repairReason,
              signal: AbortSignal.any([
                signal,
                AbortSignal.timeout(Math.ceil(remaining)),
              ]),
            });
            const parsed = operation.schema.safeParse(raw);
            if (!parsed.success)
              throw new ValidationFailure("invalid output schema");
            const value = operation.transform(parsed.data);
            signal.throwIfAborted();
            if (this.health.canContinue(lease)) {
              this.health.success(lease);
              session.activeProvider = provider;
            }
            return { value, provider };
          } catch (error) {
            signal.throwIfAborted();
            if (
              error instanceof ValidationFailure &&
              attempt === 0 &&
              this.health.canContinue(lease)
            ) {
              repairReason = error.message.slice(0, 170);
              console.warn(
                "[tarot-ai] correcting structured output",
                JSON.stringify({
                  task: operation.task,
                  provider,
                  reason: repairReason,
                }),
              );
              continue;
            }
            throw error;
          }
        }
      } catch (error) {
        if (signal.aborted) {
          this.health.cancel(lease);
          signal.throwIfAborted();
        }
        const failure =
          error instanceof ProviderFailure || error instanceof ValidationFailure
            ? error
            : new ProviderFailure(
                error instanceof Error &&
                  /^(TimeoutError|AbortError)$/.test(error.name)
                  ? "timeout"
                  : "network",
              );
        // A schema or grounding rejection is tied to this generated answer,
        // not to provider availability. Putting the provider in cooldown here
        // made one poor reading disable AI for later users on the same warm
        // server instance. Transport, quota and configuration failures still
        // update the circuit breaker below.
        if (failure instanceof ValidationFailure) this.health.cancel(lease);
        else this.health.failure(lease, failure);
        console.warn(
          failure instanceof ValidationFailure
            ? "[tarot-ai] provider answer rejected"
            : "[tarot-ai] provider unavailable",
          JSON.stringify({
            task: operation.task,
            provider,
            category:
              failure instanceof ValidationFailure
                ? "validation"
                : failure.category,
            ...(failure instanceof ValidationFailure
              ? { reason: failure.message }
              : {}),
            ...(failure instanceof ProviderFailure && failure.status
              ? { status: failure.status }
              : {}),
          }),
        );
        failed = true;
      } finally {
        this.inFlight--;
      }
    }
    return local();
  }
}

function runtimeOptions(): RouterOptions {
  return {
    enabled: process.env.AI_ENABLED === "true",
    mode:
      process.env.DEMO_MODE === "true"
        ? "balanced"
        : process.env.AI_ROUTING_MODE === "groq_primary"
          ? "groq_primary"
          : process.env.AI_ROUTING_MODE === "gemini_primary"
            ? "gemini_primary"
            : "balanced",
    demo: process.env.DEMO_MODE === "true",
    debug:
      process.env.NODE_ENV === "development" ||
      (process.env.DEMO_MODE === "true" && process.env.AI_DEBUG === "true"),
    providers: { groq: groqProvider, gemini: geminiProvider },
  };
}
// globalThis shares the runtime between route bundles and preserves it through dev HMR.
const runtime = globalThis as typeof globalThis & {
  __tarotAi?: { signature: string; router: AiRouter };
};
export function getAiRouter() {
  const signature = createHash("sha256")
    .update(
      JSON.stringify([
        process.env.AI_ENABLED,
        process.env.AI_ROUTING_MODE,
        process.env.DEMO_MODE,
        process.env.AI_DEBUG,
        process.env.NODE_ENV,
        process.env.GROQ_API_KEY,
        process.env.GROQ_MODEL,
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_MODEL,
      ]),
    )
    .digest("hex");
  if (runtime.__tarotAi?.signature !== signature)
    runtime.__tarotAi = { signature, router: new AiRouter(runtimeOptions()) };
  else {
    // Dev HMR refreshes code/adapters while preserving cooldown and rotation.
    Object.setPrototypeOf(runtime.__tarotAi.router, AiRouter.prototype);
    Object.setPrototypeOf(
      runtime.__tarotAi.router.health,
      ProviderHealth.prototype,
    );
    runtime.__tarotAi.router.refreshProviders({
      groq: groqProvider,
      gemini: geminiProvider,
    });
  }
  return runtime.__tarotAi!.router;
}
/** Test isolation; never exposed by an API route. */
export function resetAiRuntime() {
  delete runtime.__tarotAi;
}
