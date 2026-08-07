import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { PageBar } from '../components/PageBar';
import { EntrepreneurCardTile } from '../components/EntrepreneurCardTile';
import { CardGridSkeleton, EmptyState, ErrorState } from '../components/ui/States';
import { buttonStyles } from '../components/ui/button';
import { useFavorites } from '../hooks/favorites';

export default function Favourites() {
  const { data, isLoading, isError, refetch } = useFavorites();
  const list = data?.entrepreneurs ?? [];

  return (
    <div className="min-h-screen">
      <PageBar crumb="Favourites" />
      <main id="main-content" tabIndex={-1} className="px-6 py-10 md:px-16">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">[ Your list ]</div>
        <h1 className="mt-2 text-[2rem] font-medium tracking-tight md:text-[3rem]">Saved makers</h1>

        {isLoading ? (
          <CardGridSkeleton count={4} />
        ) : isError ? (
          <ErrorState message="Could not load your favourites." onRetry={() => refetch()} />
        ) : list.length === 0 ? (
          <>
            <EmptyState title="No favourites yet" hint="Tap the heart on any maker to save them here." icon={<Heart size={28} />} />
            <div className="mt-6 flex justify-center">
              <Link to="/browse" className={buttonStyles({ size: 'md' })}>
                Browse makers
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((e) => (
              <EntrepreneurCardTile key={e.id} e={e} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
