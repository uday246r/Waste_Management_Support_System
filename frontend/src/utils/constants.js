const { VITE_API_BASE_URL } = import.meta.env;

// Fallback to current origin when env is not set (helps on deployed frontend).
const fallbackOrigin =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:4000";

export const BASE_URL = VITE_API_BASE_URL || fallbackOrigin;

/** Default cooldown shown when the API does not send Retry-After / retryAfter. */
export const RATE_LIMIT_MODAL_DEFAULT_SECONDS = 10;

export const RATE_LIMIT_COUNTDOWN_MAX_SECONDS = 86400;

/** Avoid NaN/Infinity in countdown (can break the modal and crash the app in production). */
export function sanitizeRateLimitCountdownSeconds(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1) return RATE_LIMIT_MODAL_DEFAULT_SECONDS;
  return Math.min(RATE_LIMIT_COUNTDOWN_MAX_SECONDS, n);
}