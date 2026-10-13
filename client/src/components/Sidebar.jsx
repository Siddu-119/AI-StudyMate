import { NavLink } from "react-router-dom";
import {
  BookOpen,
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/quiz", label: "Quiz Generator", icon: GraduationCap },
  { to: "/planner", label: "Study Planner", icon: CalendarCheck },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { aiStatus } = useApp();

  return (
    <aside id="app-sidebar" className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <span className="brand-mark">
          <BookOpen size={20} />
        </span>
        <div>
          <strong>AI StudyMate</strong>
          <p>BharatCode Build League</p>
        </div>
      </div>
      <nav aria-label="Main">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              onClick={onClose}
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
      <div className={`mode-chip ${aiStatus.mode}`}>
        <span className="dot" />
        {aiStatus.mode === "live" ? "Live BharatCode API" : "Demo Mode"}
      </div>
    </aside>
  );
}
