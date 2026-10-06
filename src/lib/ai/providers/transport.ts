import "server-only";
import { z } from "zod";
import { ProviderFailure, ValidationFailure } from "../errors";

export function retryAfterMilliseconds(value: string | null, now = Date.now()) {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0)
    return Math.ceil(seconds * 1000);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - now) : undefined;
}

export async function readProviderJson(response: Response): Promise<unknown> {
  const reader = response.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 100000) {
        await reader.cancel();
        throw new ProviderFailure("oversize", response.status);
      }
      chunks.push(value);
    }
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const text = new TextDecoder().decode(buffer);
  if (!response.ok) {
    // Inspect a bounded error only to classify it. Never retain or log its text.
    const errorText = text.slice(0, 16000).toLowerCase();
    const quota =
      response.status === 429 ||
      /rate_limit_exceeded|quota_exceeded|resource_exhausted/.test(errorText);
    const configuration =
      [401, 403, 404].includes(response.status) ||
      /api_key_invalid|invalid_api_key|api key not valid/.test(errorText);
    let retryAfterMs = retryAfterMilliseconds(
      response.headers.get("retry-after"),
    );
    try {
      const payload = JSON.parse(text);
      const details = payload?.error?.details;
      if (Array.isArray(details)) {
        for (const detail of details) {
          if (
            typeof detail?.retryDelay === "string" &&
            /^\d+(?:\.\d+)?s$/.test(detail.retryDelay)
          )
            retryAfterMs = Math.max(
              retryAfterMs ?? 0,
              Number(detail.retryDelay.slice(0, -1)) * 1000,
            );
        }
      }
    } catch {
      /* Some upstream errors are plain text. */
    }
    const dailyQuota =
      /per.?day|requests.?per.?day|tokens.?per.?day|daily.{0,40}(?:quota|limit)|(?:quota|limit).{0,40}daily/.test(
        errorText,
      ) || response.headers.get("x-ratelimit-remaining-requests") === "0";
    throw new ProviderFailure(
      configuration ? "configuration" : quota ? "rate_limit" : "http",
      response.status,
      retryAfterMs,
      quota && dailyQuota,
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new ValidationFailure("malformed provider envelope");
  }
}

export function decodeCompletion(text: string | undefined, schema: z.ZodType) {
  if (!text?.trim()) throw new ValidationFailure("empty response");
  let decoded: unknown;
  try {
    decoded = JSON.parse(text);
  } catch {
    throw new ValidationFailure("malformed JSON");
  }
  const result = schema.safeParse(decoded);
  if (!result.success) {
    const issue = result.error.issues[0];
    // Provider-controlled extra property names must not enter diagnostics or repair prompts.
    const path =
      issue?.code === "unrecognized_keys"
        ? "response"
        : issue?.path
            .slice(0, 4)
            .join(".")
            .replace(/[^a-zA-Z0-9_.]/g, "")
            .slice(0, 80);
    throw new ValidationFailure(
      `invalid field ${path || "response"} (${issue?.code})`,
    );
  }
  return result.data;
}

export function outputJsonSchema(schema: z.ZodType) {
  const { $schema: _dialect, ...result } = z.toJSONSchema(schema);
  void _dialect;
  return result;
}

export function repairInstruction(reason?: string) {
  return reason
    ? `Validation failed: ${reason}. Return the complete valid JSON again, using only the supplied context/cards.`
    : undefined;
}
