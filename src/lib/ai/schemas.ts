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
    insight: shortText(4200, 300).describe(
      "Phân tích có cấu trúc trong 3 đoạn ngắn cách nhau bằng dòng trống, khoảng 150–250 từ (tối đa 300). Đoạn 1: hiện trạng và điểm mù từ góc nhìn lá đầu. Đoạn 2: yếu tố khách quan hoặc mâu thuẫn liên quan lá tiếp. Đoạn 3: hướng chuyển hóa và bước kiểm chứng. Dùng ngôn ngữ đời thường, đưa ví dụ cụ thể từ câu hỏi.",
    ),
    checks: z.array(shortText(500, 60)).min(2).max(4).describe(
      "2–3 tiêu chí tự kiểm tra thực tế (ưu tiên 3). Mỗi tiêu chí gồm vấn đề cần rà soát VÀ dấu hiệu nhận biết cụ thể để người đọc tự đánh giá, dùng từ ngữ đời thường, không hỏi ngược.",
    ),
    actions: z.array(providerActionSchema).length(3),
    followUpSuggestion: shortText(300, 35).describe(
      "Một câu hỏi ngắn để gợi mở câu hỏi tiếp theo.",
    ),
  })
  .strict();
