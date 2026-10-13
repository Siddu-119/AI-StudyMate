import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { createId, SUBJECTS } from "../lib/storage";

const emptyForm = { title: "", subject: "General Studies", content: "" };

export default function Notes() {
  const { notes, setNotes, settings, notify, logActivity } = useApp();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ ...emptyForm, subject: settings.defaultSubject });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return notes
      .filter((note) => {
        if (!needle) return true;
        return `${note.title} ${note.subject} ${note.content}`.toLowerCase().includes(needle);
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, query]);

  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = "Add a note title.";
    if (!form.content.trim()) next.content = "Write at least a short note.";
    setErrors(next);
    if (Object.keys(next).length) {
      notify("Title and note text are required.", "error");
      return;
    }
    const payload = {
      title: form.title.trim(),
      subject: form.subject,
      content: form.content.trim(),
      updatedAt: new Date().toISOString(),
    };
    if (editingId) {
      setNotes((current) => current.map((note) => (note.id === editingId ? { ...note, ...payload } : note)));
      notify("Note saved.");
      logActivity(`Updated note “${payload.title}”.`);
    } else {
      setNotes((current) => [{ id: createId("note"), ...payload }, ...current]);
      notify("Note created.");
      logActivity(`Created note “${payload.title}”.`);
    }
    setEditingId(null);
    setForm({ ...emptyForm, subject: settings.defaultSubject });
  };

  return (
    <div className="notes-layout fade-in">
      <form className="panel stack-sm" onSubmit={submit}>
        <h3>{editingId ? "Edit note" : "New note"}</h3>
        <label>
          Title
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="e.g. Mid-term formula sheet"
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
          Note
          <textarea
            rows="8"
            value={form.content}
            onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
            placeholder="Write definitions, examples, or a recap of today's class."
          />
          {errors.content ? <small className="error-text">{errors.content}</small> : null}
        </label>
        <div className="form-actions">
          <button className="btn primary" type="submit">
            <Plus size={16} />
            {editingId ? "Save note" : "Create note"}
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
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <section className="panel stack-sm">
        <label className="search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes by title, subject, or text"
          />
        </label>
        {filtered.length === 0 ? (
          <p className="muted">No notes match that search. Create one on the left.</p>
        ) : (
          <ul className="note-list">
            {filtered.map((note) => (
              <li key={note.id} className="note-card">
                <div className="panel-head">
                  <h4>{note.title}</h4>
                  <div className="row-actions">
                    <button
                      className="icon-btn"
                      type="button"
                      aria-label="Edit note"
                      onClick={() => {
                        setEditingId(note.id);
                        setForm({
                          title: note.title,
                          subject: note.subject,
                          content: note.content,
                        });
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-btn danger"
                      type="button"
                      aria-label="Delete note"
                      onClick={() => {
                        setNotes((current) => current.filter((item) => item.id !== note.id));
                        if (editingId === note.id) {
                          setEditingId(null);
                          setForm({ ...emptyForm, subject: settings.defaultSubject });
                        }
                        notify("Note deleted.");
                        logActivity(`Deleted note “${note.title}”.`);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="muted small">
                  {note.subject} · updated {new Date(note.updatedAt).toLocaleString()}
                </p>
                <p className="note-body">{note.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
