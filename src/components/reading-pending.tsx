"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check } from "lucide-react";
import { DeckBack } from "./card-reveal";

function PendingStatus({ phase }: { phase: "analyze" | "interpret" }) {
  const [takingLonger, setTakingLonger] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setTakingLonger(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="reading-pending-status" role="status" aria-live="polite">
      <span className="reading-pending-dot" aria-hidden="true" />
      <span>
        {takingLonger
          ? "Đang chờ phản hồi, lần này cần thêm một chút thời gian."
          : phase === "analyze"
            ? "Đang tìm cách trải phù hợp với câu hỏi của bạn…"
            : "Đang kết nối các lá với câu hỏi của bạn…"}
      </span>
    </div>
  );
}

export function ReadingPreparation({
  question,
  onCancel,
}: {
  question: string;
  onCancel: () => void;
}) {
  const reduced = useReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus({ preventScroll: true }), []);

  return (
    <div className="reading-preparation">
      <motion.p
        className="question-capsule"
        layoutId="reading-question"
        transition={{ duration: reduced ? 0 : 0.24 }}
      >
        {question}
      </motion.p>
      <div className="preparing-deck" aria-hidden="true">
        <div className="preparing-orbit" />
        {[-2, -1, 0, 1, 2].map((offset, index) => (
          <motion.div
            key={offset}
            className="preparing-card"
            style={{ "--card-delay": `${index * -0.3}s` } as CSSProperties}
            initial={
              reduced ? false : { x: "0%", y: 12, rotate: 0, opacity: 0 }
            }
            animate={{
              x: `${offset * 32}%`,
              y: Math.abs(offset) * 12,
              rotate: offset * 12,
              opacity: 1,
            }}
            transition={{
              duration: reduced ? 0 : 0.46,
              delay: reduced ? 0 : index * 0.035,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="preparing-card-breath">
              <DeckBack />
            </div>
          </motion.div>
        ))}
      </div>
      <h1 ref={heading} tabIndex={-1}>
        Đang chuẩn bị bộ bài
      </h1>
      <PendingStatus phase="analyze" />
      <p className="reading-received">
        <Check size={13} aria-hidden="true" /> Câu hỏi đã được nhận
      </p>
      <button
        className="text-link reading-cancel"
        type="button"
        onClick={onCancel}
      >
        <ArrowLeft size={14} aria-hidden="true" /> Sửa câu hỏi
      </button>
    </div>
  );
}

export function ReadingInterpretationPending({
  onCancel,
}: {
  onCancel: () => void;
}) {
  return (
    <div className="reading-interpretation-pending">
      <PendingStatus phase="interpret" />
      <div className="interpretation-preview" aria-hidden="true">
        {["Thông điệp", "Soi vào vấn đề", "3 hành động"].map((label, index) => (
          <div
            className="interpretation-preview-row"
            key={label}
            style={{ "--preview-delay": `${index * 0.2}s` } as CSSProperties}
          >
            <span className="interpretation-preview-number">0{index + 1}</span>
            <div>
              <span className="interpretation-preview-label">{label}</span>
              <div className="preview-line" />
              <div className="preview-line preview-line-short" />
            </div>
          </div>
        ))}
      </div>
      <button
        className="text-link reading-cancel"
        type="button"
        onClick={onCancel}
      >
        <ArrowLeft size={14} aria-hidden="true" /> Xem lại các lá đã chọn
      </button>
    </div>
  );
}
