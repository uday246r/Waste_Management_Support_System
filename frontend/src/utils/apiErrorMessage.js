/**
 * API errors often return { success, message }. React cannot render plain objects as text (error #31).
 */
export function apiErrorToString(data, fallback = "Something went wrong") {
  if (data == null || data === "") return fallback;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.message)) return data.message.map(String).join(", ");
    if (typeof data.error === "string") return data.error;
  }
  try {
    return JSON.stringify(data);
  } catch {
    return fallback;
  }
}
