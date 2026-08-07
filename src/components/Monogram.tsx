import { Avatar } from './ui/Avatar';

/**
 * Kept for backwards compatibility across existing screens.
 * Delegates to the `Avatar` primitive so there is a single implementation.
 */
export function Monogram({ name, size = 48, className }: { name: string; size?: number; className?: string }) {
  return <Avatar name={name} size={size} className={className} />;
}
