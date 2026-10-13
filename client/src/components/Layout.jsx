import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";
import Toasts from "./Toasts.jsx";

export default function Layout() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {open ? <button className="backdrop" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
      <div className="main-column">
        <TopBar onMenu={() => setOpen(true)} menuOpen={open} />
        <main id="main-content" className="page" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <Toasts />
    </div>
  );
}
