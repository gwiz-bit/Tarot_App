"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { motion, useReducedMotion } from "motion/react";
import { getCard } from "@/data/cards";
import { type DrawnCard } from "@/lib/domain";
import { CardFace } from "./artwork";

export function DeckBack() {
  return (
    <div className="deck-back" aria-hidden="true">
      <span>BIỆN CHỨNG</span>
      <svg viewBox="0 0 100 120" fill="none">
        <circle cx="50" cy="60" r="35" stroke="currentColor" />
        <ellipse
          cx="50"
          cy="60"
          rx="17"
          ry="48"
          transform="rotate(35 50 60)"
          stroke="currentColor"
        />
        <path
          d="M10 60h80M50 15v90m0-28 17-17-17-17-17 17Z"
          stroke="currentColor"
        />
      </svg>
      <span>✧</span>
    </div>
  );
}

export function CardReveal({
  draw,
  className = "",
  layoutId,
  delay = 0,
  reveal = true,
  artworkRef,
  onComplete,
}: {
  draw: DrawnCard;
  className?: string;
  layoutId?: string;
  delay?: number;
  reveal?: boolean;
  artworkRef?: RefObject<HTMLDivElement | null>;
  onComplete?: () => void;
}) {
  const reduced = useReducedMotion();
  const notified = useRef(false);
  const complete = useCallback(() => {
    if (notified.current) return;
    notified.current = true;
    onComplete?.();
  }, [onComplete]);
  useEffect(() => {
    if (reduced || !reveal) complete();
  }, [reduced, reveal, complete]);

  return (
    <motion.div
      className={`card-reveal ${className}`}
      layoutId={layoutId}
      transition={{ duration: reduced ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="flip-inner"
        initial={{ rotateY: reduced || !reveal ? 180 : 0 }}
        animate={{ rotateY: 180 }}
        transition={{
          delay: reduced || !reveal ? 0 : delay,
          duration: reduced || !reveal ? 0 : 0.58,
          ease: [0.22, 1, 0.36, 1],
        }}
        onAnimationComplete={complete}
      >
        <div className="flip-back">
          <DeckBack />
        </div>
        <div className="flip-front tarot-card" ref={artworkRef}>
          <CardFace
            card={getCard(draw.id)!}
            reversed={draw.orientation === "reversed"}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
