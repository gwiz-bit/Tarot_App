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

/** Ask for context only when the text contains no usable situation or decision. */
export function clarificationQuestion(value: string): string | null {
  const text = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (
    /^(?:minh|toi|em)? ?(?:nen|phai) lam gi(?: bay gio)?$/.test(text) ||
    /^(?:minh|toi|em)? ?(?:phai )?lam sao(?: bay gio)?$/.test(text) ||
    /^(?:minh|toi|em)? ?co nen thay doi(?: khong)?$/.test(text) ||
    /^(?:giup minh|tu van cho minh|cho minh loi khuyen)$/.test(text)
  )
    return "Bạn đang gặp tình huống cụ thể nào, và bạn muốn hiểu hoặc quyết định điều gì?";
  return null;
}
