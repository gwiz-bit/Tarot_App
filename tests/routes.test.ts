import test from "node:test";
import assert from "node:assert/strict";
import { POST as analyze } from "../src/app/api/analyze/route";
import { POST as reading } from "../src/app/api/reading/route";
import {
  localReading,
  readingResultSchema,
  type ReadingInput,
} from "../src/lib/domain";

function request(
  route: string,
  body: unknown,
  origin = "http://127.0.0.1:3000",
) {
  return new Request(`http://localhost:3000/api/${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Host: "127.0.0.1:3000",
      Origin: origin,
    },
    body: JSON.stringify(body),
  });
}
const input: ReadingInput = {
  question: "Mình cần cải thiện việc học môn triết thế nào?",
  spread: "cycle",
  style: "simple",
  cards: [
    { id: "the-leap", orientation: "reversed" },
    { id: "the-practice", orientation: "upright" },
    { id: "the-truth", orientation: "upright" },
  ],
};
test("route handlers complete a valid analyze/reading/follow-up flow and reject invalid input", async () => {
  const previous = process.env.AI_ENABLED;
  process.env.AI_ENABLED = "false";
  try {
    const classified = await analyze(
      request("analyze", { question: input.question }),
    );
    assert.equal(classified.status, 200);
    assert.equal((await classified.json()).spread, "cycle");
    const oneCard = await analyze(
      request("analyze", { question: input.question, drawCount: 1 }),
    );
    assert.equal((await oneCard.json()).spread, "quick");
    const threeCards = await analyze(
      request("analyze", {
        question: "Mình muốn hiểu rõ cảm giác hiện tại.",
        drawCount: 3,
      }),
    );
    assert.equal((await threeCards.json()).spread, "cycle");
    const response = await reading(request("reading", input));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    const currentReading = await response.json();
    assert.ok(readingResultSchema.safeParse(currentReading).success);
    assert.equal(currentReading.actions.length, 3);
    const follow = await reading(
      request("reading", {
        ...input,
        currentReading,
        followUp: "Mình nên bắt đầu từ đâu?",
      }),
    );
    assert.equal(follow.status, 200);
    assert.ok(
      (await follow.json()).reflection.includes(
        currentReading.actions[0].title,
      ),
    );
    assert.equal(
      (await reading(request("reading", { ...input, cards: [input.cards[0]] })))
        .status,
      400,
    );
    assert.equal(
      (await analyze(request("analyze", { question: " " }))).status,
      400,
    );
    assert.equal(
      (
        await analyze(
          request(
            "analyze",
            { question: input.question },
            "https://foreign.example",
          ),
        )
      ).status,
      403,
    );
    const sensitive = await analyze(
      request("analyze", { question: "Tôi nên uống thuốc gì?" }),
    );
    assert.equal((await sensitive.json()).category, "medical");
    const ordinary = await analyze(
      request("analyze", {
        question: "Mình nên đầu tư thời gian học thế nào?",
      }),
    );
    assert.ok(!(await ordinary.json()).blocked);
    const malformed = new Request("http://localhost:3000/api/reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{bad",
    });
    const invalid = await reading(malformed);
    assert.equal(invalid.status, 400);
    assert.equal(
      (await invalid.json()).error,
      "Dữ liệu không hợp lệ. Hãy thử lại.",
    );
  } finally {
    if (previous === undefined) delete process.env.AI_ENABLED;
    else process.env.AI_ENABLED = previous;
  }
});
test("UTF-8 follow-up context fits the bounded request body", async () => {
  const currentReading = {
    ...localReading(input),
    message: "Học tập. ".repeat(90),
    reflection: "Dữ kiện thực tiễn. ".repeat(120),
  };
  const response = await reading(
    request("reading", {
      ...input,
      currentReading,
      followUp: "Mình nên kiểm tra các dữ kiện này thế nào?",
      recentFollowUps: [
        {
          question: "Mình đã hỏi thêm về lá này",
          message: "Học tập. ".repeat(90),
        },
      ],
    }),
  );
  assert.equal(response.status, 200);
});
