import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}
interface ToastApi {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const remove = useCallback((id: number) => setItems((s) => s.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = nextId++;
      setItems((s) => [...s, { id, message, type }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg',
              t.type === 'error' ? 'border-red-200' : t.type === 'success' ? 'border-green-200' : 'border-gray-200',
            )}
          >
            {t.type === 'error' ? (
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            ) : t.type === 'success' ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-600" />
            ) : (
              <Info size={18} className="mt-0.5 shrink-0 text-gray-500" />
            )}
            <p className="flex-1 text-[13px] leading-snug text-[#111]">{t.message}</p>
            <button onClick={() => remove(t.id)} aria-label="Dismiss notification" className="text-gray-400 hover:text-black">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
