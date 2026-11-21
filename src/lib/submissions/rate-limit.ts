interface RateLimitState {
  count: number;
  windowStartMs: number;
}

/**
 * Simple in-memory sliding-window limiter. Deliberately not backed by a
 * database or shared cache, per the project's minimal-operational-burden
 * principle — on a multi-instance deployment each instance enforces its
 * own limit independently, which is an acceptable tradeoff for slowing
 * down spam rather than a hard guarantee.
 */
export class RateLimiter {
  private readonly hits = new Map<string, RateLimitState>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  /** Returns true if the request identified by `key` is allowed. */
  check(key: string, now: number): boolean {
    const state = this.hits.get(key);

    if (!state || now - state.windowStartMs >= this.windowMs) {
      this.hits.set(key, { count: 1, windowStartMs: now });
      return true;
    }

    if (state.count >= this.maxRequests) return false;

    state.count += 1;
    return true;
  }
}
