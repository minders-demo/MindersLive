import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: React.ReactNode;
}

interface ToastContextType {
  showToast: (message: React.ReactNode, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => {
      const newToasts = [...prev, { id, type, message }];
      if (newToasts.length > 3) {
        return newToasts.slice(newToasts.length - 3);
      }
      return newToasts;
    });

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { key?: React.Key; toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[var(--color-accent-mint)]" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-[var(--color-accent-cyan)]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[var(--color-accent-yellow)]" />
  };

  const borders = {
    success: 'border-[var(--color-accent-mint)]/30',
    error: 'border-red-500/30',
    info: 'border-[var(--color-accent-cyan)]/30',
    warning: 'border-[var(--color-accent-yellow)]/30'
  };

  return (
    <div className={`pointer-events-auto bg-[var(--color-surface)]/95 backdrop-blur-md border ${borders[toast.type]} p-4 rounded-xl shadow-2xl flex items-start gap-3 w-80 animate-in slide-in-from-right-8 fade-in relative overflow-hidden group`}>
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 text-sm font-medium pr-6">{toast.message}</div>
      <button onClick={onClose} className="absolute right-3 top-4 text-gray-400 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
      <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
        <div className={`h-full animate-[shrink_4s_linear_forwards] ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'success' ? 'bg-[var(--color-accent-mint)]' : toast.type === 'warning' ? 'bg-[var(--color-accent-yellow)]' : 'bg-[var(--color-accent-cyan)]'}`} style={{ width: '100%' }} />
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
