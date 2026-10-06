import { getCard } from "@/data/cards";
import type { DrawnCard, ReadingResult, Spread } from "@/lib/domain";
import {
  matchingConnections,
  readingParagraphs,
} from "@/lib/reading-presentation";

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
  cards,
  spread,
  compact = false,
}: {
  result: ReadingResult;
  cards: DrawnCard[];
  spread: Spread;
  compact?: boolean;
}) {
  const connections = matchingConnections(result, cards, spread);
  return (
    <div className={`contextual-insight ${compact ? "compact-insight" : ""}`}>
      {connections && cards.length > 1 ? (
        <dl className="context-connections">
          {connections.map((connection, index) => (
            <div className="context-connection" key={connection.cardId}>
              <dt>
                <span className="context-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="context-position">{connection.position}</span>
                <strong>{getCard(connection.cardId)!.concept}</strong>
                <span className="context-orientation">
                  {connection.orientation === "upright" ? "Xuôi" : "Ngược"}
                </span>
              </dt>
              <dd>
                <ReadingParagraphs text={connection.text} />
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      <div
        className={
          connections && cards.length > 1
            ? "reading-synthesis"
            : "reading-prose"
        }
      >
        {connections && cards.length > 1 ? (
          <h3>Nhìn các lá cùng nhau</h3>
        ) : null}
        <ReadingParagraphs text={result.reflection} />
      </div>
    </div>
  );
}
