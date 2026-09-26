import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, description, variant = 'info', duration = 4000 }) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, description, variant, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Stack - Floating Bottom Right */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastItem({ toast, onDismiss }) {
  const { title, description, variant } = toast;

  const config = {
    success: {
      icon: CheckCircle2,
      border: 'border-status-success/40',
      bg: 'bg-[#0E1512]/95',
      text: 'text-emerald-400',
      glow: 'shadow-[0_8px_30px_rgba(16,185,129,0.25)]',
    },
    danger: {
      icon: AlertCircle,
      border: 'border-status-danger/40',
      bg: 'bg-[#180E10]/95',
      text: 'text-red-400',
      glow: 'shadow-[0_8px_30px_rgba(239,68,68,0.25)]',
    },
    warning: {
      icon: AlertTriangle,
      border: 'border-status-warning/40',
      bg: 'bg-[#18140E]/95',
      text: 'text-amber-300',
      glow: 'shadow-[0_8px_30px_rgba(245,158,11,0.25)]',
    },
    accent: {
      icon: Info,
      border: 'border-accent/40',
      bg: 'bg-[#17100D]/95',
      text: 'text-accent',
      glow: 'shadow-accent-glow',
    },
    info: {
      icon: Info,
      border: 'border-white/[0.14]',
      bg: 'bg-surface-elevated/95',
      text: 'text-white',
      glow: 'shadow-2xl',
    },
  };

  const style = config[variant] || config.info;
  const IconComponent = style.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-2xl ${style.bg} ${style.border} ${style.glow} flex items-start gap-3 shadow-2xl relative overflow-hidden`}
    >
      <div className={`mt-0.5 shrink-0 ${style.text}`}>
        <IconComponent className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 pr-4">
        {title && (
          <div className="font-display font-bold text-sm text-white leading-snug">
            {title}
          </div>
        )}
        {description && (
          <div className="text-xs text-neutral-300 mt-0.5 leading-relaxed font-medium">
            {description}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Subtle indicator bar */}
      <div className={`absolute bottom-0 inset-x-0 h-0.5 ${style.text} opacity-30`} />
    </motion.div>
  );
}
