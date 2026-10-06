import type { ReadingResult } from "@/lib/domain";
import { readingParagraphs } from "@/lib/reading-presentation";

export function ReadingParagraphs({ text }: { text: string }) {
  return (
    <>
      {readingParagraphs(text).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </>
  );
}

export function ContextualInsight({
  result,
  compact = false,
}: {
  result: ReadingResult;
  cards?: unknown;
  spread?: unknown;
  compact?: boolean;
}) {
  return (
    <div className={`contextual-insight ${compact ? "compact-insight" : ""}`}>
      <div className="reading-prose">
        <ReadingParagraphs text={result.reflection} />
      </div>
    </div>
  );
}

export function ReadingCheckCards({ checks }: { checks: string[] }) {
  return (
    <div className="reading-check-cards">
      {checks.map((check, i) => (
        <div className="check-card" key={i}>
          <span className="check-card-index" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <p>{check}</p>
        </div>
      ))}
    </div>
  );
}
