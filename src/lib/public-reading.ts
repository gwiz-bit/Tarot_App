import type { ReadingRecord, ReadingResult } from "./domain";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();

const internalApplicability =
  /\b(?:relevance|applicability|scopestatus|scopenotice)\b|pham vi ap dung|xac minh pham vi|chua du boi canh xa hoi|khong du boi canh xa hoi|can lam ro pham vi va du kien lien quan|nhung la co pham vi xa hoi|la (?:bai )?nay.{0,40}(?:kho|khong the|chua the).{0,25}(?:ap dung|lien he)/;

export function containsInternalApplicability(value: string) {
  return internalApplicability.test(normalize(value));
}

function publicText(value: string, replacement: string) {
  return containsInternalApplicability(value) ? replacement : value;
}

/** Removes legacy/internal scope diagnostics before any saved result reaches UI. */
type PublicInterpretation = Pick<
  ReadingResult,
  | "message"
  | "reflection"
  | "checks"
  | "actions"
  | "followUpSuggestion"
  | "connections"
>;

function sanitizeInterpretation<T extends PublicInterpretation>(result: T): T {
  return {
    ...result,
    message: publicText(
      result.message,
      "Hãy bắt đầu từ những dữ kiện và ảnh hưởng bạn có thể quan sát trong tình huống này.",
    ),
    reflection: publicText(
      result.reflection,
      "Tập trung vào điều đã xảy ra, cách bạn đang phản ứng và một thay đổi có thể thử. Đối chiếu kết quả thực tế trước khi cập nhật kết luận.",
    ),
    checks: result.checks?.map((check) =>
      publicText(
        check,
        "Điều kiện, hoạt động hoặc mối quan hệ nào đang thực sự ảnh hưởng đến tình huống này?",
      ),
    ),
    actions: result.actions.map((action) => ({
      title: publicText(action.title, "Ghi nhận ảnh hưởng thực tế"),
      detail: publicText(
        action.detail,
        "Ghi lại điều kiện, hoạt động hoặc mối quan hệ đang ảnh hưởng; tách chúng khỏi điều bạn mới suy đoán.",
      ),
    })),
    followUpSuggestion: result.followUpSuggestion
      ? publicText(
          result.followUpSuggestion,
          "Điều gì trong tình huống này bạn có thể quan sát hoặc kiểm tra thêm?",
        )
      : undefined,
    connections: result.connections?.map((connection) => ({
      ...connection,
      text: publicText(
        connection.text,
        "Tập trung vào ảnh hưởng có thể quan sát và tách dữ kiện khỏi điều đang suy đoán.",
      ),
    })),
  } as T;
}

export function sanitizeReadingResult(result: ReadingResult): ReadingResult {
  return sanitizeInterpretation(result);
}

export function sanitizeReadingRecord(record: ReadingRecord): ReadingRecord {
  return {
    ...record,
    result: sanitizeReadingResult(record.result),
    basis: record.basis ? sanitizeInterpretation(record.basis) : undefined,
    followUps: record.followUps.map((entry) => ({
      ...entry,
      result: sanitizeReadingResult(entry.result),
    })),
    toneCache: record.toneCache
      ? Object.fromEntries(
          Object.entries(record.toneCache).map(([style, entry]) => [
            style,
            entry
              ? { ...entry, result: sanitizeReadingResult(entry.result) }
              : entry,
          ]),
        )
      : undefined,
  };
}
