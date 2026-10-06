import "server-only";
import { ProviderFailure, ValidationFailure } from "../errors";
import {
  decodeCompletion,
  outputJsonSchema,
  readProviderJson,
  repairInstruction,
} from "./transport";
import type { AIProvider } from "./types";

export const groqProvider: AIProvider = {
  name: "groq",
  configured: () => Boolean(process.env.GROQ_API_KEY?.trim()),
  async generate(request) {
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,119}$/.test(model))
      throw new ProviderFailure("configuration");
    const schema = outputJsonSchema(request.schema);
    const strict = /^(?:openai\/gpt-oss-(?:20b|120b)|qwen\/qwen3\.8-27b)$/.test(
      model,
    );
    const repair = repairInstruction(request.repairReason);
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        cache: "no-store",
        redirect: "error",
        signal: request.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY!.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                request.systemInstruction +
                (strict
                  ? ""
                  : `\nReturn JSON matching this schema: ${JSON.stringify(schema)}`),
            },
            { role: "user", content: JSON.stringify(request.data) },
            ...(repair ? [{ role: "user", content: repair }] : []),
          ],
          response_format: strict
            ? {
                type: "json_schema",
                json_schema: { name: "tarot_response", strict: true, schema },
              }
            : { type: "json_object" },
          temperature: 0.55,
          // Reasoning tokens share this budget. Only final content is parsed/returned.
          max_completion_tokens:
            request.maxOutputTokens +
            (/^openai\/gpt-oss-/.test(model) ? 1800 : 0),
          ...(/^openai\/gpt-oss-(?:20b|120b)$/.test(model)
            ? { reasoning_effort: "low", include_reasoning: false }
            : {}),
        }),
      },
    );
    const payload = (await readProviderJson(response)) as {
      choices?: { finish_reason?: string; message?: { content?: string } }[];
    };
    const choice = payload?.choices?.[0];
    if (choice?.finish_reason !== "stop")
      throw new ValidationFailure("incomplete response");
    return decodeCompletion(choice.message?.content, request.schema);
  },
};
