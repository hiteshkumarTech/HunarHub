import { cn } from '../../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'onDark';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ' +
  'disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:brightness-110 shadow-sm',
  secondary: 'bg-[#111] text-white hover:bg-black shadow-sm',
  ghost: 'bg-white text-[#111] border border-gray-300 hover:border-black',
  onDark: 'bg-white text-[#111] hover:bg-gray-100',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'text-[13px] px-4 py-2',
  md: 'text-[14px] px-5 py-2.5',
  lg: 'text-[15px] px-7 py-3.5',
};

/**
 * Shared button styling, usable on <button> or react-router <Link> so we never
 * duplicate the design. Example: <Link className={buttonStyles({ size: 'lg' })} />
 */
export function buttonStyles(opts: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  const { variant = 'primary', size = 'md', className } = opts;
  return cn(base, variants[variant], sizes[size], className);
}
