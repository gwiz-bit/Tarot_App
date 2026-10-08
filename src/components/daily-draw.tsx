"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Copy,
  RefreshCw,
  BookOpen,
  ArrowRight,
  Sparkles,
  Compass,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  SlidersHorizontal,
  Bot,
  Lightbulb,
} from "lucide-react";
import { getCard } from "@/data/cards";
import { type DrawnCard, type ReadingResult, type ReadingStyle } from "@/lib/domain";
import { getDailyCard, getRandomCard } from "@/lib/storage";
import { interpret } from "@/lib/client-api";
import { CardFace } from "./artwork";
import { DeckBack } from "./card-reveal";
import { Knowledge } from "./knowledge";
import { ReadingCheckCards, ReadingParagraphs } from "./contextual-insight";

export function DailyDrawView() {
  const [draw, setDraw] = useState<DrawnCard | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [drawMode, setDrawMode] = useState<"random" | "daily">("random");
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [key, setKey] = useState(0);

  // AI-generated unique content state
  const [aiResult, setAiResult] = useState<ReadingResult | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [viewTab, setViewTab] = useState<"ai" | "framework">("ai");
  const [style, setStyle] = useState<ReadingStyle>("simple");
  const [userFocus, setUserFocus] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentCard = draw ? getCard(draw.id) : null;

  const requestAiAdvice = useCallback(
    async (
      cardDraw: DrawnCard,
      targetStyle: ReadingStyle = style,
      focusText: string = userFocus,
    ) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoadingAi(true);
      setAiResult(null);

      const cardData = getCard(cardDraw.id);
      const cardName = cardData ? `${cardData.concept} (${cardData.name})` : cardDraw.id;
      const orientationStr = cardDraw.orientation === "upright" ? "xuôi" : "ngược";

      const promptQuestion = focusText.trim()
        ? `Hôm nay mình đang bận tâm: ${focusText.trim()}. Rút được lá bài ${cardName} chiều ${orientationStr}. Hãy cho mình lời khuyên cụ thể, hành động thực tế và điều cần tự kiểm tra cho ngày hôm nay.`
        : `Lời khuyên và hành động thực tiễn cho ngày hôm nay từ góc nhìn của lá bài ${cardName} chiều ${orientationStr} là gì?`;

      try {
        const res = await interpret(
          {
            question: promptQuestion,
            cards: [cardDraw],
            spread: "quick",
            style: targetStyle,
            readingSessionId: crypto.randomUUID(),
          },
          controller.signal,
        );

        if (!("blocked" in res)) {
          setAiResult(res);
          setViewTab("ai");
        } else {
          // If blocked by safety or input, fallback to framework view
          setViewTab("framework");
        }
      } catch {
        // Fallback gracefully on error
        setViewTab("framework");
      } finally {
        setIsLoadingAi(false);
      }
    },
    [style, userFocus],
  );

  function handleDrawRandom() {
    setDrawMode("random");
    const nextCard = getRandomCard();
    setDraw(nextCard);
    setIsRevealed(true);
    setKey((prev) => prev + 1);
    requestAiAdvice(nextCard);
  }

  function handleDrawDaily() {
    setDrawMode("daily");
    const dailyCard = getDailyCard();
    setDraw(dailyCard);
    setIsRevealed(true);
    setKey((prev) => prev + 1);
    requestAiAdvice(dailyCard);
  }

  function handleRegenerateAi() {
    if (draw) {
      requestAiAdvice(draw, style, userFocus);
    }
  }

  function handleStyleChange(newStyle: ReadingStyle) {
    setStyle(newStyle);
    if (draw) {
      requestAiAdvice(draw, newStyle, userFocus);
    }
  }

  async function handleCopyAdvice() {
    if (!currentCard || !draw) return;
    const isUpright = draw.orientation === "upright";
    const framework = isUpright
      ? currentCard.uprightFramework
      : currentCard.reversedFramework;

    let textToCopy = "";
    if (aiResult && viewTab === "ai") {
      textToCopy = `[Tarot Biện Chứng] Lời khuyên độc bản hôm nay từ AI — ${currentCard.concept} (${draw.orientation === "upright" ? "Xuôi" : "Ngược"})

✦ THÔNG ĐIỆP CHÍNH:
${aiResult.message}

✦ SOI VÀO HÔM NAY:
${aiResult.reflection}

✦ 3 HÀNH ĐỘNG GỢI Ý:
${aiResult.actions.map((a, i) => `${i + 1}. ${a.title}: ${a.detail}`).join("\n")}

✦ ĐIỀU CẦN TỰ KIỂM TRA:
${aiResult.checks?.map((c, i) => `${i + 1}. ${c}`).join("\n") ?? ""}`;
    } else {
      textToCopy = `[Tarot Biện Chứng] Lời khuyên trong ngày — ${currentCard.concept} (${draw.orientation === "upright" ? "Xuôi" : "Ngược"})

✦ THÔNG ĐIỆP:
${framework}

✦ HÀNH ĐỘNG GỢI Ý:
${currentCard.methodologicalMeaning} (${currentCard.realLifeExample})

✦ ĐIỂM MÙ CẦN TRÁNH:
${currentCard.commonMistake}

✦ CÂU HỎI SUY NGẪM:
${currentCard.reflection}`;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Đã sao chép lời khuyên trong ngày vào bộ nhớ tạm.");
    } catch {
      toast.error("Không thể sao chép văn bản trên trình duyệt này.");
    }
  }

  return (
    <div className="daily-draw-page container">
      <div className="daily-draw-header">
        <span className="eyebrow">
          <Sparkles className="icon-inline" size={14} /> Chiêm nghiệm hằng ngày với AI
        </span>
        <h1>Rút 1 lá nhận lời khuyên trong ngày</h1>
        <p className="lead">
          Mỗi lần rút là một thông điệp độc bản được AI Biện Chứng phân tích riêng cho bạn,
          tránh lặp lại rập khuôn. Nhận một góc nhìn mới, một hành động thực tế và một cạm bẫy cần tránh cho ngày hôm nay.
        </p>

        {/* Optional focus input */}
        <div className="daily-focus-container">
          <input
            type="text"
            className="daily-focus-input"
            placeholder="Tùy chọn: Điều bạn đang bận tâm hôm nay (ví dụ: công việc mới, thi cử, cần động lực...)"
            value={userFocus}
            onChange={(e) => setUserFocus(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draw) {
                handleRegenerateAi();
              }
            }}
          />
        </div>

        <div className="daily-mode-tabs">
          <button
            type="button"
            className={`tab-btn ${drawMode === "random" ? "active" : ""}`}
            onClick={handleDrawRandom}
          >
            ✦ Rút 1 lá ngẫu nhiên mới
          </button>
          <button
            type="button"
            className={`tab-btn ${drawMode === "daily" ? "active" : ""}`}
            onClick={handleDrawDaily}
          >
            ✧ Mở lá bài hôm nay
          </button>
        </div>
      </div>

      <div className="daily-draw-stage">
        {!isRevealed || !draw || !currentCard ? (
          <div className="daily-unrevealed-deck">
            <motion.div
              className="deck-interactive-card"
              whileHover={{ scale: 1.03, y: -6 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDrawRandom}
            >
              <div className="deck-back-wrapper">
                <DeckBack />
              </div>
              <div className="deck-glow" />
            </motion.div>
            <div className="deck-action-prompt">
              <button
                type="button"
                className="button button-primary"
                onClick={handleDrawRandom}
              >
                <Sparkles size={16} /> Rút lá ngẫu nhiên của bạn ngay
              </button>
              <p className="fine-print">
                Xáo trộn toàn bộ 22 lá bài và để AI phân tích lời khuyên độc bản cho bạn hôm nay.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={key}
              className="daily-result-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="daily-card-visual-col">
                <div className="daily-card-frame">
                  <CardFace
                    card={currentCard}
                    reversed={draw.orientation === "reversed"}
                  />
                </div>
                <div className="daily-card-badge">
                  <span className="card-orientation-tag">
                    {draw.orientation === "upright"
                      ? "Lá xuôi · Lăng kính phát huy"
                      : "Lá ngược · Điểm mù cần rà soát"}
                  </span>
                  <span className="card-group-tag">{currentCard.group}</span>
                </div>
                <div className="daily-card-subactions">
                  <button
                    type="button"
                    className="button button-outline full-width"
                    onClick={() => setShowKnowledge(true)}
                  >
                    <BookOpen size={15} /> Kiến thức chi tiết
                  </button>
                  <button
                    type="button"
                    className="button button-outline full-width"
                    onClick={handleDrawRandom}
                  >
                    <RefreshCw size={15} /> Rút một lá khác
                  </button>
                </div>
              </div>

              <div className="daily-card-content-col">
                <div className="daily-card-header-meta">
                  <div className="daily-card-top-row">
                    <span className="daily-card-number">
                      LÁ SỐ {String(currentCard.number).padStart(2, "0")} / 22
                    </span>
                    <div className="daily-view-switcher">
                      <button
                        type="button"
                        className={`switcher-pill ${viewTab === "ai" ? "active" : ""}`}
                        onClick={() => setViewTab("ai")}
                      >
                        <Bot size={13} /> Lời khuyên AI (Độc bản)
                      </button>
                      <button
                        type="button"
                        className={`switcher-pill ${viewTab === "framework" ? "active" : ""}`}
                        onClick={() => setViewTab("framework")}
                      >
                        <Lightbulb size={13} /> Lăng kính gốc
                      </button>
                    </div>
                  </div>
                  <h2>{currentCard.concept}</h2>
                  <div className="daily-card-name-en">
                    {currentCard.name.toUpperCase()} ·{" "}
                    <em>{currentCard.keywords.join(" · ")}</em>
                  </div>
                </div>

                {/* AI-generated Advice View */}
                {viewTab === "ai" ? (
                  <>
                    {isLoadingAi ? (
                      <div className="daily-ai-loading-box">
                        <div className="ai-loading-orbit">
                          <Sparkles className="icon-spin-slow" size={24} />
                        </div>
                        <div className="ai-loading-text">
                          <strong>AI Biện Chứng đang tạo lời khuyên riêng cho ngày hôm nay...</strong>
                          <p className="fine-print">
                            Kết nối lăng kính {currentCard.concept} với thực tiễn đời sống để tạo thông điệp độc bản.
                          </p>
                        </div>
                      </div>
                    ) : aiResult ? (
                      <>
                        <div className="daily-advice-block primary-advice ai-highlight">
                          <div className="block-label">
                            <Compass size={15} /> THÔNG ĐIỆP HÔM NAY (AI)
                            <span className="ai-tag">
                              <CheckCircle2 size={12} /> Độc bản
                            </span>
                          </div>
                          <p className="advice-text">{aiResult.message}</p>
                        </div>

                        <div className="daily-advice-block">
                          <div className="block-label">
                            <Sparkles size={14} /> SOI VÀO THỰC TIỄN HÔM NAY
                          </div>
                          <div className="reading-prose">
                            <ReadingParagraphs text={aiResult.reflection} />
                          </div>
                        </div>

                        <div className="daily-advice-block">
                          <div className="block-label">
                            <Compass size={14} /> 3 HÀNH ĐỘNG GỢI Ý TRONG NGÀY
                          </div>
                          <div className="daily-actions-list">
                            {aiResult.actions.map((action, i) => (
                              <div className="daily-action-card" key={i}>
                                <span className="action-num">0{i + 1}</span>
                                <div className="action-content">
                                  <strong>{action.title}</strong>
                                  <p>{action.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {aiResult.checks && aiResult.checks.length > 0 ? (
                          <div className="daily-advice-block caution-block">
                            <div className="block-label">
                              <AlertCircle size={14} /> ĐIỀU CẦN TỰ KIỂM TRA TRONG NGÀY
                            </div>
                            <ReadingCheckCards checks={aiResult.checks} />
                          </div>
                        ) : null}

                        {/* Style / Tone switcher */}
                        <div className="daily-tone-bar">
                          <span className="tone-label">
                            <SlidersHorizontal size={13} /> Giọng văn AI:
                          </span>
                          <div className="tone-buttons">
                            {(
                              [
                                ["simple", "Dễ hiểu"],
                                ["critical", "Phản biện"],
                                ["academic", "Học thuật"],
                              ] as const
                            ).map(([t, label]) => (
                              <button
                                key={t}
                                type="button"
                                className={`tone-btn ${style === t ? "active" : ""}`}
                                onClick={() => handleStyleChange(t)}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="button button-ghost button-sm"
                            onClick={handleRegenerateAi}
                            title="Tạo lời khuyên khác từ lá này"
                          >
                            <RefreshCw size={13} /> Làm mới AI
                          </button>
                        </div>
                      </>
                    ) : (
                      // Fallback if AI couldn't load
                      <div className="daily-advice-block">
                        <p className="detail-text">
                          {draw.orientation === "upright"
                            ? currentCard.uprightFramework
                            : currentCard.reversedFramework}
                        </p>
                        <button
                          type="button"
                          className="button button-primary"
                          onClick={handleRegenerateAi}
                          style={{ marginTop: "12px" }}
                        >
                          <Sparkles size={14} /> Thử lại với AI
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  /* Curated Framework View */
                  <>
                    <div className="daily-advice-block primary-advice">
                      <div className="block-label">
                        <Compass size={15} /> LỜI KHUYÊN GỐC (GIÁO TRÌNH)
                      </div>
                      <p className="advice-text">
                        {draw.orientation === "upright"
                          ? currentCard.uprightFramework
                          : currentCard.reversedFramework}
                      </p>
                    </div>

                    <div className="daily-advice-grid">
                      <div className="daily-advice-block">
                        <div className="block-label">
                          <Sparkles size={14} /> HÀNH ĐỘNG GỢI Ý
                        </div>
                        <p className="detail-text">
                          <strong>{currentCard.methodologicalMeaning}</strong>
                        </p>
                        <p className="example-text">
                          <em>Ví dụ:</em> {currentCard.realLifeExample}
                        </p>
                      </div>

                      <div className="daily-advice-block caution-block">
                        <div className="block-label">
                          <AlertCircle size={14} /> CẠM BẪY CẦN TRÁNH
                        </div>
                        <p className="detail-text">{currentCard.commonMistake}</p>
                      </div>
                    </div>

                    <div className="daily-advice-block reflection-block">
                      <div className="block-label">
                        <HelpCircle size={14} /> CÂU HỎI TỰ VẤN TRONG NGÀY
                      </div>
                      <p className="reflection-question">
                        “{currentCard.reflection}”
                      </p>
                      <p className="check-subquestion">
                        ↳ {currentCard.checkQuestions[0]}
                      </p>
                    </div>
                  </>
                )}

                <div className="daily-bottom-toolbar">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={handleCopyAdvice}
                  >
                    <Copy size={15} /> Sao chép lời khuyên
                  </button>

                  <Link
                    href={`/reading?seedTopic=${encodeURIComponent(
                      currentCard.concept,
                    )}`}
                    className="button button-primary"
                  >
                    Trải bài chuyên sâu về vấn đề này <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <Knowledge
        card={showKnowledge && currentCard ? currentCard : null}
        onClose={() => setShowKnowledge(false)}
      />
    </div>
  );
}
