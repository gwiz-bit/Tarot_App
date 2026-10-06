# Audit dataset Tarot Biện Chứng — 22 lá

Ngày: 04/10/2026. Phạm vi: dữ liệu cố định, khả năng diễn giải, ID/lịch sử, kiểm tra ngữ nghĩa artwork. Không nghiên cứu web, không sửa hình vẽ hay layout.

## 1. Kết luận và mức hoàn chỉnh

- **22/22 lá đủ trường cấu trúc**, đúng thứ tự/tên/khái niệm yêu cầu, số nguyên 1–22 và hiển thị 01–22; 22 ID duy nhất, 4 nhóm với số lượng 4/9/3/6.
- **0/22 lá được xác nhận học thuật từ nguồn MLN111**. Không có slide, giáo trình, syllabus hay trích đoạn lớp được xác minh trong nguồn đã cung cấp. Điều này nói về thiếu bằng chứng, không kết luận toàn bộ nội dung là sai.
- Mọi lá mang **UNSUPPORTED BY PROVIDED COURSE MATERIAL**. Không có lá nào được chốt overall PASS. Trường quy chiếu môn học có chuỗi rõ nguồn dự án nhưng **MISSING DATA** về một mục tài liệu thực sự.
- 22 định nghĩa không rỗng; 22 focus khác nhau; mỗi lá giữ 3 câu kiểm tra và 2 framework. Độ đủ học thuật của những trường này vẫn chưa được chứng minh.
- Các định nghĩa, keywords, framework xuôi/ngược, câu kiểm tra, phương pháp, sai lầm và ví dụ học thuật cũ được giữ **nguyên văn** để không sửa bằng kiến thức ngoài nguồn. Cần rà sáu lá xã hội và những điểm riêng được liệt kê bên dưới.

## 2. Nguồn và giới hạn bằng chứng

| Mã  | Nguồn đã kiểm tra                                                       | Có thể chứng minh                                                                                                          | Không chứng minh                                                 |
| --- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| S1  | Attachment f4c56d1a…/Pasted text.txt — yêu cầu audit hiện tại           | Bộ 22 tên/khái niệm/thứ tự/nhóm; ví dụ kiểm tra Reality, Conflict, Leap, Practice; phạm vi xã hội; yêu cầu differentiation | Không phải giáo trình, không có trang/slide hay quy chiếu chương |
| S2  | Attachment c4d3bc21…/Pasted text.txt — bản mô tả chức năng FINAL        | Ý tưởng, nhóm và 19 ví dụ chủ đề, cách vận dụng, xuôi/ngược                                                                | Không có định nghĩa đủ 22 lá và nguồn học thuật độc lập          |
| S3  | src/data/cards.ts trước audit; snapshot cards-before.json               | Văn bản thực tế đang dùng, có thể kiểm tra không sửa/không trích thêm                                                      | Không mặc định nội dung đúng chỉ vì tồn tại trong code           |
| S4  | README.md, PRODUCT.md, AUDIT_REPORT.md, .qa/functional-audit.md         | Quy tắc sản phẩm; README xác nhận đây là bản biên soạn cần đối chiếu                                                       | Không phải tài liệu MLN111 đã xác nhận                           |
| S5  | _design_import_20261004/src/App.tsx; attachment 3f9f39f0… artwork brief | Ba motif cũ và 22 art directions; lý do thiết kế dùng một số portrait                                                      | Brief thiết kế không chứng minh attribution học thuật            |
| S6  | TarotCards/src/data/tarotCards.js                                       | Reference tương tác và bộ Tarot truyền thống 78 lá                                                                         | Không phải dữ liệu MLN111; không dùng như nguồn sửa triết học    |
| S7  | Các attachment 43734820…, 7d388946…, c20d554d…                          | Yêu cầu audit chức năng, AI-first, engine contextual; dữ liệu cố định/không chọn lại lá                                    | Không chứa tài liệu giáo trình xác nhận bộ 22                    |

Đã rà workspace và các thư mục import/source đã cung cấp, loại thư mục dependency/build ra khỏi danh sách nguồn học thuật. Không thấy PDF/PPT/DOC/DOCX/syllabus MLN111. File ZIP được nhắc trước đó ở D:/PhiloTarot/Design Tarot Biện Chứng Website.zip **không còn tồn tại tại đường dẫn đó**; bản import đã đọc, không giả định có thêm course material trong archive mất. Chỉ dùng các attachment gắn với cuộc trao đổi này, không lấy tài liệu từ chat khác. Không gọi web search hoặc đưa tri thức trên mạng vào dataset.

Để hoàn tất xác minh cần tài liệu lớp có nguồn nhận diện được, vị trí đoạn/slide và người đối chiếu. Chưa tạo tên giáo trình, số trang, tác giả trích dẫn hay mapping chương giả.

## 3. Sửa đổi và migration

1. Đổi The Particular → **The Individual**, di chuyển đúng vị trí 08 theo S1. ID canonical là the-individual; the-particular là alias khi đọc dữ liệu cũ, không tạo lá thứ 23.
2. Sắp lại thứ tự theo đúng S1 và đổi số La Mã 0–XXI → số nguyên 1–22. Artwork, knowledge, library/home và ảnh chia sẻ dùng formatter 01–22. Không dùng số thứ tự làm ID.
3. Chuẩn hóa alias cũ: vietnamese→concept, philosophy→definition, upright/reversed→uprightFramework/reversedFramework, method→methodologicalMeaning, blindspot→commonMistake, example→realLifeExample, courseTopic→relatedCourseTopic. Các consumers chuyển sang schema mới, nội dung học thuật không tự viết lại.
4. Thêm **analysisFocus** cho cả 22, chỉ tóm lược brief và dữ liệu dự án hiện có; không coi là định nghĩa môn học đã được kiểm định. Thêm avoidForContexts cho sáu lá xã hội; các lá rộng có mảng rỗng.
5. Bỏ mapping tự sinh Chương 2/3 từ nhóm. relatedCourseTopic dùng chủ đề của brief kèm marker nguồn. Không nói đã xác định tiểu mục thực của lớp.
6. Thêm academicSourceStatus trên cả 22. Gemini nhận marker, được yêu cầu không chứng nhận nội dung draft là giáo trình, không thêm citation/attribution.
7. Payload chỉ 1/3 lá đã chọn, đúng position/orientation, dùng analysisFocus và framework của chiều đó. Bỏ keywords khỏi payload, không gửi ví dụ, metadata, path artwork hay cả deck.
8. Sáu lá xã hội mang scope limits; khi câu hỏi thiếu dấu hiệu bối cảnh phù hợp, provider phải trình bày giới hạn qua scopeNotice ở connection/insight và câu kiểm tra phạm vi. Sai → một repair → fallback. Các từ khóa bối cảnh chỉ cho phép tiếp tục xác minh, không chứng minh quan hệ. Fallback luôn cần làm rõ bối cảnh trước khi áp dụng lá xã hội.
9. ID canonical được chuẩn hóa tại schema input, lịch sử, phiên, daily draw. Phiên cũ giữ mảng deck đã trộn, index đã chọn và orientation; không trộn lại theo thứ tự mới. Lịch sử vẫn đọc được; kết quả đã lưu giữ như bản ghi quá khứ. Lá theo ngày giữ bảng ánh xạ ID cũ cho date hash ngay cả khi storage bị chặn; đổi thứ tự thư viện không đổi lá ngày đó. Fingerprint v3 có phiên bản dataset, cache cũ không được dùng cho yêu cầu mới.
10. Sửa ứng dụng local của The Leap với câu hỏi kinh doanh bằng chỉ báo lượt thử sản phẩm/phản hồi/khả năng phục vụ; đây là ứng dụng theo ngữ cảnh, không định nghĩa triết học hay khuyến nghị đầu tư.

Các thay đổi trong artwork.tsx chỉ là truy cập trường concept, case ID mới và định dạng số. Hash kiểm tra sau khi hoàn nguyên những đổi identity/presentation này khớp baseline: **mọi hình/path/portrait/palette giữ nguyên**.

### Changelog từng lá

Tất cả lá đổi tên trường, số, bổ sung focus/marker nguồn và bỏ mapping chương suy đoán. Bảng này ghi thêm thay đổi riêng; không có định nghĩa nào được sửa.

| #   | Lá              | Số cũ → mới | Thay đổi riêng                                                                                |
| --- | --------------- | ----------- | --------------------------------------------------------------------------------------------- |
| 01  | The Reality     | 0 → 01      | Focus riêng theo khái niệm; giữ văn bản học thuật                                             |
| 02  | The Mind        | I → 02      | Focus riêng theo khái niệm; giữ văn bản học thuật                                             |
| 03  | The Connection  | II → 03     | Nhãn khái niệm → Mối liên hệ phổ biến theo S1                                                 |
| 04  | The Flow        | III → 04    | Focus riêng theo khái niệm; giữ văn bản học thuật                                             |
| 05  | The Conflict    | IV → 05     | Nhãn khái niệm → Quy luật mâu thuẫn theo S1                                                   |
| 06  | The Leap        | V → 06      | Nhãn khái niệm → Quy luật Lượng — Chất theo S1                                                |
| 07  | The Spiral      | VI → 07     | Focus riêng theo khái niệm; giữ văn bản học thuật                                             |
| 08  | The Individual  | XIX → 08    | Đổi tên và alias ID; đưa lên vị trí 08; Nhãn khái niệm → Cái riêng — Cái chung theo S1        |
| 09  | The Cause       | VII → 09    | Nhãn khái niệm → Nguyên nhân — Kết quả theo S1                                                |
| 10  | The Chance      | XX → 10     | Nhãn khái niệm → Tất nhiên — Ngẫu nhiên theo S1                                               |
| 11  | The Form        | XXI → 11    | Nhãn khái niệm → Nội dung — Hình thức theo S1                                                 |
| 12  | The Essence     | VIII → 12   | Nhãn khái niệm → Bản chất — Hiện tượng theo S1                                                |
| 13  | The Possibility | IX → 13     | Nhãn khái niệm → Khả năng — Hiện thực theo S1                                                 |
| 14  | The Practice    | X → 14      | Focus riêng theo khái niệm; giữ văn bản học thuật                                             |
| 15  | The Truth       | XI → 15     | Focus riêng theo khái niệm; giữ văn bản học thuật                                             |
| 16  | The Ascent      | XII → 16    | Focus riêng theo khái niệm; giữ văn bản học thuật                                             |
| 17  | The Forces      | XIII → 17   | Nhãn khái niệm → Lực lượng sản xuất — Quan hệ sản xuất theo S1; Thêm giới hạn bối cảnh xã hội |
| 18  | The Structure   | XIV → 18    | Nhãn khái niệm → Cơ sở hạ tầng — Kiến trúc thượng tầng theo S1; Thêm giới hạn bối cảnh xã hội |
| 19  | The Society     | XV → 19     | Nhãn khái niệm → Tồn tại xã hội — Ý thức xã hội theo S1; Thêm giới hạn bối cảnh xã hội        |
| 20  | The Human       | XVI → 20    | Nhãn khái niệm → Con người và bản chất con người theo S1; Thêm giới hạn bối cảnh xã hội       |
| 21  | The Masses      | XVII → 21   | Nhãn khái niệm → Quần chúng — Cá nhân theo S1; Thêm giới hạn bối cảnh xã hội                  |
| 22  | The Turning     | XVIII → 22  | Thêm giới hạn bối cảnh xã hội                                                                 |

## 4. Kiểm tra overlap

Các phạm trù dưới đây có liên hệ về mặt nội dung; sự liên hệ không phải duplicate. Vấn đề là framework cũ có thể dẫn đến cùng lời khuyên về dữ kiện/thử nghiệm/đổi cách làm. Bảng quy định **phạm vi lens dự án**, chưa chứng nhận phân loại tiểu mục của lớp.

| Cặp/nhóm                     | Lá phân tích                                                                                                                                                       | Lá không thay thế                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Reality / Truth              | Reality: điều kiện/nguồn lực/giới hạn tồn tại khách quan. Truth: tri thức/kết luận phù hợp thực tế trong điều kiện nào                                             | Reality không tự chứng minh kết luận đúng; Truth không chỉ liệt kê những vật/điều kiện đang có                                        |
| Connection / Society         | Connection: mạng liên hệ, tác động qua lại, điều kiện cụ thể. Society: tồn tại xã hội và ý thức xã hội/tác động lại                                                | Connection không gán nguyên nhân xã hội cho mọi niềm tin; Society không là network nói chung                                          |
| Flow / Spiral / Turning      | Flow: khuynh hướng của quá trình phát triển. Spiral: kế thừa/vượt qua qua các lần phủ định. Turning: thay đổi cách tổ chức đời sống xã hội trong điều kiện phù hợp | Flow không mặc định chuỗi phủ định; Spiral không tự gắn mọi quay lại với tiến bộ; Turning không là đổi thói quen cá nhân              |
| Conflict / Turning           | Conflict: các mặt đối lập cùng tồn tại và quan hệ chuyển hóa. Turning: mâu thuẫn/lực lượng/điều kiện ở thay đổi xã hội                                             | Conflict không nhất thiết thuộc cấu trúc xã hội; Turning không gọi mọi bất đồng là biến đổi xã hội                                    |
| Practice / Ascent            | Practice: hành động thử/quan sát để kiểm chứng nhận thức. Ascent: nối quan sát cụ thể, khái quát, quay lại thử                                                     | Practice không thay toàn bộ quá trình nhận thức; Ascent không chỉ là một to-do thử nghiệm                                             |
| Individual / Human           | Individual: cái chung trong hoàn cảnh riêng, điều kiện đặc thù khi áp dụng. Human: con người trong điều kiện tự nhiên/hoạt động/quan hệ xã hội                     | Individual không là tính cách một cá nhân; Human không thay cặp cái riêng–cái chung                                                   |
| Forces / Structure / Society | Forces: lực lượng và quan hệ trong sản xuất. Structure: cơ sở kinh tế/thượng tầng và tác động lại. Society: đời sống xã hội/ý thức xã hội                          | Forces không là mọi năng lực phối hợp; Structure không là mọi ‘nền tảng’; Society không là cảm xúc cá nhân hay ba tầng tổ chức bất kỳ |

Không có ID hay định nghĩa trùng hoàn toàn. Overlap lớn trước audit: Flow/Spiral/Leap (kế thừa, tích lũy, đổi cách), Reality/Truth/Practice (dữ kiện/kiểm chứng), Connection/Cause (một nguyên nhân), Forces/Structure/Society (nguồn lực/quy tắc/niềm tin), Masses (teamwork). Focus mới tách nhiệm vụ phân tích; các đoạn cũ yếu vẫn ghi **NEEDS REVISION**, chờ tài liệu trước khi viết lại.

## 5. Audit đầy đủ từng lá

Mỗi mục dưới đây đã rà cả 15 trường yêu cầu. **PASS cho identity/focus chỉ là đáp ứng brief/cấu trúc**. Các đoạn học thuật đều UNSUPPORTED BY PROVIDED COURSE MATERIAL; relatedCourseTopic chưa có reference lớp. Không dùng việc trường ‘có dữ liệu’ để suy ra ‘đúng học thuật’.

### 01 — The Reality

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| name / id / number                    | The Reality · the-reality · 01 — đúng S1, duy nhất                                                                                                                                         |
| concept                               | Vật chất — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                                             |
| group                                 | Thế giới quan — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                                         |
| keywords                              | khách quan · điều kiện · hiện thực — Từ khóa hướng đến điều kiện khách quan, nhưng chưa có nguồn xác nhận đây là bộ thuật ngữ đủ cho phạm trù vật chất.                                    |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Đoạn hiện tại trộn vật chất với ý thức. Cần đối chiếu định nghĩa phạm trù và mức độ rút gọn theo tài liệu lớp; không tự bổ sung định nghĩa Lenin. |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                                      |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Xuôi/ngược phân biệt dữ kiện và mong muốn, chưa chỉ là tốt/xấu. Giữ bản cũ; các ví dụ điều kiện khách quan trong brief hỗ trợ hướng suy ngẫm.                       |
| checkQuestions                        | Có 3 câu. Ba câu hỏi kiểm tra dữ kiện và giới hạn, phù hợp hướng ví dụ The Reality trong yêu cầu audit; không xác nhận phạm trù vật chất chỉ là dữ kiện.                                   |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Liệt kê dữ kiện là thao tác minh họa. Cần phân biệt ý nghĩa phương pháp luận với checklist cá nhân.                                                  |
| realLifeExample                       | Có nội dung. Kế hoạch học tập là liên hệ minh họa có nguồn trong bản biên soạn, chưa phải ví dụ của giáo trình.                                                                            |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                                  |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                                              |
| artwork semantic match                | **TOO GENERIC** — Khối lập phương và điểm cố định biểu đạt tính vật thể, dễ thu hẹp vật chất thành một vật rắn. Chân dung nổi ở góc trái; chưa biểu đạt đủ tính khách quan của phạm trù.   |

**Định nghĩa draft hiện dùng:** Vật chất tồn tại khách quan, độc lập với ý thức; ý thức là sự phản ánh hiện thực trong những điều kiện lịch sử cụ thể.

**Focus:** Xác định dữ kiện, nguồn lực và giới hạn khách quan tồn tại độc lập với mong muốn chủ quan.

**Xuôi:** Hãy bắt đầu từ những điều đang có thật: nguồn lực, giới hạn và điều kiện cụ thể. Nhìn thẳng vào hiện thực giúp bạn chọn một bước có cơ sở.

**Ngược:** Có thể bạn đang để mong muốn hoặc nỗi sợ thay thế cho dữ kiện. Kiểm tra điều gì đã được quan sát, điều gì chỉ là giả định.

**Điều cần kiểm tra:**

- Những dữ kiện nào tồn tại độc lập với mong muốn của bạn?
- Nguồn lực và giới hạn khách quan nào cần được xác minh?
- Bạn đang phân biệt điều đã quan sát với giả định như thế nào?

**Phương pháp / sai lầm:** Liệt kê ba dữ kiện khách quan trước khi chọn giải pháp. / Đồng nhất điều mình muốn với điều đang tồn tại.

**Ví dụ:** Một kế hoạch học tập cần tính đến thời gian, sức khỏe và kiến thức nền thay vì chỉ dựa vào quyết tâm.

**Chủ đề đang gắn:** Thế giới quan · Vật chất (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Vladimir Lenin. Brief artwork 01 yêu cầu dùng vì liên hệ với vật chất; chưa có tài liệu MLN111 xác nhận học thuật cho gán ghép này. **UNSUPPORTED BY PROVIDED COURSE MATERIAL**; chỉ báo cáo, không thay portrait.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 02 — The Mind

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| name / id / number                    | The Mind · the-mind · 02 — đúng S1, duy nhất                                                                                                                                               |
| concept                               | Ý thức — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                                               |
| group                                 | Thế giới quan — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                                         |
| keywords                              | phản ánh · mục đích · sáng tạo — Phản ánh/mục đích/sáng tạo bám đoạn hiện có; không dùng trực giác hay phép màu. Chưa được kiểm chứng theo slide.                                          |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Đoạn nói phản ánh năng động và tác động qua hoạt động; cần đối chiếu phần định nghĩa, điều kiện hình thành và tính đầy đủ theo lớp.               |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                                      |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Hình ảnh ‘câu chuyện trong đầu’ và ‘chiếc lồng’ nghiêng tâm lý cá nhân; nghĩa ngược còn thiếu tiêu chí rõ về phản ánh sai hay tách ý thức khỏi hoạt động.           |
| checkQuestions                        | Có 3 câu. Có kiểm tra dữ kiện và chuyển mục đích thành hoạt động. Câu ‘câu chuyện bạn tự kể’ cần rà giọng và độ bám khái niệm.                                                             |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Viết mô tả kiểm chứng được và tránh suy nghĩ thay hành động bám dữ liệu dự án; cần xác nhận ý nghĩa phương pháp luận.                                |
| realLifeExample                       | Có nội dung. Đổi nhãn ‘mình kém’ sang kỹ năng là liên hệ cá nhân, chưa chứng minh nội dung học thuật.                                                                                      |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                                  |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                                              |
| artwork semantic match                | **GOOD MATCH** — Profile người, các đường phản ánh và định hướng tạo điểm nhìn riêng; không phải chân dung nhân vật lịch sử. Mức phù hợp là nhận xét biểu tượng, không kiểm chứng lý luận. |

**Định nghĩa draft hiện dùng:** Ý thức là sự phản ánh năng động, sáng tạo hiện thực khách quan và có khả năng tác động trở lại hiện thực thông qua hoạt động của con người.

**Focus:** Xem cách phản ánh và hình dung hiện thực định hướng mục đích, rồi chuyển thành hoạt động cụ thể.

**Xuôi:** Cách bạn đặt tên và hình dung vấn đề đang mở ra một khả năng hành động. Ý thức rõ ràng cần được chuyển thành việc làm.

**Ngược:** Một câu chuyện trong đầu có thể đang trở thành chiếc lồng. Hãy phân biệt điều bạn biết với điều bạn đang tự kể.

**Điều cần kiểm tra:**

- Cách bạn hình dung vấn đề dựa trên dữ kiện nào?
- Mục đích của bạn có thể chuyển thành hoạt động cụ thể nào?
- Điều gì đang là nhận thức có cơ sở, điều gì chỉ là câu chuyện bạn tự kể?

**Phương pháp / sai lầm:** Viết lại vấn đề bằng một mô tả có thể kiểm chứng. / Tin rằng suy nghĩ thay thế được hành động.

**Ví dụ:** Đổi câu ‘mình kém’ thành một câu hỏi về kỹ năng cụ thể có thể rèn luyện.

**Chủ đề đang gắn:** Thế giới quan · Ý thức (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 03 — The Connection

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                                              |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Connection · the-connection · 03 — đúng S1, duy nhất                                                                                                                                             |
| concept                               | Mối liên hệ phổ biến — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                                           |
| group                                 | Thế giới quan — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                                                   |
| keywords                              | hệ thống · quan hệ · bối cảnh — Hệ thống/quan hệ/bối cảnh phản ánh mạng lưới tác động, chưa đủ để xác nhận toàn bộ nguyên lý.                                                                        |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Khẳng định mối liên hệ phổ biến chưa chỉ rõ nội hàm mối liên hệ. Cần kiểm chứng tính chính xác và mức rút gọn; không tự thêm thuộc tính từ kiến thức ngoài. |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                                                |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Có xét mạng lưới và bỏ sót bối cảnh. Blind spot ‘một nguyên nhân’ dễ trùng The Cause; focus mới chỉ rõ tác động qua lại và điều kiện.                                         |
| checkQuestions                        | Có 3 câu. Ba câu hỏi xét yếu tố, mối liên hệ bị bỏ sót và vai trò trong điều kiện cụ thể; không chỉ truy nguyên nhân như The Cause.                                                                  |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Bản đồ ba vòng là kỹ thuật của dự án, không phải nguyên văn phương pháp luận môn học.                                                                          |
| realLifeExample                       | Có nội dung. Các điều kiện học tập là minh họa quan hệ nhiều yếu tố; không đồng nhất với tồn tại xã hội/ý thức xã hội.                                                                               |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                                            |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                                                        |
| artwork semantic match                | **GOOD MATCH** — Nhiều vật thể khác nhau trên các tuyến giao nhau, một vùng trung tâm; truyền đạt mạng liên hệ. Vai trò từng mối liên hệ chưa đọc rõ ở thumbnail.                                    |

**Định nghĩa draft hiện dùng:** Mọi sự vật tồn tại trong những mối liên hệ phổ biến và điều kiện cụ thể; không có vấn đề nào hoàn toàn biệt lập.

**Focus:** Xác định các yếu tố tác động qua lại và mối liên hệ cần xét trong điều kiện cụ thể của vấn đề.

**Xuôi:** Một góc nhìn rộng hơn sẽ cho thấy các yếu tố đang tác động lẫn nhau. Hãy nhìn mạng lưới thay vì chỉ tìm một thủ phạm.

**Ngược:** Bạn có thể đang tách một sự việc khỏi bối cảnh của nó. Kiểm tra những mối liên hệ bị bỏ quên.

**Điều cần kiểm tra:**

- Những yếu tố nào đang tác động qua lại trong hoàn cảnh này?
- Mối liên hệ quan trọng nào đang bị bỏ sót?
- Điều kiện cụ thể nào khiến một mối liên hệ trở nên quyết định?

**Phương pháp / sai lầm:** Vẽ bản đồ ba vòng: bản thân, người khác, hoàn cảnh. / Giải thích mọi thứ bằng một nguyên nhân duy nhất.

**Ví dụ:** Kết quả học tập liên quan đến phương pháp, thời gian, môi trường và sức khỏe.

**Chủ đề đang gắn:** Thế giới quan · Mối liên hệ phổ biến (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 04 — The Flow

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Flow · the-flow · 04 — đúng S1, duy nhất                                                                                                                            |
| concept                               | Sự phát triển — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                     |
| group                                 | Thế giới quan — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                      |
| keywords                              | vận động · kế thừa · đi lên — Kế thừa/đi lên giao với The Spiral; chưa xác nhận phát triển có thể rút thành động viên tiến bộ.                                          |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Đoạn khuynh hướng đi lên có kế thừa; cần tài liệu làm rõ vận động và phát triển, tránh mặc định mọi thay đổi đều phát triển.   |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                   |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Xuôi nói tích lũy/thay đổi chất, ngược nói đường thẳng; giao cả Leap và Spiral. Không sửa học thuật khi thiếu nguồn; focus mới xét cả quá trình. |
| checkQuestions                        | Có 3 câu. Câu kế thừa trùng Spiral nhưng hai câu còn lại xét quá trình và điều kiện phát triển. Cần kiểm tra phạm vi với giảng viên.                                    |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. So sánh bản thân theo thời gian là một thao tác minh họa hẹp; chưa đủ làm định nghĩa phương pháp luận.                            |
| realLifeExample                       | Có nội dung. Học kỹ năng qua thử/sai không được coi bằng chứng mọi vòng thử đều đi lên.                                                                                 |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                               |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                           |
| artwork semantic match                | **GOOD MATCH** — Chuỗi hình biến đổi theo hướng đi lên có nhịp và kích thước khác nhau, khác đường vòng của Spiral; vẫn khá hình học.                                   |

**Định nghĩa draft hiện dùng:** Phát triển là quá trình vận động theo khuynh hướng đi lên, trong đó cái mới kế thừa và vượt qua cái cũ.

**Focus:** Đánh giá khuynh hướng biến đổi qua cả quá trình và điều kiện thúc đẩy hoặc cản trở phát triển.

**Xuôi:** Một bước lùi không nhất thiết là thất bại. Hãy tìm phần đang được tích lũy và điều đã thay đổi về chất.

**Ngược:** Bạn có thể đang đòi hỏi tiến bộ theo một đường thẳng. Đánh giá lại nhịp vận động và điều kiện chuyển hóa.

**Điều cần kiểm tra:**

- So với trước, điều gì đã thay đổi và điều gì được kế thừa?
- Bạn đang đánh giá cả quá trình hay chỉ một kết quả tức thời?
- Điều kiện nào đang thúc đẩy hoặc cản trở sự phát triển?

**Phương pháp / sai lầm:** So sánh mình hôm nay với chính mình ở một mốc trước đó. / Đo phát triển chỉ bằng kết quả tức thời.

**Ví dụ:** Một kỹ năng mới thường cần nhiều vòng thử, sai và điều chỉnh trước khi thành thạo.

**Chủ đề đang gắn:** Thế giới quan · Sự phát triển (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 05 — The Conflict

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                                              |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Conflict · the-conflict · 05 — đúng S1, duy nhất                                                                                                                                                 |
| concept                               | Quy luật mâu thuẫn — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                                             |
| group                                 | Phép biện chứng — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                                                 |
| keywords                              | đối lập · lực kéo · chuyển hóa — ‘Lực kéo’ là ẩn dụ đời sống; đối lập/chuyển hóa bám bản mô tả. Không tự thay bằng thuật ngữ chưa có nguồn lớp.                                                      |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Đoạn thống nhất và đấu tranh của mặt đối lập cần được đối chiếu; chưa đủ nguồn để chứng nhận định nghĩa quy luật.                                           |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                                                |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Xuôi/ngược còn tập trung nhu cầu và thắng–thua. Cần kiểm tra tránh đồng nhất mọi bất đồng giữa người với mâu thuẫn biện chứng, hoặc coi dung hòa là cách giải quyết duy nhất. |
| checkQuestions                        | Có 3 câu. Câu 1 và 3 bám các hướng audit. Câu 2 về nhu cầu mỗi phía thu hẹp đối tượng vào con người; cần cân nhắc theo tài liệu.                                                                     |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Giữ hai mặt cùng tồn tại là một khả năng thực hành, chưa đủ làm kết luận phổ quát về chuyển hóa.                                                               |
| realLifeExample                       | Có nội dung. Nghỉ ngơi và tiến bộ là liên hệ, không phải xác nhận cấu trúc mọi mâu thuẫn.                                                                                                            |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                                            |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                                                        |
| artwork semantic match                | **GOOD MATCH** — Hai profile và hai trường màu cùng cấu trúc chồng lấn, có vùng trung tâm; thể hiện đối lập và cùng tồn tại, dễ đọc hơn sơ đồ hai vòng tròn.                                         |

**Định nghĩa draft hiện dùng:** Mâu thuẫn là sự thống nhất và đấu tranh của các mặt đối lập, là nguồn gốc và động lực của sự phát triển.

**Focus:** Nhận diện sự thống nhất, đối lập và tác động lẫn nhau của hai mặt; kiểm tra điều kiện chuyển hóa mâu thuẫn.

**Xuôi:** Hai nhu cầu đối lập đang chỉ ra vấn đề thật. Đừng vội xóa một bên; hãy tìm điều kiện để chuyển hóa mâu thuẫn.

**Ngược:** Bạn có thể đang né tránh mặt đối lập hoặc biến nó thành cuộc chiến thắng–thua. Gọi tên lợi ích của cả hai bên.

**Điều cần kiểm tra:**

- Hai mặt đối lập đang cùng tồn tại và tác động lẫn nhau như thế nào?
- Nhu cầu nào của mỗi phía cần được làm rõ?
- Điều kiện nào có thể làm thay đổi quan hệ giữa hai mặt?

**Phương pháp / sai lầm:** Viết hai mặt A/B và điều kiện làm chúng có thể cùng tồn tại. / Coi mâu thuẫn là lỗi phải loại bỏ ngay.

**Ví dụ:** Muốn nghỉ ngơi nhưng vẫn muốn tiến bộ cần một nhịp làm việc bền vững, không phải ép một phía biến mất.

**Chủ đề đang gắn:** Phép biện chứng · Quy luật mâu thuẫn (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 06 — The Leap

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| name / id / number                    | The Leap · the-leap · 06 — đúng S1, duy nhất                                                                                                                                         |
| concept                               | Quy luật Lượng — Chất — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                          |
| group                                 | Phép biện chứng — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                                 |
| keywords                              | tích lũy · ngưỡng · bước nhảy — Tích lũy/ngưỡng/bước nhảy bám brief; ‘ngưỡng’ chưa được xác nhận là thuật ngữ đủ thay điểm nút trong môn.                                            |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Chỉ có hướng lượng đến chất, ngắn và chưa định nghĩa lượng/chất. Không tự thêm chiều tác động ngược hay thuộc tính chưa có trong nguồn lớp. |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                                |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Ngược có hai nguy cơ nóng vội/trì hoãn đúng hướng ví dụ audit; cụm ‘sợ thay đổi’ còn tâm lý hóa. Giữ nguyên để không giả định sửa học thuật được hỗ trợ.      |
| checkQuestions                        | Có 3 câu. Ba câu hỏi lượng tích lũy, điều kiện, nóng vội/trì hoãn sát ví dụ người dùng cung cấp.                                                                                     |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Mốc đo/ngưỡng quyết định là gợi ý vận dụng, chưa xác nhận ngưỡng tự đặt chính là điểm nút khách quan.                                          |
| realLifeExample                       | Có nội dung. GPA cần xét lượng nào và điều kiện nào, không suy ra phương pháp sai hoặc đã đủ lượng chỉ từ điểm chưa tăng.                                                            |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                            |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                                        |
| artwork semantic match                | **GOOD MATCH** — Nhiều đơn vị nhỏ, vạch threshold, hình mới ở phía sau biểu đạt tích lũy/chuyển hóa rõ; không có biểu tượng cờ bạc hay bói toán.                                     |

**Định nghĩa draft hiện dùng:** Những biến đổi về lượng tích lũy đến một điểm nút sẽ dẫn đến biến đổi về chất; bước nhảy cần điều kiện.

**Focus:** Kiểm tra lượng tích lũy, ngưỡng và điều kiện của bước nhảy; phân biệt thay đổi nóng vội với trì hoãn khi đã đủ điều kiện.

**Xuôi:** Những gì bạn đang tích lũy có thể đang tiến gần một ngưỡng mới. Hãy kiên trì nhưng đồng thời xác định điểm cần đổi cách làm.

**Ngược:** Kiểm tra xem bạn có nóng vội tạo bước nhảy khi điều kiện chưa đủ, hay đã đủ mà vẫn sợ thay đổi.

**Điều cần kiểm tra:**

- Bạn đang thực sự tích lũy loại lượng nào?
- Điều kiện nào đã đủ và điều kiện nào còn thiếu?
- Bạn đang nóng vội tạo bước nhảy hay trì hoãn khi điều kiện đã chín muồi?

**Phương pháp / sai lầm:** Đặt một mốc đo lường và một ngưỡng quyết định rõ ràng. / Đánh đồng nhiều thời gian với tiến bộ thực chất.

**Ví dụ:** GPA chưa tăng có thể cần đổi phương pháp sau một chu kỳ thử nghiệm đủ dài.

**Chủ đề đang gắn:** Phép biện chứng · Quy luật Lượng — Chất (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 07 — The Spiral

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| name / id / number                    | The Spiral · the-spiral · 07 — đúng S1, duy nhất                                                                                                                                     |
| concept                               | Phủ định của phủ định — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                          |
| group                                 | Phép biện chứng — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                                 |
| keywords                              | vượt qua · kế thừa · chu kỳ — ‘Chu kỳ’ có thể bị hiểu thành lặp đều; vượt qua/kế thừa bám nội dung dự án.                                                                            |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Đoạn mô tả phủ định biện chứng nhưng tên lá là phủ định của phủ định. Cần nguồn kiểm tra đã đủ thể hiện quan hệ giữa các lần phủ định chưa. |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                                |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Khác biệt lần trở lại ở trình độ mới với quay vòng là hợp lý trong brief; cần tránh gọi mọi lần thử lại là quy luật phủ định của phủ định.                    |
| checkQuestions                        | Có 3 câu. Giữ/bỏ và có yếu tố mới bám vấn đề kế thừa; chưa thể xác nhận cấu trúc quy luật từ ba câu này.                                                                             |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Tách điều giữ/điều bỏ là thao tác minh họa; không thay thế mô tả quy luật.                                                                     |
| realLifeExample                       | Có nội dung. Thử lại ngành học không tự xác nhận các lần phủ định biện chứng.                                                                                                        |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                            |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                                        |
| artwork semantic match                | **WEAK MATCH** — Các vòng chủ yếu quẩn ở nửa dưới; sự trở lại ở tầng cao hơn chưa rõ. Không có chuỗi hình được kế thừa đủ nổi bật; có thể đọc như vòng lặp.                          |

**Định nghĩa draft hiện dùng:** Phủ định biện chứng loại bỏ cái lỗi thời và giữ lại yếu tố hợp lý, tạo ra sự phát triển theo đường xoáy ốc.

**Focus:** Xem yếu tố được kế thừa và vượt qua qua các lần phủ định; phân biệt phát triển với lặp lại cách cũ.

**Xuôi:** Bạn có thể quay lại một câu hỏi cũ ở một trình độ mới. Hãy giữ bài học, bỏ lớp vỏ đã không còn phù hợp.

**Ngược:** Sự lặp lại có thể đang chỉ là quay vòng. Tìm điều mới thật sự được tạo ra sau mỗi chu kỳ.

**Điều cần kiểm tra:**

- Yếu tố hợp lý nào của cách cũ cần được giữ lại?
- Điều gì đã lỗi thời và cần được vượt qua?
- Sau lần thử mới, bạn có thêm điều gì hay chỉ lặp lại cách cũ?

**Phương pháp / sai lầm:** Tách ‘điều cần giữ’ và ‘điều cần bỏ’ trước khi bắt đầu lại. / Lãng mạn hóa việc quay lại mà không thay đổi điều kiện.

**Ví dụ:** Thử lại một ngành học với hiểu biết mới khác với việc lặp y nguyên cách cũ.

**Chủ đề đang gắn:** Phép biện chứng · Phủ định của phủ định (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 08 — The Individual

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                             |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Individual · the-individual · 08 — đúng S1, duy nhất                                                                                                                            |
| concept                               | Cái riêng — Cái chung — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                         |
| group                                 | Phép biện chứng — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                                |
| keywords                              | đặc thù · chung · đơn nhất — Đặc thù/chung/đơn nhất chưa có định nghĩa thuật ngữ đi kèm; cần đối chiếu cách gọi trong MLN111.                                                       |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Đoạn quan hệ cái chung/cái riêng được giữ nguyên; chưa có nguồn kiểm tra các phạm trù và độ đầy đủ.                                        |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                               |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Có hai nguy cơ áp dụng công thức chung bỏ điều kiện riêng và khái quát một trải nghiệm. Tên Individual là biểu tượng, không chỉ tính cách cá nhân như Human. |
| checkQuestions                        | Có 3 câu. Ba câu giữ hoàn cảnh riêng khi vận dụng kinh nghiệm chung; được phân biệt rõ với các quan hệ xã hội của Human.                                                            |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Một điểm chung/hai điều riêng là thao tác dự án; số lượng không phải quy định học thuật.                                                      |
| realLifeExample                       | Có nội dung. Điều chỉnh cùng phương pháp học theo kiến thức nền minh họa vận dụng vào hoàn cảnh riêng.                                                                              |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                           |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                                       |
| artwork semantic match                | **TOO GENERIC** — Các đa giác gần như giống nhau, một phần đổi màu; quan hệ chung/riêng có thể nhận ra nhưng còn như infographic ‘một phần khác màu’. Không gắn chân dung.          |

**Định nghĩa draft hiện dùng:** Cái chung tồn tại trong cái riêng, thông qua cái riêng; cái riêng không tồn tại tách khỏi những mối liên hệ với cái chung.

**Focus:** Xem cái chung trong hoàn cảnh riêng; giữ điều kiện đặc thù khi vận dụng kinh nghiệm và tránh khái quát từ một trường hợp.

**Xuôi:** Tìm quy luật chung nhưng vẫn giữ lại điều kiện đặc thù của tình huống bạn đang sống.

**Ngược:** Bạn có thể áp dụng một công thức chung mà bỏ qua hoàn cảnh riêng, hoặc xem trải nghiệm riêng là đúng cho mọi người.

**Điều cần kiểm tra:**

- Điểm chung nào có thể nhận ra trong hoàn cảnh cụ thể này?
- Điều kiện riêng nào cần giữ lại khi áp dụng kinh nghiệm chung?
- Bạn có đang biến kinh nghiệm cá nhân thành công thức cho mọi người?

**Phương pháp / sai lầm:** Viết một điểm chung và hai điều kiện riêng trước khi áp dụng kinh nghiệm. / Biến kinh nghiệm cá nhân thành khuôn mẫu cho tất cả.

**Ví dụ:** Cùng một phương pháp học có thể cần điều chỉnh theo kiến thức nền của từng người.

**Chủ đề đang gắn:** Phép biện chứng · Cái riêng — Cái chung (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 09 — The Cause

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Cause · the-cause · 09 — đúng S1, duy nhất                                                                                                                               |
| concept                               | Nguyên nhân — Kết quả — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                  |
| group                                 | Phép biện chứng — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                         |
| keywords                              | nguyên nhân · tác động · hệ quả — Nguyên nhân/tác động/hệ quả bám đoạn hiện có; cần định nghĩa nguyên nhân theo môn.                                                         |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Nêu sinh ra kết quả với điều kiện và kết quả thành nguyên nhân mới; chưa xác nhận tiêu chuẩn nhận diện quan hệ nhân quả.            |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                        |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Xuôi có ‘nguyên nhân nhỏ/hệ quả lớn’ chưa có nguồn học thuật, ngược gán nguyên nhân thuận tiện; giữ và đánh dấu để kiểm chứng.                        |
| checkQuestions                        | Có 3 câu. Bằng chứng nhân quả, điều kiện trung gian và nhầm trùng hợp là lens khác mạng tác động qua lại của Connection.                                                     |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Chuỗi nguyên nhân → điều kiện → kết quả là minh họa; tránh mặc định mọi chuỗi quan sát được là nhân quả.                               |
| realLifeExample                       | Có nội dung. Liệt kê nguyên nhân mất động lực là các khả năng cần kiểm tra, không phải chẩn đoán có căn cứ từ lá.                                                            |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                    |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                                |
| artwork semantic match                | **WEAK MATCH** — Vật thể nối các vòng bằng nét đứt, đường sóng liên tục; hướng truyền tác động và điều kiện trung gian khó phân biệt, dễ bị đọc thành mối liên hệ nói chung. |

**Định nghĩa draft hiện dùng:** Nguyên nhân sinh ra kết quả trong những điều kiện nhất định; một kết quả có thể trở thành nguyên nhân mới.

**Focus:** Truy chuỗi nguyên nhân, điều kiện trung gian và kết quả; kiểm tra căn cứ nhân quả thay vì chỉ sự trùng hợp.

**Xuôi:** Hãy lần theo chuỗi tác động thay vì chỉ sửa biểu hiện cuối cùng. Một nguyên nhân nhỏ có thể tạo ra hệ quả lớn.

**Ngược:** Bạn có thể đang gán kết quả cho một nguyên nhân thuận tiện nhưng chưa đủ. Kiểm tra điều kiện trung gian.

**Điều cần kiểm tra:**

- Có bằng chứng nào cho quan hệ nguyên nhân và kết quả bạn đang nêu?
- Điều kiện trung gian nào khiến nguyên nhân tạo ra kết quả?
- Bạn có đang nhầm sự trùng hợp với quan hệ nhân quả?

**Phương pháp / sai lầm:** Vẽ chuỗi nguyên nhân → điều kiện → kết quả. / Nhầm tương quan với quan hệ nhân quả.

**Ví dụ:** Mất động lực có thể là kết quả của mục tiêu mơ hồ, lịch quá tải hoặc thiếu phản hồi.

**Chủ đề đang gắn:** Phép biện chứng · Nguyên nhân — Kết quả (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 10 — The Chance

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Chance · the-chance · 10 — đúng S1, duy nhất                                                                                                                          |
| concept                               | Tất nhiên — Ngẫu nhiên — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                              |
| group                                 | Phép biện chứng — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                      |
| keywords                              | quy luật · ngẫu nhiên · điều kiện — Quy luật/ngẫu nhiên/điều kiện có hướng phân biệt sự kiện và xu hướng, chưa được xác nhận định nghĩa môn học.                          |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Đoạn quy ngẫu nhiên về hoàn cảnh bên ngoài cần đối chiếu cách trình bày đầy đủ trong lớp. Không tự sửa bằng định nghĩa nhớ được. |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                     |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Xuôi phân biệt xu hướng với sự kiện tình cờ; ngược không đồng nhất một kết quả may/bất lợi với quy luật. Không tiên đoán.                          |
| checkQuestions                        | Có 3 câu. Quan sát nhiều lần chỉ tạo dữ kiện; số lần lặp không tự chứng minh tính tất nhiên. Cần rà với tài liệu.                                                         |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Ghi sự lặp và điều kiện là minh họa kiểm chứng, không phải định nghĩa tất nhiên.                                                    |
| realLifeExample                       | Có nội dung. Trúng phần đã ôn được dùng như trường hợp minh họa, không gán số phận.                                                                                       |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                 |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                             |
| artwork semantic match                | **TOO SIMILAR TO ANOTHER CARD** — Đường đi cong, node và nét phụ khá giống Ascent/Flow; chưa đọc rõ một quỹ đạo chính và các tác động tình cờ khác vai trò.               |

**Định nghĩa draft hiện dùng:** Tất nhiên do những nguyên nhân cơ bản bên trong quy định; ngẫu nhiên do sự kết hợp của các hoàn cảnh bên ngoài. Chúng thống nhất và có thể chuyển hóa trong những điều kiện nhất định.

**Focus:** Phân biệt xu hướng có cơ sở từ nguyên nhân cơ bản với sự kiện tình cờ trong những điều kiện cụ thể.

**Xuôi:** Phân biệt xu hướng có cơ sở với một sự kiện tình cờ để chọn điều bạn có thể chủ động chuẩn bị.

**Ngược:** Một kết quả may mắn hoặc bất lợi đơn lẻ có thể đang bị bạn xem thành quy luật chắc chắn.

**Điều cần kiểm tra:**

- Kết quả này lặp lại do nguyên nhân cơ bản nào hay chỉ xuất hiện một lần?
- Hoàn cảnh bên ngoài nào đã góp phần tạo ra kết quả?
- Bạn cần thêm những lần quan sát nào trước khi kết luận một xu hướng?

**Phương pháp / sai lầm:** Quan sát nhiều lần; ghi điều lặp lại và những điều kiện thay đổi. / Gọi mọi kết quả là số phận hoặc mọi sự trùng hợp là quy luật.

**Ví dụ:** Một lần làm bài tốt do trúng phần đã ôn chưa đủ để kết luận đã nắm chắc cả môn.

**Chủ đề đang gắn:** Phép biện chứng · Tất nhiên — Ngẫu nhiên (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 11 — The Form

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Form · the-form · 11 — đúng S1, duy nhất                                                                                                                     |
| concept                               | Nội dung — Hình thức — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                       |
| group                                 | Phép biện chứng — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                             |
| keywords                              | cấu trúc · nội dung · phù hợp — Cấu trúc/nội dung/phù hợp bám bản biên soạn, cần xác nhận nghĩa phạm trù hình thức trong môn.                                    |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Có quan hệ quyết định/tác động trở lại nhưng chưa định nghĩa nội dung và hình thức; cần nguồn xác nhận mức rút gọn.     |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                            |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Nói rõ chất lượng nội dung và cách tổ chức, không chỉ chăm chút vẻ ngoài. Vẫn có nguy cơ thu hẹp hình thức thành trang trí.               |
| checkQuestions                        | Có 3 câu. Ba câu kiểm tra nội dung thực chất và sự hỗ trợ/cản trở của cách tổ chức, có focus riêng với Essence.                                                  |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Kiểm tra tách hai mặt là thao tác phân tích; phải giữ quan hệ thống nhất khi đối chiếu tài liệu.                           |
| realLifeExample                       | Có nội dung. Bài thuyết trình là ví dụ dự án, không phải trích ví dụ từ giáo trình.                                                                              |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                        |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                    |
| artwork semantic match                | **TOO SIMILAR TO ANOTHER CARD** — Khung chữ nhật bao lõi thoi/bầu dục trùng ngôn ngữ lớp ngoài–lõi trong của Essence; hình thức thích ứng với nội dung chưa nổi. |

**Định nghĩa draft hiện dùng:** Nội dung và hình thức thống nhất với nhau; nội dung giữ vai trò quyết định, còn hình thức có tính độc lập tương đối và tác động trở lại nội dung.

**Focus:** Xem cách tổ chức biểu đạt hỗ trợ hoặc cản trở nội dung thực chất và sự phù hợp giữa nội dung với hình thức.

**Xuôi:** Tìm cách tổ chức phù hợp để nội dung và năng lực thực chất được thể hiện rõ hơn.

**Ngược:** Bạn có thể đang chăm chút vẻ ngoài trong khi nội dung chưa vững, hoặc có nội dung tốt nhưng cách tổ chức gây cản trở.

**Điều cần kiểm tra:**

- Nội dung thực chất nào cần được thể hiện để đạt mục tiêu?
- Cách tổ chức hiện tại đang hỗ trợ hay cản trở nội dung?
- Bạn đã kiểm tra riêng chất lượng nội dung và sự phù hợp của hình thức chưa?

**Phương pháp / sai lầm:** Kiểm tra riêng chất lượng nội dung và cách tổ chức; sửa điểm đang cản trở mục tiêu. / Đánh đồng vẻ ngoài chỉn chu với chất lượng thực chất.

**Ví dụ:** Một bài thuyết trình cần cả lập luận có cơ sở và cấu trúc giúp người nghe theo dõi.

**Chủ đề đang gắn:** Phép biện chứng · Nội dung — Hình thức (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 12 — The Essence

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                                               |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Essence · the-essence · 12 — đúng S1, duy nhất                                                                                                                                                    |
| concept                               | Bản chất — Hiện tượng — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                                           |
| group                                 | Phép biện chứng — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                                                  |
| keywords                              | bản chất · biểu hiện · đào sâu — ‘Đào sâu’ là thao tác/văn phong, bản chất/biểu hiện bám phạm vi. Không tự bổ sung thuật ngữ ngoài nguồn.                                                             |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Nêu bộc lộ qua hiện tượng, chưa định nghĩa bản chất hay hiện tượng; cần slide kiểm tra mức độ đầy đủ.                                                        |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                                                 |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Có tránh kết luận từ dấu hiệu nổi; ngược chuyển sang nhiều tầng nguyên nhân dễ giao The Cause. Focus mới đặt trọng tâm quan hệ bên trong/biểu hiện.                            |
| checkQuestions                        | Có 3 câu. Nhiều quan sát, tránh dấu hiệu đơn và xét mối liên hệ bên trong; không đồng nhất ba dấu hiệu thành đã biết bản chất.                                                                        |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Con số ba là gợi ý quan sát của dự án, không ngưỡng học thuật để kết luận bản chất.                                                                             |
| realLifeExample                       | Có nội dung. Một lần trì hoãn không đủ gán bản chất là minh họa về giới hạn kết luận.                                                                                                                 |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                                             |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                                                         |
| artwork semantic match                | **WEAK MATCH** — Các lớp che mặt có chiều sâu, nhưng chân dung Engels dễ thành chủ đề chính và gần Form ở motif lõi/vỏ. Có tín hiệu hiện tượng che điều sâu hơn, chưa rõ quan hệ bản chất–hiện tượng. |

**Định nghĩa draft hiện dùng:** Bản chất bộc lộ qua hiện tượng nhưng không đồng nhất với một biểu hiện đơn lẻ; nhận thức cần đi từ hiện tượng đến bản chất.

**Focus:** Đối chiếu nhiều biểu hiện với mối liên hệ bên trong; tránh gọi một dấu hiệu bề ngoài là bản chất.

**Xuôi:** Đừng kết luận từ vẻ ngoài đầu tiên. Hãy tìm cấu trúc đang lặp lại phía sau những dấu hiệu.

**Ngược:** Bạn có thể đang dùng một nhãn dán để thay cho phân tích. Một hiện tượng có thể có nhiều tầng nguyên nhân.

**Điều cần kiểm tra:**

- Những biểu hiện nào lặp lại qua nhiều lần quan sát?
- Một dấu hiệu đơn lẻ có đủ cơ sở cho kết luận của bạn không?
- Mối liên hệ bên trong nào có thể giải thích các biểu hiện đó?

**Phương pháp / sai lầm:** Thu thập ba biểu hiện khác nhau trước khi kết luận. / Chọn một dấu hiệu nổi bật rồi gọi đó là bản chất.

**Ví dụ:** Một lần trì hoãn chưa nói lên bản chất của thái độ làm việc.

**Chủ đề đang gắn:** Phép biện chứng · Bản chất — Hiện tượng (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Friedrich Engels. Brief artwork 12 chỉ yêu cầu mặt người/ảnh archival, không nêu lý do gắn Engels riêng với cặp phạm trù này. Gán ghép hiện tại chưa có căn cứ môn học. **UNSUPPORTED BY PROVIDED COURSE MATERIAL**; chỉ báo cáo, không thay portrait.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 13 — The Possibility

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Possibility · the-possibility · 13 — đúng S1, duy nhất                                                                               |
| concept                               | Khả năng — Hiện thực — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                               |
| group                                 | Phép biện chứng — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                     |
| keywords                              | tiềm năng · điều kiện · lựa chọn — Tiềm năng/điều kiện/lựa chọn liên quan nhưng ‘lựa chọn’ dễ generic; chưa có tài liệu xác nhận.        |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Chỉ nêu điều kiện hiện thực hóa, chưa định nghĩa khả năng và hiện thực. Cần đối chiếu theo môn. |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                    |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Giữ khác biệt mong ước/khả năng có điều kiện; không khẳng định mọi khả năng đều sẽ thành hiện thực.               |
| checkQuestions                        | Có 3 câu. Căn cứ, điều kiện khách/chủ quan và hoạt động tạo điều kiện bám nội dung hiện có; không chỉ tích lũy ngưỡng như Leap.          |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Điều kiện cần và dấu hiệu chín là thao tác minh họa, chưa xác nhận tiêu chí trong lớp.             |
| realLifeExample                       | Có nội dung. Chuyển ngành cần dữ liệu và kế hoạch là liên hệ có giới hạn.                                                                |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                            |
| artwork semantic match                | **WEAK MATCH** — Hình tiềm ẩn/đường đi/khối treo tạo ẩn dụ becoming nhưng chưa thấy điều kiện nối đến một hình hiện thực hóa rõ ràng.    |

**Định nghĩa draft hiện dùng:** Khả năng chỉ trở thành hiện thực khi có những điều kiện khách quan và chủ quan phù hợp.

**Focus:** Kiểm tra căn cứ của khả năng và điều kiện để thành hiện thực; phân biệt khả năng thực tế với mong ước.

**Xuôi:** Có nhiều khả năng, nhưng không phải khả năng nào cũng đã sẵn sàng. Chọn điều có thể bắt đầu bằng điều kiện hiện tại.

**Ngược:** Bạn có thể đang nhầm mong ước với khả năng thực tế, hoặc bỏ qua một khả năng vì chưa thấy lối đi đầu tiên.

**Điều cần kiểm tra:**

- Khả năng bạn đang xét có căn cứ thực tế nào?
- Điều kiện khách quan và chủ quan nào còn thiếu?
- Hoạt động nào có thể tạo điều kiện để khả năng thành hiện thực?

**Phương pháp / sai lầm:** Liệt kê điều kiện cần và dấu hiệu cho thấy khả năng đã chín. / Đánh giá khả năng mà không xét điều kiện.

**Ví dụ:** Chuyển ngành là khả năng cần dữ liệu, thời gian và kế hoạch chuyển tiếp.

**Chủ đề đang gắn:** Phép biện chứng · Khả năng — Hiện thực (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 14 — The Practice

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Practice · the-practice · 14 — đúng S1, duy nhất                                                                                                                    |
| concept                               | Thực tiễn — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                         |
| group                                 | Lý luận nhận thức — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                  |
| keywords                              | hành động · kiểm nghiệm · cải tạo — Hành động/kiểm nghiệm/cải tạo bám dự án; không khẳng định mọi hành động đều là thực tiễn theo định nghĩa môn.                       |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Đoạn liệt kê vai trò của thực tiễn, chưa định nghĩa phạm trù. Cần tài liệu định nghĩa và các loại hoạt động trước khi bổ sung. |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                   |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Xuôi/ngược phân biệt đọc thêm và kiểm nghiệm; ‘tri thức sống’ là cách viết dự án. Không suy ra cứ hành động là kiến thức đúng.                   |
| checkQuestions                        | Có 3 câu. Ba câu hoạt động thử, quan sát kết quả và điều chỉnh nhận thức bám hướng ví dụ audit.                                                                         |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Thử nghiệm nhỏ có hạn là ứng dụng, không thay thế toàn bộ vai trò thực tiễn.                                                      |
| realLifeExample                       | Có nội dung. Thử cách học hai tuần là đề xuất, chưa là ví dụ môn đã được xác nhận.                                                                                      |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                               |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                           |
| artwork semantic match                | **GOOD MATCH** — Bàn tay và công cụ tác động lên cấu trúc, hành động là điểm nhìn chính; phản hồi kiểm nghiệm còn chủ yếu nằm trong dòng chữ.                           |

**Định nghĩa draft hiện dùng:** Thực tiễn là cơ sở, động lực, mục đích của nhận thức và là tiêu chuẩn kiểm nghiệm chân lý.

**Focus:** Xác định giả định có thể thử bằng hành động và kết quả quan sát được để kiểm chứng hoặc điều chỉnh nhận thức.

**Xuôi:** Một ý tưởng cần đi qua hành động nhỏ để trở thành tri thức sống. Hãy thử trong phạm vi an toàn và đo kết quả.

**Ngược:** Bạn có thể đang đọc thêm để trì hoãn việc thử. Kiến thức chưa đi vào thực tiễn vẫn chưa được kiểm nghiệm.

**Điều cần kiểm tra:**

- Nhận định này đã được kiểm nghiệm bằng hoạt động thực tế chưa?
- Bạn có thể thử điều gì trong phạm vi nhỏ và quan sát kết quả nào?
- Kết quả thực tiễn nào sẽ khiến bạn điều chỉnh cách hiểu?

**Phương pháp / sai lầm:** Thiết kế một thử nghiệm nhỏ có thời hạn. / Nhầm cảm giác hiểu với năng lực làm được.

**Ví dụ:** Đổi phương pháp học trong hai tuần và theo dõi chất lượng ghi nhớ.

**Chủ đề đang gắn:** Lý luận nhận thức · Thực tiễn (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Karl Marx. Brief artwork 14 cho phép dùng archival gắn thực tiễn, nhưng không có đoạn MLN111 chứng minh liên hệ cụ thể; giữ và báo cần kiểm chứng. **UNSUPPORTED BY PROVIDED COURSE MATERIAL**; chỉ báo cáo, không thay portrait.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 15 — The Truth

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Truth · the-truth · 15 — đúng S1, duy nhất                                                                                                                   |
| concept                               | Chân lý — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                    |
| group                                 | Lý luận nhận thức — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                           |
| keywords                              | khách quan · cụ thể · kiểm chứng — Khách quan/cụ thể/kiểm chứng bám bản biên soạn nhưng giao Reality/Practice; focus mới xét kết luận đúng trong điều kiện nào.  |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Cụm ‘cụ thể, lịch sử’ cần đối chiếu các đặc tính chân lý trong tài liệu, không tự xác nhận hay bổ sung tính chất.       |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                            |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Ngược có nguy cơ giáo điều với kết luận cũ; chưa coi sai/kết luận bất lợi là lá xấu.                                                      |
| checkQuestions                        | Có 3 câu. Ba câu xét sự phù hợp, phạm vi thời điểm và cập nhật bằng chứng; phân biệt với chỉ kiểm kê điều kiện khách quan.                                       |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Ghi điều kiện và bằng chứng là thao tác phù hợp focus dự án, chưa đủ kiểm chứng định nghĩa.                                |
| realLifeExample                       | Có nội dung. Cách học cũ/môn mới minh họa giới hạn kết luận, chưa là ví dụ xác nhận từ giáo trình.                                                               |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                        |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                    |
| artwork semantic match                | **TOO GENERIC** — Vòng mục tiêu/aperture có thể đọc như la bàn hoặc một điểm chắc chắn. Chưa có bề mặt đối chiếu nhận thức với thực tế hay dấu hiệu tính cụ thể. |

**Định nghĩa draft hiện dùng:** Chân lý là tri thức phù hợp với hiện thực khách quan và luôn mang tính cụ thể, lịch sử.

**Focus:** Đánh giá tri thức hoặc kết luận có phù hợp hiện thực khách quan trong phạm vi, thời điểm và điều kiện cụ thể hay không.

**Xuôi:** Một kết luận đúng cần đúng với điều kiện cụ thể. Hãy cập nhật nhận định khi hiện thực thay đổi.

**Ngược:** Bạn có thể đang giữ một kết luận cũ như chân lý bất biến. Kiểm tra thời điểm và phạm vi đúng của nó.

**Điều cần kiểm tra:**

- Kết luận này phù hợp với những dữ kiện khách quan nào?
- Kết luận đúng trong điều kiện, thời điểm và phạm vi nào?
- Bằng chứng thực tiễn mới có yêu cầu bạn cập nhật kết luận không?

**Phương pháp / sai lầm:** Ghi rõ điều kiện, thời điểm và bằng chứng của kết luận. / Biến kinh nghiệm riêng thành quy luật chung.

**Ví dụ:** Một cách học từng hiệu quả chưa chắc phù hợp với môn học mới.

**Chủ đề đang gắn:** Lý luận nhận thức · Chân lý (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 16 — The Ascent

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                                 |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Ascent · the-ascent · 16 — đúng S1, duy nhất                                                                                                                                        |
| concept                               | Quá trình nhận thức — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                               |
| group                                 | Lý luận nhận thức — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                                  |
| keywords                              | cảm tính · lý tính · thực tiễn — Cảm tính/lý tính/thực tiễn bám trình tự dự án; cần kiểm tra quan hệ các thuật ngữ với giáo trình.                                                      |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Câu trực quan sinh động → tư duy trừu tượng → thực tiễn không gắn tác giả trong dataset. Không tự biến thành trích dẫn Lenin hay tạo số trang. |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                                   |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Có nhấn chuyển quan sát sang mô hình và thử; khác Practice là kiểm tra cả các bước nhận thức.                                                                    |
| checkQuestions                        | Có 3 câu. Ba câu theo quan sát/khái quát/trở lại thử, có cấu trúc riêng. Chưa kiểm chứng nguồn của chu trình.                                                                           |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Quan sát → khái quát → thử → cập nhật là sơ đồ ứng dụng dự án.                                                                                    |
| realLifeExample                       | Có nội dung. Phân tích dữ liệu làm bài rồi thử chiến lược là ví dụ, không phải bằng chứng học thuật.                                                                                    |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                               |
| context limitations                   | Mảng rỗng: không thêm cấm theo ngữ cảnh hẹp; mọi ứng dụng vẫn cần dữ kiện và điều kiện cụ thể                                                                                           |
| artwork semantic match                | **WEAK MATCH** — Ba node và mũi tên thể hiện nhiều giai đoạn, nhưng vòng trở về thực tiễn chưa rõ; đường đi cong giống Chance.                                                          |

**Định nghĩa draft hiện dùng:** Nhận thức vận động từ trực quan sinh động đến tư duy trừu tượng rồi trở về thực tiễn.

**Focus:** Kiểm tra sự nối tiếp giữa quan sát cụ thể, khái quát và trở lại thực tiễn; nhận diện bước nhận thức đang bị bỏ qua.

**Xuôi:** Bạn đang cần chuyển từ cảm giác ban đầu sang một mô hình hiểu biết, rồi quay lại thử nó trong đời sống.

**Ngược:** Một trong hai phía đang bị bỏ qua: dữ liệu sống động hoặc việc khái quát. Đừng dừng ở ấn tượng.

**Điều cần kiểm tra:**

- Bạn đã có những quan sát cụ thể nào trước khi khái quát?
- Cách hiểu khái quát của bạn giải thích các quan sát ra sao?
- Bạn sẽ trở lại thực tiễn để kiểm nghiệm cách hiểu bằng việc gì?

**Phương pháp / sai lầm:** Quan sát → khái quát → thử nghiệm → cập nhật. / Tin rằng một trực giác hoặc một lý thuyết đã đủ.

**Ví dụ:** Từ cảm giác học kém, phân tích dữ liệu làm bài, rồi thử một chiến lược mới.

**Chủ đề đang gắn:** Lý luận nhận thức · Quá trình nhận thức (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Không có hạn chế bổ sung ngoài dữ kiện, điều kiện và rào chắn sản phẩm.

**Nhân vật:** Vladimir Lenin. Brief artwork 16 cho phép tham chiếu archival; không có trích đoạn lớp để xác nhận tác giả/quan hệ riêng với lá. **UNSUPPORTED BY PROVIDED COURSE MATERIAL**; chỉ báo cáo, không thay portrait.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Không tự thêm định nghĩa hoặc quotation từ trí nhớ.

### 17 — The Forces

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Forces · the-forces · 17 — đúng S1, duy nhất                                                                                                                                          |
| concept                               | Lực lượng sản xuất — Quan hệ sản xuất — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                               |
| group                                 | Con người & xã hội — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                                   |
| keywords                              | nguồn lực · công cụ · quan hệ — Nguồn lực/công cụ/quan hệ quá rộng, dễ biến quan hệ sản xuất thành phối hợp nhóm. Cần tài liệu thuật ngữ rồi mới thay.                                    |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Đoạn chỉ nói tác động lẫn nhau và phù hợp tương đối, chưa định nghĩa hai phạm trù hoặc quan hệ được học; chưa có nguồn để sửa.                   |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                                     |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Cả xuôi/ngược đang nói năng lực, ma sát và cấu trúc phối hợp chung. Đây là điểm cần sửa học thuật, không chứng nhận nhóm giỏi/thiếu quy trình là quan hệ sản xuất. |
| checkQuestions                        | Có 3 câu. Ba câu hỏi công việc/công cụ/quy tắc phối hợp chưa đủ phân biệt tổ chức sản xuất với mọi nhóm. Mới thêm guard phạm vi, chưa viết lại câu học thuật.                             |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Tách năng lực/công cụ/quy tắc quá generic; cần nguồn xác định đối tượng và ý nghĩa phương pháp luận.                                                |
| realLifeExample                       | Có nội dung. Nhóm có người giỏi thiếu quy trình là ẩn dụ quản trị. Không dùng như ví dụ định nghĩa học thuật; cần thay từ tài liệu sản xuất thật.                                         |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                                 |
| context limitations                   | Có giới hạn xã hội, scope kiểm tra ở backend/fallback; không thay lá đã chọn                                                                                                              |
| artwork semantic match                | **WEAK MATCH** — Hai tam giác và đường node thể hiện capacity/relation chung, thiếu hoạt động sản xuất, công cụ và tổ chức sản xuất rõ; chân dung Marx không bổ sung nghĩa còn thiếu.     |

**Định nghĩa draft hiện dùng:** Lực lượng sản xuất và quan hệ sản xuất tác động lẫn nhau; sự phù hợp tương đối tạo điều kiện cho phát triển.

**Focus:** Xem sự phù hợp và tác động lẫn nhau giữa lực lượng sản xuất với quan hệ sản xuất trong bối cảnh sản xuất được nêu.

**Xuôi:** Hãy nhìn cả năng lực/công cụ và cách phối hợp giữa người với người. Một phía đổi mà phía kia không đổi có thể tạo ma sát.

**Ngược:** Bạn có thể đổ lỗi cho năng lực cá nhân trong khi cấu trúc phối hợp đang cản trở.

**Điều cần kiểm tra:**

- Năng lực và công cụ hiện có phù hợp với cách tổ chức công việc không?
- Quy tắc phối hợp nào đang hỗ trợ hoặc cản trở việc sử dụng nguồn lực?
- Khi công cụ thay đổi, quan hệ phối hợp cần được điều chỉnh như thế nào?

**Phương pháp / sai lầm:** Tách vấn đề thành năng lực, công cụ và quy tắc phối hợp. / Cá nhân hóa một vấn đề mang tính hệ thống.

**Ví dụ:** Một nhóm có người giỏi nhưng thiếu quy trình vẫn dễ trì trệ.

**Chủ đề đang gắn:** Con người & xã hội · Lực lượng sản xuất — Quan hệ sản xuất (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Câu hỏi tình cảm hoặc thói quen cá nhân không nêu hoạt động sản xuất hay quan hệ tổ chức sản xuất. Chỉ có năng lực cá nhân hoặc phối hợp nhóm; chưa đủ để đồng nhất với lực lượng sản xuất — quan hệ sản xuất.

**Nhân vật:** Karl Marx. Brief artwork 17 cho phép archival; association có chủ đích thiết kế nhưng chưa được chứng minh bằng tài liệu MLN111 cung cấp. **UNSUPPORTED BY PROVIDED COURSE MATERIAL**; chỉ báo cáo, không thay portrait.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Ưu tiên phạm vi xã hội/lịch sử và ví dụ có nguồn, không viết lại thành self-help.

### 18 — The Structure

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Structure · the-structure · 18 — đúng S1, duy nhất                                                                                                                                                                 |
| concept                               | Cơ sở hạ tầng — Kiến trúc thượng tầng — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                                            |
| group                                 | Con người & xã hội — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                                                                |
| keywords                              | nền tảng · thiết chế · ý thức — Nền tảng/thiết chế/ý thức quá rộng; ‘nền tảng’ dễ bị hiểu vật lý hoặc lịch sinh hoạt.                                                                                                  |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Đoạn cơ sở kinh tế/thượng tầng được giữ; cần nguồn kiểm chứng định nghĩa cơ sở hạ tầng và kiến trúc thượng tầng, không tự suy từ hình tòa nhà.                                |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                                                                  |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Khẩu hiệu/niềm tin/điều kiện nền dùng cho mọi thói quen khiến mất phạm vi kinh tế–xã hội. Giới hạn ngữ cảnh mới ngăn ép vào cá nhân.                                                            |
| checkQuestions                        | Có 3 câu. Có kinh tế ở câu 1 nhưng câu 2–3 quy tắc/điều kiện nền còn quá rộng; cần đối chiếu đối tượng trong giáo trình.                                                                                               |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. ‘Nền tảng khiến cách này tồn tại’ không đủ phân biệt với Reality; focus mới chỉ định cơ sở kinh tế và thượng tầng.                                                               |
| realLifeExample                       | Có nội dung. Lịch/công cụ/cam kết nhóm không được coi là định nghĩa hai phạm trù; cần thay ví dụ có nguồn xã hội.                                                                                                      |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                                                              |
| context limitations                   | Có giới hạn xã hội, scope kiểm tra ở backend/fallback; không thay lá đã chọn                                                                                                                                           |
| artwork semantic match                | **MISLEADING** — Tòa nhà trên các tầng gợi rất mạnh nghĩa xây dựng vật lý của cơ sở hạ tầng; tác động qua lại kinh tế/thiết chế chưa thấy. Đây là nguy cơ hiểu sai biểu tượng, không kết luận định nghĩa hiện tại sai. |

**Định nghĩa draft hiện dùng:** Cơ sở kinh tế giữ vai trò quyết định đối với kiến trúc thượng tầng, đồng thời kiến trúc thượng tầng tác động trở lại cơ sở.

**Focus:** Xem quan hệ giữa cơ sở kinh tế với kiến trúc thượng tầng và sự tác động trở lại trong bối cảnh xã hội cụ thể.

**Xuôi:** Muốn thay đổi một kết quả bền vững, hãy nhìn nền tảng vật chất và những quy tắc/niềm tin đang nâng đỡ nó.

**Ngược:** Bạn có thể chỉ sửa khẩu hiệu hoặc biểu hiện mà chưa chạm vào điều kiện nền.

**Điều cần kiểm tra:**

- Nền tảng vật chất và kinh tế nào đang duy trì cách tổ chức hiện tại?
- Quy tắc và quan niệm đang tác động trở lại nền tảng đó ra sao?
- Thay đổi biểu hiện bên ngoài đã đi kèm thay đổi điều kiện nền chưa?

**Phương pháp / sai lầm:** Hỏi: nền tảng nào đang khiến cách này tồn tại? / Tin rằng chỉ cần đổi thái độ là đủ.

**Ví dụ:** Đổi thói quen làm việc cần cả lịch, công cụ và cam kết của nhóm.

**Chủ đề đang gắn:** Con người & xã hội · Cơ sở hạ tầng — Kiến trúc thượng tầng (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Thói quen, lịch sinh hoạt hoặc công cụ cá nhân chưa có bối cảnh kinh tế và thiết chế xã hội. Không đồng nhất cơ sở hạ tầng với một nền móng vật lý hay quy trình nhóm.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Ưu tiên phạm vi xã hội/lịch sử và ví dụ có nguồn, không viết lại thành self-help.

### 19 — The Society

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                              |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Society · the-society · 19 — đúng S1, duy nhất                                                                                                                   |
| concept                               | Tồn tại xã hội — Ý thức xã hội — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                 |
| group                                 | Con người & xã hội — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                              |
| keywords                              | đời sống · chuẩn mực · tập thể — Đời sống/chuẩn mực/tập thể thu hẹp vào áp lực nhóm, cần kiểm tra đầy đủ đối tượng xã hội.                                           |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Quan hệ quyết định/độc lập tương đối/tác động lại có trong bản dự án; cần định nghĩa từng phạm trù từ nguồn lớp.            |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. ‘Niềm tin cá nhân luôn có lịch sử xã hội’ và tự trách vì môi trường là suy rộng chưa có căn cứ. Không suy áp lực xã hội từ một cảm xúc riêng. |
| checkQuestions                        | Có 3 câu. Đời sống, quan niệm và chuẩn mực bám hướng hiện có, nhưng cần xác minh quy mô xã hội thay vì chỉ cảm giác phải làm của cá nhân.                            |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Nhận diện một chuẩn mực là thao tác minh họa, không thay thế phân tích tồn tại xã hội/ý thức xã hội.                           |
| realLifeExample                       | Có nội dung. Chuẩn năng suất trên nền tảng số là giả thuyết cần dữ kiện, không giải thích nguyên nhân đã được chứng minh.                                            |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                            |
| context limitations                   | Có giới hạn xã hội, scope kiểm tra ở backend/fallback; không thay lá đã chọn                                                                                         |
| artwork semantic match                | **WEAK MATCH** — Nhà cửa/người thể hiện môi trường sống nhưng chưa có lớp biểu hiện ý thức xã hội và tác động lại; dễ đọc như minh họa đô thị chung.                 |

**Định nghĩa draft hiện dùng:** Tồn tại xã hội quyết định ý thức xã hội, trong khi ý thức xã hội có tính độc lập tương đối và tác động trở lại đời sống.

**Focus:** Xem điều kiện đời sống xã hội liên hệ với ý thức xã hội, tính độc lập tương đối và sự tác động trở lại của ý thức xã hội.

**Xuôi:** Niềm tin cá nhân luôn có lịch sử xã hội. Nhìn bối cảnh giúp bạn vừa hiểu mình vừa thấy khả năng thay đổi.

**Ngược:** Bạn có thể tự trách mình vì một áp lực được tạo bởi môi trường rộng hơn.

**Điều cần kiểm tra:**

- Điều kiện đời sống nào góp phần hình thành quan niệm hiện tại?
- Quan niệm ấy đang tác động trở lại hoạt động của bạn như thế nào?
- Áp lực nào đến từ chuẩn mực xã hội, áp lực nào là nhu cầu đã được bạn xem xét?

**Phương pháp / sai lầm:** Nhận diện một chuẩn mực đang định hướng lựa chọn. / Coi áp lực xã hội là mong muốn hoàn toàn riêng tư.

**Ví dụ:** Cảm giác phải luôn năng suất có thể đến từ chuẩn mực của nhóm và nền tảng số.

**Chủ đề đang gắn:** Con người & xã hội · Tồn tại xã hội — Ý thức xã hội (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Cảm xúc hay niềm tin riêng tư chưa có dữ kiện về điều kiện đời sống và quan niệm xã hội. Không suy ra nguyên nhân xã hội của mọi suy nghĩ cá nhân khi chưa có bằng chứng.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Ưu tiên phạm vi xã hội/lịch sử và ví dụ có nguồn, không viết lại thành self-help.

### 20 — The Human

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Human · the-human · 20 — đúng S1, duy nhất                                                                                                                                    |
| concept                               | Con người và bản chất con người — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                             |
| group                                 | Con người & xã hội — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                           |
| keywords                              | xã hội · lịch sử · hoạt động — Xã hội/lịch sử/hoạt động bám đối tượng, nhưng thiếu nguồn kiểm tra cách diễn đạt bản chất con người.                                               |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Tự nhiên–xã hội và quan hệ cụ thể được giữ; cần tài liệu xác nhận phần ‘bản chất con người’ mới có trong nhãn, không tự thêm trích Marx. |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                             |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Xuôi/ngược còn phát triển bản thân và nhãn tính cách. Cần giữ phân tích điều kiện/quan hệ xã hội cụ thể khi có nguồn.                                      |
| checkQuestions                        | Có 3 câu. Có hoạt động/quan hệ và tự nhiên/xã hội; ít generic hơn các lá xã hội khác, vẫn chưa có nguồn lớp xác nhận.                                                             |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Chọn hoạt động tạo phẩm chất là gợi ý cá nhân, không được thay định nghĩa con người hoặc bản chất.                                          |
| realLifeExample                       | Có nội dung. Hợp tác tạo tự tin là giả thuyết đời sống; cần ví dụ minh họa có điều kiện xã hội rõ hơn.                                                                            |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                         |
| context limitations                   | Có giới hạn xã hội, scope kiểm tra ở backend/fallback; không thay lá đã chọn                                                                                                      |
| artwork semantic match                | **GOOD MATCH** — Người trung tâm được nối ra các quan hệ xung quanh, tránh hình người cô lập. Dấu quanh chưa nêu loại quan hệ, nên mức khái quát còn rộng.                        |

**Định nghĩa draft hiện dùng:** Con người là thực thể tự nhiên – xã hội, được hình thành trong hoạt động và các quan hệ xã hội cụ thể.

**Focus:** Xem con người trong các điều kiện tự nhiên, hoạt động và quan hệ xã hội cụ thể; tránh quy thành một nhãn tính cách bất biến.

**Xuôi:** Bạn không phải một bản chất cố định. Những hoạt động và quan hệ bạn tham gia đang tạo nên mình.

**Ngược:** Một nhãn dán về tính cách có thể đang che khuất khả năng biến đổi.

**Điều cần kiểm tra:**

- Hoạt động và quan hệ xã hội nào đang hình thành thói quen của bạn?
- Nhu cầu tự nhiên và điều kiện xã hội nào cần được xét cùng nhau?
- Bạn có đang coi một đặc điểm hiện tại là bản chất bất biến?

**Phương pháp / sai lầm:** Chọn một hoạt động có thể tạo ra phẩm chất bạn muốn có. / Nghĩ rằng ‘tôi là người như vậy’ là kết luận cuối cùng.

**Ví dụ:** Thói quen hợp tác mới dần hình thành một phiên bản tự tin hơn.

**Chủ đề đang gắn:** Con người & xã hội · Con người và bản chất con người (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Đoán bản chất hoặc tính cách bất biến của một người từ một hành vi. Thiếu dữ kiện về hoạt động và các quan hệ xã hội của con người đang xét.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Ưu tiên phạm vi xã hội/lịch sử và ví dụ có nguồn, không viết lại thành self-help.

### 21 — The Masses

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Masses · the-masses · 21 — đúng S1, duy nhất                                                                                                                          |
| concept                               | Quần chúng — Cá nhân — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                |
| group                                 | Con người & xã hội — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                   |
| keywords                              | tập thể · vai trò · lịch sử — Tập thể/vai trò/lịch sử có hướng, nhưng tập thể bất kỳ không được tự coi là quần chúng trong lịch sử.                                       |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Quần chúng sáng tạo lịch sử/cá nhân có vai trò là bản biên soạn chưa có chứng cứ lớp; cần kiểm tra phạm vi các khái niệm.        |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                     |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Cả hai framework đang nói tìm người cùng hành động/ôm trách nhiệm/chờ đám đông, rất gần self-help làm nhóm; chưa đủ lens xã hội–lịch sử.           |
| checkQuestions                        | Có 3 câu. Nguồn lực ai, cá nhân/tập thể và ôm trách nhiệm còn chung cho teamwork. Không tự bổ sung câu về lãnh tụ khi chưa có nguồn.                                      |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Phần việc cá nhân/tập thể là quản trị nhóm, cần rà theo nội dung vai trò lịch sử.                                                   |
| realLifeExample                       | Có nội dung. Nhóm học nhỏ tạo kỷ luật chưa chứng minh vai trò quần chúng sáng tạo lịch sử; cần thay ví dụ có nguồn.                                                       |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                 |
| context limitations                   | Có giới hạn xã hội, scope kiểm tra ở backend/fallback; không thay lá đã chọn                                                                                              |
| artwork semantic match                | **GOOD MATCH** — Nhiều người tạo một chuyển động chung, một người khác màu vẫn nằm trong nhóm, không tạo hình tụ tập tuyên truyền. Chưa biểu đạt bối cảnh lịch sử cụ thể. |

**Định nghĩa draft hiện dùng:** Quần chúng là lực lượng sáng tạo lịch sử; cá nhân có vai trò trong những điều kiện và quan hệ xã hội nhất định.

**Focus:** Xem vai trò của quần chúng và cá nhân trong hoạt động xã hội, lịch sử với điều kiện và quan hệ cụ thể.

**Xuôi:** Một thay đổi bền vững cần kết nối cá nhân với năng lực tập thể. Hãy tìm người cùng hành động.

**Ngược:** Bạn có thể ôm toàn bộ trách nhiệm một mình hoặc chờ đám đông quyết định thay mình.

**Điều cần kiểm tra:**

- Thay đổi này cần sự tham gia và nguồn lực của những ai?
- Phần chủ động của cá nhân và điều kiện tập thể liên hệ như thế nào?
- Bạn đang ôm trách nhiệm một mình hay để tập thể quyết định thay mình?

**Phương pháp / sai lầm:** Xác định phần việc cá nhân và nguồn lực tập thể. / Lãng mạn hóa cá nhân tách khỏi điều kiện xã hội.

**Ví dụ:** Một nhóm học nhỏ có thể tạo kỷ luật mà ý chí cá nhân khó duy trì.

**Chủ đề đang gắn:** Con người & xã hội · Quần chúng — Cá nhân (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Nhóm học nhỏ hoặc quyết định cá nhân thiếu bối cảnh hoạt động xã hội, cộng đồng hay lịch sử. Không đồng nhất đám đông bất kỳ với quần chúng sáng tạo lịch sử.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Ưu tiên phạm vi xã hội/lịch sử và ví dụ có nguồn, không viết lại thành self-help.

### 22 — The Turning

**Overall: UNSUPPORTED.** Cấu trúc đầy đủ; học thuật: **UNSUPPORTED BY PROVIDED COURSE MATERIAL**.

| Trường                                | Kết quả                                                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name / id / number                    | The Turning · the-turning · 22 — đúng S1, duy nhất                                                                                                                                    |
| concept                               | Biến đổi xã hội — đúng nhãn yêu cầu; chưa xác nhận cách gọi trong lớp                                                                                                                 |
| group                                 | Con người & xã hội — đúng nhóm sản phẩm theo S1; không suy ra số chương                                                                                                               |
| keywords                              | chuyển hóa · xung đột · lịch sử — Chuyển hóa/xung đột/lịch sử còn gần Conflict/Flow. Không thêm cách mạng vào định nghĩa vì nhãn chỉ là Biến đổi xã hội.                              |
| definition                            | UNSUPPORTED BY PROVIDED COURSE MATERIAL. Mô tả biến đổi xã hội rất rộng; cần nguồn xác định bài/tiểu mục thực sự của MLN111. Không mặc định đây là tên một quy luật hay chương riêng. |
| analysisFocus                         | Đã bổ sung từ brief/draft, khác lens lá khác; cần đối chiếu học thuật                                                                                                                 |
| uprightFramework / reversedFramework  | Có cả hai; giữ nguyên. Xuôi ‘thay đổi nhỏ/dấu hiệu lớn’ thiếu điều kiện xác minh; ngược có nhắc cá nhân không tự đổi hệ thống. Phải tách thay đổi xã hội với chuyện cá nhân.          |
| checkQuestions                        | Có 3 câu. Mâu thuẫn/lực lượng/điều kiện và thay đổi tổ chức là hướng brief audit; cần kiểm tra quy mô và nội dung cụ thể từ lớp.                                                      |
| methodologicalMeaning / commonMistake | Có nội dung, chưa xác minh học thuật. Theo dõi mâu thuẫn/lực lượng/điều kiện phù hợp scope đề xuất; chưa xác nhận là phương pháp luận tiểu mục nào.                                   |
| realLifeExample                       | Có nội dung. Quy tắc nhóm bền không phải biến đổi cấu trúc xã hội; cần thay ví dụ có tài liệu thay vì tự gọi cách mạng.                                                               |
| relatedCourseTopic                    | MISSING DATA về reference lớp. Đã bỏ chương tự suy từ group và gắn marker                                                                                                             |
| context limitations                   | Có giới hạn xã hội, scope kiểm tra ở backend/fallback; không thay lá đã chọn                                                                                                          |
| artwork semantic match                | **WEAK MATCH** — Hai cấu trúc qua vạch threshold tạo chuyển tiếp rõ, nhưng tổ chức xã hội/điều kiện tích lũy chưa đọc được; gần Leap ở motif trước–sau ngưỡng.                        |

**Định nghĩa draft hiện dùng:** Biến đổi xã hội nảy sinh từ những mâu thuẫn và thay đổi trong phương thức con người tổ chức đời sống.

**Focus:** Xem mâu thuẫn, lực lượng và điều kiện làm thay đổi cách tổ chức đời sống xã hội; phân biệt biến động nhất thời với thay đổi cấu trúc.

**Xuôi:** Một thay đổi nhỏ có thể là dấu hiệu của chuyển động lớn hơn. Hãy nhận diện lực lượng và hướng đi của nó.

**Ngược:** Bạn có thể đang coi hiện trạng là vĩnh viễn hoặc tin một thay đổi cá nhân sẽ tự động đổi cả hệ thống.

**Điều cần kiểm tra:**

- Mâu thuẫn nào đang thúc đẩy thay đổi cách tổ chức đời sống?
- Lực lượng và điều kiện nào có thể duy trì sự thay đổi?
- Bạn đang quan sát biến động nhất thời hay thay đổi trong cách tổ chức?

**Phương pháp / sai lầm:** Theo dõi mâu thuẫn, lực lượng và điều kiện chuyển hóa. / Nhầm biến động nhất thời với thay đổi căn bản.

**Ví dụ:** Một quy tắc nhóm mới chỉ bền khi phù hợp với nhu cầu và nguồn lực thực tế.

**Chủ đề đang gắn:** Con người & xã hội · Biến đổi xã hội (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)

**Giới hạn:** Thay đổi sở thích, quyết định nhỏ hay tranh cãi tình cảm không có cấu trúc xã hội liên quan. Không gọi một thay đổi cá nhân hoặc quy tắc nhóm là cách mạng xã hội.

**Nhân vật:** Không có portrait hay metadata gán tác giả ở composition lá này.

**Xử lý tiếp:** đối chiếu định nghĩa và các trường học thuật với tài liệu lớp có vị trí cụ thể; sửa những điểm nêu trong bảng sau khi có bằng chứng. Ưu tiên phạm vi xã hội/lịch sử và ví dụ có nguồn, không viết lại thành self-help.

## 6. Vấn đề artwork và nhân vật

Phân loại chỉ là audit biểu tượng trong screenshot toàn deck và SVG thực tế. **Không sửa artwork**. GOOD MATCH cũng không phải chứng nhận học thuật.

| Lá              | Phân loại                   | Nhân vật         |
| --------------- | --------------------------- | ---------------- |
| The Reality     | TOO GENERIC                 | Vladimir Lenin   |
| The Mind        | GOOD MATCH                  | Không có         |
| The Connection  | GOOD MATCH                  | Không có         |
| The Flow        | GOOD MATCH                  | Không có         |
| The Conflict    | GOOD MATCH                  | Không có         |
| The Leap        | GOOD MATCH                  | Không có         |
| The Spiral      | WEAK MATCH                  | Không có         |
| The Individual  | TOO GENERIC                 | Không có         |
| The Cause       | WEAK MATCH                  | Không có         |
| The Chance      | TOO SIMILAR TO ANOTHER CARD | Không có         |
| The Form        | TOO SIMILAR TO ANOTHER CARD | Không có         |
| The Essence     | WEAK MATCH                  | Friedrich Engels |
| The Possibility | WEAK MATCH                  | Không có         |
| The Practice    | GOOD MATCH                  | Karl Marx        |
| The Truth       | TOO GENERIC                 | Không có         |
| The Ascent      | WEAK MATCH                  | Vladimir Lenin   |
| The Forces      | WEAK MATCH                  | Karl Marx        |
| The Structure   | MISLEADING                  | Không có         |
| The Society     | WEAK MATCH                  | Không có         |
| The Human       | GOOD MATCH                  | Không có         |
| The Masses      | GOOD MATCH                  | Không có         |
| The Turning     | WEAK MATCH                  | Không có         |

Có 5 portrait: Lenin ở Reality/Ascent, Marx ở Practice/Forces, Engels ở Essence. Bốn liên hệ đầu có chỉ dẫn trong brief thiết kế, vẫn thiếu chứng cứ MLN111. **Engels/Essence cần rà riêng** vì không có lý do gắn cá nhân đó với khái niệm trong nguồn đã cung cấp. Không khẳng định Marx/Engels/Lenin là tác giả độc quyền của các khái niệm chỉ vì artwork mang portrait. Không có quote tác giả mới trong dataset.

Ảnh kiểm tra: [toàn deck trước audit](artifacts/dataset-audit/artwork-before.png). Phiên bản SVG hoàn nguyên thay đổi ID/label khớp hash baseline, không có redraw.

## 7. Schema cuối — đối tượng đại diện thực tế

Các trường visual glyph/symbolType và reflection vẫn ở dữ liệu local để giữ rendering/câu hỏi cũ; không gửi provider. Đây là đối tượng thực tế, giữ nguyên văn draft và marker chưa xác minh:

```json
{
  "number": 6,
  "name": "The Leap",
  "concept": "Quy luật Lượng — Chất",
  "group": "Phép biện chứng",
  "keywords": ["tích lũy", "ngưỡng", "bước nhảy"],
  "definition": "Những biến đổi về lượng tích lũy đến một điểm nút sẽ dẫn đến biến đổi về chất; bước nhảy cần điều kiện.",
  "analysisFocus": "Kiểm tra lượng tích lũy, ngưỡng và điều kiện của bước nhảy; phân biệt thay đổi nóng vội với trì hoãn khi đã đủ điều kiện.",
  "uprightFramework": "Những gì bạn đang tích lũy có thể đang tiến gần một ngưỡng mới. Hãy kiên trì nhưng đồng thời xác định điểm cần đổi cách làm.",
  "reversedFramework": "Kiểm tra xem bạn có nóng vội tạo bước nhảy khi điều kiện chưa đủ, hay đã đủ mà vẫn sợ thay đổi.",
  "checkQuestions": [
    "Bạn đang thực sự tích lũy loại lượng nào?",
    "Điều kiện nào đã đủ và điều kiện nào còn thiếu?",
    "Bạn đang nóng vội tạo bước nhảy hay trì hoãn khi điều kiện đã chín muồi?"
  ],
  "methodologicalMeaning": "Đặt một mốc đo lường và một ngưỡng quyết định rõ ràng.",
  "commonMistake": "Đánh đồng nhiều thời gian với tiến bộ thực chất.",
  "realLifeExample": "GPA chưa tăng có thể cần đổi phương pháp sau một chu kỳ thử nghiệm đủ dài.",
  "avoidForContexts": [],
  "id": "the-leap",
  "relatedCourseTopic": "Phép biện chứng · Quy luật Lượng — Chất (theo brief dự án; UNSUPPORTED BY PROVIDED COURSE MATERIAL)",
  "academicSourceStatus": "UNSUPPORTED BY PROVIDED COURSE MATERIAL"
}
```

## 8. Payload Gemini tối thiểu

Selected-card context thực tế cho The Leap ngược tại Góc nhìn:

```json
{
  "cardId": "the-leap",
  "position": "Góc nhìn",
  "name": "The Leap",
  "concept": "Quy luật Lượng — Chất",
  "orientation": "reversed",
  "definition": "Những biến đổi về lượng tích lũy đến một điểm nút sẽ dẫn đến biến đổi về chất; bước nhảy cần điều kiện.",
  "analysisFocus": "Kiểm tra lượng tích lũy, ngưỡng và điều kiện của bước nhảy; phân biệt thay đổi nóng vội với trì hoãn khi đã đủ điều kiện.",
  "orientationFramework": "Kiểm tra xem bạn có nóng vội tạo bước nhảy khi điều kiện chưa đủ, hay đã đủ mà vẫn sợ thay đổi.",
  "checkQuestions": [
    "Bạn đang thực sự tích lũy loại lượng nào?",
    "Điều kiện nào đã đủ và điều kiện nào còn thiếu?",
    "Bạn đang nóng vội tạo bước nhảy hay trì hoãn khi điều kiện đã chín muồi?"
  ],
  "academicSourceStatus": "UNSUPPORTED BY PROVIDED COURSE MATERIAL"
}
```

Envelope request còn câu hỏi, evidenceExcerpts, ngữ cảnh, spread và giọng theo engine có sẵn. Không thêm AI call cho audit học thuật. Với lá xã hội, có avoidForContexts và scopeStatus; khi thiếu context, thêm scopeNotice cần copy để backend kiểm tra. Mảng cards chỉ có những lá đã chọn, đúng thứ tự. Không gửi ví dụ/visual/library/full deck/những chương chưa xác nhận. Marker nguồn ngắn cần thiết để AI không hiểu draft là course evidence.

## 9. Validation và kiểm thử ngữ cảnh

- **A — Completeness cấu trúc:** đúng 22 identity/order/number/group, unique IDs, mọi trường cần thiết có giá trị/mảng; không TODO/placeholder, không definition rỗng. **Completeness học thuật: MISSING DATA** về nguồn/tiểu mục lớp, nên chưa PASS toàn dataset.
- **B — Differentiation:** 22 focus riêng và kiểm tra chủ thể phân tích những nhóm overlap. Đây là kiểm tra lens của dự án; không chứng minh các định nghĩa môn học đúng.
- **C — Reversed:** không có framework chỉ là nhãn xấu/thất bại/thiếu tự tin. Giữ những nguy cơ riêng; vấn đề tâm lý hóa ở Mind/Leap và các lá xã hội được báo chờ revision.
- **D — Check questions:** 3/lá, không trùng trong một lá, câu hỏi dạng kiểm tra, không dùng số phận. Sự grounded vào draft/brief được rà; grounded vào tài liệu MLN111 còn UNSUPPORTED BY PROVIDED COURSE MATERIAL.
- **E — Same question, different cards:** local kiểm tra Reality/Conflict/Leap/Practice/Truth. Live Gemini kiểm tra Reality/Truth/Leap/Practice với câu GPA; các lens lần lượt dữ kiện khách quan, phạm vi đúng của kết luận, loại lượng/điều kiện ngưỡng, thử/quan sát. Có ngôn ngữ kiểm chứng chung vì các khái niệm liên hệ, không coi đó tự động là duplicate.
- **F — Same card, different context:** The Leap ngược dùng cùng fixed object, GPA→kiến thức/phản hồi bài; quan hệ→lần giao tiếp/cam kết/điều kiện; business→lượt thử/phản hồi khách hàng/khả năng phục vụ. Cả 3 live final nhận source ai. Có regression local và phép so sánh object để xác nhận không sửa định nghĩa.
- **Scope regression:** live đầu tiên đã phát hiện provider ép Forces/Turning vào nhắn tin. Sau thêm scope validation, cả 2 final chuyển source local với yêu cầu bối cảnh xã hội rõ; không đổi ID/chiều. Mock kiểm tra repair hợp lệ được chấp nhận, lỗi tiếp bị fallback; không claim chỉ prompt đã loại được mọi sai nghĩa.
- **G — Academic data:** so snapshot xác nhận nguyên văn definition, frameworks, keywords, checks, method, mistake, example. Không thêm quotes/attribution/chapter mới; không dùng web. **Độ đúng của draft cũ chưa được chứng minh**.
- Migration kiểm tra alias cũ/canonical, duplicate aliases bị chặn, record/phiên giữ card order/index/chiều, fingerprint khác phiên bản dataset. Không reroll.

Kết quả kỹ thuật cuối: **59/59 tests passed**, không fail/skip; **lint, typecheck, production build đều passed**. Thư viện đủ 22 lá; nhãn dài và hộp kiến thức The Forces không tràn ngang ở viewport 390px. The Individual hiển thị số 08 với artwork cũ. Regression lá theo ngày giữ identity cũ sau reorder và chuẩn hóa alias đã lưu.

Có **9 ca live final**: 4 ca cùng câu hỏi/khác lá và 3 ca The Leap/khác tình huống trả AI; 2 ca xã hội thiếu phạm vi bị loại và trả fallback có giới hạn. Đây là kết quả theo mẫu kiểm thử, không bảo đảm AI luôn hiểu đúng nghĩa hoặc xác nhận định nghĩa môn học.

Bằng chứng: [validation-summary.json](artifacts/dataset-audit/validation-summary.json), [context-results.json](artifacts/dataset-audit/context-results.json), [22 review đầy đủ](artifacts/dataset-audit/card-audit.json), [schema đại diện](artifacts/dataset-audit/representative-card.json), [payload tối thiểu](artifacts/dataset-audit/minimal-card-context.json), [The Individual sau audit](artifacts/dataset-audit/individual-after.png), [The Forces mobile](artifacts/dataset-audit/forces-mobile.png). Các câu hỏi QA là dữ liệu tổng hợp, không có API key hay raw provider diagnostics. Tab kiểm tra đã đóng và viewport được khôi phục.

## 10. Những việc còn cần tài liệu để chốt học thuật

1. Cung cấp/định vị slide, giáo trình hoặc syllabus MLN111 của lớp. Mỗi lá cần reference mục/đoạn thực tế; chưa tạo mapping chương mới.
2. Đối chiếu các đoạn đang là vai trò/ứng dụng nhưng gọi definition (Practice, Ascent, Leap, Essence, Possibility, Form và các lá xã hội).
3. Ưu tiên Forces, Structure, Society, Human, Masses, Turning: các ví dụ và framework cá nhân/nhóm chưa đủ phạm vi xã hội–lịch sử; scope guard là giới hạn sử dụng, không thay công việc biên soạn học thuật.
4. Kiểm tra Leap ‘sợ thay đổi’, Conflict thiên về dung hòa, Spiral chỉ mô tả phủ định biện chứng, Chance ‘hoàn cảnh bên ngoài’, Truth ‘cụ thể, lịch sử’; không tự thay thuật ngữ trước khi có căn cứ.
5. Rà portrait học thuật và đặc biệt Engels/Essence; audit này giữ nguyên artwork.

**Trạng thái cuối: cấu trúc đã sửa và kiểm thử; dữ liệu học thuật chưa được nghiệm thu. Không công bố PASS học thuật hoặc dùng marker như nội dung đã xác nhận.**
