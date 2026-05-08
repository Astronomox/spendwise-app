// src/components/ui/Toast.tsx
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

// ─── Store ────────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id:      string;
  message: string;
  variant: ToastVariant;
}

interface ToastStore {
  toasts:      Toast[];
  addToast:    (message: string, variant?: ToastVariant) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, variant = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant }],
    }));
    // Auto-dismiss after 3 s
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// ─── UI ───────────────────────────────────────────────────────────────────────

const variantConfig: Record<
  ToastVariant,
  { bg: string; iconColor: string; Icon: typeof CheckCircle }
> = {
  success: {
    bg:        'bg-forge-surface border border-emerald-500/30',
    iconColor: 'text-emerald-400',
    Icon:      CheckCircle,
  },
  error: {
    bg:        'bg-danger border border-danger/40',
    iconColor: 'text-white',
    Icon:      AlertTriangle,
  },
  info: {
    bg:        'bg-forge-elevated border border-white/[0.10]',
    iconColor: 'text-cream/60',
    Icon:      Info,
  },
};

export function ToastContainer(): React.JSX.Element {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-20 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-6 lg:bottom-6">
      <AnimatePresence>
        {toasts.map((toast) => {
          const { bg, iconColor, Icon } = variantConfig[toast.variant];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0,  scale: 1     }}
              exit={{    opacity: 0, y: 12, scale: 0.92  }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              onClick={() => removeToast(toast.id)}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg w-full max-w-sm cursor-pointer ${bg}`}
            >
              <Icon size={18} className={`shrink-0 ${iconColor}`} />
              <p className="text-[14px] font-semibold text-cream leading-snug flex-1">
                {toast.message}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
