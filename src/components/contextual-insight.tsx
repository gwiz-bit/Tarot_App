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
