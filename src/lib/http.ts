import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
class RequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
let windowStart = Date.now();
let requests = 0;
export async function readInput<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  // Next may normalize request.url to its bind hostname; Host is the browser-facing authority.
  const expectedOrigin =
    process.env.APP_ORIGIN ||
    `${url.protocol}//${request.headers.get("host") ?? url.host}`;
  if (
    (origin && origin !== expectedOrigin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new RequestError("Yêu cầu không hợp lệ.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new RequestError("Yêu cầu phải ở dạng JSON.", 415);
  if (Date.now() - windowStart > 60000) {
    windowStart = Date.now();
    requests = 0;
  }
  if (++requests > 60)
    throw new RequestError(
      "Có nhiều yêu cầu cùng lúc. Hãy thử lại sau một phút.",
      429,
    );
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError("Thiếu dữ liệu.", 400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 32000) {
      await reader.cancel();
      throw new RequestError("Dữ liệu vượt giới hạn.", 413);
    }
    chunks.push(value);
  }
  const data = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return schema.parse(JSON.parse(new TextDecoder().decode(data)));
}
export function jsonResponse(value: unknown) {
  return NextResponse.json(value, { headers: { "Cache-Control": "no-store" } });
}
export function requestFailure(error: unknown) {
  const status = error instanceof RequestError ? error.status : 400;
  const message =
    error instanceof RequestError
      ? error.message
      : error instanceof z.ZodError
        ? error.issues[0]?.message
        : "Dữ liệu không hợp lệ. Hãy thử lại.";
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(status === 429 ? { "Retry-After": "60" } : {}),
      },
    },
  );
}
