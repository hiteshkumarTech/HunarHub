import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Star, Flag } from 'lucide-react';
import { PageBar } from '../components/PageBar';
import { Monogram } from '../components/Monogram';
import { ComplaintForm } from '../components/ComplaintForm';
import { Skeleton, EmptyState, ErrorState } from '../components/ui/States';
import { StatusBadge, OrderTimeline } from '../components/ui/StatusBadge';
import { buttonStyles } from '../components/ui/button';
import { useToast } from '../components/ui/Toast';
import { useMyOrders } from '../hooks/orders';
import { useCreateReview } from '../hooks/reviews';
import { cn, inr } from '../lib/utils';
import type { OrderItem, OrderStatus } from '../types/api';

const makerName = (o: OrderItem): string => (typeof o.entrepreneur === 'object' && o.entrepreneur ? o.entrepreneur.name : 'Maker');
const makerId = (o: OrderItem): string | null => (typeof o.entrepreneur === 'object' && o.entrepreneur ? o.entrepreneur.id : null);

const FILTERS: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Awaiting' },
  { id: 'accepted', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
];

function ReviewForm({ order, onDone }: { order: OrderItem; onDone: () => void }) {
  const { toast } = useToast();
  const createReview = useCreateReview();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const id = makerId(order);

  function submit() {
    if (!id) return;
    createReview.mutate(
      { entrepreneurId: id, rating, text: text.trim() || undefined },
      {
        onSuccess: () => {
          toast('Thanks — your review is live.', 'success');
          onDone();
        },
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not submit review.', 'error'),
      },
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
      <div className="text-[12px] font-medium">Rate your experience with {makerName(order)}</div>
      <div className="mt-2 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`} className="p-0.5">
            <Star size={20} className={cn('transition-colors', n <= rating ? 'fill-accent text-accent' : 'text-gray-300')} />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="Share a few words about the work (optional)"
        aria-label="Review text"
        className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-black"
      />
      <div className="mt-3 flex gap-2">
        <button onClick={submit} disabled={createReview.isPending} className={buttonStyles({ size: 'sm' })}>
          {createReview.isPending ? 'Submitting…' : 'Submit review'}
        </button>
        <button onClick={onDone} className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function MyOrders() {
  const { data, isLoading, isError, refetch } = useMyOrders();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reporting, setReporting] = useState<string | null>(null);

  const orders = data?.orders ?? [];
  const list = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen">
      <PageBar crumb="My orders" />
      <main id="main-content" tabIndex={-1} className="px-6 py-10 md:px-16">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">[ Your activity ]</div>
        <h1 className="mt-2 text-[2rem] font-medium tracking-tight md:text-[3rem]">My orders</h1>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count = f.id === 'all' ? orders.length : orders.filter((o) => o.status === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors',
                  filter === f.id ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700 hover:border-black',
                )}
              >
                {f.label} {count > 0 && <span className="opacity-60">({count})</span>}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Could not load your orders." onRetry={() => refetch()} />
        ) : list.length === 0 ? (
          <>
            <EmptyState
              title={filter === 'all' ? 'No orders yet' : 'Nothing here yet'}
              hint="When you request a service or buy a product, it will show up here."
              icon={<Package size={28} />}
            />
            <div className="mt-6 flex justify-center">
              <Link to="/browse" className={buttonStyles({ size: 'md' })}>
                Find a maker
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-8 grid max-w-[860px] gap-4">
            {list.map((o) => {
              const id = makerId(o);
              return (
                <div key={o.id} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Monogram name={makerName(o)} size={42} />
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-medium">{o.title}</div>
                        <div className="text-[12px] text-gray-500">
                          {id ? (
                            <Link to={`/profile/${id}`} className="hover:text-black hover:underline">
                              {makerName(o)}
                            </Link>
                          ) : (
                            makerName(o)
                          )}
                          <span className="text-gray-400"> · {o.kind}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[15px] font-semibold">{inr(o.price)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <OrderTimeline status={o.status} />
                  </div>

                  {o.status === 'completed' && id && (
                    reviewing === o.id ? (
                      <ReviewForm order={o} onDone={() => setReviewing(null)} />
                    ) : (
                      <button onClick={() => setReviewing(o.id)} className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'mt-4' })}>
                        <Star size={14} /> Leave a review
                      </button>
                    )
                  )}

                  {reporting === o.id ? (
                    <ComplaintForm orderId={o.id} onDone={() => setReporting(null)} />
                  ) : (
                    <button
                      onClick={() => setReporting(o.id)}
                      className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'mt-3 text-gray-500' })}
                    >
                      <Flag size={14} /> Report an issue
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
