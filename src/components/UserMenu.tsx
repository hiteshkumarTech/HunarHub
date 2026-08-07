import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Heart, Package, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { buttonStyles } from './ui/button';
import { ThemeToggle } from './ui/ThemeToggle';
import { cn } from '../lib/utils';

/** Auth-aware navigation cluster used in the header and page bars. */
export function UserMenu({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const muted = variant === 'dark' ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-black';

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link to="/login" className={cn('text-[13px] font-medium transition-colors', muted)}>
          Sign in
        </Link>
        <Link to="/register" className={buttonStyles({ size: 'sm' })}>
          Join
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <ThemeToggle />
      {user.role === 'entrepreneur' && (
        <Link to="/dashboard" className={cn('hidden items-center gap-1.5 text-[13px] font-medium transition-colors sm:inline-flex', muted)}>
          <LayoutDashboard size={15} /> Dashboard
        </Link>
      )}
      {user.role === 'customer' && (
        <>
          <Link to="/orders" className={cn('hidden items-center gap-1.5 text-[13px] font-medium transition-colors sm:inline-flex', muted)}>
            <Package size={15} /> Orders
          </Link>
          <Link to="/favourites" className={cn('hidden items-center gap-1.5 text-[13px] font-medium transition-colors sm:inline-flex', muted)}>
            <Heart size={15} /> Saved
          </Link>
        </>
      )}
      {user.role === 'admin' && (
        <Link to="/admin" className={cn('hidden items-center gap-1.5 text-[13px] font-medium transition-colors sm:inline-flex', muted)}>
          <ShieldCheck size={15} /> Admin
        </Link>
      )}
      <span className={cn('hidden text-[13px] sm:inline', variant === 'dark' ? 'text-white/70' : 'text-gray-500')}>
        Hi, {user.name.split(' ')[0]}
      </span>
      <button
        onClick={() => {
          logout();
          navigate('/');
        }}
        className={cn('inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors', muted)}
      >
        <LogOut size={15} /> Logout
      </button>
    </div>
  );
}
