import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { buttonStyles, type ButtonVariant, type ButtonSize } from './button';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

/**
 * Button primitive. Shares styling with `buttonStyles` so <Link> can look
 * identical without duplicating classes.
 */
export function Button({ variant, size, loading = false, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button {...props} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonStyles({ variant, size, className })}>
      {loading && <Loader2 size={15} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
