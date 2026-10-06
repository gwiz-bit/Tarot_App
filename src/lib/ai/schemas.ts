import "server-only";
import { z } from "zod";
import { questionContextSchema, safetyCategorySchema } from "../domain";

export const providerAnalysisSchema = z
  .object({
    inputQuality: z.enum(["VALID", "UNCLEAR", "INVALID"]),
    contextConfidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
    options: z
      .object({
        a: z.string().trim().max(200).nullable(),
        b: z.string().trim().max(200).nullable(),
      })
      .strict(),
    safe: z.boolean(),
    safetyCategory: safetyCategorySchema.nullable(),
    spreadType: z.enum([
      "QUICK_INSIGHT",
      "TWO_CHOICES",
      "CONTRADICTION",
      "COGNITION_CYCLE",
    ]),
    ...questionContextSchema.shape,
  })
  .strict();

function shortText(maxCharacters: number, maxWords: number) {
  return z
    .string()
    .trim()
    .min(1)
    .max(maxCharacters)
    .describe(`Ngắn gọn, tối đa ${maxWords} từ tính theo khoảng trắng.`);
}

const providerActionSchema = z
  .object({
    title: shortText(100, 8),
    description: shortText(550, 35).describe(
      "Một bước cụ thể, rõ cách thực hiện và điều có thể quan sát; không tự đặt thời hạn hay con số. Tối đa 35 từ.",
    ),
  })
  .strict();

export const providerReadingSchema = z
  .object({
    cardReadings: z
      .array(
        z
          .object({
            cardId: z.string().trim().min(1).max(80),
            position: z.string().trim().min(1).max(100),
            userDetail: z.string().trim().min(4).max(300),
            conceptUsed: z.string().trim().min(1).max(200),
            orientationUsed: z.string().trim().min(12).max(350),
            connection: z
              .string()
              .trim()
              .min(12)
              .max(500)
              .describe(
                "2 câu ngắn liên hệ tự nhiên câu hỏi, vị trí và chiều của lá. Với requires-context, chỉ dùng methodologicalMeaning hoặc phần chắc chắn nhất; không hiện ghi chú phạm vi/relevance. Tối đa 65 từ.",
              ),
          })
          .strict(),
      )
      .min(1)
      .max(3),
    message: shortText(850, 70).describe(
      "Trả lời trực tiếp câu hỏi bằng 2 câu ngắn, khoảng 25–45 từ (tối đa 70).",
    ),
    insight: shortText(2600, 180).describe(
      "Liên hệ các lá trong 2 đoạn ngắn cách nhau bằng dòng trống, khoảng 80–120 từ (tối đa 180). Giải thích quan hệ giữa các vị trí, không ghép lại từng định nghĩa.",
    ),
    checks: z.array(shortText(300, 45)).min(2).max(3),
    actions: z.array(providerActionSchema).length(3),
    followUpSuggestion: shortText(300, 35).describe(
      "Một câu hỏi ngắn để gợi mở câu hỏi tiếp theo.",
    ),
  })
  .strict();
