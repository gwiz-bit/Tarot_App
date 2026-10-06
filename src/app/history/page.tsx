import { Suspense } from "react";
import { History } from "@/components/history";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Lịch sử — Tarot Biện Chứng" };
export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <main className="container reading-page">
          <p>Đang mở lịch sử trên thiết bị…</p>
        </main>
      }
    >
      <History />
    </Suspense>
  );
}
