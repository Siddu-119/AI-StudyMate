import assert from "node:assert/strict";
import { demoExplain, demoFollowUp, demoQuiz } from "./demo.js";
import { findArticle, normaliseQuery } from "./knowledge.js";

assert.equal(normaliseQuery("Explain Ohm's Law."), "ohms law");
assert.equal(normaliseQuery("ohms low"), "ohms law");
assert.equal(findArticle("Physics", "Explain Ohm's Law.")?.id, "ohms-law");

const ohms = demoExplain({
  subject: "Physics",
  topic: "Explain Ohm's Law.",
  difficulty: "beginner",
});
assert.equal(ohms.mode, "demo");
assert.match(ohms.summary, /V = I × R/);
assert.match(ohms.explanation, /volt/i);
assert.match(ohms.explanation, /current/i);
assert.match(ohms.explanation, /resistance/i);
assert.ok(ohms.formulas.some((item) => /V = I/.test(item)));

const follow = demoFollowUp({
  subject: "Physics",
  topic: "Ohm's Law",
  question: "What happens to current if resistance doubles and voltage stays the same?",
  previousSummary: ohms.summary,
});
assert.match(follow.answer, /half|decreas/i);

const quiz = demoQuiz({
  subject: "Physics",
  topic: "Ohm's Law",
  difficulty: "beginner",
  count: 5,
});
assert.equal(quiz.questions.length, 5);
for (const question of quiz.questions) {
  assert.equal(question.options.length, 4);
  assert.ok(question.correctIndex >= 0 && question.correctIndex <= 3);
  assert.ok(question.explanation.length > 8);
  assert.match(question.question, /Ohm|V =|Resistance|current|silicon/i);
}

const emptyExplain = demoExplain({ subject: "Physics", topic: "   ", difficulty: "beginner" });
assert.ok(emptyExplain.title);

console.log("Demo knowledge checks passed.");
