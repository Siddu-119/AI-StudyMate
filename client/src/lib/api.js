async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
  } catch {
    const error = new Error("Could not reach the AI StudyMate server. Start the backend, then retry.");
    error.offline = true;
    throw error;
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || data.error || "Request failed");
    error.detail = data.detail;
    error.mode = data.mode;
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
