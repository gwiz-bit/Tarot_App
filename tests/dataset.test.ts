import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ACADEMIC_SOURCE_STATUS,
  CARD_DATA_VERSION,
  cards,
  formatCardNumber,
  getCard,
} from "../src/data/cards";
import { selectedCardContext } from "../src/lib/card-context";
import { readingFingerprint } from "../src/lib/reading-cache";
import {
  localReading,
  normalize,
  readingInputSchema,
  readingResultSchema,
  recordSchema,
  type ReadingInput,
} from "../src/lib/domain";
import { parseReadingSession } from "../src/lib/reading-session";

const identities = [
  ["The Reality", "Vật chất"],
  ["The Mind", "Ý thức"],
  ["The Connection", "Mối liên hệ phổ biến"],
  ["The Flow", "Sự phát triển"],
  ["The Conflict", "Quy luật mâu thuẫn"],
  ["The Leap", "Quy luật Lượng — Chất"],
  ["The Spiral", "Phủ định của phủ định"],
  ["The Individual", "Cái riêng — Cái chung"],
  ["The Cause", "Nguyên nhân — Kết quả"],
  ["The Chance", "Tất nhiên — Ngẫu nhiên"],
  ["The Form", "Nội dung — Hình thức"],
  ["The Essence", "Bản chất — Hiện tượng"],
  ["The Possibility", "Khả năng — Hiện thực"],
  ["The Practice", "Thực tiễn"],
  ["The Truth", "Chân lý"],
  ["The Ascent", "Quá trình nhận thức"],
  ["The Forces", "Lực lượng sản xuất — Quan hệ sản xuất"],
  ["The Structure", "Cơ sở hạ tầng — Kiến trúc thượng tầng"],
  ["The Society", "Tồn tại xã hội — Ý thức xã hội"],
  ["The Human", "Con người và bản chất con người"],
  ["The Masses", "Quần chúng — Cá nhân"],
  ["The Turning", "Biến đổi xã hội"],
];
const question =
  "Dự án nhóm chưa tiến bộ sau nhiều lần thử, cần xem lại điều gì?";
const inputFor = (id: string, text = question): ReadingInput => ({
  question: text,
  spread: "quick",
  cards: [{ id, orientation: "upright" }],
  style: "simple",
});

test("A: exact requested 22 identities, numeric order, groups and normalized fields", () => {
  assert.deepEqual(
    cards.map((card) => [card.name, card.concept]),
    identities,
  );
  assert.deepEqual(
    cards.map((card) => formatCardNumber(card.number)),
    Array.from({ length: 22 }, (_, i) => String(i + 1).padStart(2, "0")),
  );
  assert.equal(new Set(cards.map((card) => card.id)).size, 22);
  assert.deepEqual(
    cards.map((card) => card.group),
    [
      ...Array(4).fill("Thế giới quan"),
      ...Array(9).fill("Phép biện chứng"),
      ...Array(3).fill("Lý luận nhận thức"),
      ...Array(6).fill("Con người & xã hội"),
    ],
  );
  for (const card of cards) {
    for (const field of [
      "id",
      "name",
      "concept",
      "definition",
      "analysisFocus",
      "uprightFramework",
      "reversedFramework",
      "methodologicalMeaning",
      "commonMistake",
      "realLifeExample",
      "relatedCourseTopic",
    ] as const) {
      assert.ok(card[field].trim(), `${card.id}: ${field}`);
      assert.doesNotMatch(card[field], /\bTODO\b|lorem ipsum|placeholder/i);
    }
    assert.equal(card.academicSourceStatus, ACADEMIC_SOURCE_STATUS);
    assert.ok(Array.isArray(card.avoidForContexts));
  }
});

test("B: overlapping cards retain different analysis subjects", () => {
  assert.equal(new Set(cards.map((card) => card.analysisFocus)).size, 22);
  const lenses: [string, RegExp][] = [
    ["the-reality", /nguon luc.*gioi han khach quan/],
    ["the-truth", /tri thuc.*ket luan/],
    ["the-connection", /yeu to tac dong qua lai/],
    ["the-society", /y thuc xa hoi/],
    ["the-flow", /qua trinh/],
    ["the-spiral", /phu dinh/],
    ["the-turning", /doi song xa hoi/],
    ["the-conflict", /hai mat/],
    ["the-practice", /gia dinh.*hanh dong/],
    ["the-ascent", /quan sat.*khai quat.*thuc tien/],
    ["the-individual", /cai chung.*hoan canh rieng/],
    ["the-human", /quan he xa hoi/],
    ["the-forces", /luc luong san xuat.*quan he san xuat/],
    ["the-structure", /co so kinh te.*kien truc thuong tang/],
  ];
  for (const [id, lens] of lenses)
    assert.match(normalize(getCard(id)!.analysisFocus), lens);
});

test("C–D: draft reversed lenses are not bare good/bad labels; checks stay 2–3 non-generic questions", () => {
  const barePsychology =
    /^(?:xau|tieu cuc|that bai|so thay doi|thieu tu tin|can co gang hon)[.!]?$/;
  for (const card of cards) {
    assert.doesNotMatch(
      normalize(card.reversedFramework.trim()),
      barePsychology,
    );
    assert.notEqual(card.uprightFramework, card.reversedFramework);
    assert.ok(
      card.checkQuestions.length >= 2 && card.checkQuestions.length <= 3,
    );
    assert.equal(new Set(card.checkQuestions).size, card.checkQuestions.length);
    for (const check of card.checkQuestions) {
      assert.ok(check.endsWith("?"));
      assert.doesNotMatch(
        normalize(check),
        /ban co tin vao ban than|van menh|so phan/,
      );
    }
  }
  // Academic sufficiency is explicitly unresolved, not certified by these text guards.
  assert.equal(
    cards.filter((card) => card.academicSourceStatus === ACADEMIC_SOURCE_STATUS)
      .length,
    22,
  );
});

test("E: same situation reaches different concrete local lenses and minimal selected context", () => {
  const cases: [string, RegExp][] = [
    ["the-reality", /nguon luc/],
    ["the-conflict", /bat dong|quan diem/],
    ["the-leap", /so cuoc hop|tich luy/],
    ["the-practice", /thu nghiem/],
    ["the-truth", /ket luan|dieu kien cu the/],
  ];
  for (const [id, lens] of cases) {
    const result = localReading(inputFor(id));
    assert.match(normalize(result.reflection), lens);
    assert.ok(readingResultSchema.safeParse(result).success);
    const context = selectedCardContext(inputFor(id).cards[0], "Góc nhìn");
    assert.equal(context.analysisFocus, getCard(id)!.analysisFocus);
    assert.equal(context.cardId, id);
    assert.deepEqual(Object.keys(context).sort(), [
      "academicSourceStatus",
      "analysisFocus",
      "cardId",
      "checkQuestions",
      "concept",
      "definition",
      "name",
      "orientation",
      "orientationFramework",
      "position",
    ]);
  }
});

test("F: Leap has different applications to GPA, relationships and business, preserving fixed philosophy", () => {
  const card = getCard("the-leap")!;
  const fixed = JSON.stringify(card);
  const cases: [string, RegExp][] = [
    [
      "Mình học mãi mà GPA không cải thiện, cần làm gì?",
      /gpa|bai tu giai|phan hoi/,
    ],
    [
      "Mối quan hệ của mình lặp lại cùng một mâu thuẫn, cần làm gì?",
      /trao doi|cam ket|giao tiep/,
    ],
    [
      "Dự án kinh doanh của mình chưa tăng trưởng, cần làm gì?",
      /khach hang|san pham|phuc vu/,
    ],
  ];
  const outputs = cases.map(([text, lens]) => {
    const result = localReading(inputFor(card.id, text));
    assert.match(normalize(result.reflection), lens);
    assert.ok(readingResultSchema.safeParse(result).success);
    assert.equal(JSON.stringify(card), fixed);
    return result.reflection;
  });
  assert.equal(new Set(outputs).size, 3);
});

test("social scope is carried to Gemini and retained when local fallback lacks evidence", () => {
  const unrelated =
    "Người yêu mình trả lời tin nhắn chậm, mình nên hiểu thế nào?";
  for (const card of cards.slice(16)) {
    assert.ok(card.avoidForContexts.length > 0);
    const input = inputFor(card.id, unrelated);
    const context = selectedCardContext(input.cards[0], "Góc nhìn");
    assert.deepEqual(context.avoidForContexts, card.avoidForContexts);
    assert.equal(context.scopeStatus, "requires-context");
    assert.ok(context.scopeNotice);
    const result = localReading(input);
    assert.match(result.message, /bối cảnh xã hội/);
    assert.match(result.checks![0], /bối cảnh xã hội phù hợp/);
    assert.equal(result.actions[1].title, "Xác minh phạm vi áp dụng");
    assert.ok(readingResultSchema.safeParse(result).success);
  }
});

test("social context signals permit verification without claiming a confirmed connection", () => {
  const draw = { id: "the-forces", orientation: "upright" as const };
  const context = selectedCardContext(
    draw,
    "Góc nhìn",
    "Công nghệ thay đổi cách tổ chức lao động và sản xuất.",
  );
  assert.equal(context.scopeStatus, "verify-context");
  assert.equal(context.scopeNotice, undefined);
  assert.ok(context.avoidForContexts!.length);
  assert.equal(context.academicSourceStatus, ACADEMIC_SOURCE_STATUS);
  const personal = selectedCardContext(
    draw,
    "Góc nhìn",
    "Công nghệ giúp mình nhắn tin với người yêu.",
  );
  assert.equal(personal.scopeStatus, "requires-context");
});

test("G: no unreviewed academic rewrite, invented chapter mappings or thinker attributions", () => {
  const before = JSON.parse(
    readFileSync("artifacts/dataset-audit/cards-before.json", "utf8"),
  ) as {
    name: string;
    philosophy: string;
    upright: string;
    reversed: string;
    keywords: string[];
    checkQuestions: string[];
    method: string;
    blindspot: string;
    example: string;
  }[];
  for (const card of cards) {
    const original = before.find(
      (entry) =>
        entry.name ===
        (card.name === "The Individual" ? "The Particular" : card.name),
    )!;
    assert.equal(card.definition, original.philosophy);
    assert.equal(card.uprightFramework, original.upright);
    assert.equal(card.reversedFramework, original.reversed);
    assert.equal(card.methodologicalMeaning, original.method);
    assert.equal(card.commonMistake, original.blindspot);
    assert.equal(card.realLifeExample, original.example);
    assert.deepEqual(card.keywords, original.keywords);
    assert.deepEqual(card.checkQuestions, original.checkQuestions);
    assert.match(
      card.relatedCourseTopic,
      /UNSUPPORTED BY PROVIDED COURSE MATERIAL/,
    );
    assert.doesNotMatch(card.relatedCourseTopic, /Chương\s*\d/);
    assert.doesNotMatch(
      card.analysisFocus,
      /Marx|Engels|Lenin|Mác|Ăngghen|Lênin|“|”/,
    );
  }
});

test("legacy Individual ID migrates in place without changing selection, positions or orientations", () => {
  const input = inputFor("the-particular");
  input.cards[0].orientation = "reversed";
  const parsed = readingInputSchema.parse(input);
  assert.deepEqual(parsed.cards, [
    { id: "the-individual", orientation: "reversed" },
  ]);
  assert.equal(getCard("the-particular"), getCard("the-individual"));
  assert.equal(readingFingerprint(input), readingFingerprint(parsed));
  assert.ok(readingFingerprint(parsed).includes(CARD_DATA_VERSION));
  assert.ok(
    !readingInputSchema.safeParse({
      ...input,
      spread: "choice",
      cards: [
        input.cards[0],
        { id: "the-individual", orientation: "upright" },
        { id: "the-reality", orientation: "upright" },
      ],
    }).success,
  );

  const record = {
    ...input,
    id: "a8f26671-7f4b-4300-9c8d-958601ee8c26",
    createdAt: "2026-10-04T00:00:00.000Z",
    result: localReading(input),
    followUps: [],
  };
  assert.deepEqual(recordSchema.parse(record).cards, parsed.cards);
  const legacyDeck = [
    "the-reality",
    "the-mind",
    "the-connection",
    "the-flow",
    "the-conflict",
    "the-leap",
    "the-spiral",
    "the-cause",
    "the-essence",
    "the-possibility",
    "the-practice",
    "the-truth",
    "the-ascent",
    "the-forces",
    "the-structure",
    "the-society",
    "the-human",
    "the-masses",
    "the-turning",
    "the-particular",
    "the-chance",
    "the-form",
  ].map((id) => ({ id, orientation: "reversed" }));
  const restored = parseReadingSession(
    JSON.stringify({
      version: 1,
      stage: "result",
      question: input.question,
      analysis: { spread: "quick", reason: "Một góc nhìn", source: "local" },
      deck: legacyDeck,
      selected: [19],
      record,
    }),
  )!;
  assert.ok(restored);
  assert.deepEqual(restored.selected, [19]);
  assert.deepEqual(
    restored.deck.map((draw) => draw.id),
    legacyDeck.map((draw) =>
      draw.id === "the-particular" ? "the-individual" : draw.id,
    ),
  );
  assert.deepEqual(restored.deck[19], parsed.cards[0]);
  assert.deepEqual(restored.record!.cards, parsed.cards);
});
