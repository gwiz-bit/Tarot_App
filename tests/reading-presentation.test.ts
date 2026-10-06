import test from "node:test";
import assert from "node:assert/strict";
import {
  localReading,
  readingResultSchema,
  type ReadingInput,
} from "../src/lib/domain";
import {
  matchingConnections,
  readingParagraphs,
} from "../src/lib/reading-presentation";

const example: ReadingInput = {
  question: "Mình có nên thay đổi hướng đi hiện tại?",
  spread: "choice",
  style: "academic",
  cards: [
    { id: "the-mind", orientation: "reversed" },
    { id: "the-turning", orientation: "upright" },
    { id: "the-human", orientation: "upright" },
  ],
};

test("the reported three-card fallback has complete short paragraphs and useful decision steps", () => {
  const before = structuredClone(example);
  const result = localReading(example);
  assert.deepEqual(example, before);
  assert.match(result.message, /chưa đủ dữ kiện/i);
  assert.match(result.message, /đổi hướng/);
  assert.doesNotMatch(result.reflection, /…|\.\.\./u);
  assert.ok(readingParagraphs(result.reflection).length >= 2);
  assert.deepEqual(
    result.connections!.map(({ cardId, orientation }) => ({
      id: cardId,
      orientation,
    })),
    example.cards,
  );
  assert.ok(
    result.connections!.every(
      ({ text }) => text.split(/\s+/u).length <= 65 && /[.!?]$/u.test(text),
    ),
  );
  assert.match(result.connections![0].text, /giả định/);
  assert.match(result.connections![1].text, /điều kiện|quan sát/);
  assert.match(result.connections![2].text, /hoạt động|quan hệ/);
  assert.equal(result.actions[1].title, "So sánh cùng tiêu chí");
  assert.match(result.actions[2].detail, /trải nghiệm.*tiêu chí/u);
  assert.doesNotMatch(
    result.actions.map((action) => action.detail).join(" "),
    /\b(?:10 phút|7 ngày)\b/u,
  );
  assert.match(result.followUpSuggestion!, /Hai hướng/);
});

test("legacy prose gains paragraph breaks without interpreting HTML or losing its words", () => {
  const prose =
    "Ý đầu tiên. Ý thứ hai! Câu hỏi thứ ba? Ý thứ tư. <script>alert(1)</script>";
  const paragraphs = readingParagraphs(prose);
  assert.equal(paragraphs.length, 3);
  assert.equal(paragraphs.join(" "), prose);
  assert.deepEqual(readingParagraphs("Đoạn A.\n\nĐoạn B."), [
    "Đoạn A.",
    "Đoạn B.",
  ]);
  assert.deepEqual(
    readingParagraphs("GPA hiện tại là 3.5. Bạn muốn kiểm tra điều gì?"),
    ["GPA hiện tại là 3.5. Bạn muốn kiểm tra điều gì?"],
  );
});

test("old saved readings still parse, and contextual labels never point at different cards or orientations", () => {
  const result = localReading(example);
  const { connections, ...legacy } = result;
  assert.ok(readingResultSchema.safeParse(legacy).success);
  assert.equal(
    matchingConnections(legacy, example.cards, example.spread),
    undefined,
  );
  assert.deepEqual(
    matchingConnections(result, example.cards, example.spread),
    connections,
  );
  assert.equal(
    matchingConnections(result, [...example.cards].reverse(), example.spread),
    undefined,
  );
  assert.equal(
    matchingConnections(
      result,
      example.cards.map((card) => ({ ...card, orientation: "upright" })),
      example.spread,
    ),
    undefined,
  );
  assert.equal(
    matchingConnections(
      {
        ...result,
        connections: connections!.map((connection) => ({
          ...connection,
          position: "Góc nhìn",
        })),
      },
      example.cards,
      example.spread,
    ),
    undefined,
  );
});
