# Báo cáo audit chức năng — Tarot Biện Chứng

Ngày kiểm tra: 04/10/2026. Giữ giao diện, bộ 22 lá và nguyên tắc sản phẩm hiện tại.

## 1. Các phần đã đúng

- Form câu hỏi tự do, giới hạn 500 ký tự, gợi ý có thể sửa và validation.
- Bốn cấu trúc trải được kiểm tra bằng schema; bộ 22 lá có ID duy nhất và artwork SVG.
- Rút 1/3 lá duy nhất, flip, chiều xuôi/ngược và vị trí được truyền đến phần diễn giải.
- Kiến thức cố định đọc từ dữ liệu dự án; 22 hộp kiến thức, tìm kiếm/lọc thư viện và About.
- Ba phần kết quả, ba hành động, lưu lịch sử và vòng kiểm nghiệm đã có đường xử lý thực.
- API key chỉ ở server, phản hồi AI được kiểm tra; không có yêu cầu đăng nhập.

## 2. Các phần đã sửa

- Khôi phục chính xác bộ bài, lá/vị trí/chiều, kết quả và hỏi tiếp khi refresh hoặc quay lại.
- Khi storage bị chặn, câu hỏi từ home vẫn chuyển được sang trải bài trong bộ nhớ.
- Hỏi tiếp gửi nội dung lần trải đang xem và tối đa hai câu hỏi/thông điệp gần nhất.
- Đổi giọng dùng bản diễn giải gốc và giữ kế hoạch hành động; giọng học thuật lấy định nghĩa từ dữ liệu cố định.
- Kết quả dự phòng ba lá giải thích quan hệ giữa các vị trí.
- Điều chỉnh phân loại và rào chắn: tránh chặn “đầu tư thời gian”, “bắt đầu từ đâu”, “từ từ”; bổ sung các tình huống nhạy cảm/rủi ro.
- Lá hôm nay cập nhật khi qua nửa đêm và khi quay lại tab.
- Phản hồi kiểm nghiệm được đồng bộ với phiên hiện tại, gồm dữ liệu cũ; không bị mất khi đổi giọng.
- Tải PNG thật, sao chép thông điệp ngắn và hỗ trợ chia sẻ file trên nền tảng phù hợp.
- Khóa yêu cầu, hủy khi rời trang, xử lý JSON/response lỗi bằng thông báo rõ ràng; nút lưu bị khóa khi đang tạo nội dung.
- Đổi theme vẫn hoạt động khi storage bị chặn. Nút theme mobile nằm trong menu để không che nút kết quả; Escape và focus khi bắt đầu câu hỏi mới hoạt động.

## 3. Giới hạn còn lại

- Chưa cấu hình Gemini bằng key thật: API đã kiểm tra bằng mock, giao diện kiểm tra ở chế độ **gợi ý theo quy tắc**. Cấu trúc gọi tham chiếu [Generate Content API chính thức](https://ai.google.dev/api/generate-content).
- Nội dung học thuật là bản biên soạn của dự án, cần đối chiếu với giáo trình/slide và giảng viên trước khi xác nhận như tài liệu ôn tập.
- Web Share đã có code, kiểm tra capability và test mock; chưa gửi ảnh tới ứng dụng khác. Tải PNG vào Downloads và sao chép đã được thực hiện.
- Bộ lọc từ khóa có giới hạn ngữ nghĩa. Nếu browser chặn storage, tải lại sẽ mất phiên trong bộ nhớ; website vẫn sử dụng được.

## 4. File quan trọng thay đổi

| Phần | File |
|---|---|
| Phiên và lịch sử | `src/lib/reading-session.ts`, `src/lib/storage.ts` |
| Phân loại, diễn giải, rào chắn | `src/lib/domain.ts`, `src/lib/server-ai.ts` |
| API và lỗi mạng | `src/lib/client-api.ts`, `src/lib/http.ts` |
| Luồng và kết quả | `src/components/reading-flow.tsx`, `src/components/reading-result.tsx`, `src/components/history.tsx` |
| Home/lá hằng ngày | `src/components/home-features.tsx`, `src/components/question-form.tsx` |
| Chia sẻ | `src/lib/share.ts`, `src/components/share-dialog.tsx` |
| Mobile/theme và thông tin | `src/components/site-shell.tsx`, `src/app/globals.css`, `src/app/about/page.tsx` |
| Hướng dẫn và QA | `README.md`, `tests/*.test.ts`, `.qa/functional-audit.md` |

## 5. Kết quả kiểm tra

| Kiểm tra | Kết quả |
|---|---|
| Typecheck | PASS — exit 0 |
| Lint | PASS — exit 0, không warning |
| Unit/integration | PASS — 31/31 |
| Production build | PASS — exit 0, đủ trang và hai API |
| Browser | Luồng 1/3 lá; cả bốn cách trải; đủ 22 hộp kiến thức; hỏi tiếp; đổi giọng; lịch sử; lá hôm nay; tải PNG; rào chắn; menu/focus; không login |

Storage hỏng/bị chặn, giới hạn lịch sử, đổi ngày, dữ liệu cũ và lỗi Gemini được kiểm tra bằng test cô lập. Console không ghi lỗi/warning ứng dụng trong các luồng đã chạy. Kiểm tra responsive ở 390, 1000 và 1440 px; không dùng điện thoại thật. Reduced motion được kiểm tra trong cấu hình/code, không thay đổi cài đặt hệ điều hành.

Ảnh xác minh: [.qa/audit-result-desktop.jpg](.qa/audit-result-desktop.jpg), [.qa/audit-result-mobile.jpg](.qa/audit-result-mobile.jpg), [.qa/share-export.png](.qa/share-export.png).

## 6. Checklist bấm kiểm tra thủ công

1. Mở [trang chủ](http://127.0.0.1:3000/). Nhấn **Bắt đầu trải bài** khi để trống: thấy thông báo tối thiểu 5 ký tự. Chọn một chip gợi ý rồi sửa nội dung.
2. Nhập: **“Trong học kỳ này mình muốn dành mỗi tối 20 phút để ôn triết, làm sao duy trì và kiểm tra việc học có tiến bộ?”** → **Bắt đầu trải bài**. Mong đợi **Vòng nhận thức**, ba vị trí Nhận thức/Thực tiễn/Kiểm nghiệm và câu hỏi được giữ nguyên.
3. Rút một lá (có thể dùng Tab/Enter), refresh: giữ lá và chiều. Rút đủ ba lá khác nhau, đợi flip/kết quả. Thấy **Thông điệp → Soi vào vấn đề → đúng ba hành động** và quan hệ giữa vị trí.
4. Nhấn **Xem kiến thức của lá này**, kiểm tra lý thuyết/ví dụ/phương pháp luận/điểm mù; đóng bằng Escape. Đổi **Dễ hiểu → Phản biện → Học thuật**: diễn đạt đổi, lá/kiến thức/hành động giữ nguyên.
5. Nhập **“Mình nên bắt đầu từ đâu để giữ được nhịp học mỗi tối?”** → **Hỏi tiếp**. Câu trả lời nhắc nội dung lần trải và hành động hiện tại. Nhấn **Lưu lần trải** hoặc chọn một hành động.
6. Nhấn **Tải ảnh chia sẻ → Tải ảnh PNG**, mở file trong Downloads: có artwork/tên/thông điệp ngắn/branding, không có câu hỏi. Nhấn **Sao chép** và kiểm tra text; thử **Chia sẻ ảnh** nếu browser hỗ trợ.
7. Refresh, đi **Thư viện**, quay về **Trải bài**: kết quả không đổi. Vào **Lịch sử → Xem lại kết quả**. Về **Trang chủ**, trả lời **Có cải thiện/Chưa thay đổi/Mình chưa thử**; quay lại kết quả, đổi giọng, kiểm tra phản hồi vẫn được giữ trong lịch sử.
8. Trong **Thư viện**, kiểm tra đủ 22 lá, tìm **mau thuan**, lọc một nhóm, mở vài lá đầu/cuối và thử tìm từ không tồn tại rồi **Xóa bộ lọc**.
9. Trang chủ → **Mở lá hôm nay**, xem khái niệm/thông điệp, refresh và mở lại: cùng lá trong ngày.
10. **Bắt đầu một câu hỏi mới**. Nhập **“Mình đang thấy chông chênh trước một học kỳ mới.”**: một lá. Nhập **“Mình nên chọn dự án A hay dự án B?”**: Lựa chọn A/B/Điều kiện. Nhập **“Nhóm mình bất đồng giữa tốc độ và chất lượng khi làm bài.”**: Mặt A/B/Điều kiện chuyển hóa.
11. Nhập **“Tôi nên uống thuốc gì để điều trị triệu chứng này?”**: thấy giới hạn y tế, không mở bộ bài. Nhập **“Mình nên đầu tư thời gian học thế nào?”**: vẫn trải được.
12. Trên màn hình nhỏ, thử rút lá và mở/đóng menu bằng Escape. Đổi sáng/tối trong menu. Mở **Về dự án** và xác nhận toàn bộ luồng không có yêu cầu đăng nhập.

Một lần trải với câu hỏi học 20 phút được giữ trong lịch sử để đối chiếu audit; dữ liệu có sẵn trước đó được giữ lại.
