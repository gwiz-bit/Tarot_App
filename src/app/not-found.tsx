import Link from "next/link";
export default function NotFound() {
  return (
    <main className="container reading-page">
      <div className="eyebrow">404</div>
      <h1>
        Góc nhìn này
        <br />
        <em>chưa tồn tại.</em>
      </h1>
      <Link href="/" className="button primary">
        Về trang chủ ↗
      </Link>
    </main>
  );
}
