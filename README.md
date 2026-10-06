# Tarot Biện Chứng

Website suy ngẫm và học Triết học Mác – Lênin. Stack: Next.js App Router, React, TypeScript, Tailwind 3, Motion, Base UI, React Hook Form/Zod, Sonner và Lenis.

## Chạy dự án

```powershell
npm.cmd install
npm.cmd run dev
```

Mở http://127.0.0.1:3000. Dự án dùng Webpack để tương thích cấu hình PostCSS/Tailwind hiện tại.

## Chức năng

- Trang chủ giữ art direction từ file ZIP, có form 500 ký tự, gợi ý câu hỏi, lá mỗi ngày và nhắc kiểm nghiệm lần trước.
- `/reading`: người dùng chọn trước 1 hoặc 3 lá; lựa chọn này khóa số lá cho cả AI và fallback. Với 3 lá, hệ thống chọn cấu trúc Hai lựa chọn, Mâu thuẫn hoặc Vòng nhận thức theo câu hỏi. Carousel 22 lá úp hỗ trợ kéo ngang, mũi tên và bàn phím; lá bay vào vị trí và flip 3D. Xuôi = góc nhìn phát huy; ngược = điểm mù.
- Câu hỏi thiếu dữ kiện nghiêm trọng được hỏi lại bằng một câu ngắn trước khi rút bài. Kết quả có bốn phần: điều cần nhìn rõ, một mạch soi vào vấn đề, tối đa 3 điều cần kiểm tra và đúng 3 hành động. Ghi chú relevance/phạm vi chỉ tồn tại trong backend. Phong cách Dễ hiểu / Phản biện / Học thuật được chọn cùng câu hỏi và áp dụng ngay cho lần diễn giải đầu. Tối đa 5 câu hỏi tiếp trong cùng lần trải; lịch sử cũ có 8 câu vẫn đọc được.
- Lần trải đang mở được giữ trong sessionStorage: bộ bài, vị trí đã rút, chiều lá, kết quả và câu hỏi tiếp. Refresh/quay lại không rút lại lá. Nếu storage bị chặn, luồng vẫn chạy trong bộ nhớ khi chuyển trang; tải lại sẽ mất phiên chưa lưu.
- `/library`: 22 artwork SVG khác nhau, tìm có/không dấu và lọc 4 nhóm, panel kiến thức có focus trap/Escape.
- `/history`: localStorage có phiên bản/schema, tối đa 30 lần, chọn hành động và ghi nhận Có cải thiện / Chưa thay đổi / Mình chưa thử. Chỉ lưu khi người dùng chọn lưu hoặc hành động.
- Ảnh PNG 1080×1350 có bản xem trước và nút tải, gồm artwork lá đầu, tên và thông điệp cố định; không đưa câu hỏi riêng tư lên ảnh. Dùng URL ảnh tự chứa để tải được trong trình duyệt nhúng; Web Share API chia sẻ file khi trình duyệt hỗ trợ. Sao chép cũng chỉ dùng thông điệp cố định của lá.
- `/about`: vai trò của Tarot, triết học, AI, dữ liệu và giới hạn.
- Responsive, chế độ sáng/tối và hỗ trợ reduced motion.

## Bật AI: Groq + Gemini

Sao chép `.env.example` thành `.env.local`, đặt hai key phía server:

```dotenv
AI_ENABLED=true
GROQ_API_KEY=your_groq_server_key
GROQ_MODEL=openai/gpt-oss-120b
GEMINI_API_KEY=your_gemini_server_key
GEMINI_MODEL=gemini-3.5-flash-lite
AI_ROUTING_MODE=balanced
DEMO_MODE=false
AI_DEBUG=false
```

Khởi động lại dev server sau khi đổi cấu hình. Key chỉ được đọc trong module `server-only`, được `.gitignore` loại trừ; không đặt biến key có tiền tố `NEXT_PUBLIC_`. Hai provider dùng HTTPS endpoint cố định, không dùng URL hoặc model từ user input.

### Routing và quota

**Cache → provider của phiên → provider còn lại khi lỗi → local cuối cùng.** Router nằm tại `src/lib/ai/router.ts`. Prompt/schema chung nằm trong `src/lib/ai/prompts.ts`, `schemas.ts`; `server-ai.ts` giữ engine ngữ cảnh và kiểm tra triết học hiện có.

- `balanced`: các phiên mới cần gọi AI luân phiên Groq → Gemini. `readingSessionId` đi từ form, phân tích, chọn lá, luận giải đến hỏi tiếp và lịch sử. Trong cùng phiên, ưu tiên provider đã dùng thành công; chuyển provider khi lỗi và giữ provider mới cho các thao tác sau.
- `groq_primary` / `gemini_primary`: ưu tiên provider tương ứng, vẫn có failover.
- 429/quota đưa provider vào cooldown, tôn trọng `Retry-After`/Gemini retryDelay; mặc định 90 giây, quota ngày rõ ràng nghỉ lâu hơn. Trong cooldown không gọi provider đó. Hết thời hạn chỉ cho một probe đồng thời; thành công trả về rotation, thất bại nghỉ tiếp. Một success cũ không thể xóa cooldown do request mới tạo.
- 401/403, key hoặc model không hợp lệ: `DISABLED_CONFIGURATION_ERROR`, dùng provider kia. Sửa env hoặc khởi động lại server để kích hoạt lại cấu hình.
- 5xx/network/timeout chuyển ngay sang provider kia, cooldown ngắn 20 giây. JSON/schema/grounding sai được sửa tối đa một lần trên mỗi provider bằng context và lý do ngắn; không gửi phản hồi sai. Mỗi thao tác thử tối đa **hai provider**, không lặp vòng.
- Ngân sách một thao tác tối đa 26 giây, mỗi provider tối đa 13 giây (kể cả correction), nằm trong timeout 30 giây phía client. `DEMO_MODE=true` buộc balanced, giảm còn 16 giây tổng / 8 giây mỗi provider; cache, dedup và local vẫn hoạt động.

Groq dùng [Chat Completions và Structured Outputs](https://console.groq.com/docs/structured-outputs), mặc định GPT OSS 120B với strict JSON schema và suy luận thấp. Model Groq khác dùng JSON mode nếu không có strict support, vẫn kiểm tra bằng Zod. Gemini dùng [Generate Content REST](https://ai.google.dev/api/generate-content) và `responseFormat.text` (JSON MIME enum + JSON schema). Cả hai dùng cùng schema/philosophy grounding; không dùng search, tools hoặc gửi cả bộ 22 lá.

### Số lượt gọi và kết quả

| Thao tác                                                                     | Lượt gọi AI bình thường |
| ---------------------------------------------------------------------------- | ----------------------- |
| Gửi câu hỏi ban đầu: nhận diện vấn đề, safety, ngữ cảnh và spread            | 1                       |
| Luận giải toàn bộ 1 hoặc 3 lá, đúng giọng đã chọn                            | 1                       |
| Gửi một câu hỏi tiếp có nghĩa                                                | 1                       |
| Typing, hover, shuffle/flip, thư viện, kiến thức, history, share, lá hôm nay | 0                       |
| Cache hit hoặc câu vô nghĩa rõ ràng như aaaaaaaaaaaaaaaa                     | 0                       |

Một reading bình thường dùng **hai request** trên cùng provider, không gọi riêng từng lá hoặc sinh cả ba giọng. Failover/correction có thể tăng số request khi provider lỗi. Không gọi AI từ render/effect; chỉ submit có chủ đích. Hỏi tiếp phải có luận giải hiện tại và tối đa hai lượt gần nhất, không gửi toàn bộ history. Câu vô nghĩa được kiểm tra local ở client và server.

Schema analysis gồm `inputQuality`, `contextConfidence`, safety, topic/coreProblem/goal, tensions, importantFactors, spreadType và options. `UNCLEAR` dừng trước bước rút bài và trả một câu hỏi làm rõ. Schema reading giữ `cardReadings`, message, insight, checks, ba actions và followUpSuggestion. Backend đối chiếu đúng ID/thứ tự/vị trí/chiều, trích đoạn câu hỏi có thật, giới hạn khái niệm, mối liên hệ giữa các vị trí và độ dài. `scopeStatus`, `scopeNotice`, relevance và ngôn ngữ validation không được đưa vào phần hiển thị; khi liên hệ yếu, kết quả chỉ dùng `methodologicalMeaning` hoặc phần chắc chắn nhất của lá. `insight` vẫn ánh xạ thành `reflection`, `description` thành `detail` để tương thích bản ghi cũ.

### Cache, phiên và vận hành

Cache client: bộ nhớ/sessionStorage, schema/phiên bản, tối đa 24 mục/180 KB. Cache server: kết quả AI hợp lệ tối đa 30 phút, 256 mục/2 MB; không cache local hoặc blocked. Fingerprint có dataset/version, task, câu hỏi, spread, **thứ tự** ID và chiều lá, giọng, context/action plan liên quan; hỏi tiếp thêm câu tiếp, nội dung luận giải và hai lượt gần nhất. Metadata phiên/debug không tham gia fingerprint. Provider không nhận fingerprint hoặc session ID.

Request giống nhau đang chạy được gộp ở client và server. Mỗi subscriber có thể hủy riêng; hủy hết sẽ abort transport, không chuyển provider hoặc đánh dấu provider lỗi vì user cancel. Nút/khóa thao tác chặn double click.

Provider health, con trỏ rotation, session (24 giờ/tối đa 512), cache và dedup lưu trong runtime chung của **một tiến trình Node**; HMR giữ được state. Khởi động lại sẽ xóa state runtime. Triển khai nhiều instance cần đưa health/session/rotation/cache sang store dùng chung (ví dụ Redis), kèm quota/rate limiter ở gateway. API hiện giới hạn 60 request/phút và bốn provider call đồng thời trong mỗi tiến trình.

Khi cả hai provider không dùng được, UI vẫn có luận giải local ngắn từ dữ liệu lá đã chọn, ghi rõ là góc nhìn nền. `AI_ENABLED=false` hoàn tất toàn bộ luồng với zero request ngoài. Phiên/lịch sử cũ được gán session ID khi khôi phục; giữ đúng deck/lựa chọn/chiều và giọng.

`POST /api/analyze`: `{ question, readingSessionId? }`.
`POST /api/reading`: `{ readingSessionId?, question, questionSummary?, questionContext?, spread, style, cards: [{id, orientation}], followUp?, actionPlan?, currentReading?, recentFollowUps? }`.
Response giữ schema cũ, thêm `readingSessionId` và metadata debug khi được bật. Các endpoint kiểm tra JSON (32 KB), card count/uniqueness/orientation và same-origin. Không log câu hỏi, provider body hoặc key.

## Kiến thức và artwork

`src/data/cards.ts` chứa đúng bộ 22 lá theo brief mới, số nguyên 1–22 (hiển thị 01–22) và schema thống nhất: `concept`, `definition`, `analysisFocus`, `uprightFramework`, `reversedFramework`, `checkQuestions`, `methodologicalMeaning`, `commonMistake`, `realLifeExample`, `relatedCourseTopic`, `avoidForContexts`. The Particular được đổi thành **The Individual** tại vị trí 08; ID cũ được chuẩn hóa khi đọc input/lịch sử/phiên, giữ thứ tự chọn và chiều lá. Fingerprint có phiên bản dataset để kết quả cache cũ không được dùng cho yêu cầu mới.

Audit không tìm thấy slide, giáo trình hay syllabus MLN111 trong những nguồn dự án đã cung cấp. Toàn bộ nội dung học thuật hiện mang `academicSourceStatus: "UNSUPPORTED BY PROVIDED COURSE MATERIAL"`; các quy chiếu chương suy ra từ nhóm đã được bỏ. Định nghĩa và các đoạn học thuật cũ được giữ nguyên để đối chiếu, chưa được xác nhận là tài liệu ôn tập chính thức. `analysisFocus` chỉ tóm lược góc phân tích từ dữ liệu/brief hiện có. Sáu lá xã hội có giới hạn ngữ cảnh được kiểm tra nội bộ; prompt và fallback chỉ diễn đạt phần liên quan chắc chắn nhất, không hiện cảnh báo phạm vi trong UI. Chi tiết từng lá, các điểm cần sửa thủ công, artwork và kiểm thử nằm trong [DATASET_AUDIT.md](DATASET_AUDIT.md).

`src/components/artwork.tsx` kế thừa 3 motif mâu thuẫn/network/xoắn ốc từ thiết kế đã cung cấp và mở rộng thành 22 biểu tượng riêng. Có thể thay artwork sau khi nhóm chốt SVG trong Figma.

## Kiểm tra

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Không có tài khoản, cloud database cá nhân, thanh toán hoặc social. Xóa dữ liệu trình duyệt sẽ xóa lịch sử. Lá mỗi ngày ổn định theo ngày địa phương của thiết bị. Khi bật AI, câu hỏi được gửi tới Groq hoặc Google theo routing; không ghi nội dung câu hỏi/API key vào log của ứng dụng.
