import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createId,
  defaultSettings,
  loadAppData,
  resetAllData,
  clearAllKeepEmpty,
  saveActivity,
  saveNotes,
  saveQuizHistory,
  saveSettings,
  saveTasks,
} from "../lib/storage";
import { getAiStatus } from "../lib/api";

const AppContext = createContext(null);

function resolveTheme(theme) {
  if (theme === "light" || theme === "dark") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AppProvider({ children }) {
  const initial = loadAppData();
  const [tasks, setTasks] = useState(initial.tasks);
  const [notes, setNotes] = useState(initial.notes);
  const [settings, setSettings] = useState(initial.settings);
  const [activity, setActivity] = useState(initial.activity);
  const [quizHistory, setQuizHistory] = useState(initial.quizHistory);
  const [toasts, setToasts] = useState([]);
  const [aiStatus, setAiStatus] = useState({
    mode: "demo",
    configured: false,
    message: "Checking AI status…",
  });
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(initial.settings.theme));

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveActivity(activity);
  }, [activity]);

  useEffect(() => {
    saveQuizHistory(quizHistory);
  }, [quizHistory]);

  useEffect(() => {
    const apply = () => setResolvedTheme(resolveTheme(settings.theme));
    apply();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    getAiStatus()
      .then(setAiStatus)
      .catch(() =>
        setAiStatus({
          mode: "demo",
          configured: false,
          message: "Could not reach the local server. Start the backend, then refresh.",
        })
      );
  }, []);

  const notify = (message, type = "success") => {
    const id = createId("toast");
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const dismissToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const logActivity = (text) => {
    setActivity((current) => [{ id: createId("act"), text, at: new Date().toISOString() }, ...current].slice(0, 20));
  };

  const value = useMemo(
    () => ({
      tasks,
      setTasks,
      notes,
      setNotes,
      settings,
      setSettings,
      activity,
      quizHistory,
      setQuizHistory,
      toasts,
      notify,
      dismissToast,
      logActivity,
      aiStatus,
      setAiStatus,
      resolvedTheme,
      resetLocalData() {
        resetAllData();
        const fresh = loadAppData();
        setTasks(fresh.tasks);
        setNotes(fresh.notes);
        setSettings(fresh.settings);
        setActivity(fresh.activity);
        setQuizHistory(fresh.quizHistory);
        notify("Local data was reset to the sample starter set.");
      },
      clearLocalData() {
        clearAllKeepEmpty();
        setTasks([]);
        setNotes([]);
        setSettings(defaultSettings);
        setActivity([]);
        setQuizHistory([]);
        notify("All local tasks, notes, and history were cleared.");
      },
    }),
    [tasks, notes, settings, activity, quizHistory, toasts, aiStatus, resolvedTheme]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
