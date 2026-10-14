const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 45000;

async function request(path, options = {}) {
  let response;
  let data = {};
  let invalidSuccessBody = false;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
      signal: controller.signal,
    });
    try {
      data = await response.json();
    } catch {
      invalidSuccessBody = response.ok;
    }
  } catch (cause) {
    const timedOut = cause?.name === "AbortError";
    const error = new Error(
      timedOut
        ? "The request timed out. Check your connection and retry."
        : "Could not reach the AI StudyMate server. Start the backend, then retry."
    );
    error.offline = !timedOut;
    error.retryable = true;
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (
    invalidSuccessBody ||
    (response.ok && (!data || typeof data !== "object" || Array.isArray(data)))
  ) {
    throw new Error("The server returned an invalid response. Please retry.");
  }

  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.status = response.status;
    error.mode = data.mode;
    error.retryable = Boolean(data.retryable);
    throw error;
  }
  return data;
}

export function getAiStatus() {
  return request("/api/ai/status");
}

export function explainTopic(payload) {
  return request("/api/ai/explain", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function generateQuiz(payload) {
  return request("/api/ai/quiz", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function askFollowUp(payload) {
  return request("/api/ai/follow-up", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
