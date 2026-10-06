# Hướng thiết kế

Nguồn: `Design Tarot Biện Chứng Website.zip` do người dùng cung cấp.

## Màu

Tối: nền #090a0d, panel #101217/#151820, chữ #f1ebdd, nhấn vàng #c6a567. Artwork dùng đỏ trầm #a85f68 và xanh xám #748da6. Sáng dùng nền #f7f8fa và nhấn #4f6175. Lá bài giữ nền tối để artwork nhất quán.

## Chữ

Cormorant Garamond cho tiêu đề và thông điệp; Inter cho form, điều hướng và lý thuyết. `next/font` self-host, có subset tiếng Việt. Tiêu đề lớn, nội dung đọc 13–15px trên màn chức năng.

## Layout và component

Container tối đa 1288px. Trang kết quả đặt lá bên trái, 3 khối diễn giải bên phải; trên điện thoại lá nằm trước nội dung. Library có 4/3/2 cột. Viền mảnh, góc 3–6px; không biến sản phẩm thành dashboard. Kiến thức dài nằm trong Base UI Dialog.

Header là thanh nổi cố định phía trên trên toàn bộ website, bo góc 20px trên desktop và 16px trên điện thoại, nền đặc, viền tương phản thấp và bóng nhẹ theo chế độ sáng/tối. Thanh cao 72px trên desktop, 68px trên tablet và 64px trên điện thoại; khoảng cách với mép màn hình tính safe area. Layout chừa chỗ cho header, anchor có khoảng cuộn tương ứng. Menu điện thoại nổi ngay dưới thanh, dùng cùng độ bo góc với header và cuộn riêng khi màn hình thấp. Dialog phủ trên cả header và menu.

Mục điều hướng đang chọn có nền màu nhấn nhạt, bo góc 10px, chừa 4px phía trên và dưới trong vùng chạm 44px. Nút trải bài trên header bo góc 10px để đồng bộ. Motion shared layout trượt nền giữa các mục trong 240ms, dùng easing chậm dần; hover đổi nền nhẹ, nhấn thu nhỏ chữ. Mục hiện tại theo pathname và `aria-current`, không dùng dấu chấm. Menu điện thoại dùng cùng nền màu nhấn. Tắt chuyển động theo reduced motion.

## Responsive

Kiểm soát bố cục theo nội dung: hero xếp dọc từ 900px, các màn chức năng thu gọn từ 650px, bổ sung kích thước cho điện thoại 320–360px và màn hình ngang thấp. Library giữ 4/3/2 cột; artwork co theo khung. Kết quả nhiều lá xếp ngang trên tablet/desktop, cuộn và snap trong vùng riêng trên điện thoại. Thẻ giữ tỷ lệ khi co để không đẩy tràn cột.

Form dùng chữ 16px; nút chính trên mobile cao 48px, nút biểu tượng và điều hướng có vùng chạm tối thiểu 44px. Container chừa 16px hai bên (14px ở màn hình 320–360px), tính safe area. Home thu gọn gợi ý câu hỏi sau disclosure; tiến trình trải bài dùng ba cột với gạch dưới bước hiện tại. Bộ lọc thư viện cuộn ngang trong vùng riêng. Footer bám sau nội dung bằng layout flex, không dùng chiều cao trang cố định. Không chặn tràn ngang toàn bộ trang để che lỗi layout; chỉ cắt phần orbit trang trí trong hero.

Menu mobile dùng Base UI Popover modal, khóa cuộn nền, giữ focus và trả focus về nút mở khi đóng bằng Escape. Menu đóng khi đổi trang hoặc chuyển sang viewport desktop, cuộn riêng ở màn hình ngang thấp. Dialog giới hạn chiều cao bằng `dvh`, tính safe area, cuộn nội dung độc lập; thanh nhãn và nút đóng ghim trong panel. Nội dung kiến thức dùng chữ 16px trên mobile. Mobile/tablet giữ cuộn native; chỉ bật Lenis smooth wheel khi màn hình từ 901px có chuột và không bật reduced motion.

Carousel mobile chiếm toàn chiều rộng, hai mũi tên 44px nằm dưới bộ bài. Quãng kéo lấy từ chiều rộng CSS đã phân giải để khớp `clamp()`/`vw`. Chỉ kéo ngang đổi lá; kéo dọc nhường cuộn trang và không kích hoạt rút bài, vẫn cho phép pinch zoom. Trên mobile dọc cao từ 700px, lời nhắc vị trí tiếp theo ghim dưới header; hàng lá đã chọn cuộn cùng trang để không che bộ bài. Kết quả nhiều lá cuộn ngang với snap nhẹ; có liên kết đi thẳng tới phần liên hệ chung. Thanh lưu/chia sẻ xếp hai cột, nút sao chép và nút hỏi tiếp chiếm toàn hàng.

Chọn phong cách Dễ hiểu / Phản biện / Học thuật ngay dưới ô câu hỏi, dùng nhóm radio ba cột và một dòng giải thích cho lựa chọn hiện tại. Dễ hiểu là mặc định. Lựa chọn đi theo phiên từ trang chủ hoặc trang trải bài, được giữ khi tải lại và áp dụng ngay lần diễn giải đầu cùng các câu hỏi tiếp theo. Chọn radio không gọi API. Trang kết quả chỉ hiển thị phong cách đã chọn, không có nút đổi phong cách để phát sinh yêu cầu diễn giải bổ sung.

Kết quả đọc theo bốn phần: Điều cần nhìn rõ → Soi vào vấn đề → Điều cần kiểm tra → Ba bước có thể thử. Tiêu đề phần dùng Inter 18px, chữ đọc 16px và dòng tối đa 70ch; thông điệp dùng Cormorant 27px. Phần soi vào vấn đề là một mạch lập luận liên kết các vị trí; không hiển thị lại từng lá như các mục giáo trình riêng. Dữ liệu từng lá, vị trí và chiều vẫn được kiểm tra ở backend. Không lặp nguyên định nghĩa dưới artwork; kiến thức đầy đủ mở qua nút của lá. Văn bản cũ trong lịch sử được chia theo câu thành đoạn đọc, giữ nguyên nội dung. Câu hỏi tiếp dùng cùng cách trình bày. Hành động không tự đặt thời hạn, số lượng hoặc thước đo khi người dùng chưa cung cấp.

Kết quả dự phòng có nút “Thử phân tích lại với AI”, giữ nguyên lá, vị trí, chiều và phong cách; thao tác không tạo lần trải mới. Nếu đã chọn một bước thực hành, lần phân tích lại giữ kế hoạch đó. Nội dung dự phòng dùng câu hoàn chỉnh, không cắt theo ngân sách từ rồi thêm dấu ba chấm. Khi hai hướng chưa rõ hoặc lá xã hội thiếu bối cảnh, nói rõ điều còn thiếu; không tự gán A/B hay chọn thay người dùng.

## Motion

Vùng rút bài ưu tiên artwork và vị trí trải: lá đã chọn và ô chờ có kích thước 144×220px trên desktop, cột 190px, tên bài bên dưới 14px. Điện thoại dùng lá 94×144px (84×128px trên màn hình nhỏ), trải một lá dùng 124×190px. Bộ bài carousel dùng 160×244px trên desktop và 116×182px trên điện thoại. Artwork, viền và typography co cùng khung; chừa chiều cao cho tên dài để không đẩy bộ bài khi lật.

Motion cho carousel có quán tính/snap, shared-layout từ bộ bài vào slot, CSS 3D flip và result blocks xuất hiện cách nhau 100ms. Lá giữa nâng 12px khi hover; các lá bên cạnh lùi theo perspective/scale. Thiết bị cảm ứng có phản hồi nhấn và không giữ hiệu ứng hover; tắt animation không cần thiết theo reduced motion. GSAP đã cài để dành cho sequence đặc biệt khi nhóm chốt choreography, không cần chạy đồng thời với flip hiện tại.

Khi gửi câu hỏi, form chuyển trong 180ms sang capsule câu hỏi và bộ bài đang chuẩn bị. Trạng thái chờ phản ánh yêu cầu thực, không dùng phần trăm giả hay thêm thời gian chờ để chạy hiệu ứng. Sau 8 giây, lời nhắc cho biết vẫn đang chờ phản hồi. Người dùng có thể hủy để sửa câu hỏi. Khi chọn bài, lá bay vào vị trí và lật, ánh sáng nền cùng viền lan nhẹ xác nhận thao tác; vị trí tiếp theo được nhấn rõ. Khi chờ diễn giải, giữ các lá đã chọn và hiển thị khung nội dung Thông điệp / Soi vào vấn đề / 3 hành động. Hủy hoặc thử lại không thay đổi lá hay chiều đã chọn. Reduced motion bỏ hiệu ứng lặp, nghiêng và lan sáng.

Khóa rút thêm bài chỉ tồn tại trong lượt lật hiện tại; nếu animation không gửi tín hiệu hoàn tất, mở khóa sau tối đa 1,3 giây khi tab đang hoạt động. Nút Đổi câu hỏi luôn dùng được, hủy yêu cầu đang chạy và bỏ qua callback của lượt cũ. Khi khôi phục phiên, các lá đã chọn hiện ngay, không lật lại và không khóa bộ bài.

Mỗi lần bắt đầu câu hỏi mới tạo một bộ 22 lá xáo trộn Fisher–Yates bằng Web Crypto, với chiều xuôi/ngược ngẫu nhiên. Dùng lấy mẫu loại bỏ phần dư để các vị trí có cùng xác suất. Trang chủ và trang trải bài cùng gọi hàm tạo phiên mới; cache phân tích câu hỏi không lưu thứ tự bài. Giao diện ghi “Bộ bài đã xáo trộn”. Tải lại trang, rút lá tiếp theo hoặc thử lại diễn giải giữ nguyên bộ bài và các lá đã chọn trong phiên hiện tại.

## Tham chiếu tương tác TarotCards

Luồng `/reading` học từ `TarotCards/src/components/Question.jsx`, `DrawCards.jsx`, `Result.jsx`: form tập trung ở giữa; carousel 3D kéo ngang có quán tính và snap; bấm lá bên cạnh để đưa vào giữa; lá được chọn chuyển vào ô vị trí, lật 3D và rời carousel. Kết quả ba lá xếp ngang trên desktop, có tên, chiều, từ khóa và khung suy ngẫm ngay dưới artwork; mobile vuốt ngang để đọc từng lá. Nút mũi tên, bàn phím và nút rút giữa cung cấp cách thao tác tương đương. MotionValue cập nhật transform trực tiếp trong khi kéo. Bốn cấu trúc trải, dữ liệu 22 lá và chiều đã chọn giữ nguyên; không chọn lại bài khi mở kết quả.
