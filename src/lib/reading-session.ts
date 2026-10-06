import { z } from "zod";
import {
  analysisSchema,
  drawSchema,
  questionSchema,
  readingStyleSchema,
  recordSchema,
  spreads,
  type Analysis,
  type DrawCount,
  type ReadingStyle,
} from "./domain";
import { readHistory, shuffleDeck } from "./storage";

const KEY = "philo-tarot:session:v1";
const sessionSchema = questionSchema
  .extend({
    version: z.literal(1),
    readingSessionId: z.string().uuid().optional(),
    stage: z.enum(["draw", "result"]),
    analysis: analysisSchema,
    style: readingStyleSchema.optional(),
    deck: z.array(drawSchema).length(22),
    selected: z.array(z.number().int().min(0).max(21)).max(3),
    record: recordSchema.nullable(),
  })
  .superRefine((session, ctx) => {
    const count = spreads[session.analysis.spread].positions.length;
    if (
      new Set(session.deck.map((draw) => draw.id)).size !== 22 ||
      new Set(session.selected).size !== session.selected.length ||
      session.selected.length > count
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Bộ bài trong phiên không hợp lệ",
      });
    }
    if (session.stage === "result") {
      const record = session.record;
      if (
        !record ||
        session.selected.length !== count ||
        record.question !== session.question ||
        record.spread !== session.analysis.spread ||
        record.cards.some((draw, i) => {
          const selected = session.deck[session.selected[i]];
          return (
            !selected ||
            draw.id !== selected.id ||
            draw.orientation !== selected.orientation
          );
        })
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Kết quả không khớp phiên trải",
        });
      }
    } else if (session.record) {
      ctx.addIssue({
        code: "custom",
        message: "Phiên rút bài chưa có kết quả",
      });
    }
  })
  .transform((session) => {
    const readingSessionId =
      session.readingSessionId ??
      session.analysis.readingSessionId ??
      session.record?.readingSessionId ??
      session.record?.id ??
      crypto.randomUUID();
    return {
      ...session,
      // Older sessions stored the tone only on the completed reading.
      style: session.record?.style ?? session.style ?? "simple",
      readingSessionId,
      record: session.record ? { ...session.record, readingSessionId } : null,
    };
  });
export type ReadingSession = z.infer<typeof sessionSchema>;
export function drawCountForSession(
  session: Pick<ReadingSession, "analysis"> | null,
): DrawCount {
  if (!session) return 1;
  return session.analysis.spread === "quick" ? 1 : 3;
}
let memory: ReadingSession | null = null;
let memoryOnly = false;
function latestSavedProgress(session: ReadingSession | null) {
  if (!session?.record) return session;
  const record = session.record;
  const stored = readHistory().find((entry) => entry.id === record.id);
  const saved = stored
    ? { ...stored, readingSessionId: session.readingSessionId }
    : undefined;
  if (
    saved &&
    saved.question === record.question &&
    saved.spread === record.spread &&
    JSON.stringify(saved.cards) === JSON.stringify(record.cards) &&
    Date.parse(saved.updatedAt ?? saved.createdAt) >=
      Date.parse(record.updatedAt ?? record.createdAt) &&
    JSON.stringify(saved) !== JSON.stringify(record)
  ) {
    const updated = {
      ...session,
      record: { ...saved, readingSessionId: session.readingSessionId },
      style: saved.style,
    };
    writeReadingSession(updated);
    return updated;
  }
  return session;
}

export function createReadingSession(
  question: string,
  analysis: Analysis,
  style: ReadingStyle = "simple",
): ReadingSession {
  return sessionSchema.parse({
    version: 1,
    readingSessionId: analysis.readingSessionId ?? crypto.randomUUID(),
    stage: "draw",
    question,
    analysis,
    style,
    deck: shuffleDeck(),
    selected: [],
    record: null,
  });
}
export function parseReadingSession(raw: string | null): ReadingSession | null {
  if (!raw || raw.length > 100000) return null;
  try {
    const result = sessionSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
export function readReadingSession(): ReadingSession | null {
  if (memoryOnly) return latestSavedProgress(memory);
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      memory = parseReadingSession(raw);
      return latestSavedProgress(memory);
    }
    // Migrate the earlier home handoff once; it contained no selected cards.
    const legacy = sessionStorage.getItem("tarot-draft");
    if (legacy && legacy.length < 4000) {
      const draft = questionSchema
        .extend({
          analysis: analysisSchema,
          style: readingStyleSchema.default("simple"),
        })
        .safeParse(JSON.parse(legacy));
      if (draft.success) {
        const session = createReadingSession(
          draft.data.question,
          draft.data.analysis,
          draft.data.style,
        );
        writeReadingSession(session);
        sessionStorage.removeItem("tarot-draft");
        return session;
      }
    }
    return latestSavedProgress(memory);
  } catch {
    return latestSavedProgress(memory);
  }
}
export function writeReadingSession(
  session: z.input<typeof sessionSchema>,
): boolean {
  memory = sessionSchema.parse(session);
  try {
    sessionStorage.setItem(KEY, JSON.stringify(memory));
    memoryOnly = false;
    return true;
  } catch {
    memoryOnly = true;
    return false;
  }
}
export function clearReadingSession() {
  memory = null;
  try {
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem("tarot-draft");
    memoryOnly = false;
  } catch {
    memoryOnly = true;
  }
}
