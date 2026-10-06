import type { DrawnCard, ReadingResult, Spread } from "./domain";
import { spreads } from "./domain";

/** Paragraphs are plain text. No Markdown or HTML from the provider is executed. */
export function readingParagraphs(text: string): string[] {
  const paragraphs = text
    .trim()
    .split(/\n\s*\n/u)
    .filter(Boolean);
  if (paragraphs.length > 1) return paragraphs;
  // Old history and providers without paragraph breaks remain readable.
  const sentences = text.trim().split(/(?<=[.!?][”"']?)\s+/u);
  const groups: string[] = [];
  for (let i = 0; i < sentences.length; i += 2)
    groups.push(
      sentences
        .slice(i, i + 2)
        .join(" ")
        .replace(/\s+/gu, " ")
        .trim(),
    );
  return groups.filter(Boolean);
}

export function matchingConnections(
  result: ReadingResult,
  draws: DrawnCard[],
  spread: Spread,
) {
  const connections = result.connections;
  if (!connections || connections.length !== draws.length) return undefined;
  if (
    !connections.every(
      (connection, index) =>
        connection.cardId === draws[index].id &&
        connection.orientation === draws[index].orientation &&
        connection.position === spreads[spread].positions[index],
    )
  )
    return undefined;
  return connections;
}
