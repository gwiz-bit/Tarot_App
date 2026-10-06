"use client";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import {
  questionSchema,
  readingStyleSchema,
  styles,
  type DrawCount,
  type ReadingStyle,
} from "@/lib/domain";
import { inputQualityError } from "@/lib/input-quality";

const questionFormSchema = questionSchema
  .extend({ style: readingStyleSchema, drawCount: z.enum(["1", "3"]) })
  .superRefine((value, context) => {
    const message = inputQualityError(value.question);
    if (message)
      context.addIssue({ code: "custom", path: ["question"], message });
  });
const styleDescriptions: Record<ReadingStyle, string> = {
  simple: "Ngắn gọn, gần gũi và dễ áp dụng.",
  critical: "Kiểm tra giả định và nhìn thêm các mặt đối lập.",
  academic: "Lý giải bằng khái niệm và lập luận triết học.",
};

const suggestions = [
  "Mình có nên thay đổi hướng đi hiện tại?",
  "Tại sao mình cố gắng nhưng chưa tiến bộ?",
  "Mình nên chọn phương án A hay B?",
  "Mình đang gặp mâu thuẫn trong nhóm, nên nhìn vấn đề thế nào?",
];
export function QuestionForm({
  onSubmit,
  busy = false,
  defaultQuestion = "",
  defaultStyle = "simple",
  defaultDrawCount = 1,
  collapseSuggestions = false,
  label = "Bạn đang băn khoăn điều gì?",
}: {
  onSubmit: (
    question: string,
    style: ReadingStyle,
    drawCount: DrawCount,
  ) => void | Promise<void>;
  busy?: boolean;
  defaultQuestion?: string;
  defaultStyle?: ReadingStyle;
  defaultDrawCount?: DrawCount;
  collapseSuggestions?: boolean;
  label?: string;
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<{
    question: string;
    style: ReadingStyle;
    drawCount: "1" | "3";
  }>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      question: defaultQuestion,
      style: defaultStyle,
      drawCount: defaultDrawCount === 3 ? "3" : "1",
    },
  });
  const question = useWatch({ control, name: "question" });
  const style = useWatch({ control, name: "style" });
  const suggestionButtons = (
    <div className="suggestions" aria-label="Câu hỏi gợi ý">
      {suggestions.map((s) => (
        <button
          type="button"
          key={s}
          disabled={busy}
          onClick={() => {
            setValue("question", s, { shouldValidate: true });
            document.getElementById("question")?.focus({ preventScroll: true });
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
  return (
    <form
      className="question-form"
      onSubmit={handleSubmit(({ question, style, drawCount }) =>
        onSubmit(question, style, Number(drawCount) as DrawCount),
      )}
    >
      <label htmlFor="question">{label}</label>
      <textarea
        {...register("question")}
        id="question"
        maxLength={500}
        rows={collapseSuggestions ? 3 : 4}
        placeholder="Một câu hỏi thật sự của bạn. Về việc học, một mối quan hệ, hay một ngã rẽ…"
        aria-invalid={!!errors.question}
        aria-describedby="question-help question-error"
        disabled={busy}
      />
      <div className="question-meta">
        <span id="question-help">
          Bạn chọn số lá trước khi bắt đầu; hệ thống sẽ không tự đổi số lá.
        </span>
        <span>{question.length}/500</span>
      </div>
      <p
        id="question-error"
        role={errors.question ? "alert" : undefined}
        className="field-error"
      >
        {errors.question?.message}
      </p>
      <fieldset className="draw-count-field" disabled={busy}>
        <legend>Bạn muốn rút bao nhiêu lá?</legend>
        <div className="draw-count-options">
          <label className="draw-count-option">
            <input type="radio" {...register("drawCount")} value="1" />
            <span>
              <strong>1 lá</strong>
              <small>Một góc nhìn tập trung</small>
            </span>
          </label>
          <label className="draw-count-option">
            <input type="radio" {...register("drawCount")} value="3" />
            <span>
              <strong>3 lá</strong>
              <small>Ba khía cạnh liên hệ với nhau</small>
            </span>
          </label>
        </div>
      </fieldset>
      <fieldset
        className="reading-style-field"
        disabled={busy}
        aria-describedby="reading-style-help"
      >
        <legend>Phong cách diễn giải</legend>
        <div className="reading-style-options">
          {Object.entries(styles).map(([key, label]) => (
            <label className="reading-style-option" key={key}>
              <input type="radio" {...register("style")} value={key} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <p id="reading-style-help">{styleDescriptions[style]}</p>
      </fieldset>
      {collapseSuggestions ? (
        <details className="question-examples">
          <summary>Câu hỏi gợi ý</summary>
          {suggestionButtons}
        </details>
      ) : (
        suggestionButtons
      )}
      <button className="button primary" disabled={busy} type="submit">
        {busy ? (
          <>
            <LoaderCircle className="spin" size={17} /> Đang tìm cách trải…
          </>
        ) : (
          <>
            Bắt đầu trải bài <ArrowUpRight size={18} />
          </>
        )}
      </button>
      <p className="fine-print">
        Câu hỏi được xử lý trên máy chủ. Khi bật AI, nội dung được gửi tới Groq
        hoặc Gemini để diễn giải. Lần trải hiện tại được giữ trong tab; chọn lưu
        để thêm vào lịch sử.
      </p>
    </form>
  );
}
