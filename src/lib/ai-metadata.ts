import { z } from "zod";

export const providerNameSchema = z.enum(["groq", "gemini"]);
export type ProviderName = z.infer<typeof providerNameSchema>;
export const providerHealthStatusSchema = z.enum([
  "HEALTHY",
  "COOLDOWN",
  "PROBE_ALLOWED",
  "DISABLED_CONFIGURATION_ERROR",
]);
export type ProviderHealthStatus = z.infer<typeof providerHealthStatusSchema>;
export const providerHealthSchema = z.object({
  status: providerHealthStatusSchema,
  cooldownUntil: z.number().nullable(),
  recentFailures: z.number().int().nonnegative(),
  lastFailure: z
    .object({
      category: z.enum([
        "validation",
        "http",
        "rate_limit",
        "configuration",
        "timeout",
        "network",
        "capacity",
        "oversize",
      ]),
      status: z.number().int().optional(),
    })
    .optional(),
});
export type ProviderHealthSnapshot = z.infer<typeof providerHealthSchema>;
export const aiDebugSchema = z.object({
  provider: z.enum(["groq", "gemini", "local"]),
  health: z.object({
    groq: providerHealthSchema,
    gemini: providerHealthSchema,
  }),
  requestCount: z.number().int().nonnegative(),
  cacheHits: z.number().int().nonnegative(),
  failoverCount: z.number().int().nonnegative(),
  cacheHit: z.boolean(),
  deduplicated: z.boolean(),
});
export type AiDebug = z.infer<typeof aiDebugSchema>;
export const aiResponseFields = {
  readingSessionId: z.string().uuid().optional(),
  aiDebug: aiDebugSchema.optional(),
};
