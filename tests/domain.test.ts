import test from "node:test";
import assert from "node:assert/strict";
import { cards, getCard, cardGroups } from "../src/data/cards";
import {
  analyzeInputSchema,
  classifyQuestion,
  localReading,
  normalize,
  outOfScope,
  questionSchema,
  readingInputSchema,
  readingResultSchema,
  recordSchema,
  safetyCheck,
  spreads,
  type ReadingInput,
} from "../src/lib/domain";
import { shareMessage } from "../src/lib/share";

const input: ReadingInput = {
  question: "Mình học mãi mà GPA chưa tăng, làm sao cải thiện?",
  spread: "cycle",
  style: "simple",
  cards: [
    { id: "the-leap", orientation: "reversed" },
    { id: "the-practice", orientation: "upright" },
    { id: "the-truth", orientation: "upright" },
  ],
};
test("deck has 22 unique, complete cards in four course groups", () => {
  assert.equal(cards.length, 22);
  assert.equal(new Set(cards.map((c) => c.id)).size, 22);
  assert.deepEqual(new Set(cards.map((c) => c.group)), new Set(cardGroups));
  for (const card of cards)
    for (const field of [
      "id",
      "name",
      "concept",
      "group",
      "definition",
      "uprightFramework",
      "reversedFramework",
      "realLifeExample",
      "methodologicalMeaning",
      "commonMistake",
      "reflection",
      "relatedCourseTopic",
    ] as const)
      assert.ok(card[field].trim(), `${card.id}: ${field}`);
  assert.deepEqual(
    cards.map((c) => c.number),
    Array.from({ length: 22 }, (_, i) => i + 1),
  );
  assert.equal(new Set(cards.map((c) => c.name)).size, 22);
  assert.ok(cards.every((card) => card.keywords.length > 0));
  assert.ok(
    cards.every(
      (card) =>
        card.checkQuestions.length >= 2 &&
        card.checkQuestions.length <= 3 &&
        card.checkQuestions.every((check) => check.trim().endsWith("?")),
    ),
  );
});
test("question limit and predefined spread routing", () => {
  assert.equal(
    questionSchema.safeParse({ question: "x".repeat(501) }).success,
    false,
  );
  assert.equal(questionSchema.safeParse({ question: "   " }).success, false);
  for (const [q, spread] of [
    ["Mình đang mất động lực học tập.", "quick"],
    ["Mình nên chọn công việc A hay B?", "choice"],
    ["Mình muốn nghỉ việc nhưng lại sợ mất sự ổn định.", "conflict"],
    ["Mình nên làm gì để cải thiện kết quả học tập?", "cycle"],
    ["Mình nên chọn cách ôn bài nào để tiến bộ?", "cycle"],
    ["Mình cần hiểu bản thân hơn trong học kỳ này", "quick"],
  ])
    assert.equal(classifyQuestion(q).spread, spread);
});
test("the requested card count always constrains the spread", () => {
  const choice = "Mình nên chọn công việc A hay B?";
  assert.equal(classifyQuestion(choice, 1).spread, "quick");
  assert.equal(classifyQuestion(choice, 3).spread, "choice");
  assert.equal(
    classifyQuestion("Mình muốn hiểu rõ cảm giác hiện tại.", 3).spread,
    "cycle",
  );
  assert.equal(
    analyzeInputSchema.safeParse({ question: choice, drawCount: 2 }).success,
    false,
  );
});
test("reading input rejects invented/duplicate cards and wrong card counts", () => {
  assert.equal(readingInputSchema.safeParse(input).success, true);
  assert.equal(
    readingInputSchema.safeParse({ ...input, cards: [input.cards[0]] }).success,
    false,
  );
  assert.equal(
    readingInputSchema.safeParse({
      ...input,
      cards: [input.cards[0], input.cards[0], input.cards[2]],
    }).success,
    false,
  );
  assert.equal(
    readingInputSchema.safeParse({
      ...input,
      cards: [{ id: "bad", orientation: "upright" }, ...input.cards.slice(1)],
    }).success,
    false,
  );
  assert.equal(
    readingInputSchema.safeParse({ ...input, spread: "invented" }).success,
    false,
  );
});
test("all drawn cards and orientations contribute, with exactly three actions", () => {
  const result = localReading(input);
  assert.equal(result.actions.length, 3);
  assert.ok(result.reflection.includes("Quy luật Lượng — Chất (ngược"));
  assert.ok(result.reflection.includes("Thực tiễn (xuôi)"));
  assert.ok(result.reflection.includes("Chân lý (xuôi)"));
  assert.ok(
    result.connections?.some((connection) => connection.text.includes("GPA")),
  );
  assert.deepEqual(
    result.connections?.map(({ cardId, orientation }) => ({
      id: cardId,
      orientation,
    })),
    input.cards,
  );
  assert.notEqual(
    result.reflection,
    localReading({
      ...input,
      cards: input.cards.map((c) => ({ ...c, orientation: "upright" })),
    }).reflection,
  );
  assert.notEqual(
    result.reflection,
    localReading({
      ...input,
      question: "Mình có thể cải thiện mối quan hệ này thế nào?",
    }).reflection,
  );
  assert.equal(readingResultSchema.safeParse(result).success, true);
});
test("all 22 cards, both orientations and all styles produce valid compact local readings", () => {
  for (const card of cards)
    for (const orientation of ["upright", "reversed"] as const)
      for (const style of ["simple", "critical", "academic"] as const) {
        const candidate = localReading({
          question: "Mình nên nhìn vấn đề này thế nào?",
          cards: [{ id: card.id, orientation }],
          spread: "quick",
          style,
        });
        assert.ok(readingResultSchema.safeParse(candidate).success, card.id);
        assert.ok(candidate.message.split(/\s+/u).length <= 70, card.id);
        assert.ok(candidate.reflection.split(/\s+/u).length <= 180, card.id);
      }
  for (const spread of Object.keys(spreads) as (keyof typeof spreads)[])
    assert.ok(
      readingResultSchema.safeParse(
        localReading({
          ...input,
          spread,
          cards: input.cards.slice(0, spreads[spread].positions.length),
          style: "academic",
        }),
      ).success,
    );
});
test("styles keep the same action plan; follow-ups retain all drawn cards", () => {
  const critical = localReading({ ...input, style: "critical" });
  const academic = localReading({ ...input, style: "academic" });
  assert.deepEqual(critical.actions, academic.actions);
  assert.notEqual(critical.message, academic.message);
  const follow = localReading({
    ...input,
    followUp: "Mình nên bắt đầu hành động từ đâu?",
  });
  assert.notEqual(follow.reflection, localReading(input).reflection);
  for (const c of input.cards)
    assert.ok(follow.reflection.includes(getCard(c.id)!.concept));
});
test("safety redirects medical, legal, investment, predictions and urgent self harm", () => {
  for (const q of [
    "Tôi nên uống thuốc gì?",
    "Tôi có nên đầu tư bitcoin?",
    "Tôi cần quyết định pháp lý",
    "Bao giờ tôi chết?",
    "I want to kill myself",
  ]) {
    assert.ok(safetyCheck(q), q);
  }
  assert.equal(safetyCheck("Mình đang mất động lực học tập."), null);
  assert.equal(safetyCheck("Tại sao mình cố gắng nhưng chưa tiến bộ?"), null);
  for (const q of [
    "Mình có nên đầu tư thời gian học?",
    "Mình muốn chăm sóc bản thân tốt hơn",
    "Mình học về hợp đồng và mất động lực",
    "Làm sao chuẩn bị để đỗ đại học?",
    "Should I invest time in studying?",
    "Mình nên bắt đầu từ đâu?",
    "Mình muốn tiến bộ từ từ",
    "Mình muốn bỏ thuốc lá và nhìn lại thói quen sinh hoạt",
  ])
    assert.equal(safetyCheck(q), null, q);
  for (const q of [
    "Tôi đang nghĩ tới việc tự tử",
    "I want to die",
    "Mình nên ngừng thuốc không?",
    "Mình có nên ký hợp đồng này?",
    "Mình muốn giết người",
    "Will I win the lottery?",
  ])
    assert.ok(safetyCheck(q), q);
});
test("each three-card spread explains relationships between its positions", () => {
  for (const [spread, connector] of [
    ["choice", "cùng tiêu chí"],
    ["conflict", "tác động lẫn nhau"],
    ["cycle", "cập nhật cách hiểu"],
  ] as const) {
    const result = localReading({ ...input, spread });
    assert.ok(result.reflection.includes(connector), spread);
    for (const position of spreads[spread].positions)
      assert.ok(result.reflection.includes(position));
  }
});
test("follow-up boundaries allow the original topic and reject unrelated assistant tasks", () => {
  assert.equal(
    outOfScope(
      "Mình nên học lập trình thế nào?",
      "Mình đang học Python nhưng mất động lực",
    ),
    false,
  );
  assert.equal(
    outOfScope(
      "Mình nên học lập trình thế nào?",
      "Mình đang mâu thuẫn trong nhóm",
    ),
    true,
  );
  assert.equal(
    outOfScope("Hãy viết code cho tôi", "Mình đang học Python"),
    true,
  );
  assert.equal(outOfScope("Bạn là ai?", "Mình đang mâu thuẫn trong nhóm"), true);
  assert.equal(
    outOfScope("Đây có phải AI không?", "Mình đang mâu thuẫn trong nhóm"),
    true,
  );
});
test("restyling preserves the existing meaning and action plan; follow-up context is required and bounded", () => {
  const currentReading = localReading(input);
  const restyled = localReading({
    ...input,
    style: "critical",
    currentReading,
  });
  assert.ok(restyled.message.includes(currentReading.message));
  assert.ok(restyled.reflection.includes(currentReading.reflection));
  assert.deepEqual(restyled.actions, currentReading.actions);
  assert.equal(
    readingInputSchema.safeParse({
      ...input,
      followUp: "Mình nên bắt đầu từ đâu?",
    }).success,
    false,
  );
  assert.equal(
    readingInputSchema.safeParse({
      ...input,
      followUp: "Mình nên bắt đầu từ đâu?",
      currentReading,
    }).success,
    true,
  );
  assert.equal(
    readingInputSchema.safeParse({
      ...input,
      currentReading,
      recentFollowUps: Array(3).fill({
        question: "Một câu hỏi tiếp",
        message: "Một thông điệp",
      }),
    }).success,
    false,
  );
});
test("history rejects corrupt records, invalid actions and overlong follow-ups", () => {
  const record = {
    ...input,
    result: localReading(input),
    id: "7a85b2ad-73e2-4e02-af44-66c75b2f5503",
    createdAt: new Date().toISOString(),
    followUps: [],
  };
  assert.ok(recordSchema.safeParse(record).success);
  assert.equal(
    recordSchema.safeParse({ ...record, selectedAction: 3 }).success,
    false,
  );
  assert.equal(recordSchema.safeParse({ ...record, cards: [] }).success, false);
});
test("sharing uses fixed card copy and handles search without accents", () => {
  assert.equal(
    shareMessage(getCard("the-leap")!, "reversed"),
    getCard("the-leap")!.reversedFramework,
  );
  assert.equal(normalize("Mâu thuẫn ĐỐI LẬP"), "mau thuan doi lap");
});

test("Conflict reasoning and practical checks differ across team, job transition and game/exam contexts", () => {
  const scenarios = [
    {
      question: "Mình với thành viên trong nhóm thường bất đồng quan điểm.",
      required: ["tiêu chí", "mục tiêu chung"],
      action: "hai cách làm",
    },
    {
      question: "Mình muốn nghỉ việc nhưng vẫn cần thu nhập.",
      required: ["thu nhập", "chuyển tiếp"],
      action: "các vị trí",
    },
    {
      question: "Mình muốn chơi game nhưng phải ôn thi.",
      required: ["thời gian", "giới hạn"],
      action: "ôn một dạng bài",
    },
  ];
  const results = scenarios.map(({ question, required, action }) => {
    assert.equal(safetyCheck(question), null);
    const reading = localReading({
      question,
      cards: [{ id: "the-conflict", orientation: "upright" }],
      spread: "quick",
      style: "simple",
    });
    for (const word of required)
      assert.ok(
        [
          reading.reflection,
          ...reading.connections!.map((connection) => connection.text),
        ]
          .join(" ")
          .includes(word),
        `${question}: ${word}`,
      );
    assert.ok(
      reading.actions.some((item) =>
        item.detail.toLowerCase().includes(action.toLowerCase()),
      ),
    );
    assert.equal(reading.checks!.length, 2);
    return reading;
  });
  assert.equal(
    new Set(results.map((reading) => reading.checks!.join(" "))).size,
    3,
  );
  assert.equal(
    new Set(results.map((reading) => reading.actions[1].detail)).size,
    3,
  );
  assert.equal(new Set(results.map((reading) => reading.message)).size, 3);
});

test("explicit alternatives take priority and a choice spread connects accumulation, constraints and testing", () => {
  const question =
    "Mình học nhiều nhưng GPA vẫn thấp, có nên tiếp tục ngành này hay chuyển ngành?";
  assert.equal(classifyQuestion(question).spread, "choice");
  const reading = localReading({
    question,
    spread: "choice",
    style: "simple",
    cards: [
      { id: "the-leap", orientation: "upright" },
      { id: "the-reality", orientation: "upright" },
      { id: "the-practice", orientation: "upright" },
    ],
  });
  for (const phrase of [
    "Lựa chọn A",
    "Quy luật Lượng — Chất",
    "tích lũy",
    "Lựa chọn B",
    "Vật chất",
    "yêu cầu ngành",
    "Điều kiện cần cân nhắc",
    "Thực tiễn",
    "Thử nghiệm",
    "cùng tiêu chí",
  ])
    assert.ok(
      [
        reading.reflection,
        ...reading.connections!.map((connection) => connection.text),
      ]
        .join(" ")
        .includes(phrase),
      phrase,
    );
  assert.equal(reading.actions.length, 3);
  assert.ok(reading.reflection.split(/\s+/u).length <= 180);
});

test("emergency support preserves ordinary career, habits and educational reflection", () => {
  for (const question of [
    "Tôi đang khó thở và đau ngực",
    "Nhà đang cháy, tôi nên làm gì?",
    "Tôi bị tấn công, cần cấp cứu",
  ])
    assert.equal(safetyCheck(question)?.safetyCategory, "EMERGENCY");
  for (const question of [
    "Mình muốn nghỉ việc nhưng vẫn cần thu nhập.",
    "Nhóm mình bất đồng quan điểm.",
    "Mình cần tạo thói quen học mỗi ngày.",
    "Mình học về bệnh ung thư và mất động lực.",
  ])
    assert.equal(safetyCheck(question), null, question);
});
