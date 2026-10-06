import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Về dự án — Tarot Biện Chứng" };
export default function AboutPage() {
  return (
    <main className="container about-page">
      <div className="eyebrow">MỘT SẢN PHẨM SÁNG TẠO CHO MLN111</div>
      <h1>
        Lá bài gợi mở.
        <br />
        <em>Thực tiễn trả lời.</em>
      </h1>
      <p className="about-lead">
        Không tiên đoán tương lai.
        <br />
        Hiểu hiện tại để tạo ra tương lai.
      </p>
      <div className="about-sections">
        {[
          [
            "01",
            "Vì sao chọn Tarot?",
            "Hình thức rút bài tạo sự tò mò và một khoảng dừng để người dùng tiếp cận khái niệm triết học. Bộ 22 lá dùng biểu tượng trừu tượng, mỗi lá mở ra một cách nhìn vấn đề.",
          ],
          [
            "02",
            "Có phải công cụ bói toán?",
            "Không. Lá bài được chọn ngẫu nhiên, không phải bằng chứng về bạn hay dấu hiệu báo trước tương lai. Xuôi và ngược là hai hướng suy ngẫm: điều có thể phát huy và điểm mù cần kiểm tra.",
          ],
          [
            "03",
            "Triết học đóng vai trò gì?",
            "Triết học Mác – Lênin là nội dung cốt lõi. Các nguyên lý, quy luật và phạm trù giúp đặt vấn đề trong mối liên hệ, điều kiện cụ thể và quá trình vận động. Những liên hệ đời sống là gợi ý để thử, không thay thế lý thuyết.",
          ],
          [
            "04",
            "AI làm gì?",
            "AI hiểu câu hỏi, chọn một trong bốn cấu trúc trải và liên hệ kiến thức có sẵn với tình huống. Phần lý thuyết trong thư viện được giữ cố định. Khi chưa bật AI hoặc dịch vụ lỗi, ứng dụng hiển thị rõ chế độ gợi ý theo quy tắc.",
          ],
          [
            "05",
            "Hành động rồi kiểm nghiệm",
            "Mỗi kết quả kết thúc bằng ba việc có thể thử. Bạn chọn một hành động, quay lại ghi nhận kết quả và điều chỉnh cách hiểu. Câu hỏi tiếp giữ nguyên vấn đề, bộ lá và chiều đã rút.",
          ],
          [
            "06",
            "Dữ liệu được giữ ở đâu?",
            "Ứng dụng không có tài khoản hoặc cơ sở dữ liệu cá nhân trên cloud. Lần trải đang mở được giữ trong tab để quay lại hoặc tải lại. Lịch sử chỉ lưu bằng localStorage khi bạn chọn lưu hoặc chọn hành động, tối đa 30 lần trải. Khi bật AI, câu hỏi được gửi từ máy chủ tới Groq hoặc Gemini; ảnh chia sẻ không chứa câu hỏi riêng tư.",
          ],
          [
            "07",
            "Giới hạn của sản phẩm",
            "Sản phẩm phục vụ học tập và suy ngẫm. Các câu hỏi về chẩn đoán, điều trị, quyết định pháp lý, hướng dẫn đầu tư hay dự đoán chắc chắn được chuyển hướng tới người có chuyên môn hoặc một câu hỏi về hiện tại. Lá bài không quyết định thay bạn.",
          ],
        ].map(([number, title, text]) => (
          <section key={number}>
            <span className="eyebrow">{number}</span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </section>
        ))}
      </div>
      <aside className="knowledge-status">
        <h2>Nguồn kiến thức</h2>
        <p>
          Bộ nội dung hiện là bản biên soạn của dự án theo các chủ đề môn Triết
          học Mác – Lênin. Nhóm cần đối chiếu và chốt nội dung với slide, giáo
          trình và giảng viên của lớp trước khi dùng như tài liệu ôn tập chính
          thức. 22 artwork SVG kế thừa phong cách từ thiết kế bạn cung cấp.
        </p>
      </aside>
      <blockquote className="about-quote">
        “Lá bài không quyết định tương lai của bạn.
        <br />
        Cách bạn hiểu hiện thực và hành động
        <br />
        mới là điều tạo nên sự thay đổi.”
      </blockquote>
      <Link href="/reading" className="button primary">
        Mở một góc nhìn của bạn ↗
      </Link>
    </main>
  );
}
