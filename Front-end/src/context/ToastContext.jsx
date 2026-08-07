// src/context/ToastContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((mensagem) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, mensagem }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Container fixo, mostra os toasts empilhados */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-[var(--color-surface)] border border-[var(--color-accent)]/40 text-[var(--color-text-primary)] text-sm px-4 py-3 rounded-[var(--radius-md)] shadow-lg shadow-black/30 flex items-center gap-2 animate-[fadeInUp_0.3s_ease]"
          >
            <span className="text-[var(--color-accent)]">✓</span>
            {toast.mensagem}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}