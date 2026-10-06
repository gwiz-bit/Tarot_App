"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getCard } from "@/data/cards";
import {
  type DrawCount,
  type DrawnCard,
  type ReadingRecord,
  type ReadingStyle,
} from "@/lib/domain";
import { analyze } from "@/lib/client-api";
import { getDailyCard, getRandomCard, outcomes, readHistory, saveRecord } from "@/lib/storage";
import {
  createReadingSession,
  writeReadingSession,
} from "@/lib/reading-session";
import { QuestionForm } from "./question-form";
import { Knowledge } from "./knowledge";
import { Artwork } from "./artwork";

const subscribe = (notify: () => void) => {
  window.addEventListener("tarot-history", notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener("tarot-history", notify);
    window.removeEventListener("storage", notify);
  };
};
const snapshot = () => {
  try {
    return localStorage.getItem("philo-tarot:history:v1") ?? "";
  } catch {
    return "";
  }
};
export function ReturningAction() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const last = raw
    ? readHistory().find((r) => r.selectedAction !== undefined && !r.outcome)
    : undefined;
  if (!last) return null;
  function feedback(outcome: ReadingRecord["outcome"]) {
    try {
      saveRecord({ ...last!, outcome });
      toast.success("Đã ghi nhận kết quả kiểm nghiệm.");
    } catch {
      toast.error("Trình duyệt chưa cho phép lưu dữ liệu.");
    }
  }
  return (
    <section className="returning-action container">
      <div className="eyebrow">QUAY LẠI VỚI THỰC TIỄN</div>
      <h2>
        Lần trước bạn đã chọn
        <br />
        <em>{last.result.actions[last.selectedAction!].title}.</em>
      </h2>
      <p>Kết quả thế nào? Một lần kiểm nghiệm mở ra một góc nhìn mới.</p>
      <div className="feedback-options">
        {Object.entries(outcomes).map(([key, label]) => (
          <button
            className="button"
            key={key}
            onClick={() => feedback(key as ReadingRecord["outcome"])}
          >
            {label}
          </button>
        ))}
      </div>
      <Link href={`/history?reading=${last.id}`} className="text-link">
        Xem lại lần trải ↗
      </Link>
    </section>
  );
}
export function HomeQuestion() {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function start(
    question: string,
    style: ReadingStyle,
    drawCount: DrawCount,
  ) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const controller = new AbortController();
    request.current = controller;
    try {
      const result = await analyze(
        question,
        controller.signal,
        crypto.randomUUID(),
        drawCount,
      );
      if (controller.signal.aborted) return;
      if ("blocked" in result) {
        setError(result.message);
        return;
      }
      const stored = writeReadingSession(
        createReadingSession(question, result, style),
      );
      if (!stored)
        toast.info(
          "Có thể trải bài trong phiên này. Trình duyệt đang chặn lưu dữ liệu khi tải lại.",
        );
      router.push("/reading");
    } catch (error) {
      if (controller.signal.aborted) return;
      setError(
        error instanceof Error
          ? error.message
          : "Không chuyển được câu hỏi. Bạn có thể mở mục Trải bài để tiếp tục.",
      );
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  return (
    <section className="home-question container" id="question-section">
      <div>
        <div className="eyebrow">HIỂU HIỆN TẠI ĐỂ TẠO RA TƯƠNG LAI</div>
        <h2>
          Mang điều băn khoăn
          <br />
          ra <em>ánh sáng.</em>
        </h2>
        <p>Một câu hỏi → một góc nhìn → một hành động có thể thử.</p>
      </div>
      <div>
        <QuestionForm onSubmit={start} busy={busy} collapseSuggestions />
        <p className="flow-error" role={error ? "alert" : undefined}>
          {error}
        </p>
      </div>
    </section>
  );
}
export function DailyCard() {
  const [draw, setDraw] = useState<DrawnCard | null>(null);
  const [show, setShow] = useState(false);
  const hasDraw = draw !== null;
  useEffect(() => {
    if (!hasDraw) return;
    let timer: ReturnType<typeof setTimeout>;
    function schedule() {
      clearTimeout(timer);
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      timer = setTimeout(refresh, midnight.getTime() - now.getTime() + 100);
    }
    function refresh() {
      setDraw(getDailyCard());
      schedule();
    }
    function visible() {
      if (!document.hidden) refresh();
    }
    schedule();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [hasDraw]);
  const card = draw ? getCard(draw.id)! : null;
  return (
    <section className="daily-section container">
      <div className="daily-art">
        {card ? (
          <Artwork card={card} />
        ) : (
          <span className="daily-orbit" aria-hidden="true">
            ✧
          </span>
        )}
      </div>
      <div>
        <div className="eyebrow">LÁ TRIẾT HỌC HÔM NAY</div>
        <h2>
          {card ? (
            card.concept
          ) : (
            <>
              Một ngày. <em>Một lăng kính.</em>
            </>
          )}
        </h2>
        <p>
          {card
            ? draw?.orientation === "upright"
              ? card.uprightFramework
              : card.reversedFramework
            : "Không cần một câu hỏi. Chỉ cần một khoảng dừng để nhìn lại điều đang diễn ra."}
        </p>
        {card ? (
          <>
            <span className="orientation-label">
              {draw?.orientation === "upright"
                ? "Lá xuôi · Góc nhìn có thể phát huy"
                : "Lá ngược · Điểm mù cần kiểm tra"}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
              <button className="button button-outline" onClick={() => setDraw(getRandomCard())}>
                ✦ Rút lá ngẫu nhiên khác
              </button>
              <button className="button button-outline" onClick={() => setShow(true)}>
                Xem kiến thức lá bài ↗
              </button>
              <Link className="button button-primary" href="/daily">
                Trang rút lá đầy đủ ↗
              </Link>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
            <button className="button button-primary" onClick={() => setDraw(getDailyCard())}>
              ✧ Mở lá hôm nay
            </button>
            <button className="button button-outline" onClick={() => setDraw(getRandomCard())}>
              ✦ Rút ngẫu nhiên một lá
            </button>
            <Link className="button button-outline" href="/daily">
              Chiêm nghiệm đầy đủ ↗
            </Link>
          </div>
        )}
        <small className="fine-print">
          Mỗi lá bài mang một lăng kính thực hành cho công việc và đời sống.
        </small>
      </div>
      <Knowledge card={show ? card : null} onClose={() => setShow(false)} />
    </section>
  );
}
