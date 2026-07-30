import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, XCircle, Info, AlertCircle, X } from "lucide-react";

type ToastTone = "success" | "error" | "info" | "warning";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
  title?: string;
};

type ToastInput = {
  message: string;
  tone?: ToastTone;
  title?: string;
};

type ToastContextValue = {
  notify: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_ICONS = {
  success: <CheckCircle2 size={20} className="toast-icon-success" />,
  error: <XCircle size={20} className="toast-icon-error" />,
  info: <Info size={20} className="toast-icon-info" />,
  warning: <AlertCircle size={20} className="toast-icon-warning" />
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    ({ message, tone = "info", title }: ToastInput) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current.slice(-2), { id, message, tone, title }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div className={`toast-card toast-${toast.tone}`} key={toast.id} role="status">
            <div className="toast-content-wrapper">
              <div className="toast-icon-container">
                {TONE_ICONS[toast.tone]}
              </div>
              <div className="toast-text-container">
                {toast.title ? <strong>{toast.title}</strong> : null}
                <p>{toast.message}</p>
              </div>
              <button type="button" aria-label="关闭提示" onClick={() => dismiss(toast.id)} className="toast-close-btn">
                <X size={16} />
              </button>
            </div>
            <div className={`toast-progress-bar bg-${toast.tone}`} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
