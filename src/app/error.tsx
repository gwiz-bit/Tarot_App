"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container reading-page">
      <h1>
        Chưa mở được
        <br />
        <em>góc nhìn này.</em>
      </h1>
      <p className="page-intro">
        Có lỗi khi tải nội dung. Hãy thử lại để tiếp tục.
      </p>
      <button className="button primary" onClick={reset}>
        Thử lại
      </button>
    </main>
  );
}
