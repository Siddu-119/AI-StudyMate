import {
  explanationFromArticle,
  findArticle,
  followUpFromArticle,
  quizFromArticle,
  SUBJECT_HINTS,
} from "./knowledge.js";

function titleCase(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function hashString(value) {
  return Array.from(String(value)).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function fallbackExplain({ subject, topic, difficulty }) {
  const cleanTopic = titleCase(topic) || "This topic";
  const cleanSubject = subject || "General Studies";
  const hint = SUBJECT_HINTS[cleanSubject] || SUBJECT_HINTS["General Studies"] || SUBJECT_HINTS.Physics;
  const level =
    difficulty === "advanced"
      ? "Go beyond the definition: conditions, edge cases, and a harder numerical or design question."
      : difficulty === "intermediate"
        ? "Connect the definition to a standard class problem."
        : "Start with a one-sentence meaning, then terms, then a tiny example.";

  return {
    title: `${cleanTopic} (${cleanSubject})`,
    summary: `${cleanTopic} is a ${cleanSubject.toLowerCase()} topic. Demo Mode does not have a dedicated article for this exact wording, so the steps below are a structured subject-specific study outline — not a substitute for your textbook.`,
    explanation: [
      level,
      `Treat “${cleanTopic}” as a real ${cleanSubject} idea, not a generic study-skill slogan.`,
      hint,
      `1. Definition — write what ${cleanTopic} means in one sentence, using the official terms.`,
      `2. Quantities or parts — list the symbols, units, ingredients, or steps that make up ${cleanTopic}.`,
      `3. Formula or process — if ${cleanSubject} uses an equation here, write it and name each symbol. If it is a process, number the stages.`,
      `4. Worked example — pick the smallest numbers or shortest case that still uses ${cleanTopic} correctly.`,
      `5. Check — restate ${cleanTopic} without notes. If you cannot, the missing piece is usually a definition, a unit, or a step — not “the whole chapter”.`,
      "This outline is labelled Demo Mode. Add a Gemini API key on the server for a live model explanation of uncommon topics.",
    ].join("\n\n"),
    formulas: [],
    examples: [
      {
        title: "Make it concrete",
        body: `Write one sentence: “${cleanTopic} is used when I need to ___ in ${cleanSubject}.” Then fill a tiny example in the blank with numbers or a short scene.`,
      },
      {
        title: "Exam check",
        body: `Invent one question that cannot be answered by quoting the heading “${cleanTopic}”. That usually means applying a formula, comparing two cases, or tracing a process.`,
      },
    ],
    commonMistakes: [
      "Memorising the name of the topic without the formula, units, or process.",
      "Skipping a worked example and assuming the definition is enough.",
      "Mixing this idea with a neighbouring topic that shares similar words.",
    ],
    followUps: [
      `What quantities or steps are involved in ${cleanTopic}?`,
      `What is a common exam trap for ${cleanTopic}?`,
      `Can you invent a 3-line example of ${cleanTopic}?`,
      `How would you explain ${cleanTopic} to a classmate who missed the lecture?`,
    ],
    tips: [
      "Prefer a formula plus one numerical example over highlighting a whole chapter.",
      "Say the units out loud when the subject is physics, chemistry, or electronics.",
      "After reading, write two quiz questions for yourself.",
    ],
  };
}

export function demoExplain(payload) {
  const article = findArticle(payload.subject, payload.topic);
  const body = article
    ? explanationFromArticle(article, payload)
    : fallbackExplain(payload);
  return { ...body, mode: "demo" };
}

export function demoQuiz(payload) {
  const article = findArticle(payload.subject, payload.topic);
  if (article) {
    return { ...quizFromArticle(article, payload), mode: "demo" };
  }

  const cleanTopic = titleCase(payload.topic) || "This Topic";
  const cleanSubject = payload.subject || "General Studies";
  const level = payload.difficulty || "beginner";
  const total = Math.min(8, Math.max(3, Number(payload.count) || 5));
  const seed = hashString(`${cleanSubject}:${cleanTopic}:${level}`);
  const hint = SUBJECT_HINTS[cleanSubject] || "Write a definition, a process, and one example.";

  const bank = [
    {
      question: `Which approach is the most accurate way to start answering a ${cleanSubject} question on ${cleanTopic}?`,
      options: [
        hint,
        "Ignore definitions and guess from the chapter title.",
        "Memorise headings only and skip units or steps.",
        "Assume the topic is unrelated to " + cleanSubject + ".",
      ],
      correctIndex: 0,
      explanation: `In ${cleanSubject}, ${cleanTopic} should be handled with the subject's own tools (definitions, formulas, or processes), not with generic highlighting.`,
    },
    {
      question: `A statement about ${cleanTopic} is trustworthy when it:`,
      options: [
        "Names the idea, the conditions under which it applies, and a check (formula, units, or example).",
        "Repeats the topic name in longer words.",
        "Avoids all examples because they take time.",
        "Claims every exam question will use identical wording.",
      ],
      correctIndex: 0,
      explanation: "Accurate answers specify conditions and a way to verify, not just a label.",
    },
    {
      question: `Demo Mode does not have a full question bank for “${cleanTopic}”. What should you still do?`,
      options: [
        "Treat this as labelled demo practice, then check your textbook or configure Google Gemini for a custom quiz.",
        "Assume the live model already ran.",
        "Score the quiz as if it contained official board questions on this exact wording.",
        "Ignore the Demo Mode badge.",
      ],
      correctIndex: 0,
      explanation: "Unmatched topics fall back to general checks. Dedicated questions appear for topics such as Ohm's Law, binary search, and the quadratic formula.",
    },
    {
      question: `Which mistake is common when studying ${cleanTopic}?`,
      options: [
        "Skipping units, assumptions, or a worked example.",
        "Writing the definition in your own words.",
        "Checking an answer by substituting values.",
        "Asking a follow-up question about an unclear step.",
      ],
      correctIndex: 0,
      explanation: "Most lost marks come from missing conditions or examples, not from asking questions.",
    },
    {
      question: `If you had to teach ${cleanTopic} in one minute, what should come first?`,
      options: [
        "What problem it solves, then the core relation or process, then one tiny example.",
        "Every exception before the main idea.",
        "A list of unused formulas with no purpose.",
        "The chapter number only.",
      ],
      correctIndex: 0,
      explanation: "Purpose, core idea, example — then exceptions.",
    },
    {
      question: `The best quick self-test for ${cleanTopic} is:`,
      options: [
        "Close notes and solve one small question, then compare with an explanation.",
        "Reread highlighted text and stop.",
        "Watch a video on mute.",
        "Delete your notes.",
      ],
      correctIndex: 0,
      explanation: "Retrieval with a small problem is a fair check of understanding.",
    },
  ];

  const questions = Array.from({ length: total }, (_, index) => {
    const item = bank[(index + seed) % bank.length];
    return {
      id: `demo-fallback-${index + 1}`,
      ...item,
    };
  });

  return {
    title: `${cleanTopic} practice quiz (general ${cleanSubject} checks)`,
    subject: cleanSubject,
    topic: cleanTopic,
    difficulty: level,
    questions,
    mode: "demo",
  };
}

export function demoFollowUp(payload) {
  const article = findArticle(payload.subject, payload.topic || payload.question);
  if (article) {
    return { ...followUpFromArticle(article, payload.question), mode: "demo" };
  }
  const cleanTopic = titleCase(payload.topic) || "this topic";
  return {
    answer: [
      payload.question?.trim() ? `You asked: “${payload.question.trim()}”` : `Follow-up on ${cleanTopic}:`,
      "",
      payload.previousSummary
        ? `Keep this in view: ${payload.previousSummary}`
        : `Stay inside ${payload.subject || "the subject"}: definition, relation or process, units, example.`,
      "",
      `Answer the follow-up by substituting into the relevant formula or by tracing the next step of the process — not by giving generic study advice. If Demo Mode has no dedicated article for ${cleanTopic}, check your class notes or configure Google Gemini.`,
    ].join("\n"),
    followUps: [
      `What formula or process does ${cleanTopic} use?`,
      `What is a common mistake on ${cleanTopic}?`,
      "What would a one-sentence summary look like now?",
    ],
    mode: "demo",
  };
}
