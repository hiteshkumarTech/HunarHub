import type { ReactNode } from 'react';
import { AlertCircle, SearchX } from 'lucide-react';
import { cn } from '../../lib/utils';
import { buttonStyles } from './button';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200/70', className)} />;
}

export function EntrepreneurCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <Skeleton className="h-36 rounded-none" />
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <EntrepreneurCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
      <AlertCircle className="text-gray-400" size={28} />
      <p className="mt-3 text-[14px] text-gray-600">{message ?? 'Something went wrong. Please try again.'}</p>
      {onRetry && (
        <button onClick={onRetry} className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'mt-4' })}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <div className="text-gray-400">{icon ?? <SearchX size={28} />}</div>
      <p className="mt-3 text-[15px] font-medium text-[#111]">{title}</p>
      {hint && <p className="mt-1 text-[13px] text-gray-500">{hint}</p>}
    </div>
  );
}
