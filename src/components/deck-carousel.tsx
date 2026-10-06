"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowLeft, ArrowRight, MoveHorizontal } from "lucide-react";
import {
  carouselSnapTarget,
  remainingDeckIndices,
  wrapCarouselIndex,
} from "@/lib/carousel";
import { DeckBack } from "./card-reveal";

type Gesture = {
  pointerId: number;
  x: number;
  y: number;
  offset: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  dragged: boolean;
  step: number;
};

function CarouselCard({
  index,
  rawIndex,
  offset,
  centered,
  disabled,
  onClick,
}: {
  index: number;
  rawIndex: number;
  offset: MotionValue<number>;
  centered: boolean;
  disabled: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>, rawIndex: number) => void;
}) {
  const reduced = useReducedMotion();
  const transform = useTransform(offset, (value) => {
    const distance = rawIndex - value;
    const depth = Math.abs(distance);
    return `translateX(calc(${distance} * var(--carousel-step))) translateZ(${-depth * (reduced ? 0 : 60)}px) rotateY(${reduced ? 0 : Math.max(-28, Math.min(28, -distance * 9))}deg) scale(${Math.max(0.52, 1 - depth * 0.12)})`;
  });
  const opacity = useTransform(offset, (value) =>
    Math.max(0, 1 - Math.abs(rawIndex - value) * 0.22),
  );
  return (
    <motion.button
      type="button"
      className={`carousel-card ${centered ? "carousel-card-centered" : ""}`}
      style={{
        transform,
        opacity,
        zIndex: centered
          ? 10
          : 5 - Math.abs(rawIndex - Math.round(offset.get())),
      }}
      disabled={disabled}
      tabIndex={centered ? 0 : -1}
      aria-label={
        centered
          ? `Rút lá bài úp ${index + 1}`
          : `Đưa lá bài úp ${index + 1} vào giữa`
      }
      data-deck-index={index}
      onClick={(event) => onClick(event, rawIndex)}
    >
      <motion.div
        className="carousel-card-body"
        layoutId={`draw-${index}`}
        transition={{ duration: reduced ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
        animate={{
          y: disabled && !reduced ? 6 : 0,
          scale: disabled && !reduced ? 0.97 : 1,
        }}
        whileHover={
          !reduced && !disabled
            ? {
                y: centered ? -14 : -7,
                rotateZ: centered ? -2 : 0,
                scale: 1.025,
              }
            : undefined
        }
        whileTap={!reduced && !disabled ? { scale: 0.97 } : undefined}
      >
        <DeckBack />
        <span className="carousel-card-sheen" aria-hidden="true" />
      </motion.div>
    </motion.button>
  );
}

export function DeckCarousel({
  count,
  selected,
  disabled,
  nextPosition,
  onPick,
}: {
  count: number;
  selected: number[];
  disabled: boolean;
  nextPosition?: string;
  onPick: (index: number) => void;
}) {
  const available = useMemo(
    () => remainingDeckIndices(count, selected),
    [count, selected],
  );
  const offset = useMotionValue(0);
  const [pivot, setPivot] = useState(0);
  const [dragging, setDragging] = useState(false);
  const reduced = useReducedMotion();
  const animation = useRef<{ stop: () => void } | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepMeasure = useRef<HTMLSpanElement>(null);
  const wasDisabled = useRef(disabled);
  const suppressClick = useRef(false);
  useMotionValueEvent(offset, "change", (value) => setPivot(Math.round(value)));
  useEffect(() => () => animation.current?.stop(), []);
  useEffect(() => {
    if (wasDisabled.current && !disabled)
      stageRef.current
        ?.querySelector<HTMLButtonElement>(".carousel-card-centered")
        ?.focus({ preventScroll: true });
    wasDisabled.current = disabled;
  }, [disabled]);

  function moveTo(target: number, focusCentered = false) {
    animation.current?.stop();
    const focus = () => {
      if (focusCentered)
        requestAnimationFrame(() =>
          stageRef.current
            ?.querySelector<HTMLButtonElement>(".carousel-card-centered")
            ?.focus({ preventScroll: true }),
        );
    };
    if (reduced) {
      offset.set(target);
      focus();
    } else {
      const playback = animate(offset, target, {
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1],
      });
      animation.current = playback;
      void playback.then(focus);
    }
  }
  function pickCenter() {
    if (disabled || dragging || !available.length) return;
    animation.current?.stop();
    onPick(
      available[wrapCarouselIndex(Math.round(offset.get()), available.length)],
    );
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (disabled || !event.isPrimary || event.button !== 0) return;
    animation.current?.stop();
    suppressClick.current = false;
    gesture.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offset: offset.get(),
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      dragged: false,
      // Read a resolved length: the mobile CSS variable contains clamp()/vw.
      step: stepMeasure.current?.getBoundingClientRect().width || 170,
    };
  }
  function clickCard(event: MouseEvent<HTMLButtonElement>, rawIndex: number) {
    if (disabled || (event.detail !== 0 && suppressClick.current)) return;
    const current = offset.get();
    if (
      rawIndex !== Math.round(current) ||
      Math.abs(current - Math.round(current)) > 0.12
    )
      moveTo(rawIndex);
    else pickCenter();
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId || disabled) return;
    const dx = event.clientX - active.x;
    const dy = event.clientY - active.y;
    if (!active.dragged) {
      if (Math.abs(dy) >= 8 && Math.abs(dy) >= Math.abs(dx)) {
        suppressClick.current = true;
        gesture.current = null;
        return;
      }
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
      active.dragged = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    event.preventDefault();
    const elapsed = Math.max(16, event.timeStamp - active.lastTime);
    active.velocity =
      (-(event.clientX - active.lastX) / active.step / elapsed) * 1000;
    active.lastX = event.clientX;
    active.lastTime = event.timeStamp;
    offset.set(active.offset - dx / active.step);
  }
  function pointerEnd(event: PointerEvent<HTMLDivElement>) {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    gesture.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (active.dragged) {
      const velocity =
        event.type === "pointercancel" ||
        event.timeStamp - active.lastTime > 100
          ? 0
          : active.velocity;
      moveTo(carouselSnapTarget(offset.get(), velocity));
    }
  }
  const visible = Array.from({ length: 9 }, (_, index) => pivot + index - 4);
  const center = available[wrapCarouselIndex(pivot, available.length)];
  return (
    <motion.section
      className="draw-carousel"
      aria-label="Chọn lá từ bộ bài"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.16 }}
    >
      <div className="carousel-navigation">
        <button
          type="button"
          className="carousel-arrow"
          disabled={disabled}
          aria-label="Lá trước"
          onClick={() => moveTo(Math.round(offset.get()) - 1)}
        >
          <ArrowLeft size={18} />
        </button>
        <div
          className={`carousel-stage ${dragging ? "is-dragging" : ""}`}
          ref={stageRef}
          role="group"
          aria-roledescription="carousel"
          aria-label={`Bộ ${available.length} lá bài úp còn lại`}
          aria-describedby="carousel-help"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerEnd}
          onPointerCancel={pointerEnd}
          onLostPointerCapture={() => {
            gesture.current = null;
            setDragging(false);
          }}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              moveTo(
                Math.round(offset.get()) + (event.key === "ArrowLeft" ? -1 : 1),
                true,
              );
            }
          }}
        >
          <span
            ref={stepMeasure}
            className="carousel-step-measure"
            aria-hidden="true"
          />
          <div
            className={`carousel-scene ${disabled ? "carousel-paused" : ""}`}
          >
            {available.length
              ? visible.map((rawIndex) => {
                  const index =
                    available[wrapCarouselIndex(rawIndex, available.length)];
                  return (
                    <CarouselCard
                      key={index}
                      index={index}
                      rawIndex={rawIndex}
                      offset={offset}
                      centered={rawIndex === pivot && !dragging}
                      disabled={disabled}
                      onClick={clickCard}
                    />
                  );
                })
              : null}
          </div>
          <div className="carousel-ground" aria-hidden="true" />
        </div>
        <button
          type="button"
          className="carousel-arrow"
          disabled={disabled}
          aria-label="Lá tiếp theo"
          onClick={() => moveTo(Math.round(offset.get()) + 1)}
        >
          <ArrowRight size={18} />
        </button>
      </div>
      <p className="carousel-help" id="carousel-help">
        <MoveHorizontal size={16} aria-hidden="true" /> Vuốt ngang, chọn lá ở
        giữa.
      </p>
      <button
        type="button"
        className="button primary carousel-pick"
        disabled={disabled || dragging}
        onClick={pickCenter}
      >
        Rút lá ở giữa <span aria-hidden="true">✧</span>
      </button>
      <p className="carousel-position" role="status">
        {nextPosition
          ? `Bộ bài đã xáo trộn · Dành cho ${nextPosition} · Lá úp ${center + 1}/${count}`
          : "Đã chọn đủ các góc nhìn"}
      </p>
    </motion.section>
  );
}
