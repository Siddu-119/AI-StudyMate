import { Moon, Monitor, Sun } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { SUBJECTS } from "../lib/storage";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function Settings() {
  const { settings, setSettings, notify, resetLocalData, clearLocalData, aiStatus, resolvedTheme } = useApp();

  const update = (partial) => {
    setSettings((current) => ({ ...current, ...partial }));
  };

  return (
    <div className="stack fade-in">
      <section className="panel stack-sm">
        <h3>Profile</h3>
        <label>
          Display name
          <input
            value={settings.displayName}
            onChange={(event) => update({ displayName: event.target.value })}
            placeholder="Your name"
          />
        </label>
        <label>
          Default subject
          <select
            value={settings.defaultSubject}
            onChange={(event) => update({ defaultSubject: event.target.value })}
          >
            {SUBJECTS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Daily study goal (hours)
          <input
            type="number"
            min="1"
            max="12"
            value={settings.dailyGoalHours}
            onChange={(event) => update({ dailyGoalHours: Number(event.target.value) || 1 })}
          />
        </label>
        <button className="btn primary" type="button" onClick={() => notify("Preferences saved in this browser.")}>
          Save preferences
        </button>
      </section>

      <section className="panel stack-sm">
        <h3>Theme</h3>
        <p className="muted">Currently showing {resolvedTheme} mode{settings.theme === "system" ? " (from your system)" : ""}.</p>
        <div className="theme-grid">
          {themes.map((theme) => {
            const Icon = theme.icon;
            return (
              <button
                key={theme.value}
                type="button"
                className={`theme-card ${settings.theme === theme.value ? "on" : ""}`}
                onClick={() => {
                  update({ theme: theme.value });
                  notify(`Theme set to ${theme.label.toLowerCase()}.`);
                }}
              >
                <Icon size={18} />
                {theme.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel stack-sm">
        <h3>AI connection</h3>
        <p className="muted">{aiStatus.message}</p>
        <p className="muted small">
          To use the official BharatCode model, copy `.env.example` to `server/.env`, add your key from
          https://bharatcode.ai/account, restart the backend, and refresh this page. The key never goes in the
          frontend.
        </p>
      </section>

      <section className="panel stack-sm">
        <h3>Local data</h3>
        <p className="muted">Tasks, notes, quiz history, and preferences are stored in this browser only.</p>
        <div className="form-actions">
          <button className="btn ghost" type="button" onClick={resetLocalData}>
            Restore sample data
          </button>
          <button className="btn danger" type="button" onClick={clearLocalData}>
            Clear all local data
          </button>
        </div>
      </section>
    </div>
  );
}
