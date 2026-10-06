import { getCard, type CardOrientation } from "@/data/cards";

export const SOCIAL_SCOPE_NOTICE =
  "Cần làm rõ bối cảnh xã hội phù hợp trước khi áp dụng trực tiếp lá này.";

// A context term permits further verification; it does not prove an academic
// connection. Without one, the provider must explain the scope limit explicitly.
const socialContextSignals: Record<string, RegExp> = {
  "the-forces":
    /san xuat|quan he lao dong|to chuc lao dong|quan he so huu|phan phoi san pham|nguoi lao dong/,
  "the-structure":
    /co so kinh te|quan he san xuat|thiet che|chinh sach xa hoi|nha nuoc|phap luat/,
  "the-society":
    /xa hoi|cong dong|chuan muc|van hoa|doi song vat chat|doi song kinh te/,
  "the-human":
    /quan he xa hoi|gia dinh|moi truong song|hoat dong lao dong|van hoa|cong dong|giao duc/,
  "the-masses": /lich su|quan chung|cong dong|phong trao|to chuc xa hoi/,
  "the-turning":
    /bien doi xa hoi|cau truc xa hoi|phuong thuc san xuat|bien doi thiet che|cai cach|cach mang|to chuc doi song xa hoi/,
};

/** Only a selected card's reasoning data crosses the provider boundary. */
export function selectedCardContext(
  draw: { id: string; orientation: CardOrientation },
  position: string,
  userContext = "",
) {
  const card = getCard(draw.id);
  if (!card) throw new Error("Unknown card");
  const text = userContext
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
  const scopeRequiresContext =
    card.avoidForContexts.length > 0 &&
    !socialContextSignals[card.id]?.test(text);
  return {
    cardId: card.id,
    position,
    name: card.name,
    concept: card.concept,
    orientation: draw.orientation,
    definition: card.definition,
    analysisFocus: card.analysisFocus,
    orientationFramework:
      draw.orientation === "upright"
        ? card.uprightFramework
        : card.reversedFramework,
    checkQuestions: card.checkQuestions,
    academicSourceStatus: card.academicSourceStatus,
    ...(card.avoidForContexts.length
      ? {
          avoidForContexts: card.avoidForContexts,
          scopeStatus: scopeRequiresContext
            ? ("requires-context" as const)
            : ("verify-context" as const),
          ...(scopeRequiresContext ? { scopeNotice: SOCIAL_SCOPE_NOTICE } : {}),
        }
      : {}),
  };
}
