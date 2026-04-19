import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircleIcon, WarningIcon } from './icons';
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-[80px] left-0 right-0 z-[100] flex flex-col items-center gap-[8px] pointer-events-none p-[24px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`pointer-events-auto flex items-center gap-[12px] px-[16px] py-[12px] rounded-[12px] shadow-[var(--shadow-shadow-lg)] w-full max-w-[320px] ${
              toast.type === 'success' ? 'bg-[var(--color-text-primary)] text-white border border-[var(--color-success)]' :
              toast.type === 'error' ? 'bg-[var(--color-danger)] text-white' :
              'bg-[var(--color-warning)] text-[var(--color-text-primary)]'
            }`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="shrink-0">
              {toast.type === 'success' && <CheckCircleIcon size={20} className="text-[var(--color-success)]" />}
              {toast.type === 'error' && <WarningIcon size={20} className="text-white" />}
              {toast.type === 'warning' && <WarningIcon size={20} className="text-[var(--color-text-primary)]" />}
            </div>
            <p className="text-[14px] font-[600] flex-1 leading-snug">{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
