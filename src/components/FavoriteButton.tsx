import { type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/Toast';
import { useFavoriteIds, useToggleFavorite } from '../hooks/favorites';
import { cn } from '../lib/utils';

export function FavoriteButton({ entrepreneurId, size = 16, className }: { entrepreneurId: string; size?: number; className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const favIds = useFavoriteIds();
  const toggle = useToggleFavorite();
  const isFav = favIds.has(entrepreneurId);

  function onClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'customer') {
      toast('Sign in with a customer account to save favourites.', 'error');
      return;
    }
    toggle.mutate(
      { entrepreneurId, isFav },
      { onError: (err) => toast(err instanceof Error ? err.message : 'Could not update favourite.', 'error') },
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={isFav}
      className={cn(
        'flex items-center justify-center rounded-full border bg-white/90 backdrop-blur transition-colors',
        isFav ? 'border-accent text-accent' : 'border-gray-200 text-gray-500 hover:text-accent',
        className,
      )}
    >
      <Heart size={size} className={isFav ? 'fill-accent' : ''} />
    </button>
  );
}
