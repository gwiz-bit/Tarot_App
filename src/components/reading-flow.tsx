"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import { ArrowLeft } from "lucide-react";
import { getCard } from "@/data/cards";
import {
  spreads,
  type Analysis,
  type DrawCount,
  type DrawnCard,
  type ReadingRecord,
  type ReadingStyle,
} from "@/lib/domain";
import { analyze, interpret, clearAiRequestCache } from "@/lib/client-api";
import { withReadingTone } from "@/lib/reading-cache";
import { readHistory } from "@/lib/storage";
import {
  clearReadingSession,
  createReadingSession,
  readReadingSession,
  writeReadingSession,
  type ReadingSession,
} from "@/lib/reading-session";
import { CardReveal } from "./card-reveal";
import { DeckCarousel } from "./deck-carousel";
import { QuestionForm } from "./question-form";
import { ReadingResultView } from "./reading-result";
import {
  ReadingPreparation,
  ReadingInterpretationPending,
} from "./reading-pending";

const subscribeHydration = () => () => {};
export function ReadingFlow() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  if (!hydrated)
    return (
      <main className="container reading-page" aria-busy="true">
        <p role="status">Đang mở lần trải trên thiết bị…</p>
      </main>
    );
  return <ReadingFlowCore initial={readReadingSession()} />;
}
function ReadingFlowCore({ initial }: { initial: ReadingSession | null }) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<"question" | "draw" | "result">(
      initial?.stage ?? "question",
    ),
    [question, setQuestion] = useState(initial?.question ?? "");
  const [analysis, setAnalysis] = useState<Analysis | null>(
      initial?.analysis ?? null,
    ),
    [deck, setDeck] = useState<DrawnCard[]>(() => initial?.deck ?? []),
    [selected, setSelected] = useState<number[]>(initial?.selected ?? []);
  const [busy, setBusy] = useState(false),
    [flipping, setFlipping] = useState(false),
    [error, setError] = useState(""),
    [record, setRecord] = useState<ReadingRecord | null>(
      initial?.record ?? null,
    );
  const [freshResult, setFreshResult] = useState(false);
  const [style, setStyle] = useState<ReadingStyle>(initial?.style ?? "simple");
  const [drawCount, setDrawCount] = useState<DrawCount>(
    initial?.analysis.spread === "quick" ? 1 : 3,
  );
  const [readingSessionId, setReadingSessionId] = useState(
    initial?.readingSessionId ?? "",
  );
  const requestLock = useRef(false);
  const pickLock = useRef(flipping);
  const pendingSelection = useRef<number[] | null>(null);
  const request = useRef<AbortController | null>(null);
  const focusQuestion = useRef(false);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (stage === "question" || !analysis) return;
    writeReadingSession({
      version: 1,
      readingSessionId,
      stage,
      question,
      analysis,
      style,
      deck,
      selected,
      record: stage === "result" ? record : null,
    });
  }, [
    stage,
    question,
    analysis,
    style,
    deck,
    selected,
    record,
    readingSessionId,
  ]);
  async function start(
    question: string,
    chosenStyle: ReadingStyle,
    chosenDrawCount: DrawCount,
  ) {
    if (requestLock.current) return;
    requestLock.current = true;
    setBusy(true);
    setError("");
    setQuestion(question);
    setStyle(chosenStyle);
    setDrawCount(chosenDrawCount);
    requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "instant" }),
    );
    const controller = new AbortController();
    request.current = controller;
    try {
      const result = await analyze(
        question,
        controller.signal,
        crypto.randomUUID(),
        chosenDrawCount,
      );
      if (controller.signal.aborted) return;
      if ("blocked" in result) {
        setError(result.message);
        return;
      }
      const session = createReadingSession(question, result, chosenStyle);
      writeReadingSession(session);
      setAnalysis(session.analysis);
      setReadingSessionId(session.readingSessionId);
      setDeck(session.deck);
      setSelected(session.selected);
      setStage("draw");
      requestAnimationFrame(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      setError(
        error instanceof Error ? error.message : "Chưa phân tích được câu hỏi.",
      );
    } finally {
      if (request.current === controller) {
        setBusy(false);
        requestLock.current = false;
        request.current = null;
      }
    }
  }
  const finish = useCallback(
    async (indices: number[]) => {
      if (!analysis || requestLock.current) return;
      requestLock.current = true;
      setBusy(true);
      setError("");
      requestAnimationFrame(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      const controller = new AbortController();
      request.current = controller;
      try {
        const input = {
          readingSessionId,
          question,
          questionSummary: analysis.summary,
          questionContext: analysis.questionContext,
          spread: analysis.spread,
          style,
          cards: indices.map((i) => deck[i]),
        };
        const result = await interpret(input, controller.signal);
        if (controller.signal.aborted) return;
        if ("blocked" in result) {
          setError(result.message);
          return;
        }
        const nextRecord: ReadingRecord = {
          ...input,
          result,
          basis: result,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          followUps: [],
        };
        setRecord(withReadingTone(nextRecord, style, result));
        setFreshResult(true);
        setStage("result");
        requestAnimationFrame(() =>
          window.scrollTo({ top: 0, behavior: "instant" }),
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(
          error instanceof Error ? error.message : "Chưa tạo được kết quả.",
        );
      } finally {
        if (request.current === controller) {
          setBusy(false);
          requestLock.current = false;
          request.current = null;
        }
      }
    },
    [analysis, deck, question, style, readingSessionId],
  );
  function pick(index: number) {
    if (
      !analysis ||
      pickLock.current ||
      busy ||
      selected.includes(index) ||
      selected.length >= spreads[analysis.spread].positions.length
    )
      return;
    pickLock.current = true;
    const nextSelection = [...selected, index];
    pendingSelection.current = nextSelection;
    setFlipping(true);
    setSelected(nextSelection);
  }
  const flipped = useCallback(() => {
    // Ignore duplicate completions and callbacks from a canceled/older draw.
    if (!pickLock.current || pendingSelection.current !== selected) return;
    pickLock.current = false;
    pendingSelection.current = null;
    setFlipping(false);
    if (
      analysis &&
      selected.length === spreads[analysis.spread].positions.length
    )
      void finish(selected);
  }, [analysis, selected, finish]);
  useEffect(() => {
    if (!flipping) return;
    // The flip normally completes in 900ms. Shared-layout interruption or a
    // suspended tab must not leave navigation and the remaining deck locked.
    const timer = window.setTimeout(() => {
      if (pendingSelection.current) {
        flipped();
      } else {
        // Recover a transient lock retained by a development hot update.
        pickLock.current = false;
        setFlipping(false);
      }
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [flipping, flipped]);
  function returnToQuestion(clearQuestion: boolean) {
    cancelRequest();
    clearReadingSession();
    setStage("question");
    setRecord(null);
    setAnalysis(null);
    if (clearQuestion) {
      setQuestion("");
      clearAiRequestCache();
    }
    setSelected([]);
    setDeck([]);
    setError("");
    setBusy(false);
    setFlipping(false);
    setFreshResult(false);
    pickLock.current = false;
    pendingSelection.current = null;
    focusQuestion.current = true;
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }
  function cancelRequest() {
    request.current?.abort();
    request.current = null;
    requestLock.current = false;
    setBusy(false);
    setError("");
  }
  function editPendingQuestion() {
    cancelRequest();
    focusQuestion.current = true;
  }
  function reset() {
    returnToQuestion(true);
  }
  if (stage === "result" && record)
    return (
      <motion.main
        className="container result-page"
        initial={{ opacity: 0, y: reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.24 }}
      >
        <ReadingResultView
          record={record}
          revealCards={freshResult}
          onChange={setRecord}
          onNew={reset}
          initiallySaved={readHistory().some((saved) => saved.id === record.id)}
        />
      </motion.main>
    );
  return (
    <main
      className={`container reading-page ${stage === "draw" ? "draw-page" : "question-page"}`}
    >
      <ol className="reading-steps" aria-label="Tiến trình trải bài">
        <li aria-current={stage === "question" ? "step" : undefined}>
          <span>01</span> Câu hỏi
        </li>
        <li aria-current={stage === "draw" && !busy ? "step" : undefined}>
          <span>02</span> Rút bài
        </li>
        <li aria-current={stage === "draw" && busy ? "step" : undefined}>
          <span>03</span> Góc nhìn
        </li>
      </ol>
      <AnimatePresence mode="wait" initial={false}>
        {stage === "question" && busy ? (
          <motion.div
            key="preparing"
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
          >
            <ReadingPreparation
              question={question}
              onCancel={editPendingQuestion}
            />
          </motion.div>
        ) : stage === "question" ? (
          <motion.div
            key="question"
            className="question-focus"
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
            onAnimationComplete={() => {
              if (focusQuestion.current) {
                document
                  .getElementById("question")
                  ?.focus({ preventScroll: true });
                focusQuestion.current = false;
              }
            }}
          >
            <svg
              className="question-orbit"
              viewBox="0 0 100 100"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="currentColor"
                opacity=".35"
              />
              <ellipse
                cx="50"
                cy="50"
                rx="19"
                ry="42"
                transform="rotate(40 50 50)"
                stroke="currentColor"
              />
              <path d="m50 34 16 16-16 16-16-16Z" stroke="currentColor" />
              <circle cx="76" cy="25" r="3" fill="currentColor" />
            </svg>
            <h1>Bạn muốn nhìn rõ điều gì?</h1>
            <p className="page-intro">
              Viết điều bạn đang băn khoăn để mở ra một góc nhìn mới.
            </p>
            <QuestionForm
              collapseSuggestions
              busy={busy}
              onSubmit={start}
              defaultQuestion={question}
              defaultStyle={style}
              defaultDrawCount={drawCount}
              label="Câu hỏi của bạn"
            />
          </motion.div>
        ) : analysis ? (
          <motion.div
            key="draw"
            className="draw-stage"
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.24 }}
          >
            <div className="draw-atmosphere" aria-hidden="true">
              {selected.length > 0 && !reduced ? (
                <motion.div
                  key={selected.length}
                  className="draw-selection-light"
                  initial={{ opacity: 0, scale: 0.65 }}
                  animate={{ opacity: [0, 0.75, 0], scale: [0.65, 1, 1.12] }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              ) : null}
            </div>
            <button
              className="text-link back-to-question"
              onClick={() => returnToQuestion(false)}
            >
              <ArrowLeft size={14} /> Đổi câu hỏi
            </button>
            <h1>{spreads[analysis.spread].name}</h1>
            <motion.p className="question-capsule" layoutId="reading-question">
              {question}
            </motion.p>
            <details className="spread-reason">
              <summary>Vì sao chọn cách trải này?</summary>
              <p className="page-intro">{analysis.reason}</p>
              <span className="source-note">
                Cấu trúc dựa trên số lá bạn chọn và nội dung câu hỏi
              </span>
            </details>
            <div className="draw-count-note" aria-label="Số lá cần rút">
              <strong>
                Trải {spreads[analysis.spread].positions.length} lá
              </strong>
              <span>
                {spreads[analysis.spread].positions.length === 1
                  ? "Chọn một lá để mở góc nhìn cho câu hỏi này."
                  : "Chọn lần lượt ba lá theo các vị trí bên dưới."}
              </span>
            </div>
            <LayoutGroup id="reading-deck">
              <div
                className="spread-slots compact-slots"
                aria-label="Các vị trí trải bài"
              >
                {spreads[analysis.spread].positions.map((position, i) => (
                  <div
                    className={`spread-slot ${i === selected.length && !busy ? "spread-slot-next" : ""}`}
                    key={position}
                  >
                    <span className="position-label">
                      0{i + 1} — {position}
                    </span>
                    {selected[i] !== undefined ? (
                      <div className="picked-card-stage">
                        {!reduced && i === selected.length - 1 ? (
                          <motion.div
                            className="picked-card-ripple"
                            aria-hidden="true"
                            initial={{ opacity: 0.6, scale: 0.72 }}
                            animate={{ opacity: 0, scale: 1.45 }}
                            transition={{
                              delay: 0.3,
                              duration: 0.55,
                              ease: "easeOut",
                            }}
                          />
                        ) : null}
                        <CardReveal
                          draw={deck[selected[i]]}
                          className="draw-reveal"
                          layoutId={`draw-${selected[i]}`}
                          delay={0.32}
                          reveal={flipping && i === selected.length - 1}
                          onComplete={
                            i === selected.length - 1 ? flipped : undefined
                          }
                        />
                      </div>
                    ) : (
                      <div className="empty-slot">
                        <span>✧</span>
                        <small>
                          {i === selected.length ? "Lá tiếp theo" : "Chờ chọn"}
                        </small>
                      </div>
                    )}
                    {selected[i] !== undefined ? (
                      <motion.span
                        className="picked-caption"
                        initial={{ opacity: 0, y: reduced ? 0 : 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: reduced ? 0 : 0.45,
                          duration: reduced ? 0 : 0.2,
                        }}
                      >
                        <strong>
                          {getCard(deck[selected[i]].id)!.concept}
                        </strong>
                        <span className="orientation-label">
                          {deck[selected[i]].orientation === "upright"
                            ? "Lá xuôi"
                            : "Lá ngược"}
                        </span>
                      </motion.span>
                    ) : (
                      <span className="picked-caption" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
              <div className="draw-instruction" role="status">
                {busy
                  ? null
                  : selected.length < spreads[analysis.spread].positions.length
                    ? flipping
                      ? `Đang mở lá ${selected.length}/${spreads[analysis.spread].positions.length} · ${spreads[analysis.spread].positions[selected.length - 1]}`
                      : `Lá ${selected.length + 1}/${spreads[analysis.spread].positions.length} · ${spreads[analysis.spread].positions[selected.length]}`
                    : "Các góc nhìn đã mở."}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                {busy ? (
                  <motion.div
                    key="interpretation-pending"
                    initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.2 }}
                  >
                    <ReadingInterpretationPending onCancel={cancelRequest} />
                  </motion.div>
                ) : selected.length <
                    spreads[analysis.spread].positions.length || flipping ? (
                  <DeckCarousel
                    key="deck"
                    count={deck.length}
                    selected={selected}
                    onPick={pick}
                    disabled={
                      busy ||
                      flipping ||
                      selected.length >=
                        spreads[analysis.spread].positions.length
                    }
                    nextPosition={
                      spreads[analysis.spread].positions[selected.length]
                    }
                  />
                ) : null}
              </AnimatePresence>
            </LayoutGroup>
            {selected.length === spreads[analysis.spread].positions.length &&
            !busy &&
            !flipping ? (
              <button
                className="button primary"
                onClick={() => finish(selected)}
              >
                {error ? "Thử tạo kết quả lại ↗" : "Mở góc nhìn ↗"}
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="flow-error" role={error ? "alert" : undefined}>
        {error}
      </div>
    </main>
  );
}
