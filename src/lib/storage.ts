import { z } from "zod";
import { cards } from "@/data/cards";
import {
  drawSchema,
  localDate,
  recordSchema,
  type DrawnCard,
  type ReadingRecord,
} from "./domain";

const KEY = "philo-tarot:history:v1";
// The date hash predates the new display order. Keep its index-to-identity map
// stable even when storage is unavailable; rearranging the library cannot reroll it.
const dailyCardIds = [
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
  "the-individual",
  "the-chance",
  "the-form",
];
const historySchema = z.object({
  version: z.literal(1),
  readings: z.array(recordSchema).max(30),
});
export function readHistory(): ReadingRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw || raw.length > 500000) return [];
    const result = historySchema.safeParse(JSON.parse(raw));
    return result.success ? result.data.readings : [];
  } catch {
    return [];
  }
}
export function saveRecord(record: ReadingRecord) {
  const parsed = recordSchema.parse({
    ...record,
    updatedAt: new Date().toISOString(),
  });
  const readings = [parsed, ...readHistory().filter((r) => r.id !== parsed.id)]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 30);
  let payload = JSON.stringify({ version: 1, readings });
  while (payload.length > 500000 && readings.length > 1) {
    readings.pop();
    payload = JSON.stringify({ version: 1, readings });
  }
  localStorage.setItem(KEY, payload);
  window.dispatchEvent(new Event("tarot-history"));
  return parsed;
}
export function removeRecord(id: string) {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      version: 1,
      readings: readHistory().filter((r) => r.id !== id),
    }),
  );
  window.dispatchEvent(new Event("tarot-history"));
}
export function shuffleDeck(): DrawnCard[] {
  const random = new Uint32Array(cards.length * 2);
  let cursor = random.length;
  function randomBelow(bound: number) {
    // Reject the incomplete range before taking a remainder so every
    // position has equal probability. Each new deck uses fresh browser entropy.
    const ceiling = 2 ** 32 - (2 ** 32 % bound);
    let value: number;
    do {
      if (cursor === random.length) {
        crypto.getRandomValues(random);
        cursor = 0;
      }
      value = random[cursor++];
    } while (value >= ceiling);
    return value % bound;
  }
  const deck = cards.map((card) => ({
    id: card.id,
    orientation:
      randomBelow(2) === 0 ? ("upright" as const) : ("reversed" as const),
  }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = randomBelow(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
export function getDailyCard(now = new Date()): DrawnCard {
  const date = localDate(now);
  try {
    const raw = localStorage.getItem("philo-tarot:daily:v1");
    const existing = z
      .object({ date: z.string(), card: drawSchema })
      .safeParse(raw && JSON.parse(raw));
    if (existing.success && existing.data.date === date)
      return existing.data.card;
  } catch {
    /* Storage may be unavailable. The date-based draw below remains stable. */
  }
  let hash = 0;
  for (const char of date) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const card: DrawnCard = {
    id: dailyCardIds[hash % dailyCardIds.length],
    orientation: hash % 2 === 0 ? "upright" : "reversed",
  };
  try {
    localStorage.setItem(
      "philo-tarot:daily:v1",
      JSON.stringify({ date, card }),
    );
  } catch {
    /* Daily card also works without storage. */
  }
  return card;
}
export const outcomes = {
  improved: "Có cải thiện",
  unchanged: "Chưa thay đổi",
  untried: "Mình chưa thử",
} as const;
