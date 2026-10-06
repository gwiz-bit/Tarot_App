import "server-only";

import { z } from "zod";
import { cards as deck, getCard } from "@/data/cards";
import { selectedCardContext } from "./card-context";
import {
  analysisSchema,
  assistantMetaQuestion,
  classifyQuestion,
  interpretationSchema,
  localReading,
  localQuestionContext,
  normalize,
  outOfScope,
  readingInputSchema,
  safetyBoundary,
  safetyCheck,
  spreads,
  type DrawCount,
  type ReadingInput,
  type ReadingResult,
  type Spread,
} from "./domain";

import { classificationSystem, interpretationSystem } from "./ai/prompts";
import { providerAnalysisSchema, providerReadingSchema } from "./ai/schemas";
import { ValidationFailure } from "./ai/errors";
import { getAiRouter } from "./ai/router";
import { clarificationQuestion, inputQualityError } from "./input-quality";
import { readingFingerprint } from "./reading-cache";

const spreadTypeToInternal: Record<
  "QUICK_INSIGHT" | "TWO_CHOICES" | "CONTRADICTION" | "COGNITION_CYCLE",
  Spread
> = {
  QUICK_INSIGHT: "quick",
  TWO_CHOICES: "choice",
  CONTRADICTION: "conflict",
  COGNITION_CYCLE: "cycle",
};

const spreadToProviderType: Record<Spread, string> = {
  quick: "QUICK_INSIGHT",
  choice: "TWO_CHOICES",
  conflict: "CONTRADICTION",
  cycle: "COGNITION_CYCLE",
};

function cardForPrompt(input: ReadingInput, index: number) {
  return selectedCardContext(
    input.cards[index],
    spreads[input.spread].positions[index],
    [input.question, input.followUp ?? ""].join(" "),
  );
}

function conciseReadingSummary(input: ReadingInput) {
  const current = input.currentReading;
  if (!current) return input.questionSummary ?? "";
  return [
    current.message,
    current.reflection.slice(0, 1000),
    ...(current.checks ?? []),
    ...current.actions.map(({ title, detail }) => `${title}: ${detail}`),
  ]
    .join("\n")
    .slice(0, 2000);
}

function providerReadingInput(input: ReadingInput) {
  const positions = spreads[input.spread].positions;
  const cards = input.cards.map((_, index) => cardForPrompt(input, index));
  return {
    originalQuestion: input.question,
    evidenceExcerpts: [
      input.question.slice(0, 300),
      ...(input.followUp ? [input.followUp.slice(0, 300)] : []),
    ],
    questionContext:
      input.questionContext ?? localQuestionContext(input.question),
    spread: {
      type: spreadToProviderType[input.spread],
      positions,
      relationship: {
        quick:
          "Một lăng kính để kiểm tra câu hỏi, chưa phải kết luận về nguyên nhân.",
        choice:
          "So sánh A và B cùng tiêu chí. Vị trí thứ ba kiểm tra điều kiện thực hiện cho cả hai hướng. Nếu chưa biết A/B là gì, nói rõ điều đó.",
        conflict:
          "Hai mặt tác động lẫn nhau; vị trí thứ ba kiểm tra điều kiện thay đổi quan hệ giữa chúng.",
        cycle:
          "Nhận thức dẫn tới thử nghiệm; kiểm nghiệm trả phản hồi để cập nhật cách hiểu ban đầu.",
      }[input.spread],
    },
    cards,
    tone: input.style,
    ...(input.followUp
      ? {
          readingSummary: conciseReadingSummary(input),
          followUp: input.followUp,
          recentTurns: (input.recentFollowUps ?? []).slice(-2),
        }
      : input.currentReading
        ? {
            readingSummary: conciseReadingSummary(input),
            restyle: true,
            actionPlan: input.actionPlan ?? input.currentReading.actions,
            checks: input.currentReading.checks ?? [],
          }
        : {}),
  };
}

function mapProviderAnalysis(
  result: z.infer<typeof providerAnalysisSchema>,
  question: string,
  drawCount?: DrawCount,
) {
  if (result.safe === (result.safetyCategory !== null))
    throw new ValidationFailure("inconsistent safety status");
  if (!result.safe) return safetyBoundary(result.safetyCategory!);
  if (result.inputQuality === "INVALID")
    return {
      blocked: true as const,
      category: "input",
      message: "Hãy viết một câu hỏi có nghĩa về điều bạn muốn hiểu rõ hơn.",
    };
  if (result.inputQuality === "UNCLEAR")
    return {
      blocked: true as const,
      category: "clarification",
      message:
        "Bạn có thể nói rõ tình huống đang xảy ra và điều bạn muốn hiểu hoặc quyết định không?",
    };
  const providerSpread = spreadTypeToInternal[result.spreadType];
  const spread =
    drawCount === 1
      ? "quick"
      : drawCount === 3 && providerSpread === "quick"
        ? classifyQuestion(question, 3).spread
        : providerSpread;
  const { topic, coreProblem, goal, tensions, importantFactors } = result;
  return analysisSchema.parse({
    spread,
    reason:
      drawCount === 1
        ? "Bạn đã chọn trải 1 lá để tập trung vào một góc nhìn."
        : drawCount === 3
          ? `Bạn đã chọn trải 3 lá. ${result.coreProblem}`
          : result.coreProblem,
    source: "ai",
    inputQuality: result.inputQuality,
    contextConfidence: result.contextConfidence,
    options: result.options,
    summary: result.coreProblem,
    contextFactors: result.importantFactors.slice(0, 3),
    questionContext: { topic, coreProblem, goal, tensions, importantFactors },
  });
}

function mapProviderReading(
  result: z.infer<typeof providerReadingSchema>,
  input: ReadingInput,
) {
  const actions = result.actions.map((action) => ({
    title: action.title,
    detail: action.description,
  }));
  return interpretationSchema.parse({
    message: result.message,
    reflection: result.insight,
    checks: result.checks,
    actions,
    followUpSuggestion: result.followUpSuggestion,
    connections: result.cardReadings.map((entry, index) => ({
      cardId: entry.cardId,
      position: entry.position,
      orientation: input.cards[index].orientation,
      text: entry.connection,
    })),
  });
}

const evidenceText = (value: string) =>
  normalize(value)
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const genericWords = new Set(
  "minh toi ban chung ta nen can muon hay gi la va nhung vi de co the dang van mot nay do khi duoc cua cho voi trong ve nao sao hon khong".split(
    " ",
  ),
);
function meaningfulWords(value: string) {
  return evidenceText(value)
    .split(" ")
    .filter((word) => word.length > 1 && !genericWords.has(word));
}

function validateGrounding(
  result: z.infer<typeof providerReadingSchema>,
  input: ReadingInput,
) {
  const failures: string[] = [];
  const fail = (reason: string) => {
    failures.push(reason);
  };
  if (result.cardReadings.length !== input.cards.length)
    throw new ValidationFailure("missing or extra cardReadings");
  if (
    input.followUp &&
    !result.cardReadings.some((entry) => {
      const excerpt = evidenceText(entry.userDetail);
      return (
        meaningfulWords(excerpt).length > 0 &&
        evidenceText(input.followUp!).includes(excerpt)
      );
    })
  )
    fail("follow-up evidence must quote the NEW question");
  const userTexts = [input.question, input.followUp ?? ""].map(evidenceText);
  input.cards.forEach((draw, index) => {
    const evidence = result.cardReadings[index];
    const card = getCard(draw.id)!;
    const position = spreads[input.spread].positions[index];
    if (evidence.cardId !== draw.id)
      fail(`cardId/order mismatch at position ${index + 1}`);
    if (evidence.position !== position)
      fail(`position mismatch for ${draw.id}`);
    const context = cardForPrompt(input, index);
    if (
      context.scopeStatus === "requires-context" &&
      /(?:chung minh|xac nhan|chac chan|cho thay rang).{0,45}(?:nguyen nhan|ban la|ban dang)/.test(
        evidenceText(evidence.connection),
      )
    )
      fail(`connection overclaims weak applicability for ${draw.id}`);
    const detail = evidenceText(evidence.userDetail);
    if (
      !meaningfulWords(detail).length ||
      !userTexts.some((text) => text.includes(detail))
    )
      fail(`userDetail for ${draw.id} must quote a real question excerpt`);
    if (
      !evidenceText(evidence.conceptUsed).includes(evidenceText(card.concept))
    )
      fail(`conceptUsed mismatch for ${draw.id}`);
    const connectionWords = meaningfulWords(evidence.connection);
    if (
      !connectionWords.length ||
      /^(hay )?(kien tri|suy nghi tich cuc|tin vao ban than)/.test(
        evidenceText(evidence.connection),
      )
    )
      fail(`connection is generic for ${draw.id}`);
    if (
      !evidence.orientationUsed.startsWith(`${draw.orientation}:`) ||
      evidence.orientationUsed.slice(draw.orientation.length + 1).trim()
        .length < 8 ||
      /\b(?:upright|reversed)\b/.test(
        evidence.orientationUsed.slice(draw.orientation.length),
      )
    )
      fail(`orientationUsed mismatch for ${draw.id}`);
    // Identity, position, concept and orientation are checked in structured
    // evidence and displayed by the UI. Prose can refer to these roles without
    // repeating every literal label; synthesis is checked below as a whole.
  });
  const visible = [
    result.message,
    result.insight,
    ...result.cardReadings.map((entry) => entry.connection),
    ...result.checks,
    ...result.actions.map((action) => `${action.title} ${action.description}`),
    result.followUpSuggestion,
  ].join(" ");
  const internalApplicabilityLanguage =
    /\b(?:relevance|applicability|scopestatus|scopenotice)\b|pham vi ap dung|xac minh pham vi|chua du boi canh xa hoi|khong du boi canh xa hoi|la (?:bai )?nay.{0,40}(?:kho|khong the|chua the).{0,25}(?:ap dung|lien he)/;
  if (internalApplicabilityLanguage.test(evidenceText(visible)))
    fail("internal applicability language must stay backend-only");
  const checkAnchors = new Set(
    input.cards.flatMap((draw) => {
      const card = getCard(draw.id)!;
      return meaningfulWords(
        [card.concept, ...card.keywords, ...card.checkQuestions].join(" "),
      );
    }),
  );
  if (
    result.checks.some(
      (check) => !meaningfulWords(check).some((word) => checkAnchors.has(word)),
    )
  )
    fail("checks must stay grounded in the curated card questions");
  if (
    result.actions.some(
      (action) =>
        !/\b(?:ghi|viet|liet ke|so sanh|doi chieu|kiem tra|danh gia|quan sat|thu|thuc hanh|thuc hien|ap dung|hoi|chon|xac dinh|mo ta|theo doi|trao doi|thu thap|phan loai|dat ten|lam ro|tach|neu|tim|doc|giai|dung|lap)\b/.test(
          evidenceText(action.description),
        ),
    )
  )
    fail("actions need a concrete, observable step");
  const normalizeNumber = (value: string) => value.replace(",", ".");
  const statedNumbers = new Set(
    (
      `${input.question} ${input.followUp ?? ""}`.match(/\d+(?:[.,]\d+)?/g) ??
      []
    ).map(normalizeNumber),
  );
  const inventedNumber = [
    result.message,
    result.insight,
    ...result.checks,
    ...result.actions.map((action) => action.description),
  ]
    .flatMap((text) => text.match(/\d+(?:[.,]\d+)?/g) ?? [])
    .some((number) => !statedNumbers.has(normalizeNumber(number)));
  if (inventedNumber)
    fail("visible text must not invent numbers, deadlines or measurements");
  for (const card of deck) {
    if (
      !input.cards.some((draw) => draw.id === card.id) &&
      (evidenceText(visible).includes(evidenceText(card.name)) ||
        visible.includes(card.id))
    )
      fail("unselected card referenced in result");
  }
  if (
    !meaningfulWords(input.question).some((word) =>
      evidenceText(result.insight).split(" ").includes(word),
    )
  )
    fail("insight lacks a concrete question detail");
  if (
    !/co the|can (?:kiem tra|xac minh|lam ro|them|bo sung)|chua (?:ro|biet|co|du)|khong du/.test(
      evidenceText(result.insight),
    )
  )
    fail("insight must frame unstated conditions as something to check");
  const synthesis = evidenceText(`${result.message} ${result.insight}`);
  if (
    /\b(?:upright|reversed)\b/.test(synthesis) ||
    input.cards.some((draw) =>
      synthesis.includes(evidenceText(getCard(draw.id)!.name)),
    )
  )
    fail(
      "message and insight must not repeat card names or orientation tokens",
    );
  const relationship = {
    choice: /ca hai|hai huong|cung tieu chi|so sanh|doi chieu hai|doi chieu a/,
    conflict:
      /tac dong lan nhau|quan he giua|hai mat.*(?:chuyen hoa|dieu kien)|chuyen hoa.*hai mat/,
    cycle:
      /cap nhat|phan hoi|quay lai|dieu chinh.*nhan thuc|kiem nghiem.*cach hieu/,
  };
  if (
    input.spread !== "quick" &&
    !relationship[input.spread].test(evidenceText(result.insight))
  )
    fail("insight lacks the relationship between spread positions");
  if (
    result.message.split(/\s+/u).length > 70 ||
    result.insight.split(/\s+/u).length > 180 ||
    result.cardReadings.some(
      (entry) => entry.connection.split(/\s+/u).length > 65,
    ) ||
    result.actions.some(
      (action) => action.description.split(/\s+/u).length > 35,
    )
  )
    fail("visible text exceeds word limits");
  // Known dangerous guidance or explicit predictions are rejected even if the
  // evidence is structurally valid. This is a bounded guard, not a semantic oracle.
  if (
    /chac chan (?:ban )?se|du doan (?:ban )?se|la bai (?:dam bao|bao truoc)|so phan da|guaranteed|you will definitely/i.test(
      normalize(visible),
    )
  )
    fail("prediction in reflective reading");
  if (
    /ban (?:la ke that bai|that vo dung|dang sai vi)|upright.*tot.*reversed.*xau|xuoi.*tot.*nguoc.*xau/.test(
      normalize(visible),
    )
  )
    fail("shaming or good/bad orientation judgment");
  // Return several independent corrections together. Fixing only the first
  // issue caused a second valid-looking response to fail for another issue.
  // These are our own messages, never the rejected provider text.
  if (failures.length)
    throw new ValidationFailure(failures.slice(0, 4).join("; ").slice(0, 170));
}

export function aiConfigured() {
  return (
    process.env.AI_ENABLED === "true" &&
    Boolean(
      process.env.GROQ_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim(),
    )
  );
}

export async function analyzeQuestion(
  question: string,
  readingSessionId?: string,
  signal?: AbortSignal,
  drawCount?: DrawCount,
) {
  const safety = safetyCheck(question);
  if (safety) return safety;
  const quality = inputQualityError(question);
  if (quality)
    return { blocked: true as const, category: "input", message: quality };
  const clarification = clarificationQuestion(question);
  if (clarification)
    return {
      blocked: true as const,
      category: "clarification",
      message: clarification,
    };
  return getAiRouter().run({
    task: "analysis",
    sessionId: readingSessionId,
    fingerprint: `analysis:v4:${drawCount ?? "auto"}:${question.trim()}`,
    schema: providerAnalysisSchema,
    data: {
      question,
      ...(drawCount ? { requestedCardCount: drawCount } : {}),
    },
    systemInstruction: classificationSystem,
    maxOutputTokens: 850,
    transform: (result) => mapProviderAnalysis(result, question, drawCount),
    local: () => classifyQuestion(question, drawCount),
    signal,
  });
}

export async function generateReading(
  request: ReadingInput,
  signal?: AbortSignal,
) {
  const input = readingInputSchema.parse(request);
  const safety =
    safetyCheck(input.question) ||
    (input.followUp ? safetyCheck(input.followUp) : null);
  if (safety) return safety;
  const quality = inputQualityError(input.followUp ?? input.question);
  if (quality)
    return { blocked: true as const, category: "input", message: quality };
  const clarification = !input.followUp
    ? clarificationQuestion(input.question)
    : null;
  if (clarification)
    return {
      blocked: true as const,
      category: "clarification",
      message: clarification,
    };
  if (input.followUp && outOfScope(input.followUp, input.question))
    return {
      blocked: true as const,
      category: "scope",
      message: assistantMetaQuestion(input.followUp)
        ? "Mình là trợ lý phân tích của Tarot Biện Chứng. Ô này dùng để hỏi tiếp về vấn đề ban đầu và những lá đã rút; hãy hỏi về một góc nhìn, lựa chọn hoặc bước hành động trong lần trải này."
        : "Phần hỏi tiếp chỉ hỗ trợ vấn đề ban đầu và những lá đã rút. Hãy hỏi về một góc nhìn, lựa chọn hoặc bước hành động trong lần trải này.",
    };
  const data = providerReadingInput(input);
  return getAiRouter().run<typeof providerReadingSchema, ReadingResult>({
    task: input.followUp ? "follow-up" : "reading",
    sessionId: input.readingSessionId,
    fingerprint: readingFingerprint(input),
    schema: providerReadingSchema,
    data,
    systemInstruction: interpretationSystem,
    maxOutputTokens: 2400,
    transform: (providerResult) => {
      validateGrounding(providerResult, input);
      const result = mapProviderReading(providerResult, input);
      return {
        ...result,
        actions:
          !input.followUp && input.actionPlan
            ? input.actionPlan
            : result.actions,
        source: "ai" as const,
      };
    },
    local: (reason) => ({ ...localReading(input), fallbackReason: reason }),
    signal,
  });
}
