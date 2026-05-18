// Shared utilities for behavioural trackers.
// The actual subscriptions live in hooks/* so they can be attached and
// detached with the component lifecycle.

export function distance(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

export function pruneTrail<T extends { t: number }>(items: T[], maxAgeMs: number, now: number): T[] {
  const cutoff = now - maxAgeMs;
  return items.filter((item) => item.t >= cutoff);
}
