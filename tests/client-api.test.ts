import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { analyze, interpret, clearAiRequestCache } from "../src/lib/client-api";
import { localReading, type ReadingInput } from "../src/lib/domain";
import { readingFingerprint } from "../src/lib/reading-cache";

let storageDescriptor: PropertyDescriptor | undefined;
beforeEach(() => {
  storageDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "sessionStorage",
  );
  const entries = new Map<string, string>();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
      removeItem: (key: string) => entries.delete(key),
    },
  });
  clearAiRequestCache();
});
afterEach(() => {
  clearAiRequestCache();
  if (storageDescriptor)
    Object.defineProperty(globalThis, "sessionStorage", storageDescriptor);
  else Reflect.deleteProperty(globalThis, "sessionStorage");
});

const basicInput: ReadingInput = {
  question: "Mình nên nhìn việc học thế nào?",
  cards: [{ id: "the-practice", orientation: "upright" }],
  spread: "quick",
  style: "simple",
};

test("follow-up requests include the current interpretation and two recent messages, without full history", async () => {
  const input: ReadingInput = {
    question: "Mình nên nhìn việc học thế nào?",
    cards: [{ id: "the-practice", orientation: "upright" }],
    spread: "quick",
    style: "simple",
    followUp: "Mình nên bắt đầu từ đâu?",
  };
  const result = localReading(input);
  const record = {
    ...input,
    currentReading: result,
    recentFollowUps: [
      { question: "Tại sao lá này liên quan?", message: result.message },
    ],
    result,
    followUps: Array.from({ length: 8 }, () => ({
      question: "Mình cần thêm góc nhìn",
      result,
    })),
    createdAt: new Date().toISOString(),
    id: crypto.randomUUID(),
  };
  const original = globalThis.fetch;
  try {
    let body: Record<string, unknown> = {};
    globalThis.fetch = async (_url, init) => {
      body = JSON.parse(String(init?.body));
      return Response.json(result);
    };
    await interpret(record);
    assert.equal(body.question, input.question);
    assert.equal(body.followUp, input.followUp);
    assert.deepEqual(body.currentReading, {
      message: result.message,
      reflection: result.reflection,
      actions: result.actions,
      checks: result.checks,
      followUpSuggestion: result.followUpSuggestion,
      connections: result.connections,
    });
    assert.deepEqual(body.recentFollowUps, record.recentFollowUps);
    assert.ok(!("followUps" in body));
    assert.ok(!("result" in body));
    assert.ok(!("id" in body));
  } finally {
    globalThis.fetch = original;
  }
});
test("invalid JSON and incomplete responses show friendly errors", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response("<html>upstream failed</html>", { status: 502 });
    await assert.rejects(analyze("Mình cần một góc nhìn"), /kết quả hợp lệ/);
    globalThis.fetch = async () => Response.json({ spread: "invented" });
    await assert.rejects(analyze("Mình cần một góc nhìn"), /chưa đủ thông tin/);
  } finally {
    globalThis.fetch = original;
  }
});

test("the initial interpretation sends the selected tone and exact cards in one request", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  const input: ReadingInput = { ...basicInput, style: "critical" };
  try {
    globalThis.fetch = async (_url, options) => {
      calls++;
      const body = JSON.parse(String(options?.body));
      assert.equal(body.style, "critical");
      assert.equal(body.question, input.question);
      assert.deepEqual(body.cards, input.cards);
      return Response.json({ ...localReading(input), source: "ai" });
    };
    await interpret(input);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});

test("successful results cache simple → academic → simple, classification and exact follow-ups", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  const result = { ...localReading(basicInput), source: "ai" as const };
  try {
    globalThis.fetch = async (url) => {
      calls++;
      return Response.json(
        url === "/api/analyze"
          ? {
              spread: "quick",
              reason: "Một góc nhìn",
              source: "ai",
              summary: "Suy ngẫm về việc học",
              contextFactors: [],
            }
          : result,
      );
    };
    await analyze(basicInput.question);
    await analyze(` ${basicInput.question} `);
    assert.equal(calls, 1);
    await interpret(basicInput);
    await interpret({
      ...basicInput,
      style: "academic",
      currentReading: result,
    });
    assert.equal(calls, 3);
    await interpret({
      ...basicInput,
      currentReading: result,
      actionPlan: result.actions,
    });
    assert.equal(
      calls,
      4,
      "a restyle with a fixed action plan has different context from the initial reading",
    );
    const follow: ReadingInput = {
      ...basicInput,
      followUp: "Mình nên bắt đầu từ đâu?",
      currentReading: result,
      recentFollowUps: [],
    };
    await interpret(follow);
    await interpret({ ...follow });
    assert.equal(calls, 5);
    await interpret({
      ...follow,
      recentFollowUps: [
        {
          question: "Mình kiểm nghiệm thế nào?",
          message: "Đo kết quả sau một tuần.",
        },
      ],
    });
    assert.equal(calls, 6);
    const stored = JSON.parse(
      sessionStorage.getItem("philo-tarot:ai-cache:v2")!,
    );
    assert.equal(stored.entries.length, 6);
    assert.ok(
      stored.entries.every(
        (entry: { result: { source: string } }) => entry.result.source === "ai",
      ),
    );
  } finally {
    globalThis.fetch = original;
  }
});

test("failed or local responses are retryable and never enter the successful AI cache", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => {
      calls++;
      return Response.json(localReading(basicInput));
    };
    await interpret(basicInput);
    await interpret(basicInput);
    assert.equal(calls, 2);
    assert.equal(sessionStorage.getItem("philo-tarot:ai-cache:v2"), null);
    globalThis.fetch = async () => {
      calls++;
      return new Response("quota", { status: 429 });
    };
    await assert.rejects(interpret(basicInput));
    globalThis.fetch = async () => {
      calls++;
      return Response.json({ ...localReading(basicInput), source: "ai" });
    };
    await interpret(basicInput);
    await interpret(basicInput);
    assert.equal(calls, 4);
  } finally {
    globalThis.fetch = original;
  }
});

test("deduplicated callers can cancel independently without cancelling the remaining subscriber", async () => {
  const original = globalThis.fetch;
  let release!: (value: Response) => void;
  let transportSignal: AbortSignal | null = null;
  let calls = 0;
  try {
    globalThis.fetch = async (_url, init) => {
      calls++;
      transportSignal = init?.signal ?? null;
      return await new Promise<Response>((resolve) => {
        release = resolve;
      });
    };
    const controller = new AbortController();
    const first = interpret(basicInput, controller.signal);
    const second = interpret({ ...basicInput });
    const cancelled = assert.rejects(first, /Cancelled/);
    controller.abort();
    await cancelled;
    assert.equal(calls, 1);
    assert.ok(transportSignal && !(transportSignal as AbortSignal).aborted);
    release(Response.json({ ...localReading(basicInput), source: "ai" }));
    assert.equal(((await second) as { source: string }).source, "ai");
  } finally {
    globalThis.fetch = original;
  }
});

test("when every subscriber cancels the transport aborts, and an explicit retry starts cleanly", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async (_url, init) => {
      calls++;
      if (calls > 1)
        return Response.json({ ...localReading(basicInput), source: "ai" });
      return await new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("Cancelled", "AbortError")),
          { once: true },
        );
      });
    };
    const controller = new AbortController();
    const pending = interpret(basicInput, controller.signal);
    const cancelled = assert.rejects(pending, /Cancelled/);
    controller.abort();
    await cancelled;
    assert.equal(
      ((await interpret(basicInput)) as { source: string }).source,
      "ai",
    );
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = original;
  }
});

test("fingerprints distinguish position order, orientation, tone and follow-up context", () => {
  const original = readingFingerprint(basicInput);
  assert.notEqual(
    original,
    readingFingerprint({ ...basicInput, style: "academic" }),
  );
  assert.notEqual(
    original,
    readingFingerprint({
      ...basicInput,
      cards: [{ ...basicInput.cards[0], orientation: "reversed" }],
    }),
  );
  assert.equal(
    original,
    readingFingerprint({ ...basicInput, question: ` ${basicInput.question} ` }),
  );
  const result = localReading(basicInput);
  const follow: ReadingInput = {
    ...basicInput,
    followUp: "Lá này có ý nghĩa gì?",
    currentReading: result,
  };
  assert.notEqual(
    readingFingerprint(follow),
    readingFingerprint({
      ...follow,
      currentReading: { ...result, reflection: "Một ngữ cảnh khác" },
    }),
  );
  const multi: ReadingInput = {
    ...basicInput,
    spread: "conflict",
    cards: [
      basicInput.cards[0],
      { id: "the-leap", orientation: "reversed" },
      { id: "the-conflict", orientation: "upright" },
    ],
  };
  assert.notEqual(
    readingFingerprint(multi),
    readingFingerprint({ ...multi, cards: [...multi.cards].reverse() }),
  );
});

test("client cache debug counts remain cumulative through later follow-ups", async () => {
  const original = globalThis.fetch;
  const readingSessionId = crypto.randomUUID();
  const health = {
    groq: { status: "HEALTHY", cooldownUntil: null, recentFailures: 0 },
    gemini: { status: "HEALTHY", cooldownUntil: null, recentFailures: 0 },
  };
  const input = { ...basicInput, readingSessionId };
  let calls = 0;
  try {
    globalThis.fetch = async () => {
      calls++;
      return Response.json({
        ...localReading(input),
        source: "ai",
        readingSessionId,
        aiDebug: {
          provider: "groq",
          health,
          requestCount: calls + 1,
          cacheHits: 0,
          failoverCount: 0,
          cacheHit: false,
          deduplicated: false,
        },
      });
    };
    const first = await interpret(input);
    assert.ok("source" in first);
    const cached = await interpret(input);
    assert.equal(cached.aiDebug!.cacheHits, 1);
    const follow = await interpret({
      ...input,
      currentReading: first,
      followUp: "Mình nên kiểm tra kết quả thế nào?",
    });
    assert.equal(follow.aiDebug!.cacheHits, 1);
    assert.equal(follow.aiDebug!.requestCount, 3);
    const oldCached = await interpret(input);
    assert.equal(oldCached.aiDebug!.requestCount, 3);
    assert.equal(oldCached.aiDebug!.cacheHits, 2);
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = original;
  }
});
