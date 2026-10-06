"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  BookOpen,
  Download,
  Bookmark,
  Copy,
  LoaderCircle,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { getCard, type TarotCard } from "@/data/cards";
import {
  styles,
  spreads,
  MAX_FOLLOW_UPS,
  readingChecks,
  type ReadingRecord,
} from "@/lib/domain";
import { interpret } from "@/lib/client-api";
import { saveRecord } from "@/lib/storage";
import { createShareImage, shareMessage, type ShareImage } from "@/lib/share";
import { ShareDialog } from "./share-dialog";
import { CardReveal } from "./card-reveal";
import { Knowledge } from "./knowledge";
import { withReadingTone } from "@/lib/reading-cache";
import { ContextualInsight, ReadingParagraphs } from "./contextual-insight";

export function ReadingResultView({
  record,
  onChange,
  onNew,
  initiallySaved = false,
  revealCards = false,
}: {
  record: ReadingRecord;
  onChange: (record: ReadingRecord) => void;
  onNew?: () => void;
  initiallySaved?: boolean;
  revealCards?: boolean;
}) {
  const reduced = useReducedMotion();
  const [knowledge, setKnowledge] = useState<TarotCard | null>(null);
  const [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(initiallySaved),
    [exporting, setExporting] = useState(false);
  const [followUp, setFollowUp] = useState(""),
    [error, setError] = useState("");
  const artworkRef = useRef<HTMLDivElement>(null);
  const [sharePreview, setSharePreview] = useState<ShareImage | null>(null);
  const requestLock = useRef(false);
  const exportLock = useRef(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const first = getCard(record.cards[0].id)!;
  function persist(next: ReadingRecord, notify = false) {
    const updated = { ...next, updatedAt: new Date().toISOString() };
    try {
      onChange(saveRecord(updated));
      setSaved(true);
      if (notify) toast.success("Đã lưu lần trải trên trình duyệt này.");
    } catch {
      onChange(updated);
      toast.error(
        "Không thể lưu trên trình duyệt này. Kết quả vẫn còn trong phiên hiện tại.",
      );
    }
  }
  async function ask(event: React.FormEvent) {
    event.preventDefault();
    if (requestLock.current) return;
    if (followUp.trim().length < 5) {
      setError("Hãy viết ít nhất 5 ký tự.");
      return;
    }
    if (record.followUps.length >= MAX_FOLLOW_UPS) {
      setError(
        "Đã đủ 5 câu hỏi tiếp cho lần trải này. Bạn có thể bắt đầu một câu hỏi mới.",
      );
      return;
    }
    setBusy(true);
    requestLock.current = true;
    setError("");
    const controller = new AbortController();
    request.current = controller;
    const question = followUp.trim();
    try {
      const result = await interpret(
        {
          ...record,
          readingSessionId: record.readingSessionId ?? record.id,
          followUp: question,
          currentReading: record.result,
          recentFollowUps: record.followUps.slice(-2).map((entry) => ({
            question: entry.question,
            message: entry.result.message,
          })),
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if ("blocked" in result) {
        setError(result.message);
        return;
      }
      const next = {
        ...record,
        readingSessionId: result.readingSessionId ?? record.readingSessionId,
        result: { ...record.result, aiDebug: result.aiDebug },
        followUps: [...record.followUps, { question, result }],
        updatedAt: new Date().toISOString(),
      };
      if (saved) persist(next);
      else onChange(next);
      setFollowUp("");
    } catch (error) {
      if (controller.signal.aborted) return;
      setError(
        error instanceof Error ? error.message : "Không thể trả lời lúc này.",
      );
    } finally {
      setBusy(false);
      requestLock.current = false;
    }
  }
  async function share() {
    if (exportLock.current) return;
    exportLock.current = true;
    setExporting(true);
    try {
      const svg = artworkRef.current?.querySelector("svg");
      if (!svg) throw new Error();
      setSharePreview(
        await createShareImage(first, record.cards[0].orientation, svg),
      );
    } catch {
      toast.error("Chưa xuất được ảnh. Hãy thử lại.");
    } finally {
      setExporting(false);
      exportLock.current = false;
    }
  }
  async function retryInterpretation() {
    if (requestLock.current) return;
    const controller = new AbortController();
    request.current = controller;
    requestLock.current = true;
    setBusy(true);
    setError("");
    try {
      const {
        readingSessionId,
        question,
        questionContext,
        questionSummary,
        spread,
        style,
        cards,
      } = record;
      const result = await interpret(
        {
          readingSessionId: readingSessionId ?? record.id,
          question,
          questionContext,
          questionSummary,
          spread,
          style,
          cards,
          ...(record.selectedAction !== undefined
            ? { actionPlan: record.result.actions }
            : {}),
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if ("blocked" in result) {
        setError(result.message);
        return;
      }
      const next = withReadingTone(record, record.style, result);
      if (saved) persist(next);
      else onChange(next);
      if (result.source === "local")
        toast("AI vẫn chưa phản hồi. Các lá đã chọn được giữ nguyên.");
    } catch (error) {
      if (!controller.signal.aborted)
        setError(
          error instanceof Error
            ? error.message
            : "Chưa phân tích lại được. Hãy thử sau.",
        );
    } finally {
      setBusy(false);
      requestLock.current = false;
    }
  }
  const result = record.result;
  const checks = result.checks ?? readingChecks(record);
  const followUpSuggestion =
    record.followUps.at(-1)?.result.followUpSuggestion ??
    result.followUpSuggestion ??
    result.reflectionQuestion ??
    first.checkQuestions[0];
  return (
    <div className="result-experience">
      <ol className="reading-steps" aria-label="Tiến trình trải bài">
        <li>
          <span>01</span> Câu hỏi
        </li>
        <li>
          <span>02</span> Rút bài
        </li>
        <li aria-current="step">
          <span>03</span> Góc nhìn
        </li>
      </ol>
      <div className="result-heading">
        <div className="eyebrow">
          {spreads[record.spread].name} ·{" "}
          {new Date(record.createdAt).toLocaleDateString("vi-VN")}
        </div>
        <h1>
          Một góc nhìn.
          <br />
          <em>Một bước để thử.</em>
        </h1>
        <p className="question-capsule">{record.question}</p>
        {record.cards.length > 1 ? (
          <p className="result-swipe-hint">
            Vuốt ngang các lá để xem từng góc nhìn. Phần liên hệ chung ở bên
            dưới.
          </p>
        ) : null}
        <a className="text-link result-jump" href="#reading-insight">
          Đọc phần liên hệ <span aria-hidden="true">↓</span>
        </a>
      </div>
      <div
        className={`result-layout ${record.cards.length > 1 ? "spread-result" : ""}`}
      >
        <aside className="result-cards" aria-label="Các lá đã rút">
          {record.cards.map((draw, i) => {
            const card = getCard(draw.id)!;
            return (
              <div className="result-card-item" key={draw.id}>
                <span className="position-label">
                  0{i + 1} — {spreads[record.spread].positions[i]}
                </span>
                <CardReveal
                  draw={draw}
                  artworkRef={i === 0 ? artworkRef : undefined}
                  className="result-card-face"
                  reveal={revealCards}
                  delay={0.12 + i * 0.18}
                />
                <span className="orientation-label">
                  {draw.orientation === "upright"
                    ? "Xuôi · Góc nhìn có thể phát huy"
                    : "Ngược · Điểm mù cần kiểm tra"}
                </span>
                <div className="result-card-meta">
                  <strong>{card.concept}</strong>
                  <span>
                    {card.name} · {card.group}
                  </span>
                  <p className="card-keywords">
                    {card.keywords.slice(0, 3).join(" · ")}
                  </p>
                </div>
                <button
                  className="text-link"
                  onClick={() => setKnowledge(card)}
                >
                  <BookOpen size={14} /> Xem kiến thức của lá này
                </button>
              </div>
            );
          })}
        </aside>
        <section
          className="reading-copy"
          id="reading-insight"
          aria-label="Luận giải"
        >
          <p className="reading-style-summary">
            Phong cách: <strong>{styles[record.style]}</strong>
          </p>
          <p className="source-note">
            {result.source === "ai"
              ? "AI liên hệ câu hỏi với các lá bạn đã chọn."
              : result.fallbackReason === "unavailable"
                ? "AI chưa trả lời được. Dưới đây là góc nhìn nền để bạn tự đối chiếu."
                : "Góc nhìn nền từ các lá bài · AI chưa được bật."}
          </p>
          {result.source === "local" &&
          result.fallbackReason === "unavailable" ? (
            <button
              className="text-link retry-interpretation"
              onClick={retryInterpretation}
              disabled={busy}
            >
              {busy ? (
                <LoaderCircle className="spin" size={14} />
              ) : (
                <ArrowUpRight size={14} />
              )}
              {busy ? "Đang liên hệ với câu hỏi…" : "Thử phân tích lại với AI"}
            </button>
          ) : null}
          <div aria-busy={busy}>
            {[
              { title: "Điều cần nhìn rõ", text: result.message },
              { title: "Soi vào vấn đề", text: result.reflection },
            ].map((block, i) => (
              <motion.section
                className={`reading-block ${i === 0 ? "message-block" : ""}`}
                key={block.title}
                initial={{ opacity: 0, y: reduced ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: reduced ? 0 : i * 0.1,
                  duration: reduced ? 0 : 0.4,
                }}
              >
                <h2 className="reading-section-title">
                  <span>0{i + 1}</span> {block.title}
                </h2>
                {i === 0 ? (
                  <ReadingParagraphs text={block.text} />
                ) : (
                  <ContextualInsight
                    result={result}
                    cards={record.cards}
                    spread={record.spread}
                  />
                )}
              </motion.section>
            ))}
            <motion.section
              className="reading-block"
              initial={{ opacity: 0, y: reduced ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: reduced ? 0 : 0.2,
                duration: reduced ? 0 : 0.4,
              }}
            >
              <h2 className="reading-section-title">
                <span>03</span> Tự hỏi trước khi quyết định
              </h2>
              <ul className="reading-checks">
                {checks.map((check, i) => (
                  <li key={i}>{check}</li>
                ))}
              </ul>
            </motion.section>
            <motion.section
              className="reading-block"
              initial={{ opacity: 0, y: reduced ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: reduced ? 0 : 0.3,
                duration: reduced ? 0 : 0.4,
              }}
            >
              <h2 className="reading-section-title">
                <span>04</span> Ba bước có thể thử
              </h2>
              <p className="action-intro">
                Chọn một bước để lưu và kiểm nghiệm sau.
              </p>
              <div className="action-options">
                {result.actions.map((action, i) => (
                  <button
                    key={i}
                    className={`action-option ${record.selectedAction === i ? "selected" : ""}`}
                    aria-pressed={record.selectedAction === i}
                    disabled={busy}
                    onClick={() =>
                      persist(
                        { ...record, selectedAction: i, outcome: undefined },
                        true,
                      )
                    }
                  >
                    <span className="action-index">
                      {record.selectedAction === i ? (
                        <Check size={17} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                    <span>
                      <strong>{action.title}</strong>
                      <span>{action.detail}</span>
                    </span>
                  </button>
                ))}
              </div>
            </motion.section>
          </div>
          <div className="result-toolbar">
            <button
              className="button"
              onClick={() => persist(record, true)}
              disabled={busy}
            >
              <Bookmark size={15} />
              {saved ? "Đã lưu · cập nhật" : "Lưu lần trải"}
            </button>
            <button className="button" onClick={share} disabled={exporting}>
              {exporting ? (
                <LoaderCircle size={15} className="spin" />
              ) : (
                <Download size={15} />
              )}
              Tải ảnh chia sẻ
            </button>
            <button
              className="text-link"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `${first.name}\n${shareMessage(first, record.cards[0].orientation)}\nTarot Biện Chứng`,
                  );
                  toast.success("Đã sao chép thông điệp.");
                } catch {
                  toast.error("Trình duyệt chưa cho phép sao chép.");
                }
              }}
            >
              <Copy size={14} /> Sao chép
            </button>
          </div>
          <p className="fine-print">
            Ảnh chia sẻ dùng thông điệp ngắn của lá đầu tiên, không chứa câu hỏi
            hoặc luận giải riêng tư. Lịch sử tối đa 30 lần trải, chỉ nằm trên
            thiết bị này.
          </p>
          <section className="follow-up-section">
            <h2>
              Bạn còn muốn <em>hỏi gì?</em>
            </h2>
            <p>Tiếp tục với vấn đề ban đầu và các lá đã rút.</p>
            <div className="follow-up-list">
              {record.followUps.map((entry, i) => (
                <article className="follow-up-entry" key={i}>
                  <h3>{entry.question}</h3>
                  <ReadingParagraphs text={entry.result.message} />
                  <ContextualInsight
                    result={entry.result}
                    cards={record.cards}
                    spread={record.spread}
                    compact
                  />
                  {entry.result.checks ? (
                    <ul className="reading-checks">
                      {entry.result.checks.map((check, j) => (
                        <li key={j}>{check}</li>
                      ))}
                    </ul>
                  ) : null}
                  <ol>
                    {entry.result.actions.map((a, j) => (
                      <li key={j}>
                        <strong>{a.title}:</strong> {a.detail}
                      </li>
                    ))}
                  </ol>
                  <span className="source-note">
                    {entry.result.source === "ai"
                      ? "Diễn giải AI"
                      : "Gợi ý theo quy tắc"}
                  </span>
                </article>
              ))}
            </div>
            <form onSubmit={ask}>
              <label className="sr-only" htmlFor="follow-up">
                Câu hỏi tiếp theo
              </label>
              <textarea
                id="follow-up"
                rows={3}
                maxLength={500}
                value={followUp}
                disabled={busy || record.followUps.length >= MAX_FOLLOW_UPS}
                onChange={(e) => setFollowUp(e.target.value)}
                placeholder={followUpSuggestion}
              />
              <div className="follow-up-bottom">
                <span className="fine-print">
                  {followUp.length}/500 · {record.followUps.length}/
                  {MAX_FOLLOW_UPS} câu hỏi tiếp
                </span>
                <button
                  className="button"
                  disabled={busy || record.followUps.length >= MAX_FOLLOW_UPS}
                >
                  {busy ? (
                    <LoaderCircle size={15} className="spin" />
                  ) : (
                    <ArrowUpRight size={16} />
                  )}
                  Hỏi tiếp
                </button>
              </div>
            </form>
          </section>
          <p className="field-error" role={error ? "alert" : undefined}>
            {error}
          </p>
          {onNew ? (
            <button
              className="text-link new-reading"
              onClick={onNew}
              disabled={busy}
            >
              Bắt đầu một câu hỏi mới ↗
            </button>
          ) : null}
        </section>
      </div>
      <Knowledge card={knowledge} onClose={() => setKnowledge(null)} />
      <ShareDialog image={sharePreview} onClose={() => setSharePreview(null)} />
    </div>
  );
}
