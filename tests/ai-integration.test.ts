import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { analyzeQuestion, generateReading } from "../src/lib/server-ai";
import { resetAiRuntime } from "../src/lib/ai/router";
import {
  localQuestionContext,
  localReading,
  spreads,
  type ReadingInput,
} from "../src/lib/domain";
import { getCard } from "../src/data/cards";
import { analyze, interpret, clearAiRequestCache } from "../src/lib/client-api";

const envNames = [
  "AI_ENABLED",
  "GROQ_API_KEY",
  "GEMINI_API_KEY",
  "AI_ROUTING_MODE",
  "DEMO_MODE",
  "AI_DEBUG",
  "NODE_ENV",
] as const;
let previous: (string | undefined)[];
let originalFetch: typeof fetch;
beforeEach(() => {
  previous = envNames.map((name) => process.env[name]);
  originalFetch = globalThis.fetch;
  process.env.AI_ENABLED = "true";
  process.env.GROQ_API_KEY = "test-groq-secret";
  process.env.GEMINI_API_KEY = "test-gemini-secret";
  process.env.AI_ROUTING_MODE = "balanced";
  process.env.DEMO_MODE = "true";
  process.env.AI_DEBUG = "true";
  resetAiRuntime();
  clearAiRequestCache();
});
afterEach(() => {
  envNames.forEach((name, index) => {
    if (previous[index] === undefined) delete process.env[name];
    else Reflect.set(process.env, name, previous[index]);
  });
  globalThis.fetch = originalFetch;
  resetAiRuntime();
  clearAiRequestCache();
});

const input: ReadingInput = {
  question: "Mình nên cải thiện kết quả học tập thế nào?",
  spread: "cycle",
  style: "simple",
  cards: [
    { id: "the-leap", orientation: "reversed" },
    { id: "the-practice", orientation: "upright" },
    { id: "the-truth", orientation: "upright" },
  ],
};
function readingData(request: ReadingInput) {
  const local = localReading(request);
  return {
    cardReadings: request.cards.map((draw, index) => ({
      cardId: draw.id,
      position: spreads[request.spread].positions[index],
      userDetail: request.question,
      conceptUsed: getCard(draw.id)!.concept,
      orientationUsed: `${draw.orientation}: ${draw.orientation === "upright" ? getCard(draw.id)!.uprightFramework : getCard(draw.id)!.reversedFramework}`,
      connection: `“${request.question}” được xem qua ${getCard(draw.id)!.concept} tại ${spreads[request.spread].positions[index]}.`,
    })),
    message: local.message,
    insight: `Cần kiểm tra dữ kiện. ${local.reflection}`,
    checks: local.checks,
    actions: local.actions.map(({ title, detail }) => ({
      title,
      description: detail,
    })),
    followUpSuggestion: "Bạn có thể kiểm nghiệm điều gì trong tuần này?",
  };
}
function envelope(provider: "groq" | "gemini", data: unknown) {
  return Response.json(
    provider === "groq"
      ? {
          choices: [
            {
              finish_reason: "stop",
              message: { content: JSON.stringify(data) },
            },
          ],
        }
      : {
          candidates: [
            {
              finishReason: "STOP",
              content: { parts: [{ text: JSON.stringify(data) }] },
            },
          ],
        },
  );
}

test("both transports use common schemas, exact cards and sticky follow-ups; provider errors never enter public output", async () => {
  const calls: string[] = [];
  const contexts: unknown[] = [];
  let geminiQuota = true;
  globalThis.fetch = async (url, init) => {
    const provider = String(url).includes("api.groq.com") ? "groq" : "gemini";
    calls.push(provider);
    const body = JSON.parse(String(init?.body));
    const data = JSON.parse(
      provider === "groq"
        ? body.messages[1].content
        : body.contents[0].parts[0].text,
    );
    assert.ok(init?.signal);
    assert.ok(!JSON.stringify(body).includes("test-groq-secret"));
    assert.ok(!JSON.stringify(body).includes("test-gemini-secret"));
    if (provider === "groq") {
      assert.equal(body.response_format.type, "json_schema");
      assert.equal(body.response_format.json_schema.strict, true);
      assert.equal(body.include_reasoning, false);
      assert.ok(!body.tools);
    } else {
      assert.equal(
        body.generationConfig.responseFormat.text.mimeType,
        "APPLICATION_JSON",
      );
      assert.ok(!body.tools);
      if (geminiQuota) {
        geminiQuota = false;
        return Response.json(
          { error: { message: "quota private provider body" } },
          { status: 429, headers: { "Retry-After": "90" } },
        );
      }
    }
    if (data.question)
      return envelope(provider, {
        inputQuality: "VALID",
        contextConfidence: "MEDIUM",
        options: { a: null, b: null },
        safe: true,
        safetyCategory: null,
        spreadType: "COGNITION_CYCLE",
        ...localQuestionContext(data.question),
      });
    contexts.push(data);
    const result = readingData(input);
    if (data.followUp) result.cardReadings[0].userDetail = data.followUp;
    if (contexts.length === 1)
      result.cardReadings[0].orientationUsed = "upright: Changed orientation";
    return envelope(provider, result);
  };
  const id = crypto.randomUUID();
  const analysis = await analyzeQuestion(input.question, id);
  assert.ok("spread" in analysis);
  assert.equal(analysis.aiDebug!.provider, "groq");
  const reading = await generateReading({
    ...input,
    readingSessionId: id,
    questionContext: analysis.questionContext,
  });
  assert.ok("source" in reading && reading.source === "ai");
  assert.equal(reading.aiDebug!.provider, "groq");
  assert.deepEqual(
    reading.connections!.map(({ cardId, orientation, position }) => ({
      id: cardId,
      orientation,
      position,
    })),
    input.cards.map((draw, i) => ({
      ...draw,
      position: spreads.cycle.positions[i],
    })),
  );
  assert.ok(!("cardReadings" in reading));
  assert.deepEqual(
    contexts[0],
    contexts[1],
    "repair preserves exact card/context payload",
  );
  const follow = await generateReading({
    ...input,
    readingSessionId: id,
    currentReading: reading,
    followUp: "Mình nên kiểm nghiệm kết quả thế nào?",
  });
  assert.ok("source" in follow && follow.source === "ai");
  assert.equal(follow.aiDebug!.provider, "groq");
  assert.equal(
    follow.aiDebug!.requestCount,
    4,
    "one analysis, one reading plus its correction, one follow-up",
  );
  // The next reading prefers Gemini, automatically fails over, then remains on Groq.
  const secondId = crypto.randomUUID();
  const second = await analyzeQuestion(
    "Mình nên điều chỉnh cách học ra sao?",
    secondId,
  );
  assert.ok("spread" in second);
  assert.equal(second.aiDebug!.provider, "groq");
  assert.equal(second.aiDebug!.failoverCount, 1);
  assert.equal(second.aiDebug!.health.gemini.status, "COOLDOWN");
  await generateReading({ ...input, readingSessionId: secondId });
  assert.deepEqual(calls, [
    "groq",
    "groq",
    "groq",
    "groq",
    "gemini",
    "groq",
    "groq",
  ]);
  assert.ok(!JSON.stringify(second).includes("private provider body"));
});

test("gibberish reaches neither API route nor external provider, including follow-up", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new Error("must not call");
  };
  const invalid = "aaaaaaaaaaaaaaaa";
  for (const result of [
    await analyze(invalid),
    await analyzeQuestion(invalid),
    await interpret({
      ...input,
      currentReading: localReading(input),
      followUp: invalid,
    }),
    await generateReading({
      ...input,
      currentReading: localReading(input),
      followUp: invalid,
    }),
  ])
    assert.ok("blocked" in result && result.category === "input");
  assert.equal(calls, 0);
});

test("a follow-up that quotes only the original question is corrected using the exact new question and cards", async () => {
  const followUp = "Mình nên đo kết quả sau buổi tự học như thế nào?";
  let calls = 0;
  globalThis.fetch = async (_url, init) => {
    calls++;
    const body = JSON.parse(String(init?.body));
    const data = JSON.parse(body.messages[1].content);
    assert.equal(data.followUp, followUp);
    assert.deepEqual(
      data.cards.map((card: { cardId: string; orientation: string }) => ({
        id: card.cardId,
        orientation: card.orientation,
      })),
      input.cards,
    );
    const response = readingData(input);
    if (calls > 1) {
      assert.match(body.messages[2].content, /NEW question/);
      response.cardReadings[0].userDetail = followUp;
    }
    return envelope("groq", response);
  };
  const result = await generateReading({
    ...input,
    readingSessionId: crypto.randomUUID(),
    currentReading: localReading(input),
    followUp,
  });
  assert.ok("source" in result && result.source === "ai");
  assert.equal(calls, 2);
});

test("demo overrides primary mode, production hides debug, and schema-invalid analysis repairs before failover", async () => {
  process.env.AI_ROUTING_MODE = "gemini_primary";
  let malformed = true;
  const calls: string[] = [];
  globalThis.fetch = async (url, init) => {
    const provider = String(url).includes("api.groq.com") ? "groq" : "gemini";
    calls.push(provider);
    const body = JSON.parse(String(init?.body));
    const data = JSON.parse(
      provider === "groq"
        ? body.messages[1].content
        : body.contents[0].parts[0].text,
    );
    const result = {
      inputQuality: "VALID",
      contextConfidence: "LOW",
      options: { a: null, b: null },
      safe: true,
      safetyCategory: null,
      spreadType: "COGNITION_CYCLE",
      ...localQuestionContext(data.question),
    };
    if (malformed) {
      malformed = false;
      return envelope(provider, { ...result, spreadType: "OTHER" });
    }
    return envelope(provider, result);
  };
  const first = await analyzeQuestion(input.question, crypto.randomUUID());
  assert.ok("spread" in first);
  assert.equal(first.aiDebug!.provider, "groq");
  assert.deepEqual(calls, ["groq", "groq"]);
  const second = await analyzeQuestion(
    "Mình nên điều chỉnh lịch học thế nào?",
    crypto.randomUUID(),
  );
  assert.equal(second.aiDebug!.provider, "gemini");
  Object.assign(process.env, { NODE_ENV: "production" });
  process.env.DEMO_MODE = "false";
  resetAiRuntime();
  const production = await analyzeQuestion(input.question, crypto.randomUUID());
  assert.ok(!("aiDebug" in production));
});
