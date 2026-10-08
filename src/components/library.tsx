"use client";
import { useDeferredValue, useState } from "react";
import { Search } from "lucide-react";
import {
  cards,
  cardGroups,
  formatCardNumber,
  type TarotCard,
} from "@/data/cards";
import { normalize } from "@/lib/domain";
import { Artwork } from "./artwork";
import { Knowledge } from "./knowledge";
export function Library() {
  const [query, setQuery] = useState(""),
    [group, setGroup] = useState("Tất cả"),
    [card, setCard] = useState<TarotCard | null>(null);
  const search = normalize(useDeferredValue(query));
  const visible = cards.filter(
    (c) =>
      (group === "Tất cả" || c.group === group) &&
      normalize([c.name, c.concept, ...c.keywords].join(" ")).includes(search),
  );
  return (
    <main className="container library-page">
      <div className="eyebrow">22 lá bài · 44 hướng suy ngẫm</div>
      <h1>
        Mỗi lá bài,
        <br />
        <em>một lăng kính.</em>
      </h1>
      <p className="page-intro">
        Khám phá những khái niệm Triết học Mác – Lênin qua biểu tượng, ví dụ và
        câu hỏi tự suy ngẫm.
      </p>
      <div className="library-tools">
        <label className="library-search">
          <Search size={18} />
          <span className="sr-only">Tìm lá bài</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tên lá, khái niệm hoặc từ khóa…"
          />
        </label>
        <div className="group-filters" role="group" aria-label="Nhóm kiến thức">
          {["Tất cả", ...cardGroups].map((g) => (
            <button
              key={g}
              aria-pressed={g === group}
              onClick={() => setGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <p className="source-note" aria-live="polite">
        {visible.length} / 22 lá · Chọn một lá để xem kiến thức
      </p>
      {visible.length ? (
        <div className="full-library-grid">
          {visible.map((c) => (
            <button
              className="library-item"
              key={c.id}
              onClick={() => setCard(c)}
            >
              <div className="library-art">
                <span className="library-number">
                  {formatCardNumber(c.number)} / 22
                </span>
                <Artwork card={c} />
                <span className="library-art-label">
                  {c.name.toUpperCase()}
                </span>
              </div>
              <div className="library-meta">
                <span>{c.group}</span>
                <span aria-hidden="true">↗</span>
              </div>
              <h2>{c.concept}</h2>
              <p>{c.keywords.join(" · ")}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>
            Chưa tìm thấy <em>góc nhìn này.</em>
          </h2>
          <p>Thử một từ khóa ngắn hơn hoặc xem tất cả nhóm kiến thức.</p>
          <button
            className="button"
            onClick={() => {
              setQuery("");
              setGroup("Tất cả");
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
      <Knowledge card={card} onClose={() => setCard(null)} />
    </main>
  );
}
