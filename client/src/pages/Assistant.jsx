import { useMemo, useState } from "react";
import { LoaderCircle, MessageCircleQuestion, RotateCcw, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { askFollowUp, explainTopic } from "../lib/api";
import { DIFFICULTIES, SUBJECTS } from "../lib/storage";

export default function Assistant() {
  const { settings, notify, logActivity, aiStatus } = useApp();
  const [subject, setSubject] = useState(settings.defaultSubject);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [followQuestion, setFollowQuestion] = useState("");
  const [followAnswer, setFollowAnswer] = useState(null);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");

  const modeLabel = useMemo(() => {
    if (result?.mode === "live") return "Generated with BharatCode";
    return "Demo Mode explanation";
  }, [result]);

  const runExplain = async () => {
    const nextErrors = {};
    if (!topic.trim()) nextErrors.topic = "Enter a topic, for example “Ohm's Law” or “binary search”.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      notify("Please add a topic before asking for an explanation.", "error");
      return;
    }

    setLoading(true);
    setFollowAnswer(null);
    setRequestError("");
    try {
      const data = await explainTopic({ subject, topic: topic.trim(), difficulty });
      setResult(data);
      logActivity(`Asked the assistant about ${topic.trim()} (${subject}).`);
      notify(data.mode === "live" ? "Explanation ready from the model API." : "Demo explanation ready.");
    } catch (error) {
      setRequestError(error.message || "Could not generate an explanation.");
      notify(error.message || "Could not generate an explanation.", "error");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    await runExplain();
  };

  const sendFollowUp = async (question) => {
    if (!question.trim()) {
      notify("Type a follow-up question first.", "error");
      return;
    }
    setFollowLoading(true);
    setRequestError("");
    try {
      const data = await askFollowUp({
        subject,
        topic: topic.trim() || result?.title,
        question: question.trim(),
        previousSummary: result?.summary || "",
      });
      setFollowAnswer(data);
      setFollowQuestion("");
      logActivity(`Asked a follow-up on ${topic.trim() || "the current topic"}.`);
    } catch (error) {
      setRequestError(error.message || "Follow-up failed.");
      notify(error.message || "Follow-up failed.", "error");
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="stack fade-in">
      <section className="banner" role="status">
        {aiStatus.message}
      </section>

      <form className="panel form-grid" onSubmit={submit}>
        <label htmlFor="assistant-subject">
          Subject
          <select
            id="assistant-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          >
            {SUBJECTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="assistant-topic">
          Topic or question
          <input
            id="assistant-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g. Explain Ohm's Law"
            aria-invalid={Boolean(errors.topic)}
            aria-describedby={errors.topic ? "assistant-topic-error" : undefined}
          />
          {errors.topic ? (
            <small id="assistant-topic-error" className="error-text">
              {errors.topic}
            </small>
          ) : null}
        </label>
        <label htmlFor="assistant-difficulty">
          Difficulty
          <select
            id="assistant-difficulty"
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
        <div className="form-actions">
          <button className="btn primary" type="submit" disabled={loading} aria-busy={loading}>
            {loading ? <LoaderCircle className="spin" size={16} /> : <Sparkles size={16} />}
            {loading ? "Explaining…" : "Explain this topic"}
          </button>
        </div>
      </form>

      {loading ? (
        <section className="panel empty-state" aria-live="polite">
          <LoaderCircle className="spin" size={22} />
          <p>Preparing an explanation…</p>
        </section>
      ) : null}

      {requestError ? (
        <section className="panel error-panel" role="alert">
          <p>{requestError}</p>
          <button className="btn ghost" type="button" onClick={runExplain}>
            <RotateCcw size={16} /> Retry
          </button>
        </section>
      ) : null}

      {!result && !loading && !requestError ? (
        <section className="panel empty-state">
          <Sparkles size={22} />
          <h3>Ask a real class question</h3>
          <p className="muted">
            Try “Explain Ohm&apos;s Law”, “binary search”, “quadratic formula”, or a follow-up in your own words.
            Demo Mode uses built-in study articles; live mode needs a BharatCode key on the server.
          </p>
        </section>
      ) : null}

      {result ? (
        <article className="panel explanation">
          <div className="panel-head">
            <h3>{result.title || topic}</h3>
            <span className={`mode-chip ${result.mode === "live" ? "live" : "demo"}`}>{modeLabel}</span>
          </div>
          {result.summary ? <p className="lead">{result.summary}</p> : null}
          {result.formulas?.length ? (
            <ul className="formula-list">
              {result.formulas.map((formula) => (
                <li key={formula}>
                  <code>{formula}</code>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="prose">{result.explanation}</div>
          {result.examples?.length ? (
            <div className="example-grid">
              {result.examples.map((example) => (
                <article key={example.title} className="mini-card">
                  <h4>{example.title}</h4>
                  <p>{example.body}</p>
                </article>
              ))}
            </div>
          ) : null}
          {result.commonMistakes?.length ? (
            <div>
              <h4 className="subhead">Common mistakes</h4>
              <ul className="tips">
                {result.commonMistakes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {result.tips?.length ? (
            <div>
              <h4 className="subhead">Study tips</h4>
              <ul className="tips">
                {result.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      ) : null}

      {result ? (
        <section className="panel">
          <div className="panel-head">
            <h3>Follow-up questions</h3>
          </div>
          <div className="chip-row wrap">
            {(followAnswer?.followUps?.length ? followAnswer.followUps : result.followUps || []).map((item) => (
              <button key={item} type="button" className="ghost-chip clickable" onClick={() => sendFollowUp(item)}>
                <MessageCircleQuestion size={14} />
                {item}
              </button>
            ))}
          </div>
          <form
            className="follow-row"
            onSubmit={(event) => {
              event.preventDefault();
              sendFollowUp(followQuestion);
            }}
          >
            <label className="sr-only" htmlFor="follow-question">
              Follow-up question
            </label>
            <input
              id="follow-question"
              value={followQuestion}
              onChange={(event) => setFollowQuestion(event.target.value)}
              placeholder="Ask a follow-up in your own words"
            />
            <button className="btn primary" type="submit" disabled={followLoading} aria-busy={followLoading}>
              {followLoading ? <LoaderCircle className="spin" size={16} /> : "Ask"}
            </button>
          </form>
          {followLoading ? (
            <p className="muted small">Thinking about your follow-up…</p>
          ) : null}
          {followAnswer?.answer ? (
            <div className="prose follow-answer">
              {followAnswer.mode === "demo" ? (
                <span className="mode-chip demo">Demo Mode follow-up</span>
              ) : (
                <span className="mode-chip live">Live follow-up</span>
              )}
              {followAnswer.answer}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
