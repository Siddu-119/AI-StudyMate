const KEYS = {
  tasks: "studymate.tasks",
  notes: "studymate.notes",
  settings: "studymate.settings",
  activity: "studymate.activity",
  quizHistory: "studymate.quizHistory",
  seeded: "studymate.seeded",
};

export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Electronics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Programming",
  "English",
  "History",
  "Economics",
  "General Studies",
];

export const DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const defaultSettings = {
  displayName: "Student",
  theme: "system",
  dailyGoalHours: 2,
  defaultSubject: "Computer Science",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function seedIfNeeded() {
  if (read(KEYS.seeded, false)) return;
  const now = new Date().toISOString();
  write(KEYS.tasks, [
    {
      id: uid("task"),
      title: "Revise binary search with two examples",
      subject: "Computer Science",
      dueDate: daysFromNow(1),
      priority: "high",
      done: false,
      createdAt: now,
    },
    {
      id: uid("task"),
      title: "Practice 10 calculus limits",
      subject: "Mathematics",
      dueDate: daysFromNow(2),
      priority: "medium",
      done: false,
      createdAt: now,
    },
    {
      id: uid("task"),
      title: "Write a one-page summary of photosynthesis",
      subject: "Biology",
      dueDate: daysFromNow(3),
      priority: "low",
      done: true,
      createdAt: now,
    },
  ]);
  write(KEYS.notes, [
    {
      id: uid("note"),
      title: "How I start a new topic",
      subject: "General Studies",
      content:
        "1. Write the goal in one sentence.\n2. Learn the definition in my own words.\n3. Do one tiny example.\n4. Make two quiz questions.\n5. Schedule a follow-up on the planner.",
      updatedAt: now,
    },
    {
      id: uid("note"),
      title: "Stack vs queue",
      subject: "Computer Science",
      content:
        "Stack: last in, first out. Use for undo, recursion, and parsing.\nQueue: first in, first out. Use for printers, requests, and breadth-first search.",
      updatedAt: now,
    },
  ]);
  write(KEYS.activity, [
    {
      id: uid("act"),
      text: "Welcome to AI StudyMate. Sample tasks and notes were added so the dashboard is not empty.",
      at: now,
    },
  ]);
  write(KEYS.quizHistory, []);
  write(KEYS.settings, defaultSettings);
  write(KEYS.seeded, true);
}

export function loadAppData() {
  seedIfNeeded();
  return {
    tasks: read(KEYS.tasks, []),
    notes: read(KEYS.notes, []),
    settings: { ...defaultSettings, ...read(KEYS.settings, {}) },
    activity: read(KEYS.activity, []),
    quizHistory: read(KEYS.quizHistory, []),
  };
}

export function saveTasks(tasks) {
  write(KEYS.tasks, tasks);
}

export function saveNotes(notes) {
  write(KEYS.notes, notes);
}

export function saveSettings(settings) {
  write(KEYS.settings, settings);
}

export function saveActivity(activity) {
  write(KEYS.activity, activity.slice(0, 20));
}

export function saveQuizHistory(history) {
  write(KEYS.quizHistory, history.slice(0, 20));
}

export function resetAllData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

export function clearAllKeepEmpty() {
  resetAllData();
  write(KEYS.tasks, []);
  write(KEYS.notes, []);
  write(KEYS.activity, []);
  write(KEYS.quizHistory, []);
  write(KEYS.settings, defaultSettings);
  write(KEYS.seeded, true);
}

export function createId(prefix) {
  return uid(prefix);
}
