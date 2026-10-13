import { useMemo, useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { createId, PRIORITIES, SUBJECTS } from "../lib/storage";

const emptyForm = {
  title: "",
  subject: "Computer Science",
  dueDate: "",
  priority: "medium",
};

export default function Planner() {
  const { tasks, setTasks, settings, notify, logActivity } = useApp();
  const [form, setForm] = useState({ ...emptyForm, subject: settings.defaultSubject });
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [errors, setErrors] = useState({});

  const visible = useMemo(() => {
    const list = [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    if (filter === "open") return list.filter((task) => !task.done);
    if (filter === "done") return list.filter((task) => task.done);
    return list;
  }, [tasks, filter]);

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Give the task a short title.";
    if (!form.dueDate) next.dueDate = "Choose a due date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();
    if (!validate()) {
      notify("Please complete the required task fields.", "error");
      return;
    }
    if (editingId) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingId
            ? { ...task, ...form, title: form.title.trim() }
            : task
        )
      );
      notify("Task updated.");
      logActivity(`Updated planner task “${form.title.trim()}”.`);
    } else {
      const task = {
        id: createId("task"),
        ...form,
        title: form.title.trim(),
        done: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((current) => [task, ...current]);
      notify("Task added to your planner.");
      logActivity(`Added planner task “${task.title}”.`);
    }
    setEditingId(null);
    setForm({ ...emptyForm, subject: settings.defaultSubject });
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      subject: task.subject,
      dueDate: task.dueDate,
      priority: task.priority,
    });
  };

  return (
    <div className="stack fade-in">
      <form className="panel form-grid" onSubmit={submit}>
        <label className="wide">
          Task title
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="e.g. Finish chapter 4 examples"
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title ? <small className="error-text">{errors.title}</small> : null}
        </label>
        <label>
          Subject
          <select
            value={form.subject}
            onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
          >
            {SUBJECTS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Due date
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
          />
          {errors.dueDate ? <small className="error-text">{errors.dueDate}</small> : null}
        </label>
        <label>
          Priority
          <select
            value={form.priority}
            onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
          >
            {PRIORITIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="form-actions">
          <button className="btn primary" type="submit">
            <Plus size={16} />
            {editingId ? "Save changes" : "Add task"}
          </button>
          {editingId ? (
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ ...emptyForm, subject: settings.defaultSubject });
              }}
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <section className="panel">
        <div className="panel-head">
          <h3>Your tasks</h3>
          <div className="chip-row">
            {["all", "open", "done"].map((item) => (
              <button
                key={item}
                type="button"
                className={`ghost-chip clickable ${filter === item ? "on" : ""}`}
                onClick={() => setFilter(item)}
              >
                {item === "all" ? "All" : item === "open" ? "Open" : "Done"}
              </button>
            ))}
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="muted">No tasks in this view. Add one above.</p>
        ) : (
          <ul className="task-list">
            {visible.map((task) => (
              <li key={task.id} className={`task-row ${task.done ? "done" : ""}`}>
                <button
                  className="check"
                  type="button"
                  aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                  onClick={() => {
                    setTasks((current) =>
                      current.map((item) => (item.id === task.id ? { ...item, done: !item.done } : item))
                    );
                    logActivity(
                      task.done ? `Reopened “${task.title}”.` : `Completed “${task.title}”.`
                    );
                  }}
                >
                  {task.done ? <Check size={14} /> : null}
                </button>
                <div>
                  <strong>{task.title}</strong>
                  <p>
                    {task.subject} · due {task.dueDate} · {task.priority} priority
                  </p>
                </div>
                <div className="row-actions">
                  <button className="icon-btn" type="button" onClick={() => startEdit(task)} aria-label="Edit task">
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-btn danger"
                    type="button"
                    onClick={() => {
                      setTasks((current) => current.filter((item) => item.id !== task.id));
                      if (editingId === task.id) {
                        setEditingId(null);
                        setForm({ ...emptyForm, subject: settings.defaultSubject });
                      }
                      notify("Task deleted.");
                      logActivity(`Deleted planner task “${task.title}”.`);
                    }}
                    aria-label="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
