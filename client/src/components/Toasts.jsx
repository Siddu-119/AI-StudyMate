import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

export default function Toasts() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.type === "error" ? <CircleAlert size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
          <button className="icon-btn tiny" onClick={() => dismissToast(toast.id)} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
