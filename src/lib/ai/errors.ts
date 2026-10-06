import "server-only";

/** Messages contain only our own validation labels, never rejected output. */
export class ValidationFailure extends Error {}
export class ProviderFailure extends Error {
  constructor(
    readonly category:
      | "http"
      | "rate_limit"
      | "configuration"
      | "timeout"
      | "network"
      | "capacity"
      | "oversize",
    readonly status?: number,
    readonly retryAfterMs?: number,
    readonly dailyQuota = false,
  ) {
    super(category);
  }
}
