/** Reject only obvious noise locally. Short, vague human questions still reach AI. */
export function inputQualityError(value: string): string | null {
  const text = value.normalize("NFKC").trim();
  const letters = text.toLocaleLowerCase("vi").replace(/[^\p{L}\p{N}]/gu, "");
  if (
    letters.length < 3 ||
    /^(.)\1{5,}$/u.test(letters) ||
    /^(..|...|....)\1{3,}$/u.test(letters) ||
    /^(?:asdf|qwer|zxcv|1234|abcd)+$/u.test(letters)
  )
    return "Hãy viết một câu hỏi có nghĩa về điều bạn muốn hiểu rõ hơn.";
  return null;
}
