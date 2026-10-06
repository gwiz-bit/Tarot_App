import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { AiRouter } from "../src/lib/ai/router";
import { ProviderFailure, ValidationFailure } from "../src/lib/ai/errors";
import { ProviderHealth } from "../src/lib/ai/health/provider-health";
import type {
  AIProvider,
  CompletionRequest,
} from "../src/lib/ai/providers/types";
import type { ProviderName } from "../src/lib/ai-metadata";
import {
  readProviderJson,
  retryAfterMilliseconds,
} from "../src/lib/ai/providers/transport";

const output = z.object({ message: z.string().min(1) }).strict();
function fixture(
  mode: "balanced" | "groq_primary" | "gemini_primary" = "balanced",
  debug = true,
) {
  const calls: { provider: ProviderName; request: CompletionRequest }[] = [];
  let now = 100000;
  const handlers: Record<
    ProviderName,
    (request: CompletionRequest) => Promise<unknown>
  > = {
    groq: async () => ({ message: "valid" }),
    gemini: async () => ({ message: "valid" }),
  };
  const provider = (name: ProviderName): AIProvider => ({
    name,
    configured: () => true,
    generate: (request) => {
      calls.push({ provider: name, request });
      return handlers[name](request);
    },
  });
  const router = new AiRouter({
    enabled: true,
    mode,
    demo: true,
    debug,
    now: () => now,
    providers: { groq: provider("groq"), gemini: provider("gemini") },
  });
  let requestNumber = 0;
  const run = (
    sessionId = randomUUID(),
    task: "analysis" | "reading" | "follow-up" = "analysis",
    key = `request:${++requestNumber}`,
    signal?: AbortSignal,
  ) =>
    router.run<typeof output, { message: string; source: "ai" | "local" }>({
      task,
      sessionId,
      fingerprint: key,
      schema: output,
      data: { question: "Câu hỏi thực tế" },
      systemInstruction: "Use only supplied cards",
      maxOutputTokens: 100,
      transform: (value) => ({ ...value, source: "ai" as const }),
      local: () => ({ message: "local", source: "local" as const }),
      signal,
    });
  return {
    router,
    calls,
    handlers,
    run,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

test("acceptance 1/7: new readings alternate while analysis, reading and follow-up stay together", async () => {
  const f = fixture();
  for (const expected of ["groq", "gemini", "groq", "gemini"]) {
    const id = randomUUID();
    for (const task of ["analysis", "reading", "follow-up"] as const) {
      const result = await f.run(id, task);
      assert.equal(result.aiDebug!.provider, expected);
    }
  }
  assert.deepEqual(
    f.calls.map((call) => call.provider),
    [
      "groq",
      "groq",
      "groq",
      "gemini",
      "gemini",
      "gemini",
      "groq",
      "groq",
      "groq",
      "gemini",
      "gemini",
      "gemini",
    ],
  );
});

test("acceptance 2/3/4: 429 fails over immediately, skips cooldown, probes once and resumes rotation", async () => {
  const f = fixture();
  f.handlers.groq = async () => {
    throw new ProviderFailure("rate_limit", 429, 120000);
  };
  const id = randomUUID();
  const result = await f.run(id);
  assert.equal(result.aiDebug!.provider, "gemini");
  assert.equal(result.aiDebug!.health.groq.status, "COOLDOWN");
  assert.equal(result.aiDebug!.health.groq.cooldownUntil, 220000);
  assert.equal(result.aiDebug!.requestCount, 2);
  assert.equal(result.aiDebug!.failoverCount, 1);
  await f.run(id, "reading");
  await f.run();
  assert.equal(f.calls.filter((call) => call.provider === "groq").length, 1);
  f.advance(120001);
  f.handlers.groq = async () => ({ message: "recovered" });
  const probe = await f.run();
  assert.equal(probe.aiDebug!.provider, "groq");
  assert.equal(probe.aiDebug!.health.groq.status, "HEALTHY");
  assert.equal((await f.run()).aiDebug!.provider, "gemini");
  // The reading that failed over remains on Gemini, even after Groq recovers.
  assert.equal((await f.run(id, "follow-up")).aiDebug!.provider, "gemini");
});

test("acceptance 5: both fail, local is final and each provider is attempted at most once for quota errors", async () => {
  const f = fixture();
  for (const name of ["groq", "gemini"] as const)
    f.handlers[name] = async () => {
      throw new ProviderFailure("rate_limit", 429);
    };
  const result = await f.run();
  assert.equal(result.source, "local");
  assert.equal(result.aiDebug!.provider, "local");
  assert.equal(f.calls.length, 2);
  const second = await f.run();
  assert.equal(second.source, "local");
  assert.equal(second.aiDebug!.requestCount, 0);
  assert.equal(f.calls.length, 2);
});

test("using an old cache entry cannot undo the session's successful failover", async () => {
  const f = fixture();
  const id = randomUUID();
  await f.run(id, "reading", "original-reading");
  f.handlers.groq = async () => {
    throw new ProviderFailure("rate_limit", 429, 1000);
  };
  assert.equal((await f.run(id, "follow-up")).aiDebug!.provider, "gemini");
  assert.equal(
    (await f.run(id, "reading", "original-reading")).aiDebug!.cacheHit,
    true,
  );
  f.advance(1001);
  f.handlers.groq = async () => ({ message: "recovered" });
  assert.equal((await f.run(id, "follow-up")).aiDebug!.provider, "gemini");
});

test("acceptance 6: Gemini quota first is symmetric and recovers into balanced rotation", async () => {
  const f = fixture();
  await f.run();
  f.handlers.gemini = async () => {
    throw new ProviderFailure("rate_limit", 429, 60000);
  };
  const id = randomUUID();
  assert.equal((await f.run(id)).aiDebug!.provider, "groq");
  assert.equal((await f.run()).aiDebug!.provider, "groq");
  assert.equal(f.calls.filter((call) => call.provider === "gemini").length, 1);
  f.advance(60001);
  f.handlers.gemini = async () => ({ message: "recovered" });
  assert.equal((await f.run()).aiDebug!.provider, "gemini");
  assert.equal((await f.run()).aiDebug!.provider, "groq");
});

test("configuration errors disable retries; network/503/timeout use temporary cooldown", async () => {
  for (const error of [
    new ProviderFailure("configuration", 401),
    new ProviderFailure("configuration", 403),
    new ProviderFailure("http", 503),
    new DOMException("timeout", "TimeoutError"),
    new Error("network"),
  ]) {
    const f = fixture();
    f.handlers.groq = async () => {
      throw error;
    };
    const result = await f.run();
    assert.equal(result.aiDebug!.provider, "gemini");
    assert.equal(
      result.aiDebug!.health.groq.status,
      error instanceof ProviderFailure && error.category === "configuration"
        ? "DISABLED_CONFIGURATION_ERROR"
        : "COOLDOWN",
    );
    await f.run();
    assert.equal(f.calls.filter((call) => call.provider === "groq").length, 1);
  }
});

test("invalid output gets at most one compact correction per provider, then failover or local", async () => {
  const f = fixture();
  f.handlers.groq = async () => {
    throw new ValidationFailure("invalid field cardId");
  };
  const result = await f.run();
  assert.deepEqual(
    f.calls.map((call) => call.provider),
    ["groq", "groq", "gemini"],
  );
  assert.equal(result.aiDebug!.provider, "gemini");
  assert.ok(f.calls[1].request.repairReason!.length < 300);
  assert.deepEqual(f.calls[0].request.data, f.calls[1].request.data);
  assert.equal(
    result.aiDebug!.health.groq.status,
    "HEALTHY",
    "a rejected answer must not poison provider availability",
  );
  const both = fixture();
  both.handlers.groq = both.handlers.gemini = async () => ({
    wrong: "invalid",
  });
  const local = await both.run();
  assert.equal(local.source, "local");
  assert.equal(both.calls.length, 4);
  assert.equal(local.aiDebug!.health.groq.status, "HEALTHY");
  assert.equal(local.aiDebug!.health.gemini.status, "HEALTHY");
});

test("cache precedes routing, caches only validated AI and deduplicates identical concurrent operations", async () => {
  const f = fixture();
  let release!: (value: unknown) => void;
  f.handlers.groq = async () =>
    new Promise((resolve) => {
      release = resolve;
    });
  const id = randomUUID();
  const first = f.run(id, "reading", "identical");
  const second = f.run(id, "reading", "identical");
  assert.equal(f.calls.length, 1);
  release({ message: "valid" });
  const [a, b] = await Promise.all([first, second]);
  assert.equal(a.message, b.message);
  assert.equal(b.aiDebug!.deduplicated, true);
  const cached = await f.run(id, "reading", "identical");
  assert.equal(cached.aiDebug!.cacheHit, true);
  assert.equal(cached.aiDebug!.requestCount, 1);
  assert.equal(f.calls.length, 1);
});

test("deduplicated server callers cancel independently; all cancelled abort the provider without poisoning health", async () => {
  const f = fixture();
  let release!: (value: unknown) => void;
  f.handlers.groq = async () =>
    new Promise((resolve) => {
      release = resolve;
    });
  const controller = new AbortController();
  const id = randomUUID();
  const first = f.run(id, "reading", "one", controller.signal);
  const other = f.run(id, "reading", "one");
  const rejection = assert.rejects(first, /Cancelled/);
  controller.abort();
  await rejection;
  assert.equal(f.calls[0].request.signal.aborted, false);
  release({ message: "valid" });
  assert.equal((await other).source, "ai");
  const all = fixture();
  all.handlers.groq = async (request) =>
    new Promise((_resolve, reject) =>
      request.signal.addEventListener(
        "abort",
        () => reject(request.signal.reason),
        { once: true },
      ),
    );
  const cancel = new AbortController();
  const pending = all.run(randomUUID(), "reading", "cancel", cancel.signal);
  const cancelled = assert.rejects(pending, /Cancelled/);
  cancel.abort();
  await cancelled;
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(all.calls[0].request.signal.aborted, true);
  assert.equal(all.router.health.snapshot("groq").status, "HEALTHY");
  all.handlers.groq = async () => ({ message: "valid" });
  assert.equal((await all.run(randomUUID(), "reading", "cancel")).source, "ai");
});

test("only one recovery probe can run concurrently and stale success cannot erase a newer cooldown", () => {
  let now = 0;
  const health = new ProviderHealth({ groq: true, gemini: true }, () => now);
  const first = health.claim("groq")!;
  const stale = health.claim("groq")!;
  health.failure(first, new ProviderFailure("rate_limit", 429, 1000));
  health.success(stale);
  assert.equal(health.snapshot("groq").status, "COOLDOWN");
  now = 1001;
  assert.equal(health.snapshot("groq").status, "PROBE_ALLOWED");
  const probe = health.claim("groq")!;
  assert.equal(probe.probe, true);
  assert.equal(health.claim("groq"), null);
  health.failure(probe, new ProviderFailure("rate_limit", 429, 2000));
  now = 3002;
  const recovered = health.claim("groq")!;
  health.success(recovered);
  assert.equal(health.snapshot("groq").status, "HEALTHY");
});

test("primary modes remain sticky; normal production responses omit debug", async () => {
  for (const [mode, provider] of [
    ["groq_primary", "groq"],
    ["gemini_primary", "gemini"],
  ] as const) {
    const f = fixture(mode, false);
    for (let i = 0; i < 3; i++) {
      const result = await f.run();
      assert.ok(!("aiDebug" in result));
      assert.equal(f.calls.at(-1)!.provider, provider);
    }
  }
});

test("bounded demo timeout leaves time for failover; rate-limit Retry-After supports seconds/date and daily quota", async () => {
  const f = fixture();
  const result = await f.run();
  assert.equal(result.source, "ai");
  assert.ok(f.calls[0].request.signal);
  assert.equal(retryAfterMilliseconds("120", 0), 120000);
  assert.equal(
    retryAfterMilliseconds("Thu, 01 Jan 1970 00:02:00 GMT", 0),
    120000,
  );
  assert.equal(retryAfterMilliseconds("garbage", 0), undefined);
  await assert.rejects(
    readProviderJson(
      Response.json(
        {
          error: {
            message: "requests per day exhausted",
            details: [{ retryDelay: "7200s" }],
          },
        },
        { status: 429, headers: { "Retry-After": "90" } },
      ),
    ),
    (error: unknown) => {
      assert.ok(error instanceof ProviderFailure);
      assert.equal(error.retryAfterMs, 7200000);
      assert.equal(error.dailyQuota, true);
      assert.ok(!error.message.includes("exhausted"));
      return true;
    },
  );
});

test("timeout aborts both hung transports and terminates at local within the demo budget", async (t) => {
  const durations: number[] = [];
  t.mock.method(AbortSignal, "timeout", (milliseconds: number) => {
    durations.push(milliseconds);
    const controller = new AbortController();
    queueMicrotask(() =>
      controller.abort(new DOMException("Timed out", "TimeoutError")),
    );
    return controller.signal;
  });
  const f = fixture();
  for (const provider of ["groq", "gemini"] as const)
    f.handlers[provider] = async (request) =>
      new Promise((_resolve, reject) => {
        if (request.signal.aborted) reject(request.signal.reason);
        else
          request.signal.addEventListener(
            "abort",
            () => reject(request.signal.reason),
            { once: true },
          );
      });
  const result = await f.run();
  assert.equal(result.source, "local");
  assert.equal(f.calls.length, 2);
  assert.equal(durations.length, 2);
  assert.ok(durations.every((duration) => duration > 0 && duration <= 8000));
  assert.ok(durations.reduce((sum, duration) => sum + duration, 0) <= 16000);
  assert.equal(result.aiDebug!.health.groq.status, "COOLDOWN");
  assert.equal(result.aiDebug!.health.gemini.status, "COOLDOWN");
});
