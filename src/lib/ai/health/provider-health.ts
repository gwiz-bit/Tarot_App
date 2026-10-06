import "server-only";
import type { ProviderName, ProviderHealthSnapshot } from "../../ai-metadata";
import { ProviderFailure, ValidationFailure } from "../errors";

type State = ProviderHealthSnapshot & { revision: number; probing: boolean };
export type ProviderLease = {
  provider: ProviderName;
  revision: number;
  probe: boolean;
};
export class ProviderHealth {
  private states: Record<ProviderName, State>;
  constructor(
    configured: Record<ProviderName, boolean>,
    private readonly now = Date.now,
  ) {
    const state = (enabled: boolean): State => ({
      status: enabled ? "HEALTHY" : "DISABLED_CONFIGURATION_ERROR",
      cooldownUntil: null,
      recentFailures: 0,
      revision: 0,
      probing: false,
    });
    this.states = {
      groq: state(configured.groq),
      gemini: state(configured.gemini),
    };
  }
  snapshot(provider: ProviderName): ProviderHealthSnapshot {
    const state = this.states[provider];
    if (
      state.status === "COOLDOWN" &&
      !state.probing &&
      this.now() >= (state.cooldownUntil ?? Infinity)
    )
      state.status = "PROBE_ALLOWED";
    return {
      status: state.status,
      cooldownUntil: state.cooldownUntil,
      recentFailures: state.recentFailures,
      ...(state.lastFailure ? { lastFailure: state.lastFailure } : {}),
    };
  }
  eligible(provider: ProviderName) {
    const status = this.snapshot(provider).status;
    return (
      !this.states[provider].probing &&
      (status === "HEALTHY" || status === "PROBE_ALLOWED")
    );
  }
  claim(provider: ProviderName): ProviderLease | null {
    if (!this.eligible(provider)) return null;
    const state = this.states[provider];
    const probe = state.status === "PROBE_ALLOWED";
    if (probe) state.probing = true;
    return { provider, revision: state.revision, probe };
  }
  canContinue(lease: ProviderLease) {
    const state = this.states[lease.provider];
    return (
      state.revision === lease.revision &&
      (state.status === "HEALTHY" || (lease.probe && state.probing))
    );
  }
  success(lease: ProviderLease) {
    const state = this.states[lease.provider];
    if (state.revision !== lease.revision) return; // A stale success cannot clear a newer 429.
    state.status = "HEALTHY";
    state.cooldownUntil = null;
    state.recentFailures = 0;
    state.lastFailure = undefined;
    state.probing = false;
  }
  cancel(lease: ProviderLease) {
    const state = this.states[lease.provider];
    if (state.revision === lease.revision && lease.probe) state.probing = false;
  }
  failure(lease: ProviderLease, error: unknown) {
    const state = this.states[lease.provider];
    if (state.status === "DISABLED_CONFIGURATION_ERROR") return;
    state.recentFailures++;
    state.lastFailure =
      error instanceof ProviderFailure
        ? {
            category: error.category,
            ...(error.status ? { status: error.status } : {}),
          }
        : {
            category:
              error instanceof ValidationFailure ? "validation" : "network",
          };
    state.probing = false;
    state.revision++;
    if (
      error instanceof ProviderFailure &&
      error.category === "configuration"
    ) {
      state.status = "DISABLED_CONFIGURATION_ERROR";
      state.cooldownUntil = null;
      return;
    }
    const duration =
      error instanceof ProviderFailure && error.category === "rate_limit"
        ? Math.max(
            error.retryAfterMs ?? 90000,
            error.dailyQuota ? 3600000 : 1000,
          )
        : 20000;
    state.status = "COOLDOWN";
    state.cooldownUntil = Math.max(
      state.cooldownUntil ?? 0,
      this.now() + duration,
    );
  }
}
