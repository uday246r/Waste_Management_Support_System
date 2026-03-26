const { VITE_API_BASE_URL } = import.meta.env;

// Fallback to current origin when env is not set (helps on deployed frontend).
const fallbackOrigin =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:4000";

export const BASE_URL = VITE_API_BASE_URL || fallbackOrigin;