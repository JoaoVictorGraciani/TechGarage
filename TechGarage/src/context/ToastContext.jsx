/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
let sequence = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((message, type = 'info', duration = 3200) => {
    const id = ++sequence;
    setToasts((current) => [...current.slice(-3), { id, message, type }]);
    window.setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  const api = useMemo(() => ({
    push,
    success: (message) => push(message, 'success'),
    error: (message) => push(message, 'error', 4500),
    info: (message) => push(message, 'info'),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((toast) => <Toast key={toast.id} toast={toast} onClose={() => remove(toast.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  const meta = {
    success: { icon: CheckCircle2, cls: 'border-emerald-500/30 text-emerald-300' },
    error: { icon: CircleAlert, cls: 'border-red-500/30 text-red-300' },
    info: { icon: Info, cls: 'border-lime-400/30 text-lime-300' },
  }[toast.type] || { icon: Info, cls: 'border-zinc-700 text-zinc-200' };
  const Icon = meta.icon;

  return (
    <div className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-zinc-950/95 p-4 shadow-2xl backdrop-blur ${meta.cls}`}>
      <Icon size={19} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm leading-5 text-zinc-100">{toast.message}</p>
      <button type="button" onClick={onClose} aria-label="Fechar aviso" className="text-zinc-500 hover:text-white"><X size={16} /></button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve ser usado dentro de ToastProvider.');
  return context;
}
