import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  localReading,
  localDate,
  classifyQuestion,
  readingChecks,
  type ReadingInput,
  type ReadingRecord,
} from "../src/lib/domain";
import {
  getDailyCard,
  readHistory,
  removeRecord,
  saveRecord,
  shuffleDeck,
} from "../src/lib/storage";
import {
  clearReadingSession,
  createReadingSession,
  parseReadingSession,
  readReadingSession,
  writeReadingSession,
} from "../src/lib/reading-session";
import { cachedTone, withReadingTone } from "../src/lib/reading-cache";

class MemoryStorage implements Storage {
  private entries = new Map<string, string>();
  get length() {
    return this.entries.size;
  }
  clear() {
    this.entries.clear();
  }
  getItem(key: string) {
    return this.entries.get(key) ?? null;
  }
  key(index: number) {
    return [...this.entries.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.entries.delete(key);
  }
  setItem(key: string, value: string) {
    this.entries.set(key, String(value));
  }
}
const HISTORY = "philo-tarot:history:v1";
const SESSION = "philo-tarot:session:v1";
const input: ReadingInput = {
  question: "Mình cần nhìn lại việc học thế nào?",
  cards: [{ id: "the-practice", orientation: "reversed" }],
  spread: "quick",
  style: "simple",
};
function record(day = 1): ReadingRecord {
  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date(2026, 9, day).toISOString(),
    result: localReading(input),
    followUps: [],
  };
}
let original: Record<string, PropertyDescriptor | undefined>;
beforeEach(() => {
  original = {};
  for (const key of ["localStorage", "sessionStorage", "window"])
    original[key] = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: new MemoryStorage(),
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: new MemoryStorage(),
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: new EventTarget(),
  });
  clearReadingSession();
});
afterEach(() => {
  clearReadingSession();
  for (const key of Object.keys(original)) {
    if (original[key]) Object.defineProperty(globalThis, key, original[key]!);
    else Reflect.deleteProperty(globalThis, key);
  }
});

test("history round-trips orientation, action outcome and follow-ups and notifies subscribers", () => {
  const reading = record();
  const complete = {
    ...reading,
    selectedAction: 1,
    outcome: "improved" as const,
    followUps: [
      { question: "Mình nên bắt đầu từ đâu?", result: reading.result },
    ],
  };
  let events = 0;
  window.addEventListener("tarot-history", () => events++);
  const stored = saveRecord(complete);
  assert.deepEqual(readHistory(), [stored]);
  assert.ok(stored.updatedAt);
  assert.equal(stored.selectedAction, complete.selectedAction);
  assert.deepEqual(stored.followUps, complete.followUps);
  assert.equal(JSON.parse(localStorage.getItem(HISTORY)!).version, 1);
  assert.equal(events, 1);
  removeRecord(reading.id);
  assert.deepEqual(readHistory(), []);
  assert.equal(events, 2);
});
test("history replaces the same reading and keeps the 30 newest readings", () => {
  const reading = record();
  saveRecord(reading);
  saveRecord({ ...reading, selectedAction: 2 });
  assert.equal(readHistory().length, 1);
  assert.equal(readHistory()[0].selectedAction, 2);
  for (let day = 2; day <= 32; day++) saveRecord(record(day));
  const kept = readHistory();
  assert.equal(kept.length, 30);
  assert.ok(!kept.some((r) => r.id === reading.id));
  assert.ok(
    kept.every(
      (r, i) =>
        !i || Date.parse(kept[i - 1].createdAt) >= Date.parse(r.createdAt),
    ),
  );
});
test("invalid, oversized, unknown-version and malformed history cannot crash parsing", () => {
  for (const raw of [
    "{",
    "null",
    '"text"',
    JSON.stringify({ version: 2, readings: [] }),
    JSON.stringify({ version: 1, readings: [{ ...record(), cards: [] }] }),
    "x".repeat(500001),
  ]) {
    localStorage.setItem(HISTORY, raw);
    assert.deepEqual(readHistory(), []);
  }
  saveRecord(record());
  assert.equal(readHistory().length, 1);
});
test("history payload stays bounded even with eight large follow-up results per reading", () => {
  for (let day = 1; day <= 30; day++) {
    const reading = record(day);
    const large = {
      ...reading.result,
      message: "m".repeat(850),
      reflection: "r".repeat(2600),
    };
    saveRecord({
      ...reading,
      followUps: Array.from({ length: 8 }, () => ({
        question: "q".repeat(500),
        result: large,
      })),
    });
  }
  assert.ok(localStorage.getItem(HISTORY)!.length <= 500000);
  assert.ok(readHistory().length > 0 && readHistory().length < 30);
});
test("denied storage does not break history reads or deterministic daily draws", () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("Storage denied");
    },
  });
  assert.deepEqual(readHistory(), []);
  assert.throws(() => saveRecord(record()), /Storage denied/);
  const day = new Date(2026, 9, 4, 10);
  assert.deepEqual(getDailyCard(day), getDailyCard(day));
});
test("daily card is stable during the local day and rolls over at local midnight", () => {
  const day = new Date(2026, 9, 4, 23, 59);
  const draw = getDailyCard(day);
  assert.deepEqual(getDailyCard(new Date(2026, 9, 4, 6)), draw);
  const nextDay = new Date(2026, 9, 5, 0, 0);
  const next = getDailyCard(nextDay);
  assert.notDeepEqual(next, draw);
  assert.equal(
    JSON.parse(localStorage.getItem("philo-tarot:daily:v1")!).date,
    localDate(nextDay),
  );
  localStorage.setItem("philo-tarot:daily:v1", "corrupt");
  assert.deepEqual(getDailyCard(nextDay), next);
});
test("shuffled deck contains all 22 unique cards with usable orientations", () => {
  const deck = shuffleDeck();
  assert.equal(new Set(deck.map((draw) => draw.id)).size, 22);
  assert.equal(deck.length, 22);
  assert.ok(
    deck.every((draw) => ["upright", "reversed"].includes(draw.orientation)),
  );
});
test("new readings shuffle again even for the same question, while restoring keeps the deck", (t) => {
  let entropy = 0;
  const random = t.mock.method(
    crypto,
    "getRandomValues",
    (values: Uint32Array) => {
      values.fill(entropy);
      return values;
    },
  );
  const analysis = classifyQuestion(input.question);
  const first = createReadingSession(input.question, analysis);
  entropy = 1;
  const next = createReadingSession(input.question, analysis);
  assert.equal(random.mock.callCount(), 2);
  assert.notEqual(first.deck[0].id, next.deck[0].id);
  assert.deepEqual(
    first.deck.map((draw) => draw.id).sort(),
    next.deck.map((draw) => draw.id).sort(),
  );
  next.selected = [0];
  writeReadingSession(next);
  const restored = readReadingSession();
  assert.deepEqual(restored?.deck, next.deck);
  assert.deepEqual(restored?.selected, [0]);
  assert.equal(random.mock.callCount(), 2);
});
test("shuffle rejects random values that would bias the position distribution", (t) => {
  const random = t.mock.method(
    crypto,
    "getRandomValues",
    (values: Uint32Array) => {
      values.fill(0);
      // The first 22 samples select orientation; the next selects from 22 cards.
      values[22] = 0xffffffff;
      return values;
    },
  );
  const rejected = shuffleDeck();
  random.mock.restore();
  t.mock.method(crypto, "getRandomValues", (values: Uint32Array) => {
    values.fill(0);
    return values;
  });
  assert.deepEqual(rejected, shuffleDeck());
  assert.equal(new Set(rejected.map((draw) => draw.id)).size, 22);
});
test("daily draws keep the previous identity mapping after the deck reorder and migrate a stored legacy ID", () => {
  assert.deepEqual(getDailyCard(new Date(2026, 9, 4, 12)), {
    id: "the-form",
    orientation: "reversed",
  });
  localStorage.setItem(
    "philo-tarot:daily:v1",
    JSON.stringify({
      date: "2026-10-04",
      card: { id: "the-particular", orientation: "upright" },
    }),
  );
  assert.deepEqual(getDailyCard(new Date(2026, 9, 4, 12)), {
    id: "the-individual",
    orientation: "upright",
  });
});
test("draw session restores the exact deck, selected positions and orientations", () => {
  const session = createReadingSession(input.question, {
    spread: "cycle",
    reason: "Hiểu, thử và kiểm tra",
    source: "local",
  });
  session.selected = [3, 9];
  writeReadingSession(session);
  assert.deepEqual(readReadingSession(), session);
  const selected = [3, 9, 15];
  const reading = {
    ...record(),
    readingSessionId: session.readingSessionId,
    spread: "cycle" as const,
    cards: selected.map((i) => session.deck[i]),
  };
  const completed = {
    ...session,
    stage: "result" as const,
    selected,
    record: reading,
  };
  writeReadingSession(completed);
  assert.deepEqual(
    parseReadingSession(sessionStorage.getItem(SESSION)),
    completed,
  );
});
test("session parser rejects corrupt or inconsistent card/result state", () => {
  const session = createReadingSession(input.question, {
    spread: "quick",
    reason: "Một góc nhìn",
    source: "local",
  });
  assert.equal(parseReadingSession("{bad"), null);
  assert.equal(parseReadingSession("x".repeat(100001)), null);
  assert.equal(
    parseReadingSession(JSON.stringify({ ...session, selected: [0, 0] })),
    null,
  );
  assert.equal(
    parseReadingSession(
      JSON.stringify({
        ...session,
        stage: "result",
        selected: [0],
        record: { ...record(), question: "Một câu hỏi khác" },
      }),
    ),
    null,
  );
  assert.equal(
    parseReadingSession(
      JSON.stringify({
        ...session,
        deck: session.deck.map(() => session.deck[0]),
      }),
    ),
    null,
  );
});
test("the chosen interpretation style survives question handoff and session reload", () => {
  const session = createReadingSession(
    input.question,
    classifyQuestion(input.question),
    "critical",
  );
  session.selected = [0];
  writeReadingSession(session);
  const restored = readReadingSession()!;
  assert.equal(restored.style, "critical");
  assert.deepEqual(restored.deck, session.deck);
  assert.deepEqual(restored.selected, [0]);
  const readingInput = {
    ...input,
    cards: [session.deck[0]],
    style: restored.style,
  };
  const completed = {
    ...restored,
    stage: "result" as const,
    record: {
      ...record(),
      ...readingInput,
      result: localReading(readingInput),
    },
  };
  writeReadingSession(completed);
  assert.equal(readReadingSession()?.record?.style, "critical");
});
test("legacy sessions default to simple or preserve the completed reading's style", () => {
  const session = createReadingSession(
    input.question,
    classifyQuestion(input.question),
  );
  const { style, ...legacy } = session;
  assert.equal(style, "simple");
  assert.equal(parseReadingSession(JSON.stringify(legacy))?.style, "simple");
  const academicInput = {
    ...input,
    cards: [session.deck[0]],
    style: "academic" as const,
  };
  const completed = {
    ...legacy,
    stage: "result",
    selected: [0],
    record: {
      ...record(),
      ...academicInput,
      result: localReading(academicInput),
    },
  };
  assert.equal(
    parseReadingSession(JSON.stringify(completed))?.style,
    "academic",
  );
  assert.equal(
    parseReadingSession(JSON.stringify({ ...session, style: "invented" })),
    null,
  );
});
test("a returning practice outcome is reconciled into the current session before restyling", () => {
  const session = createReadingSession(input.question, {
    spread: "quick",
    reason: "Một góc nhìn",
    source: "local",
  });
  const reading = { ...record(), cards: [session.deck[0]], selectedAction: 1 };
  writeReadingSession({
    ...session,
    stage: "result",
    selected: [0],
    record: reading,
  });
  const saved = saveRecord({ ...reading, outcome: "improved" });
  const restored = readReadingSession()!;
  assert.equal(restored.record!.outcome, "improved");
  assert.deepEqual(restored.record, {
    ...saved,
    readingSessionId: session.readingSessionId,
  });
  assert.deepEqual(restored.deck, session.deck);
});
test("denied sessionStorage still permits the home handoff and navigation in memory", () => {
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    get() {
      throw new Error("Storage denied");
    },
  });
  const session = createReadingSession(input.question, {
    spread: "quick",
    reason: "Một góc nhìn",
    source: "local",
  });
  assert.equal(writeReadingSession(session), false);
  assert.deepEqual(readReadingSession(), session);
  clearReadingSession();
  assert.equal(readReadingSession(), null);
});
test("legacy saved outcomes without updatedAt survive reopening the matching session", () => {
  const session = createReadingSession(input.question, {
    spread: "quick",
    reason: "Một góc nhìn",
    source: "local",
  });
  const reading = { ...record(), cards: [session.deck[0]], selectedAction: 1 };
  writeReadingSession({
    ...session,
    stage: "result",
    selected: [0],
    record: reading,
  });
  localStorage.setItem(
    HISTORY,
    JSON.stringify({
      version: 1,
      readings: [{ ...reading, outcome: "improved" }],
    }),
  );
  assert.equal(readReadingSession()!.record!.outcome, "improved");
});

test("successful tone caches survive save/reload with source metadata and reject changed cards", () => {
  const baseline = { ...record(), questionSummary: "Nhìn lại việc học" };
  const simple = {
    ...baseline.result,
    source: "ai" as const,
    reflectionQuestion: "Bạn sẽ thử điều gì?",
  };
  let reading = withReadingTone(
    { ...baseline, result: simple },
    "simple",
    simple,
  );
  const academic = {
    ...simple,
    message: "Một diễn giải theo thuật ngữ triết học.",
  };
  reading = withReadingTone(reading, "academic", academic);
  saveRecord(reading);
  const restored = readHistory()[0];
  assert.equal(restored.questionSummary, "Nhìn lại việc học");
  assert.deepEqual(cachedTone(restored, "simple"), simple);
  assert.deepEqual(cachedTone(restored, "academic"), academic);
  assert.equal(
    cachedTone(
      {
        ...restored,
        cards: [{ ...restored.cards[0], orientation: "upright" }],
      },
      "simple",
    ),
    undefined,
  );
  const failed = withReadingTone(restored, "critical", {
    ...baseline.result,
    fallbackReason: "unavailable",
  });
  assert.equal(cachedTone(failed, "critical"), undefined);
  assert.deepEqual(cachedTone(failed, "simple"), simple);
});

test("question context, checks and follow-up suggestion survive history/session reload; legacy records still open", () => {
  const analysis = classifyQuestion(input.question);
  const session = createReadingSession(input.question, analysis);
  const cards = [session.deck[0]];
  const readingInput = {
    ...input,
    questionContext: analysis.questionContext,
    cards,
  };
  const saved = saveRecord({
    ...record(),
    ...readingInput,
    result: localReading(readingInput),
  });
  writeReadingSession({
    ...session,
    stage: "result",
    selected: [0],
    record: saved,
  });
  const restored = readReadingSession()!.record!;
  assert.deepEqual(restored.questionContext, analysis.questionContext);
  assert.deepEqual(restored.result.checks, saved.result.checks);
  assert.equal(
    restored.result.followUpSuggestion,
    saved.result.followUpSuggestion,
  );
  assert.deepEqual(restored.cards, cards);
  const legacy = {
    ...restored,
    questionContext: undefined,
    result: {
      message: "Một thông điệp cũ",
      reflection: "Một liên hệ cũ",
      actions: restored.result.actions,
      reflectionQuestion: "Bạn muốn hỏi tiếp điều gì?",
      source: "local",
    },
  };
  localStorage.setItem(
    HISTORY,
    JSON.stringify({ version: 1, readings: [legacy] }),
  );
  const history = readHistory();
  assert.equal(history.length, 1);
  assert.equal(
    history[0].result.reflectionQuestion,
    "Bạn muốn hỏi tiếp điều gì?",
  );
  assert.deepEqual(history[0].cards, cards);
  assert.ok(readingChecks(history[0]).length >= 2);
});
