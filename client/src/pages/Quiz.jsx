import { useState } from "react";
import { GraduationCap, LoaderCircle, RotateCcw } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { generateQuiz } from "../lib/api";
import { createId, DIFFICULTIES, SUBJECTS } from "../lib/storage";

export default function Quiz() {
  const { settings, notify, logActivity, setQuizHistory, aiStatus } = useApp();
  const [subject, setSubject] = useState(settings.defaultSubject);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [topicError, setTopicError] = useState("");
  const [requestError, setRequestError] = useState("");

  const startQuiz = async (event) => {
    event?.preventDefault();
    if (!topic.trim()) {
      setTopicError("Enter a topic so the quiz has something to test.");
      notify("Enter a topic so the quiz has something to test.", "error");
      return;
    }
    setTopicError("");
    setLoading(true);
    setSubmitted(false);
    setScore(null);
    setAnswers({});
    setRequestError("");
    try {
      const data = await generateQuiz({
        subject,
        topic: topic.trim(),
        difficulty,
        count,
      });
      if (!data.questions?.length) {
        throw new Error("No questions were returned. Try another topic.");
      }
      setQuiz(data);
      logActivity(`Generated a ${data.questions.length}-question quiz on ${topic.trim()}.`);
      notify(data.mode === "live" ? "Quiz ready from the model API." : "Demo quiz ready.");
    } catch (error) {
      setRequestError(error.message || "Could not generate a quiz.");
      notify(error.message || "Could not generate a quiz.", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = (event) => {
    event.preventDefault();
    if (!quiz) return;
    const unanswered = quiz.questions.filter((question) => answers[question.id] === undefined);
    if (unanswered.length) {
      notify(`Select an answer for all questions (${unanswered.length} left).`, "error");
      return;
    }
    let correct = 0;
    quiz.questions.forEach((question) => {
      if (Number(answers[question.id]) === Number(question.correctIndex)) correct += 1;
    });
    const percent = Math.round((correct / quiz.questions.length) * 100);
    setScore({ correct, total: quiz.questions.length, percent });
    setSubmitted(true);
    setQuizHistory((current) =>
      [
        {
          id: createId("quiz"),
          topic: quiz.topic || topic,
          subject: quiz.subject || subject,
          percent,
          correct,
          total: quiz.questions.length,
          at: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 20)
    );
    logActivity(`Scored ${correct}/${quiz.questions.length} on ${quiz.topic || topic}.`);
    notify(`You scored ${correct} out of ${quiz.questions.length}.`);
  };

  const retry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  return (
    <div className="stack fade-in">
      <section className="banner" role="status">
        {aiStatus.message}
      </section>

      <form className="panel form-grid" onSubmit={startQuiz}>
        <label htmlFor="quiz-subject">
          Subject
          <select id="quiz-subject" value={subject} onChange={(event) => setSubject(event.target.value)}>
            {SUBJECTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="quiz-topic">
          Topic
          <input
            id="quiz-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g. Ohm's Law, SQL joins"
            aria-invalid={Boolean(topicError)}
            aria-describedby={topicError ? "quiz-topic-error" : undefined}
          />
          {topicError ? (
            <small id="quiz-topic-error" className="error-text">
              {topicError}
            </small>
          ) : null}
        </label>
        <label htmlFor="quiz-difficulty">
          Difficulty
          <select
            id="quiz-difficulty"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            {DIFFICULTIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="quiz-count">
          Questions
          <select id="quiz-count" value={count} onChange={(event) => setCount(Number(event.target.value))}>
            {[3, 4, 5, 6, 8].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <div className="form-actions">
          <button className="btn primary" type="submit" disabled={loading} aria-busy={loading}>
            {loading ? <LoaderCircle className="spin" size={16} /> : <GraduationCap size={16} />}
            {loading ? "Building quiz…" : "Generate quiz"}
          </button>
        </div>
      </form>

      {loading ? (
        <section className="panel empty-state" aria-live="polite">
          <LoaderCircle className="spin" size={22} />
          <p>Building your questions…</p>
        </section>
      ) : null}

      {requestError ? (
        <section className="panel error-panel" role="alert">
          <p>{requestError}</p>
          <button className="btn ghost" type="button" onClick={startQuiz}>
            <RotateCcw size={16} /> Retry
          </button>
        </section>
      ) : null}

      {!quiz && !loading && !requestError ? (
        <section className="panel empty-state">
          <GraduationCap size={22} />
          <h3>No quiz yet</h3>
          <p className="muted">
            Enter a topic such as Ohm&apos;s Law or binary search. Each question has one correct answer and an
            explanation after you check your work.
          </p>
        </section>
      ) : null}

      {quiz ? (
        <form className="panel stack-sm" onSubmit={submitQuiz}>
          <div className="panel-head">
            <h3>{quiz.title}</h3>
            <span className={`mode-chip ${quiz.mode === "live" ? "live" : "demo"}`}>
              {quiz.mode === "live" ? "Live BharatCode API" : "Demo Mode quiz"}
            </span>
          </div>

          {quiz.questions.map((question, index) => {
            const selected = answers[question.id];
            return (
              <fieldset key={question.id} className="question-card">
                <legend>
                  {index + 1}. {question.question}
                </legend>
                {question.options.map((option, optionIndex) => {
                  const isCorrect = submitted && optionIndex === question.correctIndex;
                  const isWrong = submitted && selected === optionIndex && optionIndex !== question.correctIndex;
                  return (
                    <label
                      key={`${question.id}-${optionIndex}`}
                      className={`option ${selected === optionIndex ? "picked" : ""} ${isCorrect ? "correct" : ""} ${
                        isWrong ? "wrong" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        disabled={submitted}
                        checked={selected === optionIndex}
                        onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                      />
                      {option}
                    </label>
                  );
                })}
                {submitted ? <p className="explain">{question.explanation}</p> : null}
              </fieldset>
            );
          })}

          {score ? (
            <div className="score-banner" role="status">
              Score: {score.correct}/{score.total} · {score.percent}%
            </div>
          ) : null}

          <div className="form-actions">
            {submitted ? (
              <>
                <button className="btn ghost" type="button" onClick={retry}>
                  <RotateCcw size={16} /> Retry same quiz
                </button>
                <button className="btn primary" type="button" onClick={startQuiz}>
                  New quiz
                </button>
              </>
            ) : (
              <button className="btn primary" type="submit">
                Check answers
              </button>
            )}
          </div>
        </form>
      ) : null}
    </div>
  );
}
