import { CARD_DATA_VERSION, canonicalCardId } from "@/data/cards";
import type {
  ReadingInput,
  ReadingRecord,
  ReadingResult,
  ReadingStyle,
} from "./domain";

/** Card order matters because each index belongs to a different position. */
export function readingFingerprint(input: ReadingInput) {
  const current = input.currentReading;
  const context = current && [
    current.message,
    current.reflection,
    current.actions.map(({ title, detail }) => [title, detail]),
    current.reflectionQuestion ?? "",
    current.checks ?? [],
    current.followUpSuggestion ?? "",
    current.connections?.map(({ cardId, position, orientation, text }) => [
      cardId,
      position,
      orientation,
      text,
    ]) ?? [],
  ];
  return JSON.stringify([
    "reading:v6",
    CARD_DATA_VERSION,
    input.question.trim(),
    input.spread,
    input.cards.map(({ id, orientation }) => [
      canonicalCardId(id),
      orientation,
    ]),
    input.style,
    input.questionSummary ?? "",
    input.questionContext ?? null,
    input.actionPlan ?? null,
    !input.followUp ? (context ?? null) : null,
    ...(input.followUp
      ? [
          input.followUp.trim(),
          context,
          (input.recentFollowUps ?? []).map(({ question, message }) => [
            question,
            message,
          ]),
        ]
      : []),
  ]);
}

export function cachedTone(record: ReadingRecord, style: ReadingStyle) {
  const entry = record.toneCache?.[style];
  if (
    entry?.result.source === "ai" &&
    entry.fingerprint === readingFingerprint({ ...record, style })
  )
    return entry.result;
  return undefined;
}

export function withReadingTone(
  record: ReadingRecord,
  style: ReadingStyle,
  result: ReadingResult,
): ReadingRecord {
  const toneCache = { ...record.toneCache };
  // A provider failure never poisons a previously successful tone.
  if (record.result.source === "ai") {
    toneCache[record.style] = {
      fingerprint: readingFingerprint(record),
      result: record.result,
    };
  }
  if (result.source === "ai") {
    toneCache[style] = {
      fingerprint: readingFingerprint({ ...record, style }),
      result,
    };
  }
  return {
    ...record,
    basis: record.basis ?? record.result,
    updatedAt: new Date().toISOString(),
    style,
    result,
    toneCache,
  };
}
