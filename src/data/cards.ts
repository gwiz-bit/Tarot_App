export type CardGroup =
  | "Thế giới quan"
  | "Phép biện chứng"
  | "Lý luận nhận thức"
  | "Con người & xã hội";
export type CardOrientation = "upright" | "reversed";

export const CARD_DATA_VERSION = "dataset-audit-2026-10-04-v1";
export const ACADEMIC_SOURCE_STATUS = "UNSUPPORTED BY PROVIDED COURSE MATERIAL";

// Course sources were not supplied locally. The audit preserves draft academic
// prose; this marker must stay until actual course evidence has been reviewed.
export type TarotCard = {
  id: string;
  number: number;
  name: string;
  concept: string;
  group: CardGroup;
  keywords: string[];
  definition: string;
  analysisFocus: string;
  uprightFramework: string;
  reversedFramework: string;
  checkQuestions: [string, string] | [string, string, string];
  methodologicalMeaning: string;
  commonMistake: string;
  realLifeExample: string;
  relatedCourseTopic: string;
  avoidForContexts: string[];
  academicSourceStatus: typeof ACADEMIC_SOURCE_STATUS;
  glyph: string;
  symbolType: 0 | 1 | 2;
  reflection: string;
};

const card = (
  data: Omit<TarotCard, "id" | "relatedCourseTopic" | "academicSourceStatus">,
): TarotCard => ({
  ...data,
  id: data.name.toLowerCase().replaceAll(" ", "-"),
  relatedCourseTopic: `${data.group} · ${data.concept} (theo brief dự án; ${ACADEMIC_SOURCE_STATUS})`,
  academicSourceStatus: ACADEMIC_SOURCE_STATUS,
});

export const cards: TarotCard[] = [
  card({
    number: 1,
    name: "The Reality",
    concept: "Vật chất",
    group: "Thế giới quan",
    keywords: ["khách quan", "điều kiện", "hiện thực"],
    definition:
      "Vật chất tồn tại khách quan, độc lập với ý thức; ý thức là sự phản ánh hiện thực trong những điều kiện lịch sử cụ thể.",
    analysisFocus:
      "Xác định dữ kiện, nguồn lực và giới hạn khách quan tồn tại độc lập với mong muốn chủ quan.",
    uprightFramework:
      "Hãy bắt đầu từ những điều đang có thật: nguồn lực, giới hạn và điều kiện cụ thể. Nhìn thẳng vào hiện thực giúp bạn chọn một bước có cơ sở.",
    reversedFramework:
      "Có thể bạn đang để mong muốn hoặc nỗi sợ thay thế cho dữ kiện. Kiểm tra điều gì đã được quan sát, điều gì chỉ là giả định.",
    checkQuestions: [
      "Những dữ kiện nào tồn tại độc lập với mong muốn của bạn?",
      "Nguồn lực và giới hạn khách quan nào cần được xác minh?",
      "Bạn đang phân biệt điều đã quan sát với giả định như thế nào?",
    ],
    methodologicalMeaning:
      "Liệt kê ba dữ kiện khách quan trước khi chọn giải pháp.",
    commonMistake: "Đồng nhất điều mình muốn với điều đang tồn tại.",
    realLifeExample:
      "Một kế hoạch học tập cần tính đến thời gian, sức khỏe và kiến thức nền thay vì chỉ dựa vào quyết tâm.",
    avoidForContexts: [],
    glyph: "◉",
    symbolType: 0,
    reflection:
      "Điều gì trong vấn đề này đang tồn tại độc lập với cách bạn diễn giải nó?",
  }),
  card({
    number: 2,
    name: "The Mind",
    concept: "Ý thức",
    group: "Thế giới quan",
    keywords: ["phản ánh", "mục đích", "sáng tạo"],
    definition:
      "Ý thức là sự phản ánh năng động, sáng tạo hiện thực khách quan và có khả năng tác động trở lại hiện thực thông qua hoạt động của con người.",
    analysisFocus:
      "Xem cách phản ánh và hình dung hiện thực định hướng mục đích, rồi chuyển thành hoạt động cụ thể.",
    uprightFramework:
      "Cách bạn đặt tên và hình dung vấn đề đang mở ra một khả năng hành động. Ý thức rõ ràng cần được chuyển thành việc làm.",
    reversedFramework:
      "Một câu chuyện trong đầu có thể đang trở thành chiếc lồng. Hãy phân biệt điều bạn biết với điều bạn đang tự kể.",
    checkQuestions: [
      "Cách bạn hình dung vấn đề dựa trên dữ kiện nào?",
      "Mục đích của bạn có thể chuyển thành hoạt động cụ thể nào?",
      "Điều gì đang là nhận thức có cơ sở, điều gì chỉ là câu chuyện bạn tự kể?",
    ],
    methodologicalMeaning: "Viết lại vấn đề bằng một mô tả có thể kiểm chứng.",
    commonMistake: "Tin rằng suy nghĩ thay thế được hành động.",
    realLifeExample:
      "Đổi câu ‘mình kém’ thành một câu hỏi về kỹ năng cụ thể có thể rèn luyện.",
    avoidForContexts: [],
    glyph: "◌",
    symbolType: 1,
    reflection: "Cách bạn gọi tên vấn đề đang làm nó rộng ra hay nhỏ lại?",
  }),
  card({
    number: 3,
    name: "The Connection",
    concept: "Mối liên hệ phổ biến",
    group: "Thế giới quan",
    keywords: ["hệ thống", "quan hệ", "bối cảnh"],
    definition:
      "Mọi sự vật tồn tại trong những mối liên hệ phổ biến và điều kiện cụ thể; không có vấn đề nào hoàn toàn biệt lập.",
    analysisFocus:
      "Xác định các yếu tố tác động qua lại và mối liên hệ cần xét trong điều kiện cụ thể của vấn đề.",
    uprightFramework:
      "Một góc nhìn rộng hơn sẽ cho thấy các yếu tố đang tác động lẫn nhau. Hãy nhìn mạng lưới thay vì chỉ tìm một thủ phạm.",
    reversedFramework:
      "Bạn có thể đang tách một sự việc khỏi bối cảnh của nó. Kiểm tra những mối liên hệ bị bỏ quên.",
    checkQuestions: [
      "Những yếu tố nào đang tác động qua lại trong hoàn cảnh này?",
      "Mối liên hệ quan trọng nào đang bị bỏ sót?",
      "Điều kiện cụ thể nào khiến một mối liên hệ trở nên quyết định?",
    ],
    methodologicalMeaning:
      "Vẽ bản đồ ba vòng: bản thân, người khác, hoàn cảnh.",
    commonMistake: "Giải thích mọi thứ bằng một nguyên nhân duy nhất.",
    realLifeExample:
      "Kết quả học tập liên quan đến phương pháp, thời gian, môi trường và sức khỏe.",
    avoidForContexts: [],
    glyph: "∞",
    symbolType: 1,
    reflection: "Mối liên hệ nào đang bị bạn bỏ ra ngoài khung nhìn?",
  }),
  card({
    number: 4,
    name: "The Flow",
    concept: "Sự phát triển",
    group: "Thế giới quan",
    keywords: ["vận động", "kế thừa", "đi lên"],
    definition:
      "Phát triển là quá trình vận động theo khuynh hướng đi lên, trong đó cái mới kế thừa và vượt qua cái cũ.",
    analysisFocus:
      "Đánh giá khuynh hướng biến đổi qua cả quá trình và điều kiện thúc đẩy hoặc cản trở phát triển.",
    uprightFramework:
      "Một bước lùi không nhất thiết là thất bại. Hãy tìm phần đang được tích lũy và điều đã thay đổi về chất.",
    reversedFramework:
      "Bạn có thể đang đòi hỏi tiến bộ theo một đường thẳng. Đánh giá lại nhịp vận động và điều kiện chuyển hóa.",
    checkQuestions: [
      "So với trước, điều gì đã thay đổi và điều gì được kế thừa?",
      "Bạn đang đánh giá cả quá trình hay chỉ một kết quả tức thời?",
      "Điều kiện nào đang thúc đẩy hoặc cản trở sự phát triển?",
    ],
    methodologicalMeaning:
      "So sánh mình hôm nay với chính mình ở một mốc trước đó.",
    commonMistake: "Đo phát triển chỉ bằng kết quả tức thời.",
    realLifeExample:
      "Một kỹ năng mới thường cần nhiều vòng thử, sai và điều chỉnh trước khi thành thạo.",
    avoidForContexts: [],
    glyph: "⟳",
    symbolType: 2,
    reflection: "Điều gì đang âm thầm thay đổi dù chưa hiện ra rõ?",
  }),
  card({
    number: 5,
    name: "The Conflict",
    concept: "Quy luật mâu thuẫn",
    group: "Phép biện chứng",
    keywords: ["đối lập", "lực kéo", "chuyển hóa"],
    definition:
      "Mâu thuẫn là sự thống nhất và đấu tranh của các mặt đối lập, là nguồn gốc và động lực của sự phát triển.",
    analysisFocus:
      "Nhận diện sự thống nhất, đối lập và tác động lẫn nhau của hai mặt; kiểm tra điều kiện chuyển hóa mâu thuẫn.",
    uprightFramework:
      "Hai nhu cầu đối lập đang chỉ ra vấn đề thật. Đừng vội xóa một bên; hãy tìm điều kiện để chuyển hóa mâu thuẫn.",
    reversedFramework:
      "Bạn có thể đang né tránh mặt đối lập hoặc biến nó thành cuộc chiến thắng–thua. Gọi tên lợi ích của cả hai bên.",
    checkQuestions: [
      "Hai mặt đối lập đang cùng tồn tại và tác động lẫn nhau như thế nào?",
      "Nhu cầu nào của mỗi phía cần được làm rõ?",
      "Điều kiện nào có thể làm thay đổi quan hệ giữa hai mặt?",
    ],
    methodologicalMeaning:
      "Viết hai mặt A/B và điều kiện làm chúng có thể cùng tồn tại.",
    commonMistake: "Coi mâu thuẫn là lỗi phải loại bỏ ngay.",
    realLifeExample:
      "Muốn nghỉ ngơi nhưng vẫn muốn tiến bộ cần một nhịp làm việc bền vững, không phải ép một phía biến mất.",
    avoidForContexts: [],
    glyph: "◐",
    symbolType: 0,
    reflection: "Hai lực kéo nào đang cùng tồn tại trong bạn?",
  }),
  card({
    number: 6,
    name: "The Leap",
    concept: "Quy luật Lượng — Chất",
    group: "Phép biện chứng",
    keywords: ["tích lũy", "ngưỡng", "bước nhảy"],
    definition:
      "Những biến đổi về lượng tích lũy đến một điểm nút sẽ dẫn đến biến đổi về chất; bước nhảy cần điều kiện.",
    analysisFocus:
      "Kiểm tra lượng tích lũy, ngưỡng và điều kiện của bước nhảy; phân biệt thay đổi nóng vội với trì hoãn khi đã đủ điều kiện.",
    uprightFramework:
      "Những gì bạn đang tích lũy có thể đang tiến gần một ngưỡng mới. Hãy kiên trì nhưng đồng thời xác định điểm cần đổi cách làm.",
    reversedFramework:
      "Kiểm tra xem bạn có nóng vội tạo bước nhảy khi điều kiện chưa đủ, hay đã đủ mà vẫn sợ thay đổi.",
    checkQuestions: [
      "Bạn đang thực sự tích lũy loại lượng nào?",
      "Điều kiện nào đã đủ và điều kiện nào còn thiếu?",
      "Bạn đang nóng vội tạo bước nhảy hay trì hoãn khi điều kiện đã chín muồi?",
    ],
    methodologicalMeaning:
      "Đặt một mốc đo lường và một ngưỡng quyết định rõ ràng.",
    commonMistake: "Đánh đồng nhiều thời gian với tiến bộ thực chất.",
    realLifeExample:
      "GPA chưa tăng có thể cần đổi phương pháp sau một chu kỳ thử nghiệm đủ dài.",
    avoidForContexts: [],
    glyph: "✦",
    symbolType: 0,
    reflection:
      "Bạn đang thiếu tích lũy, thiếu điều kiện hay thiếu một bước nhảy?",
  }),
  card({
    number: 7,
    name: "The Spiral",
    concept: "Phủ định của phủ định",
    group: "Phép biện chứng",
    keywords: ["vượt qua", "kế thừa", "chu kỳ"],
    definition:
      "Phủ định biện chứng loại bỏ cái lỗi thời và giữ lại yếu tố hợp lý, tạo ra sự phát triển theo đường xoáy ốc.",
    analysisFocus:
      "Xem yếu tố được kế thừa và vượt qua qua các lần phủ định; phân biệt phát triển với lặp lại cách cũ.",
    uprightFramework:
      "Bạn có thể quay lại một câu hỏi cũ ở một trình độ mới. Hãy giữ bài học, bỏ lớp vỏ đã không còn phù hợp.",
    reversedFramework:
      "Sự lặp lại có thể đang chỉ là quay vòng. Tìm điều mới thật sự được tạo ra sau mỗi chu kỳ.",
    checkQuestions: [
      "Yếu tố hợp lý nào của cách cũ cần được giữ lại?",
      "Điều gì đã lỗi thời và cần được vượt qua?",
      "Sau lần thử mới, bạn có thêm điều gì hay chỉ lặp lại cách cũ?",
    ],
    methodologicalMeaning:
      "Tách ‘điều cần giữ’ và ‘điều cần bỏ’ trước khi bắt đầu lại.",
    commonMistake: "Lãng mạn hóa việc quay lại mà không thay đổi điều kiện.",
    realLifeExample:
      "Thử lại một ngành học với hiểu biết mới khác với việc lặp y nguyên cách cũ.",
    avoidForContexts: [],
    glyph: "∿",
    symbolType: 2,
    reflection: "Bạn đang trở lại với vốn hiểu biết nào?",
  }),
  card({
    number: 8,
    name: "The Individual",
    concept: "Cái riêng — Cái chung",
    group: "Phép biện chứng",
    keywords: ["đặc thù", "chung", "đơn nhất"],
    definition:
      "Cái chung tồn tại trong cái riêng, thông qua cái riêng; cái riêng không tồn tại tách khỏi những mối liên hệ với cái chung.",
    analysisFocus:
      "Xem cái chung trong hoàn cảnh riêng; giữ điều kiện đặc thù khi vận dụng kinh nghiệm và tránh khái quát từ một trường hợp.",
    uprightFramework:
      "Tìm quy luật chung nhưng vẫn giữ lại điều kiện đặc thù của tình huống bạn đang sống.",
    reversedFramework:
      "Bạn có thể áp dụng một công thức chung mà bỏ qua hoàn cảnh riêng, hoặc xem trải nghiệm riêng là đúng cho mọi người.",
    checkQuestions: [
      "Điểm chung nào có thể nhận ra trong hoàn cảnh cụ thể này?",
      "Điều kiện riêng nào cần giữ lại khi áp dụng kinh nghiệm chung?",
      "Bạn có đang biến kinh nghiệm cá nhân thành công thức cho mọi người?",
    ],
    methodologicalMeaning:
      "Viết một điểm chung và hai điều kiện riêng trước khi áp dụng kinh nghiệm.",
    commonMistake: "Biến kinh nghiệm cá nhân thành khuôn mẫu cho tất cả.",
    realLifeExample:
      "Cùng một phương pháp học có thể cần điều chỉnh theo kiến thức nền của từng người.",
    avoidForContexts: [],
    glyph: "⊚",
    symbolType: 0,
    reflection:
      "Điều gì ở tình huống này là phổ biến, và điều gì chỉ riêng bạn có?",
  }),
  card({
    number: 9,
    name: "The Cause",
    concept: "Nguyên nhân — Kết quả",
    group: "Phép biện chứng",
    keywords: ["nguyên nhân", "tác động", "hệ quả"],
    definition:
      "Nguyên nhân sinh ra kết quả trong những điều kiện nhất định; một kết quả có thể trở thành nguyên nhân mới.",
    analysisFocus:
      "Truy chuỗi nguyên nhân, điều kiện trung gian và kết quả; kiểm tra căn cứ nhân quả thay vì chỉ sự trùng hợp.",
    uprightFramework:
      "Hãy lần theo chuỗi tác động thay vì chỉ sửa biểu hiện cuối cùng. Một nguyên nhân nhỏ có thể tạo ra hệ quả lớn.",
    reversedFramework:
      "Bạn có thể đang gán kết quả cho một nguyên nhân thuận tiện nhưng chưa đủ. Kiểm tra điều kiện trung gian.",
    checkQuestions: [
      "Có bằng chứng nào cho quan hệ nguyên nhân và kết quả bạn đang nêu?",
      "Điều kiện trung gian nào khiến nguyên nhân tạo ra kết quả?",
      "Bạn có đang nhầm sự trùng hợp với quan hệ nhân quả?",
    ],
    methodologicalMeaning: "Vẽ chuỗi nguyên nhân → điều kiện → kết quả.",
    commonMistake: "Nhầm tương quan với quan hệ nhân quả.",
    realLifeExample:
      "Mất động lực có thể là kết quả của mục tiêu mơ hồ, lịch quá tải hoặc thiếu phản hồi.",
    avoidForContexts: [],
    glyph: "→",
    symbolType: 1,
    reflection: "Điều gì đang là nguyên nhân, và điều gì chỉ là biểu hiện?",
  }),
  card({
    number: 10,
    name: "The Chance",
    concept: "Tất nhiên — Ngẫu nhiên",
    group: "Phép biện chứng",
    keywords: ["quy luật", "ngẫu nhiên", "điều kiện"],
    definition:
      "Tất nhiên do những nguyên nhân cơ bản bên trong quy định; ngẫu nhiên do sự kết hợp của các hoàn cảnh bên ngoài. Chúng thống nhất và có thể chuyển hóa trong những điều kiện nhất định.",
    analysisFocus:
      "Phân biệt xu hướng có cơ sở từ nguyên nhân cơ bản với sự kiện tình cờ trong những điều kiện cụ thể.",
    uprightFramework:
      "Phân biệt xu hướng có cơ sở với một sự kiện tình cờ để chọn điều bạn có thể chủ động chuẩn bị.",
    reversedFramework:
      "Một kết quả may mắn hoặc bất lợi đơn lẻ có thể đang bị bạn xem thành quy luật chắc chắn.",
    checkQuestions: [
      "Kết quả này lặp lại do nguyên nhân cơ bản nào hay chỉ xuất hiện một lần?",
      "Hoàn cảnh bên ngoài nào đã góp phần tạo ra kết quả?",
      "Bạn cần thêm những lần quan sát nào trước khi kết luận một xu hướng?",
    ],
    methodologicalMeaning:
      "Quan sát nhiều lần; ghi điều lặp lại và những điều kiện thay đổi.",
    commonMistake:
      "Gọi mọi kết quả là số phận hoặc mọi sự trùng hợp là quy luật.",
    realLifeExample:
      "Một lần làm bài tốt do trúng phần đã ôn chưa đủ để kết luận đã nắm chắc cả môn.",
    avoidForContexts: [],
    glyph: "⋈",
    symbolType: 1,
    reflection: "Bạn đang dựa vào xu hướng lặp lại hay một sự kiện đơn lẻ?",
  }),
  card({
    number: 11,
    name: "The Form",
    concept: "Nội dung — Hình thức",
    group: "Phép biện chứng",
    keywords: ["cấu trúc", "nội dung", "phù hợp"],
    definition:
      "Nội dung và hình thức thống nhất với nhau; nội dung giữ vai trò quyết định, còn hình thức có tính độc lập tương đối và tác động trở lại nội dung.",
    analysisFocus:
      "Xem cách tổ chức biểu đạt hỗ trợ hoặc cản trở nội dung thực chất và sự phù hợp giữa nội dung với hình thức.",
    uprightFramework:
      "Tìm cách tổ chức phù hợp để nội dung và năng lực thực chất được thể hiện rõ hơn.",
    reversedFramework:
      "Bạn có thể đang chăm chút vẻ ngoài trong khi nội dung chưa vững, hoặc có nội dung tốt nhưng cách tổ chức gây cản trở.",
    checkQuestions: [
      "Nội dung thực chất nào cần được thể hiện để đạt mục tiêu?",
      "Cách tổ chức hiện tại đang hỗ trợ hay cản trở nội dung?",
      "Bạn đã kiểm tra riêng chất lượng nội dung và sự phù hợp của hình thức chưa?",
    ],
    methodologicalMeaning:
      "Kiểm tra riêng chất lượng nội dung và cách tổ chức; sửa điểm đang cản trở mục tiêu.",
    commonMistake: "Đánh đồng vẻ ngoài chỉn chu với chất lượng thực chất.",
    realLifeExample:
      "Một bài thuyết trình cần cả lập luận có cơ sở và cấu trúc giúp người nghe theo dõi.",
    avoidForContexts: [],
    glyph: "▣",
    symbolType: 0,
    reflection:
      "Hình thức hiện tại đang hỗ trợ hay cản trở nội dung bạn muốn thể hiện?",
  }),
  card({
    number: 12,
    name: "The Essence",
    concept: "Bản chất — Hiện tượng",
    group: "Phép biện chứng",
    keywords: ["bản chất", "biểu hiện", "đào sâu"],
    definition:
      "Bản chất bộc lộ qua hiện tượng nhưng không đồng nhất với một biểu hiện đơn lẻ; nhận thức cần đi từ hiện tượng đến bản chất.",
    analysisFocus:
      "Đối chiếu nhiều biểu hiện với mối liên hệ bên trong; tránh gọi một dấu hiệu bề ngoài là bản chất.",
    uprightFramework:
      "Đừng kết luận từ vẻ ngoài đầu tiên. Hãy tìm cấu trúc đang lặp lại phía sau những dấu hiệu.",
    reversedFramework:
      "Bạn có thể đang dùng một nhãn dán để thay cho phân tích. Một hiện tượng có thể có nhiều tầng nguyên nhân.",
    checkQuestions: [
      "Những biểu hiện nào lặp lại qua nhiều lần quan sát?",
      "Một dấu hiệu đơn lẻ có đủ cơ sở cho kết luận của bạn không?",
      "Mối liên hệ bên trong nào có thể giải thích các biểu hiện đó?",
    ],
    methodologicalMeaning:
      "Thu thập ba biểu hiện khác nhau trước khi kết luận.",
    commonMistake: "Chọn một dấu hiệu nổi bật rồi gọi đó là bản chất.",
    realLifeExample:
      "Một lần trì hoãn chưa nói lên bản chất của thái độ làm việc.",
    avoidForContexts: [],
    glyph: "◇",
    symbolType: 0,
    reflection: "Điều gì đang lặp lại dưới những biểu hiện khác nhau?",
  }),
  card({
    number: 13,
    name: "The Possibility",
    concept: "Khả năng — Hiện thực",
    group: "Phép biện chứng",
    keywords: ["tiềm năng", "điều kiện", "lựa chọn"],
    definition:
      "Khả năng chỉ trở thành hiện thực khi có những điều kiện khách quan và chủ quan phù hợp.",
    analysisFocus:
      "Kiểm tra căn cứ của khả năng và điều kiện để thành hiện thực; phân biệt khả năng thực tế với mong ước.",
    uprightFramework:
      "Có nhiều khả năng, nhưng không phải khả năng nào cũng đã sẵn sàng. Chọn điều có thể bắt đầu bằng điều kiện hiện tại.",
    reversedFramework:
      "Bạn có thể đang nhầm mong ước với khả năng thực tế, hoặc bỏ qua một khả năng vì chưa thấy lối đi đầu tiên.",
    checkQuestions: [
      "Khả năng bạn đang xét có căn cứ thực tế nào?",
      "Điều kiện khách quan và chủ quan nào còn thiếu?",
      "Hoạt động nào có thể tạo điều kiện để khả năng thành hiện thực?",
    ],
    methodologicalMeaning:
      "Liệt kê điều kiện cần và dấu hiệu cho thấy khả năng đã chín.",
    commonMistake: "Đánh giá khả năng mà không xét điều kiện.",
    realLifeExample:
      "Chuyển ngành là khả năng cần dữ liệu, thời gian và kế hoạch chuyển tiếp.",
    avoidForContexts: [],
    glyph: "◇",
    symbolType: 1,
    reflection: "Khả năng nào đang có điều kiện để trở thành hiện thực?",
  }),
  card({
    number: 14,
    name: "The Practice",
    concept: "Thực tiễn",
    group: "Lý luận nhận thức",
    keywords: ["hành động", "kiểm nghiệm", "cải tạo"],
    definition:
      "Thực tiễn là cơ sở, động lực, mục đích của nhận thức và là tiêu chuẩn kiểm nghiệm chân lý.",
    analysisFocus:
      "Xác định giả định có thể thử bằng hành động và kết quả quan sát được để kiểm chứng hoặc điều chỉnh nhận thức.",
    uprightFramework:
      "Một ý tưởng cần đi qua hành động nhỏ để trở thành tri thức sống. Hãy thử trong phạm vi an toàn và đo kết quả.",
    reversedFramework:
      "Bạn có thể đang đọc thêm để trì hoãn việc thử. Kiến thức chưa đi vào thực tiễn vẫn chưa được kiểm nghiệm.",
    checkQuestions: [
      "Nhận định này đã được kiểm nghiệm bằng hoạt động thực tế chưa?",
      "Bạn có thể thử điều gì trong phạm vi nhỏ và quan sát kết quả nào?",
      "Kết quả thực tiễn nào sẽ khiến bạn điều chỉnh cách hiểu?",
    ],
    methodologicalMeaning: "Thiết kế một thử nghiệm nhỏ có thời hạn.",
    commonMistake: "Nhầm cảm giác hiểu với năng lực làm được.",
    realLifeExample:
      "Đổi phương pháp học trong hai tuần và theo dõi chất lượng ghi nhớ.",
    avoidForContexts: [],
    glyph: "⌁",
    symbolType: 1,
    reflection: "Bạn có thể kiểm nghiệm suy nghĩ này bằng hành động nào?",
  }),
  card({
    number: 15,
    name: "The Truth",
    concept: "Chân lý",
    group: "Lý luận nhận thức",
    keywords: ["khách quan", "cụ thể", "kiểm chứng"],
    definition:
      "Chân lý là tri thức phù hợp với hiện thực khách quan và luôn mang tính cụ thể, lịch sử.",
    analysisFocus:
      "Đánh giá tri thức hoặc kết luận có phù hợp hiện thực khách quan trong phạm vi, thời điểm và điều kiện cụ thể hay không.",
    uprightFramework:
      "Một kết luận đúng cần đúng với điều kiện cụ thể. Hãy cập nhật nhận định khi hiện thực thay đổi.",
    reversedFramework:
      "Bạn có thể đang giữ một kết luận cũ như chân lý bất biến. Kiểm tra thời điểm và phạm vi đúng của nó.",
    checkQuestions: [
      "Kết luận này phù hợp với những dữ kiện khách quan nào?",
      "Kết luận đúng trong điều kiện, thời điểm và phạm vi nào?",
      "Bằng chứng thực tiễn mới có yêu cầu bạn cập nhật kết luận không?",
    ],
    methodologicalMeaning:
      "Ghi rõ điều kiện, thời điểm và bằng chứng của kết luận.",
    commonMistake: "Biến kinh nghiệm riêng thành quy luật chung.",
    realLifeExample:
      "Một cách học từng hiệu quả chưa chắc phù hợp với môn học mới.",
    avoidForContexts: [],
    glyph: "⊙",
    symbolType: 0,
    reflection: "Kết luận này đúng trong điều kiện nào?",
  }),
  card({
    number: 16,
    name: "The Ascent",
    concept: "Quá trình nhận thức",
    group: "Lý luận nhận thức",
    keywords: ["cảm tính", "lý tính", "thực tiễn"],
    definition:
      "Nhận thức vận động từ trực quan sinh động đến tư duy trừu tượng rồi trở về thực tiễn.",
    analysisFocus:
      "Kiểm tra sự nối tiếp giữa quan sát cụ thể, khái quát và trở lại thực tiễn; nhận diện bước nhận thức đang bị bỏ qua.",
    uprightFramework:
      "Bạn đang cần chuyển từ cảm giác ban đầu sang một mô hình hiểu biết, rồi quay lại thử nó trong đời sống.",
    reversedFramework:
      "Một trong hai phía đang bị bỏ qua: dữ liệu sống động hoặc việc khái quát. Đừng dừng ở ấn tượng.",
    checkQuestions: [
      "Bạn đã có những quan sát cụ thể nào trước khi khái quát?",
      "Cách hiểu khái quát của bạn giải thích các quan sát ra sao?",
      "Bạn sẽ trở lại thực tiễn để kiểm nghiệm cách hiểu bằng việc gì?",
    ],
    methodologicalMeaning: "Quan sát → khái quát → thử nghiệm → cập nhật.",
    commonMistake: "Tin rằng một trực giác hoặc một lý thuyết đã đủ.",
    realLifeExample:
      "Từ cảm giác học kém, phân tích dữ liệu làm bài, rồi thử một chiến lược mới.",
    avoidForContexts: [],
    glyph: "↟",
    symbolType: 2,
    reflection: "Bạn đang đứng ở bước nào của quá trình nhận thức?",
  }),
  card({
    number: 17,
    name: "The Forces",
    concept: "Lực lượng sản xuất — Quan hệ sản xuất",
    group: "Con người & xã hội",
    keywords: ["nguồn lực", "công cụ", "quan hệ"],
    definition:
      "Lực lượng sản xuất và quan hệ sản xuất tác động lẫn nhau; sự phù hợp tương đối tạo điều kiện cho phát triển.",
    analysisFocus:
      "Xem sự phù hợp và tác động lẫn nhau giữa lực lượng sản xuất với quan hệ sản xuất trong bối cảnh sản xuất được nêu.",
    uprightFramework:
      "Hãy nhìn cả năng lực/công cụ và cách phối hợp giữa người với người. Một phía đổi mà phía kia không đổi có thể tạo ma sát.",
    reversedFramework:
      "Bạn có thể đổ lỗi cho năng lực cá nhân trong khi cấu trúc phối hợp đang cản trở.",
    checkQuestions: [
      "Năng lực và công cụ hiện có phù hợp với cách tổ chức công việc không?",
      "Quy tắc phối hợp nào đang hỗ trợ hoặc cản trở việc sử dụng nguồn lực?",
      "Khi công cụ thay đổi, quan hệ phối hợp cần được điều chỉnh như thế nào?",
    ],
    methodologicalMeaning:
      "Tách vấn đề thành năng lực, công cụ và quy tắc phối hợp.",
    commonMistake: "Cá nhân hóa một vấn đề mang tính hệ thống.",
    realLifeExample:
      "Một nhóm có người giỏi nhưng thiếu quy trình vẫn dễ trì trệ.",
    avoidForContexts: [
      "Câu hỏi tình cảm hoặc thói quen cá nhân không nêu hoạt động sản xuất hay quan hệ tổ chức sản xuất.",
      "Chỉ có năng lực cá nhân hoặc phối hợp nhóm; chưa đủ để đồng nhất với lực lượng sản xuất — quan hệ sản xuất.",
    ],
    glyph: "⚙",
    symbolType: 1,
    reflection: "Điều gì trong công cụ và quan hệ đang giới hạn kết quả?",
  }),
  card({
    number: 18,
    name: "The Structure",
    concept: "Cơ sở hạ tầng — Kiến trúc thượng tầng",
    group: "Con người & xã hội",
    keywords: ["nền tảng", "thiết chế", "ý thức"],
    definition:
      "Cơ sở kinh tế giữ vai trò quyết định đối với kiến trúc thượng tầng, đồng thời kiến trúc thượng tầng tác động trở lại cơ sở.",
    analysisFocus:
      "Xem quan hệ giữa cơ sở kinh tế với kiến trúc thượng tầng và sự tác động trở lại trong bối cảnh xã hội cụ thể.",
    uprightFramework:
      "Muốn thay đổi một kết quả bền vững, hãy nhìn nền tảng vật chất và những quy tắc/niềm tin đang nâng đỡ nó.",
    reversedFramework:
      "Bạn có thể chỉ sửa khẩu hiệu hoặc biểu hiện mà chưa chạm vào điều kiện nền.",
    checkQuestions: [
      "Nền tảng vật chất và kinh tế nào đang duy trì cách tổ chức hiện tại?",
      "Quy tắc và quan niệm đang tác động trở lại nền tảng đó ra sao?",
      "Thay đổi biểu hiện bên ngoài đã đi kèm thay đổi điều kiện nền chưa?",
    ],
    methodologicalMeaning: "Hỏi: nền tảng nào đang khiến cách này tồn tại?",
    commonMistake: "Tin rằng chỉ cần đổi thái độ là đủ.",
    realLifeExample:
      "Đổi thói quen làm việc cần cả lịch, công cụ và cam kết của nhóm.",
    avoidForContexts: [
      "Thói quen, lịch sinh hoạt hoặc công cụ cá nhân chưa có bối cảnh kinh tế và thiết chế xã hội.",
      "Không đồng nhất cơ sở hạ tầng với một nền móng vật lý hay quy trình nhóm.",
    ],
    glyph: "▦",
    symbolType: 0,
    reflection: "Nền tảng nào đang chống đỡ vấn đề này?",
  }),
  card({
    number: 19,
    name: "The Society",
    concept: "Tồn tại xã hội — Ý thức xã hội",
    group: "Con người & xã hội",
    keywords: ["đời sống", "chuẩn mực", "tập thể"],
    definition:
      "Tồn tại xã hội quyết định ý thức xã hội, trong khi ý thức xã hội có tính độc lập tương đối và tác động trở lại đời sống.",
    analysisFocus:
      "Xem điều kiện đời sống xã hội liên hệ với ý thức xã hội, tính độc lập tương đối và sự tác động trở lại của ý thức xã hội.",
    uprightFramework:
      "Niềm tin cá nhân luôn có lịch sử xã hội. Nhìn bối cảnh giúp bạn vừa hiểu mình vừa thấy khả năng thay đổi.",
    reversedFramework:
      "Bạn có thể tự trách mình vì một áp lực được tạo bởi môi trường rộng hơn.",
    checkQuestions: [
      "Điều kiện đời sống nào góp phần hình thành quan niệm hiện tại?",
      "Quan niệm ấy đang tác động trở lại hoạt động của bạn như thế nào?",
      "Áp lực nào đến từ chuẩn mực xã hội, áp lực nào là nhu cầu đã được bạn xem xét?",
    ],
    methodologicalMeaning: "Nhận diện một chuẩn mực đang định hướng lựa chọn.",
    commonMistake: "Coi áp lực xã hội là mong muốn hoàn toàn riêng tư.",
    realLifeExample:
      "Cảm giác phải luôn năng suất có thể đến từ chuẩn mực của nhóm và nền tảng số.",
    avoidForContexts: [
      "Cảm xúc hay niềm tin riêng tư chưa có dữ kiện về điều kiện đời sống và quan niệm xã hội.",
      "Không suy ra nguyên nhân xã hội của mọi suy nghĩ cá nhân khi chưa có bằng chứng.",
    ],
    glyph: "◎",
    symbolType: 1,
    reflection: "Môi trường nào đang nói hộ bạn rằng ‘phải’ làm điều này?",
  }),
  card({
    number: 20,
    name: "The Human",
    concept: "Con người và bản chất con người",
    group: "Con người & xã hội",
    keywords: ["xã hội", "lịch sử", "hoạt động"],
    definition:
      "Con người là thực thể tự nhiên – xã hội, được hình thành trong hoạt động và các quan hệ xã hội cụ thể.",
    analysisFocus:
      "Xem con người trong các điều kiện tự nhiên, hoạt động và quan hệ xã hội cụ thể; tránh quy thành một nhãn tính cách bất biến.",
    uprightFramework:
      "Bạn không phải một bản chất cố định. Những hoạt động và quan hệ bạn tham gia đang tạo nên mình.",
    reversedFramework:
      "Một nhãn dán về tính cách có thể đang che khuất khả năng biến đổi.",
    checkQuestions: [
      "Hoạt động và quan hệ xã hội nào đang hình thành thói quen của bạn?",
      "Nhu cầu tự nhiên và điều kiện xã hội nào cần được xét cùng nhau?",
      "Bạn có đang coi một đặc điểm hiện tại là bản chất bất biến?",
    ],
    methodologicalMeaning:
      "Chọn một hoạt động có thể tạo ra phẩm chất bạn muốn có.",
    commonMistake: "Nghĩ rằng ‘tôi là người như vậy’ là kết luận cuối cùng.",
    realLifeExample:
      "Thói quen hợp tác mới dần hình thành một phiên bản tự tin hơn.",
    avoidForContexts: [
      "Đoán bản chất hoặc tính cách bất biến của một người từ một hành vi.",
      "Thiếu dữ kiện về hoạt động và các quan hệ xã hội của con người đang xét.",
    ],
    glyph: "◯",
    symbolType: 0,
    reflection: "Hoạt động nào đang làm bạn trở thành người hôm nay?",
  }),
  card({
    number: 21,
    name: "The Masses",
    concept: "Quần chúng — Cá nhân",
    group: "Con người & xã hội",
    keywords: ["tập thể", "vai trò", "lịch sử"],
    definition:
      "Quần chúng là lực lượng sáng tạo lịch sử; cá nhân có vai trò trong những điều kiện và quan hệ xã hội nhất định.",
    analysisFocus:
      "Xem vai trò của quần chúng và cá nhân trong hoạt động xã hội, lịch sử với điều kiện và quan hệ cụ thể.",
    uprightFramework:
      "Một thay đổi bền vững cần kết nối cá nhân với năng lực tập thể. Hãy tìm người cùng hành động.",
    reversedFramework:
      "Bạn có thể ôm toàn bộ trách nhiệm một mình hoặc chờ đám đông quyết định thay mình.",
    checkQuestions: [
      "Thay đổi này cần sự tham gia và nguồn lực của những ai?",
      "Phần chủ động của cá nhân và điều kiện tập thể liên hệ như thế nào?",
      "Bạn đang ôm trách nhiệm một mình hay để tập thể quyết định thay mình?",
    ],
    methodologicalMeaning: "Xác định phần việc cá nhân và nguồn lực tập thể.",
    commonMistake: "Lãng mạn hóa cá nhân tách khỏi điều kiện xã hội.",
    realLifeExample:
      "Một nhóm học nhỏ có thể tạo kỷ luật mà ý chí cá nhân khó duy trì.",
    avoidForContexts: [
      "Nhóm học nhỏ hoặc quyết định cá nhân thiếu bối cảnh hoạt động xã hội, cộng đồng hay lịch sử.",
      "Không đồng nhất đám đông bất kỳ với quần chúng sáng tạo lịch sử.",
    ],
    glyph: "⋯",
    symbolType: 1,
    reflection: "Ai đang cùng tạo ra hoàn cảnh này với bạn?",
  }),
  card({
    number: 22,
    name: "The Turning",
    concept: "Biến đổi xã hội",
    group: "Con người & xã hội",
    keywords: ["chuyển hóa", "xung đột", "lịch sử"],
    definition:
      "Biến đổi xã hội nảy sinh từ những mâu thuẫn và thay đổi trong phương thức con người tổ chức đời sống.",
    analysisFocus:
      "Xem mâu thuẫn, lực lượng và điều kiện làm thay đổi cách tổ chức đời sống xã hội; phân biệt biến động nhất thời với thay đổi cấu trúc.",
    uprightFramework:
      "Một thay đổi nhỏ có thể là dấu hiệu của chuyển động lớn hơn. Hãy nhận diện lực lượng và hướng đi của nó.",
    reversedFramework:
      "Bạn có thể đang coi hiện trạng là vĩnh viễn hoặc tin một thay đổi cá nhân sẽ tự động đổi cả hệ thống.",
    checkQuestions: [
      "Mâu thuẫn nào đang thúc đẩy thay đổi cách tổ chức đời sống?",
      "Lực lượng và điều kiện nào có thể duy trì sự thay đổi?",
      "Bạn đang quan sát biến động nhất thời hay thay đổi trong cách tổ chức?",
    ],
    methodologicalMeaning:
      "Theo dõi mâu thuẫn, lực lượng và điều kiện chuyển hóa.",
    commonMistake: "Nhầm biến động nhất thời với thay đổi căn bản.",
    realLifeExample:
      "Một quy tắc nhóm mới chỉ bền khi phù hợp với nhu cầu và nguồn lực thực tế.",
    avoidForContexts: [
      "Thay đổi sở thích, quyết định nhỏ hay tranh cãi tình cảm không có cấu trúc xã hội liên quan.",
      "Không gọi một thay đổi cá nhân hoặc quy tắc nhóm là cách mạng xã hội.",
    ],
    glyph: "↻",
    symbolType: 2,
    reflection: "Điều gì đang tích lũy để làm thay đổi cách sống hiện tại?",
  }),
];

export const cardGroups: CardGroup[] = [
  "Thế giới quan",
  "Phép biện chứng",
  "Lý luận nhận thức",
  "Con người & xã hội",
];

/** The renamed card retains its identity in previously saved readings. */
export function canonicalCardId(id: string) {
  return id === "the-particular" ? "the-individual" : id;
}

export function getCard(id: string) {
  return cards.find((item) => item.id === canonicalCardId(id));
}

export function formatCardNumber(number: number) {
  return String(number).padStart(2, "0");
}
