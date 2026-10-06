import "server-only";
import { ProviderFailure, ValidationFailure } from "../errors";
import {
  decodeCompletion,
  outputJsonSchema,
  readProviderJson,
  repairInstruction,
} from "./transport";
import type { AIProvider } from "./types";

export const geminiProvider: AIProvider = {
  name: "gemini",
  configured: () => Boolean(process.env.GEMINI_API_KEY?.trim()),
  async generate(request) {
    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    if (!/^[a-zA-Z0-9._-]{1,80}$/.test(model))
      throw new ProviderFailure("configuration");
    const repair = repairInstruction(request.repairReason);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        cache: "no-store",
        redirect: "error",
        signal: request.signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!.trim(),
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: request.systemInstruction }] },
          contents: [
            {
              role: "user",
              parts: [
                { text: JSON.stringify(request.data) },
                ...(repair ? [{ text: repair }] : []),
              ],
            },
          ],
          generationConfig: {
            responseFormat: {
              text: {
                mimeType: "APPLICATION_JSON",
                schema: outputJsonSchema(request.schema),
              },
            },
            ...(/^gemini-3/.test(model)
              ? {
                  thinkingConfig: {
                    thinkingLevel: /^gemini-3\.(5|6)-flash/.test(model)
                      ? "MINIMAL"
                      : "LOW",
                  },
                }
              : {}),
            temperature: 0.55,
            maxOutputTokens: request.maxOutputTokens,
          },
        }),
      },
    );
    const payload = (await readProviderJson(response)) as {
      candidates?: {
        finishReason?: string;
        content?: { parts?: { text?: string; thought?: boolean }[] };
      }[];
    };
    const candidate = payload?.candidates?.[0];
    if (candidate?.finishReason !== "STOP")
      throw new ValidationFailure("incomplete response");
    const text = candidate.content?.parts
      ?.filter((part) => !part.thought)
      .map((part) => part.text ?? "")
      .join("");
    return decodeCompletion(text, request.schema);
  },
};
