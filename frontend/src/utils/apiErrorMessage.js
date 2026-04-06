/**
 * API errors often return { success, message }. React cannot render plain objects as text (error #31).
 */
export function apiErrorToString(data, fallback = "Something went wrong") {
  if (data == null || data === "") return fallback;

  let parsedData = data;
  if (typeof data === "string") {
    try {
      parsedData = JSON.parse(data);
    } catch {
      return data; // If it's a normal string, return as is
    }
  }

  if (typeof parsedData === "object" && parsedData !== null) {
    if (typeof parsedData.message === "string") return parsedData.message;
    if (Array.isArray(parsedData.message)) return parsedData.message.map(String).join(", ");
    if (typeof parsedData.error === "string") return parsedData.error;
  }

  try {
    return JSON.stringify(parsedData);
  } catch {
    return fallback;
  }
}
