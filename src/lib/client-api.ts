import { z } from "zod";
import {
  analysisSchema,
  blockedSchema,
  readingResultSchema,
  readingInputSchema,
  analyzeInputSchema,
  type ReadingInput,
} from "./domain";
import { readingFingerprint } from "./reading-cache";
import { clarificationQuestion, inputQualityError } from "./input-quality";

const cacheSchema = z.object({
  version: z.literal(3),
  entries: z
    .array(
      z.object({
        key: z.string().max(20000),
        result: z.union([
          analysisSchema.extend({ source: z.literal("ai") }),
          readingResultSchema.extend({ source: z.literal("ai") }),
        ]),
      }),
    )
    .max(24),
});
type CachedResult = z.infer<typeof cacheSchema>["entries"][number]["result"];
const CACHE_KEY = "philo-tarot:ai-cache:v3";
const successfulRequests = new Map<string, CachedResult>();
const clientDebugCounts = new Map<
  string,
  { localHits: number; serverHits: number; requests: number; failovers: number }
>();
let cacheLoaded = false;

function withClientDebug<
  T extends {
    readingSessionId?: string;
    aiDebug?: import("./ai-metadata").AiDebug;
  },
>(result: T, cacheHit = false): T {
  const id = result.readingSessionId;
  const debug = result.aiDebug;
  if (!id || !debug) return result;
  const counts = clientDebugCounts.get(id) ?? {
    localHits: 0,
    serverHits: 0,
    requests: 0,
    failovers: 0,
  };
  if (cacheHit) counts.localHits++;
  counts.serverHits = Math.max(counts.serverHits, debug.cacheHits);
  counts.requests = Math.max(counts.requests, debug.requestCount);
  counts.failovers = Math.max(counts.failovers, debug.failoverCount);
  clientDebugCounts.set(id, counts);
  while (clientDebugCounts.size > 256)
    clientDebugCounts.delete(clientDebugCounts.keys().next().value!);
  return {
    ...result,
    aiDebug: {
      ...debug,
      requestCount: counts.requests,
      cacheHits: counts.serverHits + counts.localHits,
      failoverCount: counts.failovers,
      cacheHit: cacheHit || debug.cacheHit,
      deduplicated: cacheHit ? false : debug.deduplicated,
    },
  };
}
type PendingRequest = {
  controller: AbortController;
  promise: Promise<unknown>;
  subscribers: number;
};
const pendingRequests = new Map<string, PendingRequest>();

function loadCache() {
  if (cacheLoaded) return;
  cacheLoaded = true;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw || raw.length > 180000) return;
    const parsed = cacheSchema.safeParse(JSON.parse(raw));
    if (parsed.success)
      for (const { key, result } of parsed.data.entries)
        successfulRequests.set(key, result);
  } catch {
    // Storage can be unavailable; in-memory deduplication still works.
  }
}

function remember(key: string, result: unknown) {
  const parsed =
    cacheSchema.shape.entries.element.shape.result.safeParse(result);
  if (!parsed.success) return; // No failed, blocked or local results in AI cache.
  successfulRequests.delete(key);
  successfulRequests.set(key, parsed.data);
  while (successfulRequests.size > 24)
    successfulRequests.delete(successfulRequests.keys().next().value!);
  let entries = [...successfulRequests].map(([key, result]) => ({
    key,
    result,
  }));
  let payload = JSON.stringify({ version: 3, entries });
  while (payload.length > 180000 && entries.length > 1) {
    successfulRequests.delete(entries[0].key);
    entries = entries.slice(1);
    payload = JSON.stringify({ version: 3, entries });
  }
  try {
    sessionStorage.setItem(CACHE_KEY, payload);
  } catch {
    // Successful responses remain available in memory for this page session.
  }
}

export function clearAiRequestCache() {
  successfulRequests.clear();
  clientDebugCounts.clear();
  cacheLoaded = false;
  for (const pending of pendingRequests.values()) pending.controller.abort();
  pendingRequests.clear();
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // No storage is required to start another reading.
  }
}

function subscribe<T>(
  pending: PendingRequest,
  key: string,
  signal?: AbortSignal,
) {
  pending.subscribers++;
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const finish = (cancelled = false) => {
      if (settled) return false;
      settled = true;
      signal?.removeEventListener("abort", abort);
      pending.subscribers--;
      if (cancelled && pending.subscribers === 0) {
        pending.controller.abort();
        if (pendingRequests.get(key) === pending) pendingRequests.delete(key);
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
        if (finish()) resolve(value as T);
      },
      (error) => {
        if (finish()) reject(error);
      },
    );
  });
}
async function post<T extends z.ZodType>(
  path: string,
  body: unknown,
  schema: T,
  signal?: AbortSignal,
  fingerprint = `${path}:${JSON.stringify(body)}`,
): Promise<z.infer<T>> {
  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  loadCache();
  const cached = schema.safeParse(successfulRequests.get(fingerprint));
  if (cached.success) {
    return schema.parse(withClientDebug(cached.data as CachedResult, true));
  }
  const pending = pendingRequests.get(fingerprint);
  if (pending) return subscribe<z.infer<T>>(pending, fingerprint, signal);

  const controller = new AbortController();
  const operation = (async () => {
    let response: Response;
    try {
      response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(30000),
        ]),
      });
    } catch {
      throw new Error(
        "Không kết nối được máy chủ. Hãy kiểm tra kết nối và thử lại.",
      );
    }
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error("Máy chủ chưa trả được kết quả hợp lệ. Hãy thử lại.");
    }
    if (!response.ok) {
      const error = z.object({ error: z.string() }).safeParse(data);
      throw new Error(
        error.success ? error.data.error : "Không thể xử lý lúc này.",
      );
    }
    const result = schema.safeParse(data);
    if (!result.success)
      throw new Error("Kết quả chưa đủ thông tin. Hãy thử lại.");
    if (!controller.signal.aborted) remember(fingerprint, result.data);
    return schema.parse(withClientDebug(result.data as CachedResult));
  })();
  const entry: PendingRequest = {
    controller,
    subscribers: 0,
    promise: operation.finally(() => {
      if (pendingRequests.get(fingerprint) === entry)
        pendingRequests.delete(fingerprint);
    }),
  };
  pendingRequests.set(fingerprint, entry);
  return subscribe<z.infer<T>>(entry, fingerprint, signal);
}
export function analyze(
  question: string,
  signal?: AbortSignal,
  readingSessionId?: string,
  drawCount?: import("./domain").DrawCount,
) {
  const parsed = analyzeInputSchema.parse({
    question,
    readingSessionId,
    drawCount,
  });
  const quality = inputQualityError(parsed.question);
  if (quality)
    return Promise.resolve(
      blockedSchema.parse({
        blocked: true,
        category: "input",
        message: quality,
      }),
    );
  const clarification = clarificationQuestion(parsed.question);
  if (clarification)
    return Promise.resolve(
      blockedSchema.parse({
        blocked: true,
        category: "clarification",
        message: clarification,
      }),
    );
  return post(
    "/api/analyze",
    parsed,
    z.union([analysisSchema, blockedSchema]),
    signal,
    `analyze:v4:${readingSessionId ?? ""}:${parsed.drawCount ?? "auto"}:${parsed.question}`,
  );
}
export function interpret(input: ReadingInput, signal?: AbortSignal) {
  const parsed = readingInputSchema.safeParse(input);
  if (!parsed.success)
    throw new Error("Thông tin lần trải chưa hợp lệ. Hãy thử lại.");
  const quality = inputQualityError(
    parsed.data.followUp ?? parsed.data.question,
  );
  if (quality)
    return Promise.resolve(
      blockedSchema.parse({
        blocked: true,
        category: "input",
        message: quality,
      }),
    );
  return post(
    "/api/reading",
    parsed.data,
    z.union([readingResultSchema, blockedSchema]),
    signal,
    `${parsed.data.readingSessionId ?? ""}:${readingFingerprint(parsed.data)}`,
  );
}
