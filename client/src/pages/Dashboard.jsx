import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatTime(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const { settings, tasks, notes, quizHistory, activity, aiStatus } = useApp();
  const done = tasks.filter((task) => task.done).length;
  const open = tasks.length - done;
  const dueSoon = tasks.filter((task) => !task.done && task.dueDate <= new Date().toISOString().slice(0, 10)).length;
  const lastScore = quizHistory[0];
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const goal = Number(settings.dailyGoalHours) || 2;

  return (
    <div className="stack fade-in">
      <section className="hero-card">
        <div>
          <p className="eyebrow">{greeting()}</p>
          <h2>{settings.displayName || "Student"}, ready to study?</h2>
          <p className="muted">
            Explain a tough topic, take a quiz, tick off a planner task, or capture a note. Your work stays in this
            browser after refresh.
          </p>
          <div className="chip-row">
            <span className={`mode-chip ${aiStatus.mode}`}>
              {aiStatus.mode === "live" ? "Live BharatCode API" : "Demo Mode"}
            </span>
            <span className="ghost-chip">Daily goal · {goal} hour{goal === 1 ? "" : "s"}</span>
          </div>
        </div>
        <div className="hero-actions">
          <Link className="btn primary" to="/assistant">
            <Sparkles size={16} /> Ask the assistant
          </Link>
          <Link className="btn ghost" to="/quiz">
            <GraduationCap size={16} /> Generate a quiz
          </Link>
        </div>
      </section>

      <section className="stat-grid">
        <article className="stat-card">
          <CalendarCheck size={18} />
          <strong>{open}</strong>
          <span>Open tasks</span>
        </article>
        <article className="stat-card">
          <CheckCircle2 size={18} />
          <strong>{done}</strong>
          <span>Completed</span>
        </article>
        <article className="stat-card">
          <StickyNote size={18} />
          <strong>{notes.length}</strong>
          <span>Saved notes</span>
        </article>
        <article className="stat-card">
          <GraduationCap size={18} />
          <strong>{lastScore ? `${lastScore.percent}%` : "—"}</strong>
          <span>Last quiz score</span>
        </article>
      </section>

      <section className="grid-2">
        <article className="panel">
          <div className="panel-head">
            <h3>Study progress</h3>
            <span className="muted">{progress}% of planner tasks done</span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Planner completion"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="muted small">
            {dueSoon
              ? `${dueSoon} task${dueSoon === 1 ? "" : "s"} due today or overdue.`
              : "Nothing overdue. Add a task if you want a target for today."}
          </p>
          <Link className="text-link" to="/planner">
            Open planner <ArrowRight size={14} />
          </Link>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h3>Quick actions</h3>
          </div>
          <div className="quick-grid">
            <Link to="/assistant" className="quick-card">
              <Sparkles size={16} /> Explain a topic
            </Link>
            <Link to="/quiz" className="quick-card">
              <GraduationCap size={16} /> Practice quiz
            </Link>
            <Link to="/planner" className="quick-card">
              <CalendarCheck size={16} /> Add a task
            </Link>
            <Link to="/notes" className="quick-card">
              <BookOpen size={16} /> Write a note
            </Link>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Recent activity</h3>
        </div>
        {activity.length === 0 ? (
          <p className="muted">No activity yet. Generate an explanation, finish a quiz, or save a note.</p>
        ) : (
          <ul className="activity-list">
            {activity.slice(0, 6).map((item) => (
              <li key={item.id}>
                <span>{item.text}</span>
                <time>{formatTime(item.at)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
