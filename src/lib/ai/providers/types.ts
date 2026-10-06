import "server-only";
import type { z } from "zod";
import type { ProviderName } from "../../ai-metadata";

export type AiTask = "analysis" | "reading" | "follow-up";
export type CompletionRequest = {
  task: AiTask;
  schema: z.ZodType;
  data: unknown;
  systemInstruction: string;
  maxOutputTokens: number;
  repairReason?: string;
  signal: AbortSignal;
};
/** Every task uses the same schema, prompts and semantic validators on either provider. */
export interface AIProvider {
  readonly name: ProviderName;
  configured(): boolean;
  generate(request: CompletionRequest): Promise<unknown>;
}
