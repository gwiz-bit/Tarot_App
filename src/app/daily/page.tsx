import type { Metadata } from "next";
import { DailyDrawView } from "@/components/daily-draw";

export const metadata: Metadata = {
  title: "Lá bài trong ngày & Lời khuyên ngẫu nhiên | Tarot Biện Chứng",
  description:
    "Rút 1 lá bài ngẫu nhiên để nhận một góc nhìn soi chiếu, lời khuyên hành động thực tiễn và câu hỏi suy ngẫm trong ngày.",
};

export default function DailyPage() {
  return <DailyDrawView />;
}
