import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import { demoExplain, demoFollowUp, demoQuiz } from "./demo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const PORT = Number(process.env.PORT || 5000);
const AI_DEMO_MODE = process.env.AI_DEMO_MODE?.trim().toLowerCase() === "true";
const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000);
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
const gemini = !AI_DEMO_MODE && geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        timeout: AI_REQUEST_TIMEOUT_MS,
        retryOptions: { attempts: 1 },
      },
    })
  : null;

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}
if (!Number.isInteger(AI_REQUEST_TIMEOUT_MS) || AI_REQUEST_TIMEOUT_MS < 1000) {
  throw new Error("AI_REQUEST_TIMEOUT_MS must be an integer of at least 1000.");
}

const TOPIC_MAX = 240;
const QUESTION_MAX = 600;
const MAX_AI_ATTEMPTS = 2;
const MAX_RETRY_DELAY_MS = 8000;

const app = express();
const allowedOrigins = new Set([
  ...CLIENT_ORIGINS,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
]);
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
  })
);
app.use(express.json({ limit: "32kb" }));

function isLiveConfigured() {
  return Boolean(gemini);
}

function aiMode() {
  return AI_DEMO_MODE ? "demo" : isLiveConfigured() ? "live" : "unconfigured";
}

function providerStatus(error) {
  const status = Number(error?.status);
  if (Number.isInteger(status) && status >= 400 && status <= 599) return status;
  const numericCode = Number(error?.code);
  if (Number.isInteger(numericCode) && numericCode >= 400 && numericCode <= 599) return numericCode;
  const code = String(error?.code || "").toUpperCase();
  if (/timeout|timed out/i.test(`${error?.name || ""} ${error?.message || ""}`)) return 504;
  if (code === "RESOURCE_EXHAUSTED") return 429;
  if (code === "UNAVAILABLE") return 503;
  if (code === "DEADLINE_EXCEEDED") return 504;
  if (code === "INVALID_ARGUMENT") return 400;
  if (code === "UNAUTHENTICATED") return 401;
  if (code === "PERMISSION_DENIED") return 403;
  return 502;
}

function providerRetryGuidanceMs(error) {
  const retryAfter = error?.headers?.get?.("retry-after") ?? error?.response?.headers?.get?.("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
    const dateDelay = Date.parse(retryAfter) - Date.now();
    if (Number.isFinite(dateDelay)) return Math.max(0, dateDelay);
  }

  const details = JSON.stringify(error?.details || error?.errorDetails || []);
  const retryDelay = details.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i);
  return retryDelay ? Number(retryDelay[1]) * 1000 : null;
}

export function classifyProviderError(error) {
  const status = providerStatus(error);
  const description = `${error?.message || ""} ${JSON.stringify(error?.details || error?.errorDetails || [])}`;
  const dailyQuotaExhausted =
    status === 429 &&
    /(daily|per[\s_-]*day|day.{0,30}quota|quota.{0,40}(day|exhaust|exceed)|exceed.{0,40}quota)/i.test(description);
  const retryGuidanceMs = providerRetryGuidanceMs(error);
  const retryableStatus = [408, 500, 502, 503, 504].includes(status);
  const retryable =
    !dailyQuotaExhausted &&
    (retryableStatus || (status === 429 && retryGuidanceMs !== null && retryGuidanceMs <= MAX_RETRY_DELAY_MS));

  let message = "The Gemini API request failed. Check the server configuration and try again.";
  if (status === 401 || status === 403) {
    message = "Gemini rejected the server API key or account access. Check GEMINI_API_KEY and your Google AI Studio access.";
  } else if (status === 429 && dailyQuotaExhausted) {
    message = "The Gemini API quota appears exhausted. Check your Google AI Studio quota and wait for its reset, or enable AI_DEMO_MODE=true. This request was not retried.";
  } else if (status === 429) {
    message = "The Gemini API rate limit was reached. Wait before trying again.";
  } else if (status === 408 || status === 504) {
    message = "The Gemini API request timed out. Check your connection and retry.";
  } else if (status === 503 || status === 502) {
    message = "The Gemini API is temporarily unavailable. Wait briefly and retry.";
  } else if (status === 400 || status === 404) {
    message = "Gemini rejected the request. Check that GEMINI_MODEL is a supported model and that the request is valid.";
  }

  return { status, message, retryable, retryGuidanceMs };
}

function sendAiError(res, error) {
  const failure = classifyProviderError(error);
  return res.status(failure.status).json({
    error: failure.message,
    mode: "live",
    retryable: failure.retryable,
  });
}

function extractMessageText(payload) {
  const choice = payload?.choices?.[0]?.message?.content;
  if (typeof choice === "string") return choice;
  if (Array.isArray(choice)) {
    return choice
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("\n")
      .trim();
  }
  return "";
}

function parseJsonContent(text) {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch {
        return null;
      }
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function clip(value, max) {
  return String(value || "").trim().slice(0, max);
}

function requireFields(body, fields) {
  return fields.filter((field) => !String(body?.[field] || "").trim());
}


async function generateWithGemini(messages) {
  const systemPrompt = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n");

  const userPrompt = messages
    .filter((message) => message.role !== "system")
    .map((message) => message.content)
    .join("\n");

  for (let attempt = 1; attempt <= MAX_AI_ATTEMPTS; attempt++) {
    try {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const text = response.text || "";

      return {
        choices: [
          {
            message: {
              content: text,
            },
          },
        ],
      };
    } catch (error) {
      const failure = classifyProviderError(error);
      const retryDelayMs = failure.retryGuidanceMs ?? Math.min(1000 * 2 ** (attempt - 1), MAX_RETRY_DELAY_MS);
      if (!failure.retryable || attempt === MAX_AI_ATTEMPTS || retryDelayMs > MAX_RETRY_DELAY_MS) {
        throw error;
      }

      console.warn(`Gemini returned HTTP ${failure.status}; retrying once after ${retryDelayMs}ms.`);
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}

const TUTOR_SYSTEM = `You are StudyMate, a careful tutor for school and college students.
Treat the student's question literally. If they ask about Ohm's Law, explain the electrical principle V = I × R (voltage, current, resistance). Never replace a science, maths, electronics, or programming question with generic study-skill advice.
Handle common spelling mistakes (for example "ohms low" means Ohm's Law).
Reply with JSON only, no markdown. Shape:
{"title":string,"summary":string,"explanation":string,"formulas":string[],"examples":[{"title":string,"body":string}],"commonMistakes":string[],"followUps":string[],"tips":string[]}
Use simple language first, then official terms. Include formulas when they exist, two worked examples, three common mistakes, four follow-up questions, and three short tips.`;

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ai-studymate-server",
    port: PORT,
    mode: aiMode(),
  });
});

app.get("/api/ai/status", (_req, res) => {
  const mode = aiMode();
  res.json({
    mode,
    configured: mode !== "unconfigured",
    provider: "Google Gemini",
    model: mode === "live" ? GEMINI_MODEL : null,
    port: PORT,
    message:
      mode === "live"
        ? `Live Google Gemini mode · model ${GEMINI_MODEL}.`
        : mode === "demo"
          ? "Demo Mode is explicitly enabled. Results are local sample content, not generated by an AI model."
          : "AI is not configured. Set GEMINI_API_KEY for live Google Gemini requests or explicitly enable AI_DEMO_MODE=true.",
  });
});

app.post("/api/ai/explain", async (req, res) => {
  try {
    const missing = requireFields(req.body, ["topic"]);
    if (missing.length) {
      return res.status(400).json({ error: "Please enter a topic to explain." });
    }

    const payload = {
      subject: clip(req.body.subject || "General Studies", 80),
      topic: clip(req.body.topic, TOPIC_MAX),
      difficulty: clip(req.body.difficulty || "beginner", 40),
    };
    if (payload.topic.length < 2) {
      return res.status(400).json({ error: "Enter a slightly longer topic name or question." });
    }

    if (AI_DEMO_MODE) {
      return res.json({ ...demoExplain(payload), mode: "demo" });
    }
    if (!isLiveConfigured()) {
      return res.status(503).json({
        error: "AI is not configured. Set GEMINI_API_KEY for live generation or explicitly enable AI_DEMO_MODE=true.",
        mode: "unconfigured",
        retryable: false,
      });
    }

    const completion = await generateWithGemini([
      { role: "system", content: TUTOR_SYSTEM },
      {
        role: "user",
        content: `Subject: ${payload.subject}\nTopic or question: ${payload.topic}\nDifficulty: ${payload.difficulty}`,
      },
    ]);
    const text = extractMessageText(completion);
    if (!text.trim()) {
      throw Object.assign(new Error("Gemini returned an empty explanation."), { status: 502 });
    }
    const parsed = parseJsonContent(text);
    if (!parsed?.explanation && !parsed?.summary) {
      return res.json({
        title: payload.topic,
        summary: text.slice(0, 280),
        explanation: text,
        formulas: [],
        examples: [],
        commonMistakes: [],
        followUps: [],
        tips: [],
        mode: "live",
        model: GEMINI_MODEL,
      });
    }
    return res.json({ ...parsed, mode: "live", model: GEMINI_MODEL });
  } catch (error) {
    return sendAiError(res, error);
  }
});

app.post("/api/ai/quiz", async (req, res) => {
  try {
    const missing = requireFields(req.body, ["topic"]);
    if (missing.length) {
      return res.status(400).json({ error: "Please enter a topic for the quiz." });
    }

    const payload = {
      subject: clip(req.body.subject || "General Studies", 80),
      topic: clip(req.body.topic, TOPIC_MAX),
      difficulty: clip(req.body.difficulty || "beginner", 40),
      count: Math.min(8, Math.max(3, Number(req.body.count) || 5)),
    };
    if (payload.topic.length < 2) {
      return res.status(400).json({ error: "Enter a slightly longer quiz topic." });
    }

    if (AI_DEMO_MODE) {
      return res.json({ ...demoQuiz(payload), mode: "demo" });
    }
    if (!isLiveConfigured()) {
      return res.status(503).json({
        error: "AI is not configured. Set GEMINI_API_KEY for live generation or explicitly enable AI_DEMO_MODE=true.",
        mode: "unconfigured",
        retryable: false,
      });
    }

    const completion = await generateWithGemini([
      {
        role: "system",
        content:
          'You are StudyMate, a quiz writer. Reply with JSON only. Shape: {"title":string,"questions":[{"id":string,"question":string,"options":[string,string,string,string],"correctIndex":number,"explanation":string}]}. correctIndex is 0-3. Questions must be about the requested academic topic (for Ohm\'s Law ask about V = I × R, units, and calculations — not generic study habits). One option is clearly correct. Create exactly the requested number of items.',
      },
      {
        role: "user",
        content: `Subject: ${payload.subject}\nTopic: ${payload.topic}\nDifficulty: ${payload.difficulty}\nNumber of questions: ${payload.count}`,
      },
    ]);
    const text = extractMessageText(completion);
    const parsed = parseJsonContent(text);
    const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];
    const normalised = questions
      .map((item, index) => ({
        id: String(item.id || `q-${index + 1}`),
        question: String(item.question || "").trim(),
        options: Array.isArray(item.options) ? item.options.map((option) => String(option)) : [],
        correctIndex: Number(item.correctIndex),
        explanation: String(item.explanation || "").trim(),
      }))
      .filter(
        (item) =>
          item.question &&
          item.options.length === 4 &&
          Number.isInteger(item.correctIndex) &&
          item.correctIndex >= 0 &&
          item.correctIndex <= 3
      );

    if (normalised.length < payload.count) {
      return res.status(502).json({
        error: "The model response did not contain the requested number of usable questions. Try again.",
        retryable: true,
        mode: "live",
      });
    }

    return res.json({
      title: parsed.title || `${payload.topic} quiz`,
      subject: payload.subject,
      topic: payload.topic,
      difficulty: payload.difficulty,
      questions: normalised.slice(0, payload.count),
      mode: "live",
      model: GEMINI_MODEL,
    });
  } catch (error) {
    return sendAiError(res, error);
  }
});

app.post("/api/ai/follow-up", async (req, res) => {
  try {
    const question = clip(req.body.question, QUESTION_MAX);
    if (!question) {
      return res.status(400).json({ error: "Please enter a follow-up question." });
    }

    const payload = {
      subject: clip(req.body.subject, 80),
      topic: clip(req.body.topic, TOPIC_MAX),
      question,
      previousSummary: clip(req.body.previousSummary, 800),
    };

    if (AI_DEMO_MODE) {
      return res.json({ ...demoFollowUp(payload), mode: "demo" });
    }
    if (!isLiveConfigured()) {
      return res.status(503).json({
        error: "AI is not configured. Set GEMINI_API_KEY for live generation or explicitly enable AI_DEMO_MODE=true.",
        mode: "unconfigured",
        retryable: false,
      });
    }

    const completion = await generateWithGemini([
      {
        role: "system",
        content:
          'You are StudyMate. Reply with JSON only: {"answer":string,"followUps":string[]}. Answer the academic question directly (formulas and steps). Suggest 3 short follow-up questions. No generic study-skill filler.',
      },
      {
        role: "user",
        content: `Subject: ${payload.subject}\nTopic: ${payload.topic}\nPrevious summary: ${payload.previousSummary}\nStudent question: ${payload.question}`,
      },
    ]);
    const text = extractMessageText(completion);
    if (!text.trim()) {
      throw Object.assign(new Error("Gemini returned an empty follow-up answer."), { status: 502 });
    }
    const parsed = parseJsonContent(text);
    return res.json({
      answer: parsed?.answer || text,
      followUps: Array.isArray(parsed?.followUps) ? parsed.followUps : [],
      mode: "live",
      model: GEMINI_MODEL,
    });
  } catch (error) {
    return sendAiError(res, error);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: `No API route for ${req.method} ${req.path}` });
});

app.use((error, _req, res, _next) => {
  const status = Number.isInteger(error?.status) && error.status >= 400 && error.status < 500 ? error.status : 500;
  console.error(`Request failed with HTTP ${status} (${error?.name || "Error"}).`);
  res.status(status).json({
    error:
      status === 400
        ? "The request body is invalid JSON."
        : status === 413
          ? "The request body is too large."
          : "Something went wrong on the server.",
  });
});

let serverInstance;

export function startServer(port = PORT) {
  if (serverInstance) return serverInstance;

  serverInstance = app.listen(port, () => {
    console.log(`AI StudyMate API listening at http://localhost:${port}`);
    if (AI_DEMO_MODE) {
      console.log("AI_DEMO_MODE=true · AI results are labelled local demo content.");
    } else if (isLiveConfigured()) {
      console.log(`Google Gemini live mode · model ${GEMINI_MODEL}.`);
    } else {
      console.warn("AI is unconfigured · set GEMINI_API_KEY or explicitly enable AI_DEMO_MODE=true.");
    }
  });

  serverInstance.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Cannot start AI StudyMate: port ${port} is already in use (EADDRINUSE).`);
      console.error("No other process was stopped. Close the owning app or choose a free PORT in server/.env.");
      serverInstance = undefined;
      process.exitCode = 1;
      return;
    }
    console.error(`AI StudyMate server failed to start (${error.code || error.name}).`);
    serverInstance = undefined;
    process.exitCode = 1;
  });

  return serverInstance;
}

export { app };

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  startServer();
}
