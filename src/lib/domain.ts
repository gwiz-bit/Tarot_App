import { z } from "zod";
import { canonicalCardId, getCard } from "@/data/cards";
import { selectedCardContext } from "./card-context";
import { aiResponseFields } from "./ai-metadata";

export const spreads = {
  quick: {
    name: "Góc nhìn nhanh",
    description: "Một lăng kính để mở đầu suy ngẫm.",
    positions: ["Góc nhìn"],
  },
  choice: {
    name: "Hai lựa chọn",
    description: "Nhìn hai hướng đi và điều kiện cần cân nhắc.",
    positions: ["Lựa chọn A", "Lựa chọn B", "Điều kiện cần cân nhắc"],
  },
  conflict: {
    name: "Mâu thuẫn",
    description: "Nhận diện hai mặt đối lập và khả năng chuyển hóa.",
    positions: ["Mặt A", "Mặt B", "Điều kiện chuyển hóa"],
  },
  cycle: {
    name: "Vòng nhận thức",
    description: "Từ hiểu vấn đề, đến thử nghiệm và kiểm chứng.",
    positions: ["Nhận thức", "Thực tiễn", "Kiểm nghiệm"],
  },
} as const;
export type Spread = keyof typeof spreads;
export const drawCountSchema = z.union([z.literal(1), z.literal(3)]);
export type DrawCount = z.infer<typeof drawCountSchema>;
export const styles = {
  simple: "Dễ hiểu",
  critical: "Phản biện",
  academic: "Học thuật",
} as const;
export type ReadingStyle = keyof typeof styles;
export const readingStyleSchema = z.enum(["simple", "critical", "academic"]);
export const MAX_FOLLOW_UPS = 5;
export const safetyCategorySchema = z.enum([
  "SELF_HARM",
  "MEDICAL",
  "LEGAL",
  "FINANCIAL",
  "EMERGENCY",
]);
export type SafetyCategory = z.infer<typeof safetyCategorySchema>;
export const questionContextSchema = z.object({
  topic: z.string().trim().min(1).max(100),
  coreProblem: z.string().trim().min(1).max(300),
  goal: z.string().trim().min(1).max(200),
  tensions: z.array(z.string().trim().min(1).max(120)).max(3),
  importantFactors: z.array(z.string().trim().min(1).max(120)).max(4),
});
export type QuestionContext = z.infer<typeof questionContextSchema>;
export const questionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, "Hãy viết ít nhất 5 ký tự để mô tả vấn đề.")
    .max(500, "Câu hỏi tối đa 500 ký tự."),
});
export const analyzeInputSchema = questionSchema.extend({
  readingSessionId: z.string().uuid().optional(),
  drawCount: drawCountSchema.optional(),
});
export const drawSchema = z.object({
  id: z
    .string()
    .max(80)
    .refine((id) => !!getCard(id), "Lá bài không tồn tại")
    .transform(canonicalCardId),
  orientation: z.enum(["upright", "reversed"]),
});
const readingBaseSchema = questionSchema.extend({
  readingSessionId: z.string().uuid().optional(),
  questionSummary: z.string().trim().max(300).optional(),
  questionContext: questionContextSchema.optional(),
  cards: z.array(drawSchema).min(1).max(3),
  spread: z.enum(["quick", "choice", "conflict", "cycle"]),
  style: readingStyleSchema,
});
export const actionSchema = z.object({
  title: z.string().trim().min(1).max(100),
  detail: z.string().trim().min(1).max(550),
});
export const cardConnectionSchema = z.object({
  cardId: z
    .string()
    .trim()
    .max(80)
    .refine((id) => !!getCard(id))
    .transform(canonicalCardId),
  position: z.string().trim().min(1).max(100),
  orientation: z.enum(["upright", "reversed"]),
  text: z.string().trim().min(1).max(650),
});
export const interpretationSchema = z.object({
  message: z.string().trim().min(1).max(850),
  reflection: z.string().trim().min(1).max(2600),
  actions: z.array(actionSchema).length(3),
  reflectionQuestion: z.string().trim().min(1).max(300).optional(),
  // `reflection` remains the stored alias of provider `insight`, so existing
  // sessions and history keep working. Legacy records may lack these fields.
  checks: z.array(z.string().trim().min(1).max(300)).min(2).max(4).optional(),
  followUpSuggestion: z.string().trim().min(1).max(300).optional(),
  // Public, contextual explanations only; private provider evidence stays on
  // the server. Optional so old saved readings can still be opened.
  connections: z.array(cardConnectionSchema).min(1).max(3).optional(),
});
export const readingInputSchema = readingBaseSchema
  .extend({
    followUp: z.string().trim().min(5).max(500).optional(),
    actionPlan: z.array(actionSchema).length(3).optional(),
    currentReading: interpretationSchema.optional(),
    recentFollowUps: z
      .array(
        z.object({
          question: z.string().trim().min(5).max(500),
          message: z.string().trim().min(1).max(850),
        }),
      )
      .max(2)
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.cards.length !== spreads[value.spread].positions.length)
      ctx.addIssue({ code: "custom", message: "Số lá không khớp cách trải" });
    if (new Set(value.cards.map((c) => c.id)).size !== value.cards.length)
      ctx.addIssue({ code: "custom", message: "Các lá bài phải khác nhau" });
    if (value.followUp && !value.currentReading)
      ctx.addIssue({
        code: "custom",
        message: "Câu hỏi tiếp cần ngữ cảnh lần trải hiện tại",
      });
  });
export const readingResultSchema = interpretationSchema.extend({
  ...aiResponseFields,
  source: z.enum(["ai", "local"]),
  fallbackReason: z.enum(["disabled", "unavailable"]).optional(),
});
export const analysisSchema = z.object({
  ...aiResponseFields,
  inputQuality: z.enum(["VALID", "UNCLEAR", "INVALID"]).optional(),
  contextConfidence: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  options: z
    .object({
      a: z.string().max(200).nullable(),
      b: z.string().max(200).nullable(),
    })
    .optional(),
  spread: z.enum(["quick", "choice", "conflict", "cycle"]),
  reason: z.string().min(1).max(500),
  source: z.enum(["ai", "local"]),
  // Optional fields preserve the original session/history format.
  summary: z.string().trim().max(300).optional(),
  contextFactors: z.array(z.string().trim().min(1).max(120)).max(3).optional(),
  questionContext: questionContextSchema.optional(),
});
export const blockedSchema = z.object({
  ...aiResponseFields,
  blocked: z.literal(true),
  message: z.string(),
  category: z.string(),
  safetyCategory: safetyCategorySchema.optional(),
});
export type DrawnCard = z.infer<typeof drawSchema>;
export type ReadingInput = z.infer<typeof readingInputSchema>;
export type ReadingResult = z.infer<typeof readingResultSchema>;
export type Analysis = z.infer<typeof analysisSchema>;
export type Blocked = z.infer<typeof blockedSchema>;
const toneCacheEntrySchema = z.object({
  fingerprint: z.string().max(20000),
  result: readingResultSchema,
});
export const recordSchema = readingBaseSchema
  .extend({
    id: z.string().uuid(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional(),
    result: readingResultSchema,
    basis: interpretationSchema.optional(),
    toneCache: z
      .object({
        simple: toneCacheEntrySchema.optional(),
        critical: toneCacheEntrySchema.optional(),
        academic: toneCacheEntrySchema.optional(),
      })
      .optional(),
    selectedAction: z.number().int().min(0).max(2).optional(),
    outcome: z.enum(["improved", "unchanged", "untried"]).optional(),
    followUps: z
      .array(
        z.object({
          question: z.string().max(500),
          result: readingResultSchema,
        }),
      )
      .max(8)
      .default([]),
  })
  .superRefine((value, ctx) => {
    if (
      value.cards.length !== spreads[value.spread].positions.length ||
      new Set(value.cards.map((c) => c.id)).size !== value.cards.length
    )
      ctx.addIssue({ code: "custom", message: "Lịch sử không hợp lệ" });
  });
export type ReadingRecord = z.infer<typeof recordSchema>;
export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d");
}

export function safetyBoundary(category: SafetyCategory): Blocked {
  const messages: Record<SafetyCategory, string> = {
    SELF_HARM:
      "Nếu bạn đang có nguy cơ làm hại bản thân, hãy liên hệ ngay người bạn tin tưởng và dịch vụ cấp cứu tại nơi bạn sống. Bạn có thể nhờ họ ở cùng để được hỗ trợ. Lá bài không phù hợp để xử lý tình huống này.",
    MEDICAL:
      "Câu hỏi này cần người có chuyên môn y tế. Tarot Biện Chứng không chẩn đoán hay đề xuất điều trị. Hãy ghi lại triệu chứng và băn khoăn để trao đổi với nhân viên y tế.",
    LEGAL:
      "Quyết định pháp lý cần người có chuyên môn xem hồ sơ cụ thể. Bạn có thể chuẩn bị dữ kiện và câu hỏi để trao đổi với họ; lá bài không thể quyết định thay bạn.",
    FINANCIAL:
      "Lá bài không thể hướng dẫn đầu tư hoặc quyết định tài chính. Hãy tham khảo người có chuyên môn và dữ liệu đáng tin cậy trước khi quyết định.",
    EMERGENCY:
      "Nếu có nguy cơ tức thời, hãy liên hệ dịch vụ cấp cứu tại nơi bạn sống và nhờ người gần bạn hỗ trợ ngay. Lá bài không phù hợp để xử lý tình huống khẩn cấp.",
  };
  return {
    blocked: true,
    category: category.toLowerCase(),
    safetyCategory: category,
    message: messages[category],
  };
}

export function safetyCheck(question: string): Blocked | null {
  const text = normalize(question.replace(/từ từ/gi, "chậm rãi")).replace(
    /\s+/g,
    " ",
  );
  // Non-financial uses of "invest" are ordinary questions about effort or time.
  const financialText = text
    .replace(/\bbat dau tu\b/g, "bat dau o")
    .replace(
      /\b(?:dau tu (?:thoi gian|cong suc|tam suc|vao ban than)|invest(?:ing)? (?:time|effort|in myself))\b/g,
      "danh cong suc",
    );
  const rules = [
    [
      "emergency",
      /cap cuu|kho tho|dau nguc|qua lieu|chay nha|nha dang chay|hoa hoan|dang bi tan cong|khong tho duoc|emergency|cannot breathe|can't breathe|overdose/,
      safetyBoundary("EMERGENCY").message,
    ],
    [
      "urgent",
      /tu tu|tu sat|tu hai ban than|ket thuc cuoc doi|khong muon song|muon chet|suicide|kill myself|self.harm|want to die|end my life/,
      "Nếu bạn đang có nguy cơ làm hại bản thân, hãy liên hệ ngay người bạn tin tưởng và dịch vụ cấp cứu tại nơi bạn sống. Lá bài không phù hợp để xử lý tình huống này.",
    ],
    [
      "medical",
      /chan doan|dieu tri|uong thuoc|lieu thuoc|chua benh|ngung thuoc|trieu chung|co bi benh|diagnos\w*|treatment|medication/,
      "Câu hỏi này cần người có chuyên môn y tế. Tarot Biện Chứng phục vụ suy ngẫm và học tập, không chẩn đoán hay đề xuất điều trị. Bạn có thể chuẩn bị các băn khoăn để trao đổi với nhân viên y tế.",
    ],
    [
      "legal",
      /tu van phap ly|quyet dinh phap ly|quyen loi phap ly|kien tung|ra toa|pham phap|legal advice|lawsuit|(?:co nen|nen|lam sao|cach|thu tuc|quyet dinh).*(?:ly hon|ky hop dong|khoi kien)|(?:hop dong|ly hon).*(?:ky|kien|thu tuc|phan chia)/,
      "Quyết định pháp lý cần tư vấn từ người có chuyên môn dựa trên hồ sơ cụ thể. Bạn có thể dùng một câu hỏi khác để suy ngẫm về nhu cầu, giá trị và cách chuẩn bị thông tin.",
    ],
    [
      "financial",
      /co phieu|chung khoan|crypto|bitcoin|mua coin|vay tien|all.in|stocks?|trading|(?:co nen|nen|mua|ban|quyet dinh|khuyen|should|buy|sell|advice).*(?:dau tu|invest\w*)|dau tu (?:tien|tai chinh|bat dong san)/,
      "Lá bài không thể hướng dẫn đầu tư hoặc quyết định tài chính. Hãy tham khảo người có chuyên môn và dữ liệu đáng tin cậy. Bạn có thể suy ngẫm về mục tiêu và mức chấp nhận rủi ro mà không xin một lệnh mua/bán.",
    ],
    [
      "prediction",
      /tien doan|boi bai|boi tarot|xem boi|bao gio.*(?:cuoi|chet|giau)|chac chan.*(?:tuong lai|se)|(?:co|se) (?:do dai hoc|trung so)|predict.*future|will i win/,
      "Sản phẩm không dự đoán chắc chắn tương lai. Hãy chuyển câu hỏi sang điều kiện hiện tại và hành động bạn có thể kiểm chứng, ví dụ: Mình có thể chuẩn bị điều gì cho mục tiêu này?",
    ],
    [
      "high-risk",
      /giet (?:nguoi|ai|ho|no)|lam hai (?:nguoi|ho|no)|danh (?:dap|nguoi)|tra thu bang bao luc|kill someone|hurt someone|attack someone/,
      "Lá bài không phù hợp để quyết định việc có thể gây hại. Hãy dừng hành động nguy hiểm, tìm người đáng tin cậy hỗ trợ và liên hệ dịch vụ khẩn cấp tại nơi bạn sống nếu có nguy cơ tức thời.",
    ],
  ] as const;
  for (const [category, pattern, message] of rules)
    if (
      new RegExp(`\\b(?:${pattern.source})\\b`).test(
        category === "financial" ? financialText : text,
      )
    )
      return category === "prediction"
        ? { blocked: true, category, message }
        : safetyBoundary(
            {
              urgent: "SELF_HARM",
              medical: "MEDICAL",
              legal: "LEGAL",
              financial: "FINANCIAL",
              emergency: "EMERGENCY",
              "high-risk": "EMERGENCY",
            }[category] as SafetyCategory,
          );
  return null;
}
export function classifyQuestion(
  question: string,
  drawCount?: DrawCount,
): Analysis {
  const t = normalize(question);
  let spread: Spread = drawCount === 3 ? "cycle" : "quick";
  if (
    drawCount !== 1 &&
    /(?:lua chon|phuong an) a|hai (?:lua chon|phuong an)|(?:chon|nen).+\bhay\b|a (hay|or) b|giua .+ va|choice|choose.+or/.test(
      t,
    )
  )
    spread = "choice";
  else if (
    drawCount !== 1 &&
    /mau thuan|xung dot|bat dong|muon.+nhung|nhung.*(so|lai|van)|vua.*vua|conflict/.test(
      t,
    )
  )
    spread = "conflict";
  else if (
    drawCount !== 1 &&
    /lam gi|lam sao|cai thien|giai quyet|phuong phap|ket qua|tien bo|chon cach|chon.*cach|thu nghiem|bat dau|thay doi|how/.test(
      t,
    )
  )
    spread = "cycle";
  const reasons: Record<Spread, string> = {
    quick:
      drawCount === 1
        ? "Bạn đã chọn trải 1 lá để tập trung vào một góc nhìn."
        : "Câu hỏi phù hợp với một góc nhìn tập trung để bắt đầu suy ngẫm.",
    choice: `${drawCount === 3 ? "Bạn đã chọn trải 3 lá. " : ""}Câu hỏi có các hướng lựa chọn cần so sánh cùng những điều kiện thực tế.`,
    conflict: `${drawCount === 3 ? "Bạn đã chọn trải 3 lá. " : ""}Câu hỏi chứa nhu cầu hoặc xu hướng đối lập cần được nhìn từ cả hai phía.`,
    cycle: `${drawCount === 3 ? "Bạn đã chọn trải 3 lá. " : ""}Câu hỏi được nhìn qua ba bước: nhận thức, thực tiễn và kiểm nghiệm.`,
  };
  return {
    spread,
    reason: reasons[spread],
    source: "local",
    summary: question.trim().slice(0, 300),
    contextFactors: [],
    questionContext: localQuestionContext(question),
  };
}
function contextFor(question: string) {
  const t = normalize(question);
  if (/\b(?:game|tro choi)\b/.test(t) && /\b(?:hoc|thi|on)\b/.test(t))
    return {
      subject: "chơi game và ôn thi",
      factors: "nhu cầu giải trí, thời hạn thi và phần kiến thức cần ôn",
      conflict:
        "Mong muốn chơi game và nghĩa vụ ôn thi cùng tranh thời gian. Chuyển hóa mâu thuẫn cần giới hạn giải trí gắn với phần ôn hoàn thành.",
      accumulation:
        "Số giờ ngồi học chưa đủ; cần đo phần bài hiểu và làm được trước khi tăng thời gian chơi.",
      objective:
        "Kiểm tra ngày thi, phần bài chưa nắm và quỹ thời gian thực có, thay vì chỉ dựa vào hứng thú.",
      test: "ôn một dạng bài đã chọn trước khi chơi game, rồi ghi lại kết quả",
      measure: "số bài tự giải được và việc giữ giới hạn chơi game",
      checks: [
        "Nhu cầu giải trí và yêu cầu ôn thi đang tranh quỹ thời gian như thế nào?",
        "Điều kiện nào giúp giải trí mà vẫn hoàn thành phần ôn đã định?",
      ],
    };
  if (/\b(?:nhom|dong nghiep|team)\b/.test(t))
    return {
      subject: "phối hợp trong nhóm",
      factors:
        "quan điểm khác nhau, mục tiêu chung và trách nhiệm của từng thành viên",
      conflict:
        "Bất đồng có thể phản ánh tiêu chí khác nhau, chưa phải thiếu thiện chí. Làm rõ mục tiêu chung và cách nhóm kiểm chứng từng ý kiến.",
      accumulation:
        "Số cuộc họp chỉ có ý nghĩa khi tích lũy dữ kiện và cam kết; cần kiểm tra chất lượng phối hợp sau mỗi lần trao đổi.",
      objective:
        "Đối chiếu phần việc, thời hạn và nguồn lực mỗi thành viên trước khi kết luận về năng lực hoặc thái độ.",
      test: "thống nhất một tiêu chí chung rồi thử hai cách làm trên cùng một phần việc",
      measure: "chất lượng phần việc và những bất đồng còn lại sau thử nghiệm",
      checks: [
        "Các quan điểm khác nhau phục vụ nhu cầu nào của nhóm?",
        "Mục tiêu chung và dữ kiện nào giúp các bên kiểm tra ý kiến?",
      ],
    };
  if (/nghi viec|thu nhap|doi viec/.test(t))
    return {
      subject: "thay đổi công việc và duy trì thu nhập",
      factors:
        "mong muốn rời công việc, nhu cầu thu nhập và điều kiện chuyển tiếp",
      conflict:
        "Mong muốn nghỉ việc và nhu cầu thu nhập đều có cơ sở. Cần tìm điều kiện chuyển tiếp để nhu cầu thay đổi không tách khỏi sinh hoạt thực tế.",
      accumulation:
        "Xác định kỹ năng, thông tin việc làm và mức chuẩn bị cần tích lũy; thời gian chờ đợi tự nó không tạo điều kiện đổi việc.",
      objective:
        "Kiểm tra yêu cầu sinh hoạt, nguồn hỗ trợ và thông tin vị trí mới trước khi đánh giá khả năng chuyển tiếp.",
      test: "tìm hiểu các vị trí đang cân nhắc và đối chiếu yêu cầu với năng lực hiện tại",
      measure:
        "dữ kiện mới về điều kiện làm việc và khoảng trống năng lực cần chuẩn bị",
      checks: [
        "Điều gì khiến bạn muốn nghỉ việc, điều gì khiến thu nhập hiện tại vẫn cần thiết?",
        "Điều kiện chuyển tiếp nào còn thiếu để hai nhu cầu bớt xung đột?",
      ],
    };
  if (/\b(?:hoc|gpa|nganh|thi|diem)\b/.test(t))
    return {
      subject: "việc học",
      factors: "kiến thức nền, cách học, thời gian và phản hồi từ bài làm",
      conflict:
        "Nhu cầu đạt kết quả và cách học hiện tại cần được đối chiếu. Xác định trở ngại cụ thể thay vì xem điểm thấp là kết luận về bản thân.",
      accumulation:
        "Học nhiều nhưng GPA thấp cần kiểm tra loại lượng tích lũy: thời gian, bài tự giải hay phản hồi; tăng giờ chưa đủ cho thay đổi chất lượng.",
      objective:
        "Xem yêu cầu ngành, kiến thức nền và điều kiện học thực tế; mong muốn chuyển ngành cần dữ kiện, chưa thể coi là giải pháp chắc chắn.",
      test: "thử một cách ôn tập trên phần kiến thức đang vướng và ghi lại kết quả",
      measure: "số câu làm đúng và khả năng giải thích lại kiến thức",
      checks: [
        "Nhu cầu đạt điểm và cách học hiện tại đang tác động lẫn nhau ra sao?",
        "Điều kiện nào giúp đổi cách học mà vẫn đáp ứng yêu cầu môn?",
      ],
    };
  if (/\b(?:quan he|yeu|nguoi.*(?:ban|ay)|tinh cam)\b/.test(t))
    return {
      subject: "mối quan hệ",
      factors: "nhu cầu của mỗi người, cách giao tiếp và các giới hạn",
      conflict:
        "Hai nhu cầu có thể cùng tồn tại; cần làm rõ giới hạn và điều kiện đối thoại, tránh biến khác biệt thành cuộc phân thắng thua.",
      accumulation:
        "Xem những lần trao đổi có tích lũy hiểu biết và cam kết hay chỉ lặp lại; cần điều kiện cụ thể để cách giao tiếp thay đổi.",
      objective:
        "Tách hành vi đã quan sát khỏi suy đoán về ý định; làm rõ giới hạn thực tế của mỗi bên.",
      test: "dành một cuộc trao đổi bình tĩnh để làm rõ một nhu cầu",
      measure:
        "mức độ hiểu nhau và việc hai bên có thực hiện điều đã thống nhất",
      checks: [
        "Nhu cầu nào của mỗi bên đang đối lập trong mối quan hệ?",
        "Giới hạn và điều kiện nào giúp hai bên trao đổi mà không ép một phía?",
      ],
    };
  if (/kinh doanh|khach hang|doanh nghiep|business|khoi nghiep/.test(t))
    return {
      subject: "dự án kinh doanh",
      factors: "lượt thử sản phẩm, phản hồi khách hàng và khả năng phục vụ",
      conflict:
        "Cần làm rõ nhu cầu mở rộng và nguồn lực hiện có đang tác động lẫn nhau như thế nào; chưa đủ dữ kiện để kết luận nguyên nhân trì trệ.",
      accumulation:
        "Kiểm tra lượng tích lũy là lượt thử, phản hồi khách hàng hay khả năng phục vụ; xác định điều kiện và tiêu chí trước khi mở rộng dự án.",
      objective:
        "Đối chiếu phản hồi khách hàng, thời gian và khả năng phục vụ thực tế; mong muốn tăng trưởng chưa xác nhận điều kiện đã đủ.",
      test: "thử một điều chỉnh nhỏ của sản phẩm và ghi lại phản hồi khách hàng",
      measure: "phản hồi khách hàng và khả năng thực hiện điều chỉnh",
      checks: [
        "Nhu cầu mở rộng và nguồn lực hiện có của dự án đang tác động lẫn nhau ra sao?",
        "Điều kiện nào giúp dự án đáp ứng nhu cầu khách hàng với nguồn lực hiện tại?",
      ],
    };
  if (/\b(?:viec|nghe|cong viec)\b/.test(t))
    return {
      subject: "công việc",
      factors: "nguồn lực, thời gian, năng lực và tiêu chí lựa chọn",
      conflict:
        "Xác định yêu cầu nào đang tranh cùng nguồn lực, rồi kiểm tra điều kiện để điều chỉnh cách tổ chức công việc.",
      accumulation:
        "Phân biệt số giờ làm với kỹ năng và chất lượng được tích lũy; xác định tiêu chí cho một thay đổi cách làm.",
      objective:
        "Đối chiếu thời gian, năng lực và yêu cầu thực tế của từng hướng công việc trước khi kết luận.",
      test: "thử một thay đổi nhỏ trong quy trình và ghi lại điều thay đổi",
      measure: "chất lượng công việc, thời gian thực hiện và mức độ phù hợp",
      checks: [
        "Những yêu cầu công việc nào đang tranh cùng nguồn lực?",
        "Điều kiện tổ chức nào có thể thay đổi quan hệ giữa các yêu cầu?",
      ],
    };
  if (/huong di|doi huong|thay doi huong/.test(t))
    return {
      subject: "hướng đi hiện tại",
      factors: "điều muốn thay đổi, hướng đang cân nhắc và điều kiện thực hiện",
      conflict:
        "Cần làm rõ điều bạn muốn giữ và điều muốn thay đổi. Hai nhu cầu có thể cùng tồn tại; chưa đủ dữ kiện để xem đổi hướng là giải pháp.",
      accumulation:
        "Kiểm tra trải nghiệm và kỹ năng đã tích lũy, cùng điều kiện còn thiếu của hướng đang cân nhắc; thời gian chờ tự nó chưa đủ để quyết định.",
      objective:
        "Đối chiếu những trải nghiệm đã có với yêu cầu của hướng đang cân nhắc; tách lý do có dữ kiện khỏi điều còn là giả định.",
      test: "tìm một trải nghiệm nhỏ của hướng đang cân nhắc và ghi lại mức phù hợp",
      measure: "mức phù hợp của trải nghiệm với điều bạn muốn thay đổi",
      checks: [
        "Điều gì ở hướng hiện tại không còn phù hợp, dựa trên trải nghiệm nào?",
        "Hướng bạn đang cân nhắc đòi hỏi điều kiện nào đã có, điều kiện nào còn thiếu?",
      ],
    };
  return {
    subject: "vấn đề này",
    factors: "dữ kiện đã có, điều chưa biết và những điều bạn có thể tác động",
    conflict:
      "Làm rõ nhu cầu của hai mặt và cách chúng tác động lẫn nhau; tìm điều kiện thay đổi quan hệ giữa chúng thay vì loại bỏ một phía.",
    accumulation:
      "Xác định điều đang tích lũy, ngưỡng cần đạt và điều kiện còn thiếu trước khi cân nhắc đổi cách làm.",
    objective:
      "Tách dữ kiện đã quan sát khỏi mong muốn; ghi rõ nguồn lực và giới hạn cần xác minh.",
    test: "thử một bước nhỏ và ghi lại điều quan sát được",
    measure: "một dấu hiệu cụ thể mà bạn có thể quan sát trước và sau khi thử",
    checks: [
      "Nhu cầu nào của hai mặt đang đối lập trong tình huống này?",
      "Điều kiện nào có thể làm thay đổi quan hệ giữa hai mặt?",
    ],
  };
}

export function localQuestionContext(question: string): QuestionContext {
  const context = contextFor(question);
  return {
    topic: context.subject,
    coreProblem: question.trim().slice(0, 300),
    goal: `Làm rõ điều kiện và một bước có thể kiểm chứng về ${context.subject}.`,
    tensions: [],
    importantFactors: context.factors.split(", ").slice(0, 4),
  };
}

export function readingChecks(
  input: Pick<ReadingInput, "cards" | "question" | "spread">,
): string[] {
  const context = contextFor(input.question);
  if (input.cards.length === 1) {
    if (input.cards[0].id === "the-conflict") return context.checks;
    const card = getCard(input.cards[0].id)!;
    return card.avoidForContexts.length
      ? [
          `Điều kiện, hoạt động hoặc mối quan hệ nào đang thực sự ảnh hưởng đến ${context.subject}?`,
          ...card.checkQuestions.slice(0, 2),
        ]
      : card.checkQuestions.slice(0, 3);
  }
  const checks = input.cards.flatMap((draw, index) => {
    const card = getCard(draw.id)!;
    if (card.avoidForContexts.length) return [];
    const check =
      draw.id === "the-conflict"
        ? context.checks[0]
        : getCard(draw.id)!.checkQuestions[0];
    return [`${spreads[input.spread].positions[index]}: ${check}`];
  });
  if (input.spread === "choice")
    checks.unshift(
      "A và B cụ thể là hai hướng nào? Bạn sẽ dùng dữ kiện và tiêu chí nào để so sánh?",
    );
  if (input.cards.some((draw) => getCard(draw.id)!.avoidForContexts.length))
    checks.push(
      `Điều kiện, hoạt động hoặc mối quan hệ nào đang thực sự ảnh hưởng đến ${context.subject}?`,
    );
  if (checks.length < 2) checks.push(context.checks[0]);
  return checks.slice(0, 3);
}
export function outOfScope(followUp: string, question = "") {
  const text = normalize(followUp);
  if (assistantMetaQuestion(followUp)) return true;
  if (/ignore.*instruction|bo qua.*huong dan|thay doi.*quy tac/.test(text))
    return true;
  if (/viet code|write code|dich sang|cong thuc nau/.test(text)) return true;
  return [
    [/thoi tiet|weather/, /thoi tiet|weather/],
    [/thu do|capital of/, /thu do|capital of/],
    [
      /lap trinh|programming/,
      /lap trinh|programming|python|javascript|coding|phan mem|code/,
    ],
  ].some(
    ([topic, context]) =>
      topic.test(text) && !context.test(normalize(question)),
  );
}

export function assistantMetaQuestion(value: string) {
  const text = normalize(value)
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return /^(?:ban la ai|ban la gi|ai dang tra loi|day la ai|ten ban la gi|ban dung mo hinh (?:ai )?nao|day co phai ai khong)$/.test(
    text,
  );
}
export function localReading(input: ReadingInput): ReadingResult {
  const tone =
    input.style === "critical"
      ? "Theo hướng phản biện, hãy kiểm tra các giả định: "
      : input.style === "academic"
        ? "Xét vấn đề trong điều kiện cụ thể và thông qua thực tiễn: "
        : "";
  if (input.currentReading && !input.followUp) {
    return {
      source: "local",
      message: (tone + input.currentReading.message).slice(0, 850),
      reflection: input.currentReading.reflection,
      connections: input.currentReading.connections,
      actions: input.actionPlan ?? input.currentReading.actions,
      checks: input.currentReading.checks ?? readingChecks(input),
      followUpSuggestion:
        input.currentReading.followUpSuggestion ??
        input.currentReading.reflectionQuestion ??
        getCard(input.cards[0].id)!.reflection,
    };
  }
  const context = contextFor(input.question);
  const views = input.cards.map((draw, i) => {
    const card = getCard(draw.id)!;
    return {
      card,
      label: spreads[input.spread].positions[i],
      orientation: draw.orientation,
      context: selectedCardContext(
        draw,
        spreads[input.spread].positions[i],
        input.question,
      ),
    };
  });
  const first = views[0];
  const weaklyRelated = views.find(
    (view) => view.context.scopeStatus === "requires-context",
  );
  const connections = views.map((view) => {
    const { card, orientation } = view;
    let text: string;
    if (view.context.scopeStatus === "requires-context") {
      text = `${card.methodologicalMeaning} Với ${context.subject}, hãy dùng câu hỏi này để tách điều đã quan sát khỏi điều đang giả định.`;
    } else if (card.id === "the-mind") {
      text =
        orientation === "reversed"
          ? `Cách bạn nhìn ${context.subject} có thể chưa khớp với điều đã trải nghiệm. Tách lý do có dữ kiện khỏi giả định trước khi kết luận; lá ngược chưa chứng minh lựa chọn này sai.`
          : `Làm rõ bạn muốn thay đổi điều gì ở ${context.subject}, rồi chuyển mục đích ấy thành một việc có thể thử. Một cách nhìn mới cần được đối chiếu bằng hành động.`;
    } else if (card.id === "the-conflict") {
      text =
        orientation === "upright"
          ? context.conflict
          : `Cần kiểm tra việc chỉ muốn loại bỏ một phía có làm bạn bỏ sót nhu cầu còn lại không. ${context.checks[0]}`;
    } else if (card.id === "the-leap") {
      text =
        orientation === "upright"
          ? context.accumulation
          : `Cần kiểm tra việc vội đổi cách làm khi chưa rõ lượng đã tích lũy. ${context.accumulation}`;
    } else if (card.id === "the-reality") {
      text =
        orientation === "upright"
          ? context.objective
          : `Cần kiểm tra điều mong muốn có đang thay thế dữ kiện không. ${context.objective}`;
    } else if (card.id === "the-practice") {
      text = `Thử nghiệm cần gắn với dữ kiện: ${context.test}. Ghi lại ${context.measure} để kiểm tra cách hiểu${orientation === "reversed" ? "; đừng xem một lần thử là kết luận cuối" : ""}.`;
    } else if (card.id === "the-truth") {
      text = `Đối chiếu kết luận về ${context.subject} với ${context.measure}. ${orientation === "reversed" ? "Cần kiểm tra điều bạn tin là đúng, thay vì chỉ chọn dữ kiện xác nhận nó." : "Kết quả kiểm nghiệm có thể giúp bạn điều chỉnh cách hiểu."}`;
    } else {
      // Complete curated sentences, never a word-budget slice with an ellipsis.
      const framework =
        orientation === "upright"
          ? card.uprightFramework
          : card.reversedFramework;
      text = `${framework.split(/(?<=[.!?])\s/u)[0]} ${card.checkQuestions[0]}`;
    }
    return { cardId: card.id, position: view.label, orientation, text };
  });
  const named = views.map(
    (view) =>
      `${view.label}: ${view.card.concept} (${view.orientation === "upright" ? "xuôi" : "ngược"})`,
  );
  const relationship =
    input.spread === "choice"
      ? `Với ${context.subject}, cần đặt tên rõ cho A và B, rồi đối chiếu cả hai hướng cùng tiêu chí. Lá ở vị trí thứ ba giúp kiểm tra điều kiện thực hiện; các lá chưa cho phép xếp hạng hai hướng.`
      : input.spread === "conflict"
        ? `Trong ${context.subject}, hai mặt tác động lẫn nhau. Cần xem điều kiện ở vị trí thứ ba có thể thay đổi quan hệ giữa chúng thế nào, thay vì vội loại bỏ một phía.`
        : input.spread === "cycle"
          ? `Dùng nhận thức về ${context.subject} để thiết kế thử nghiệm. Kết quả kiểm nghiệm cần quay lại cập nhật cách hiểu: điều gì được xác nhận, điều gì cần điều chỉnh?`
          : `Đây là một câu hỏi để kiểm tra ${context.subject}, chưa phải kết luận về nguyên nhân. Hãy đối chiếu với trải nghiệm thực tế trước khi chọn cách hành động.`;
  const follow = input.followUp ? normalize(input.followUp) : "";
  const followAnswer = !input.followUp
    ? ""
    : /bat dau|hanh dong|tu dau/.test(follow)
      ? input.currentReading
        ? `Bắt đầu bằng “${input.currentReading.actions[0].title}”. Thực hiện bước đã ghi, rồi ghi lại kết quả để có dữ kiện kiểm chứng.`
        : `Bắt đầu bằng một việc nhỏ: ${context.test}. Ghi lại kết quả để có dữ kiện thay vì chỉ suy đoán.`
      : /phuong an|lua chon|con lai/.test(follow)
        ? "Phương án còn lại cần được so sánh trên cùng tiêu chí; chưa thể kết luận hướng nào phù hợp hơn khi thiếu dữ kiện."
        : "Phần dự phòng chưa đủ dữ kiện để trả lời sâu câu hỏi tiếp. Hãy nêu một trải nghiệm cụ thể để kiểm tra góc nhìn từ những lá này.";
  const message =
    followAnswer ||
    (input.spread === "choice"
      ? `${context.subject === "hướng đi hiện tại" ? "Chưa đủ dữ kiện để kết luận bạn nên đổi hướng." : "Chưa đủ dữ kiện để chọn một hướng thay bạn."} Cần làm rõ hai lựa chọn và điều bạn muốn cải thiện, rồi kiểm tra điều kiện thực hiện.`
      : input.spread === "conflict"
        ? context.conflict
        : weaklyRelated
          ? `Hãy bắt đầu từ những ảnh hưởng có thể quan sát trong ${context.subject}. ${weaklyRelated.card.methodologicalMeaning}`
          : `Hãy bắt đầu bằng một điều có thể kiểm chứng về ${context.subject}. ${first.card.id === "the-leap" ? context.accumulation : connections[0].text.split(/(?<=[.!?])\s/u)[0]}`);
  const arrangement =
    input.spread === "choice"
      ? `${named[0]} cần được đối chiếu với ${named[1]}. ${named[2]} đặt câu hỏi về điều kiện thực hiện của cả hai hướng.`
      : input.spread === "conflict"
        ? `${named[0]} và ${named[1]} được xem trong quan hệ tác động lẫn nhau. ${named[2]} giúp kiểm tra điều kiện thay đổi quan hệ đó.`
        : input.spread === "cycle"
          ? `${named[0]} định hướng việc thử ở ${named[1]}. Kết quả từ ${named[2]} quay lại kiểm tra cách hiểu ban đầu.`
          : `${named[0]} gợi một điều cần kiểm tra: ${connections[0].text}`;
  const reflection = [
    arrangement,
    followAnswer || relationship,
    ...(input.followUp ? [relationship] : []),
  ].join("\n\n");
  return {
    source: "local",
    message:
      input.style === "critical"
        ? `Điều gì đã có bằng chứng? ${message}`
        : input.style === "academic"
          ? `Cần phân biệt nhận định với dữ kiện. ${message}`
          : message,
    reflection,
    connections,
    checks: readingChecks(input),
    actions:
      input.actionPlan ??
      (input.currentReading &&
      input.followUp &&
      /bat dau|hanh dong|tu dau/.test(follow)
        ? input.currentReading.actions
        : [
            {
              title:
                input.spread === "choice"
                  ? "Đặt tên hai hướng"
                  : "Làm rõ dữ kiện",
              detail:
                input.spread === "choice"
                  ? "Viết A và B thành hai lựa chọn cụ thể; ghi điều bạn muốn cải thiện và lý do đã có dữ kiện."
                  : `Ghi các dữ kiện đã biết về ${context.subject}; đánh dấu điều còn là giả định.`,
            },
            {
              title:
                input.spread === "choice"
                  ? "So sánh cùng tiêu chí"
                  : weaklyRelated
                    ? "Ghi nhận ảnh hưởng thực tế"
                    : "Thử một thay đổi",
              detail:
                input.spread === "choice"
                  ? "Chọn cùng một nhóm tiêu chí cho cả hai hướng; ghi dữ kiện đã có và điều còn thiếu ở mỗi hướng."
                  : weaklyRelated
                    ? `Ghi điều kiện, hoạt động hoặc mối quan hệ đang thực sự ảnh hưởng đến ${context.subject}; tách chúng khỏi điều bạn mới suy đoán.`
                    : `${context.test[0].toUpperCase() + context.test.slice(1)}.`,
            },
            {
              title:
                input.spread === "choice"
                  ? "Thử trước khi quyết"
                  : "Hẹn ngày kiểm nghiệm",
              detail:
                input.spread === "choice"
                  ? "Tìm một trải nghiệm nhỏ của hướng đang cân nhắc. Đối chiếu kết quả với các tiêu chí đã ghi trước khi quyết định."
                  : `Sau khi thử, đánh giá ${context.measure}; ghi điều cần điều chỉnh.`,
            },
          ]),
    followUpSuggestion:
      input.spread === "choice"
        ? "Hai hướng bạn đang cân nhắc cụ thể là gì, và bạn muốn thay đổi điều nào?"
        : first.card.checkQuestions.at(-1)!,
  };
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
