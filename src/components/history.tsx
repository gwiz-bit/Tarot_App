"use client";
import { useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getCard } from "@/data/cards";
import { spreads, type ReadingRecord } from "@/lib/domain";
import { outcomes, readHistory, removeRecord, saveRecord } from "@/lib/storage";
import { Artwork } from "./artwork";
import { ReadingResultView } from "./reading-result";
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
export function History() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const params = useSearchParams();
  const [selected, setSelected] = useState<string | null>(
      params.get("reading"),
    ),
    [override, setOverride] = useState<ReadingRecord | null>(null),
    [deleting, setDeleting] = useState<string | null>(null);
  const records = raw ? readHistory() : [];
  const current =
    override?.id === selected
      ? override
      : records.find((r) => r.id === selected);
  function feedback(record: ReadingRecord, outcome: ReadingRecord["outcome"]) {
    try {
      saveRecord({ ...record, outcome });
      toast.success("Đã ghi nhận kết quả.");
    } catch {
      toast.error("Không thể ghi dữ liệu trên trình duyệt này.");
    }
  }
  function remove(id: string) {
    try {
      removeRecord(id);
      setDeleting(null);
      toast.success("Đã xóa lần trải khỏi thiết bị.");
    } catch {
      toast.error("Chưa xóa được dữ liệu.");
    }
  }
  if (current)
    return (
      <main className="container result-page">
        <button
          className="text-link"
          onClick={() => {
            setSelected(null);
            setOverride(null);
          }}
        >
          <ArrowLeft size={15} /> Trở về lịch sử
        </button>
        <ReadingResultView
          key={current.id}
          record={current}
          onChange={setOverride}
          initiallySaved
        />
      </main>
    );
  return (
    <main className="container history-page">
      <div className="eyebrow">Nhận thức → Hành động → Kiểm nghiệm</div>
      <h1>
        Những góc nhìn
        <br />
        <em>bạn đã giữ lại.</em>
      </h1>
      <p className="page-intro">
        Lịch sử chỉ nằm trên trình duyệt này. Quay lại một hành động để xem thực
        tiễn đã thay đổi điều gì.
      </p>
      {records.length ? (
        <div className="history-list">
          {records.map((record) => (
            <article className="history-entry" key={record.id}>
              <div className="history-art">
                <Artwork card={getCard(record.cards[0].id)!} />
              </div>
              <div className="history-content">
                <span className="eyebrow">
                  {spreads[record.spread].name} ·{" "}
                  {new Date(record.createdAt).toLocaleDateString("vi-VN")}
                </span>
                <button
                  className="history-question"
                  onClick={() => setSelected(record.id)}
                >
                  {record.question}
                </button>
                <p>
                  {record.cards
                    .map(
                      (c) =>
                        `${getCard(c.id)!.concept} (${c.orientation === "upright" ? "xuôi" : "ngược"})`,
                    )
                    .join(" · ")}
                </p>
                {record.selectedAction !== undefined ? (
                  <div className="history-feedback">
                    <strong>
                      Bạn đã chọn:{" "}
                      {record.result.actions[record.selectedAction].title}
                    </strong>
                    <p>Kết quả thế nào?</p>
                    <div className="feedback-options">
                      {Object.entries(outcomes).map(([key, label]) => (
                        <button
                          key={key}
                          className={record.outcome === key ? "selected" : ""}
                          aria-pressed={record.outcome === key}
                          onClick={() =>
                            feedback(record, key as ReadingRecord["outcome"])
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="fine-print">
                    Chưa chọn hành động. Mở lần trải để chọn một việc muốn thử.
                  </p>
                )}
                <div className="history-actions">
                  <button
                    className="text-link"
                    onClick={() => setSelected(record.id)}
                  >
                    Xem lại kết quả ↗
                  </button>
                  {deleting === record.id ? (
                    <>
                      <span className="fine-print">Xóa lần trải này?</span>
                      <button
                        className="text-link"
                        onClick={() => remove(record.id)}
                      >
                        Xóa
                      </button>
                      <button
                        className="text-link"
                        onClick={() => setDeleting(null)}
                      >
                        Giữ lại
                      </button>
                    </>
                  ) : (
                    <button
                      className="text-link"
                      onClick={() => setDeleting(record.id)}
                      aria-label="Xóa lần trải"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="outlined-star" aria-hidden="true">
            ✧
          </span>
          <h2>
            Một hành trình
            <br />
            <em>chưa bắt đầu.</em>
          </h2>
          <p>
            Chọn “Lưu lần trải” hoặc một hành động sau khi xem kết quả để giữ
            lại góc nhìn ở đây.
          </p>
          <Link className="button primary" href="/reading">
            Bắt đầu trải bài ↗
          </Link>
        </div>
      )}
    </main>
  );
}
