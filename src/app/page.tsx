"use client";
import { useState } from "react";
import Image from "next/image";
import {
  getCard,
  formatCardNumber,
  type TarotCard as CardData,
} from "@/data/cards";
import { Artwork, CardFace } from "@/components/artwork";
import { Knowledge } from "@/components/knowledge";
import {
  DailyCard,
  HomeQuestion,
  ReturningAction,
} from "@/components/home-features";
const previewCards = [
  getCard("the-conflict")!,
  getCard("the-connection")!,
  getCard("the-spiral")!,
];
const principles = previewCards.map((c) => ({
  ...c,
  name: c.concept,
  english: c.name.toUpperCase(),
  category: c.group,
  text: c.uprightFramework,
}));
function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
function SymbolArt({ type = 0 }: { type?: number }) {
  return <Artwork card={previewCards[type]} />;
}
function TarotCard({
  type,
  className = "",
  onClick,
}: {
  type: number;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      className={`tarot-card ${className}`}
      onClick={onClick}
      aria-label={`Xem kiến thức ${previewCards[type].concept}`}
    >
      <CardFace card={previewCards[type]} />
    </button>
  );
}
export default function Home() {
  const [knowledge, setKnowledge] = useState<CardData | null>(null);
  function openDraw() {
    document.getElementById("question-section")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    document.getElementById("question")?.focus({ preventScroll: true });
  }
  return (
    <>
      <main>
        <section className="hero container" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-line" /> TRIẾT HỌC, QUA MỘT GÓC NHÌN KHÁC
            </div>
            <h1>
              Một câu hỏi.
              <br />
              Những <em>góc nhìn</em>
              <br />
              mới.
            </h1>
            <p className="hero-description">
              Không dự đoán tương lai. Không định đoạt số phận.
              <br /> Một lá bài, một góc nhìn triết học — để thấu hiểu
              <br className="desktop-break" /> vấn đề và tìm hướng hành động của
              riêng bạn.
            </p>
            <div className="hero-buttons">
              <button className="button primary" onClick={openDraw}>
                Đặt câu hỏi. Rút một lá bài. <Arrow />
              </button>
              <a className="text-link" href="#how-it-works">
                Khám phá cách hoạt động <span>↗</span>
              </a>
            </div>
            <div className="hero-footnote">
              <span className="small-orbit">◉</span> Lấy cảm hứng từ triết học
              Mác – Lênin <span className="footnote-divider" /> MLN111
            </div>
          </div>
          <div className="hero-art">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="art-coordinate coordinate-top">
              GÓC NHÌN 01 / 22
            </span>
            <TarotCard
              type={1}
              className="back-card left-card"
              onClick={() => {
                setKnowledge(previewCards[1]);
              }}
            />
            <TarotCard
              type={2}
              className="back-card right-card"
              onClick={() => {
                setKnowledge(previewCards[2]);
              }}
            />
            <TarotCard
              type={0}
              className="front-card"
              onClick={() => {
                setKnowledge(previewCards[0]);
              }}
            />
            <div className="art-caption">
              <span className="caption-line" /> ĐỐI LẬP. THỐNG NHẤT. CHUYỂN HÓA.
            </div>
            <span className="art-coordinate coordinate-bottom">
              MỖI LÁ BÀI LÀ MỘT LĂNG KÍNH
            </span>
          </div>
        </section>
        <ReturningAction />
        <HomeQuestion />
        <DailyCard />
        <section className="manifesto container" id="about">
          <div className="manifesto-label">
            <span className="outlined-star">✧</span>
            <span>
              KHÔNG PHẢI LỜI TIÊN TRI.
              <br />
              LÀ MỘT LỜI GỢI MỞ.
            </span>
          </div>
          <blockquote>
            “Lá bài không quyết định tương lai.
            <br />
            Nó mở ra một góc nhìn để <em>hiểu và hành động.</em>”
          </blockquote>
          <span className="manifesto-index">01 — 03</span>
        </section>
        <section className="process container" id="how-it-works">
          <div className="section-heading">
            <div>
              <div className="eyebrow">TỪ SUY NGẪM ĐẾN THỰC TIỄN</div>
              <h2>
                Một khoảng dừng. <em>Một bước tiến.</em>
              </h2>
            </div>
            <p>
              Không cần biết Tarot. Không cần giỏi triết học.
              <br />
              Chỉ cần một câu hỏi thật sự của bạn.
            </p>
          </div>
          <div className="process-grid">
            {[
              {
                title: "Đặt một câu hỏi",
                text: "Điều gì đang khiến bạn băn khoăn? Học tập, công việc, hay một ngã rẽ trong cuộc sống.",
                symbol: "01",
              },
              {
                title: "Mở một góc nhìn",
                text: "Rút một lá bài. Khám phá vấn đề qua một nguyên lý hoặc quy luật triết học.",
                symbol: "02",
              },
              {
                title: "Chọn cách hành động",
                text: "Liên hệ với thực tế của bạn. Bắt đầu từ một hành động nhỏ, nhưng có ý nghĩa.",
                symbol: "03",
              },
            ].map((step, index) => (
              <div className="process-step" key={step.symbol}>
                <div className="step-top">
                  <span>{step.symbol}</span>
                  <div
                    className={`step-symbol step-symbol-${index}`}
                    aria-hidden="true"
                  >
                    {index === 0 ? "?" : index === 1 ? "◎" : "↗"}
                  </div>
                  {index < 2 && <span className="step-arrow">⟶</span>}
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="library-section" id="library">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  22 LÁ BÀI. 22 LĂNG KÍNH TRIẾT HỌC.
                </div>
                <h2>
                  Điều gì nằm sau <em>một lá bài?</em>
                </h2>
              </div>
              <a href="/library" className="text-link">
                Khám phá cả 22 lá <Arrow />
              </a>
            </div>
            <div className="library-grid">
              {principles.map((card, index) => (
                <button
                  className="library-item"
                  key={card.number}
                  onClick={() => {
                    setKnowledge(previewCards[index]);
                  }}
                >
                  <div className={`library-art library-art-${index}`}>
                    <span className="library-number">
                      {formatCardNumber(card.number)} / 22
                    </span>
                    <SymbolArt type={index} />
                    <span className="library-art-label">{card.english}</span>
                  </div>
                  <div className="library-meta">
                    <span>{card.category}</span>
                    <Arrow />
                  </div>
                  <h3>{card.name}</h3>
                  <p>{card.text}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="philosophy container" id="philosophy">
          <span className="eyebrow">TRIẾT HỌC KHÔNG Ở ĐÂU XA</span>
          <h2>
            Từ những trang sách,
            <br />
            đến <em>cuộc sống của bạn.</em>
          </h2>
          <p>
            Triết học Mác – Lênin không chỉ là những khái niệm trong giáo trình.
            Đó còn là cách nhìn nhận sự vận động, những mối liên hệ và khả năng
            thay đổi trong đời sống mỗi ngày.
          </p>
          <button className="button primary" onClick={openDraw}>
            Tìm góc nhìn của bạn <Arrow />
          </button>
          <div className="principle-tags">
            {[
              "Vật chất & ý thức",
              "Lượng & chất",
              "Nguyên nhân & kết quả",
              "Bản chất & hiện tượng",
              "Thực tiễn & chân lý",
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>
        <section
          className="thinkers container"
          aria-labelledby="thinkers-title"
        >
          <div className="section-heading">
            <div>
              <div className="eyebrow">NHỮNG CON NGƯỜI. NHỮNG TƯ TƯỞNG.</div>
              <h2 id="thinkers-title">
                Đằng sau một <em>hệ tư tưởng.</em>
              </h2>
            </div>
            <p>
              Gặp gỡ những nhà tư tưởng đặt nền móng
              <br />
              cho triết học Mác – Lênin.
            </p>
          </div>
          <div className="thinkers-grid">
            {[
              {
                name: "Karl Marx",
                vietnamese: "C. Mác",
                years: "1818 — 1883",
                image: "karl-marx.jpg",
                file: "Karl_Marx_001.jpg",
                text: "Cùng Engels xây dựng chủ nghĩa duy vật biện chứng và chủ nghĩa duy vật lịch sử, gắn việc nhận thức thế giới với thực tiễn cải tạo thế giới.",
              },
              {
                name: "Friedrich Engels",
                vietnamese: "Ph. Ăngghen",
                years: "1820 — 1895",
                image: "friedrich-engels.jpg",
                file: "Friedrich_Engels_portrait_(cropped).jpg",
                text: "Cùng Marx đặt nền móng cho triết học Mác; nghiên cứu sự vận động, mối liên hệ và các quy luật biện chứng trong tự nhiên và xã hội.",
              },
              {
                name: "Vladimir I. Lenin",
                vietnamese: "V. I. Lênin",
                years: "1870 — 1924",
                image: "lenin.jpg",
                file: "Lenin_in_1920.jpg",
                text: "Bảo vệ và phát triển triết học Mác trong điều kiện lịch sử mới, làm rõ vai trò của thực tiễn, nhận thức và tính khách quan của vật chất.",
              },
            ].map((person, index) => (
              <article className="thinker" key={person.name}>
                <div className="thinker-portrait">
                  <Image
                    src={`/images/${person.image}`}
                    alt={`Chân dung ${person.name} (${person.vietnamese})`}
                    loading="lazy"
                    width="600"
                    height="800"
                  />
                  <span className="thinker-index">0{index + 1}</span>
                  <span className="thinker-years">{person.years}</span>
                </div>
                <div className="thinker-name">
                  <h3>{person.name}</h3>
                  <span>{person.vietnamese}</span>
                </div>
                <p>{person.text}</p>
                <a
                  className="portrait-source"
                  href={`https://commons.wikimedia.org/wiki/File:${person.file}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Nguồn ảnh: Wikimedia Commons ↗
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Knowledge card={knowledge} onClose={() => setKnowledge(null)} />
    </>
  );
}
