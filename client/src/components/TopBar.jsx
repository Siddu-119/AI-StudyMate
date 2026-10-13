import { Menu, Moon, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

const titles = {
  "/": "Dashboard",
  "/assistant": "AI Study Assistant",
  "/quiz": "Quiz Generator",
  "/planner": "Study Planner",
  "/notes": "Notes",
  "/settings": "Settings",
};

export default function TopBar({ onMenu, menuOpen }) {
  const { pathname } = useLocation();
  const { resolvedTheme, settings, setSettings } = useApp();

  const toggleTheme = () => {
    setSettings((current) => ({
      ...current,
      theme: resolvedTheme === "dark" ? "light" : "dark",
    }));
  };

  return (
    <header className="topbar">
      <button
        className="icon-btn menu-btn"
        type="button"
        onClick={onMenu}
        aria-label="Open navigation"
        aria-expanded={menuOpen}
        aria-controls="app-sidebar"
      >
        <Menu size={20} />
      </button>
      <div>
        <p className="eyebrow">Hello, {settings.displayName || "Student"}</p>
        <h1>{titles[pathname] || "AI StudyMate"}</h1>
      </div>
      <button className="icon-btn" type="button" onClick={toggleTheme} aria-label="Toggle colour theme">
        {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
