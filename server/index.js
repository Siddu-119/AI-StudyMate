import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { demoExplain, demoFollowUp, demoQuiz } from "./demo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const PORT = Number(process.env.PORT) || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const BHARATCODE_BASE_URL = (
  process.env.BHARATCODE_BASE_URL || "https://bharatcode.ai/api/model/v1"
).replace(/\/$/, "");
const BHARATCODE_MODEL = process.env.BHARATCODE_MODEL || "qwen-3.8-27b";

const TOPIC_MAX = 240;
const QUESTION_MAX = 600;

const app = express();
app.use(
  cors({
    origin: [CLIENT_ORIGIN, "http://127.0.0.1:5173", "http://localhost:4173"],
  })
);
app.use(express.json({ limit: "32kb" }));

function getApiKey() {
  const key = (process.env.BHARATCODE_API_KEY || "").trim();
  if (!key || key.includes("your_key") || key.includes("bc_live_your_key")) {
    return "";
  }
  return key;
}

function isLiveConfigured() {
  return Boolean(getApiKey());
}

function publicErrorMessage(status, fallback) {
  if (status === 401 || status === 403) {
    return "The BharatCode API rejected the key. Check BHARATCODE_API_KEY, account access (student / Lite / Pro), and restart the server.";
  }
  if (status === 429) {
    return "The BharatCode API rate limit was reached. Wait and try again.";
  }
  if (status === 503) {
    return "The BharatCode model is busy (503). Wait a few seconds and retry.";
  }
  return fallback;
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

async function bharatChat(messages, attempt = 1) {
  const response = await fetch(`${BHARATCODE_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: BHARATCODE_MODEL,
      messages,
    }),
  });

  if ((response.status === 503 || response.status === 429) && attempt < 3) {
    await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    return bharatChat(messages, attempt + 1);
  }

  const rawText = await response.text();
  let payload = null;
  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail = publicErrorMessage(
      response.status,
      payload?.error?.message || payload?.message || `BharatCode request failed (${response.status}).`
    );
    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }

  return payload;
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
    mode: isLiveConfigured() ? "live" : "demo",
  });
});

app.get("/api/ai/status", (_req, res) => {
  const live = isLiveConfigured();
  res.json({
    mode: live ? "live" : "demo",
    configured: live,
    model: live ? BHARATCODE_MODEL : null,
    baseUrl: live ? BHARATCODE_BASE_URL : null,
    port: PORT,
    message: live
      ? "Server has a BharatCode API key. Generations will call the official model API."
      : "Demo Mode is on because BHARATCODE_API_KEY is not set. Explanations and quizzes use local study content, not the BharatCode model.",
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

    if (!isLiveConfigured()) {
      return res.json({ ...demoExplain(payload), mode: "demo" });
    }

    const completion = await bharatChat([
      { role: "system", content: TUTOR_SYSTEM },
      {
        role: "user",
        content: `Subject: ${payload.subject}\nTopic or question: ${payload.topic}\nDifficulty: ${payload.difficulty}`,
      },
    ]);
    const text = extractMessageText(completion);
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
        model: BHARATCODE_MODEL,
      });
    }
    return res.json({ ...parsed, mode: "live", model: BHARATCODE_MODEL });
  } catch (error) {
    return res.status(error.status || 502).json({
      error: "The BharatCode model request failed. Demo Mode was not used because a key is configured.",
      detail: error.message,
      mode: "live",
    });
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

    if (!isLiveConfigured()) {
      return res.json({ ...demoQuiz(payload), mode: "demo" });
    }

    const completion = await bharatChat([
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

    if (!normalised.length) {
      return res.status(502).json({
        error: "The model response did not contain a usable quiz. Try again.",
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
      model: BHARATCODE_MODEL,
    });
  } catch (error) {
    return res.status(error.status || 502).json({
      error: "The BharatCode model request failed. Demo Mode was not used because a key is configured.",
      detail: error.message,
      mode: "live",
    });
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

    if (!isLiveConfigured()) {
      return res.json({ ...demoFollowUp(payload), mode: "demo" });
    }

    const completion = await bharatChat([
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
    const parsed = parseJsonContent(text);
    return res.json({
      answer: parsed?.answer || text,
      followUps: Array.isArray(parsed?.followUps) ? parsed.followUps : [],
      mode: "live",
      model: BHARATCODE_MODEL,
    });
  } catch (error) {
    return res.status(error.status || 502).json({
      error: "The BharatCode model request failed. Demo Mode was not used because a key is configured.",
      detail: error.message,
      mode: "live",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: `No API route for ${req.method} ${req.path}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const server = app.listen(PORT, () => {
  const live = isLiveConfigured();
  console.log(`AI StudyMate server on http://localhost:${PORT}`);
  console.log(
    live
      ? `Live BharatCode mode · model ${BHARATCODE_MODEL}`
      : "Demo Mode · add BHARATCODE_API_KEY in server/.env to call the official API"
  );
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error("");
    console.error(`Port ${PORT} is already in use (EADDRINUSE).`);
    console.error("This app will not stop whatever is already listening.");
    console.error("Fix options:");
    console.error(`  1. Close the other program using port ${PORT}, then start this server again.`);
    console.error("  2. Or set a free port in server\\.env, for example PORT=5001");
    console.error("     Then point the Vite proxy at the same port in client\\.env:");
    console.error("     VITE_API_URL=http://localhost:5001");
    console.error("     Restart both the backend and the frontend.");
    console.error("");
    process.exit(1);
  }
  console.error("Server failed to start:", error.message);
  process.exit(1);
});
