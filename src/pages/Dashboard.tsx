import { useState } from 'react';
import { Package, Clock, Star, Wallet, Check } from 'lucide-react';
import { PageBar } from '../components/PageBar';
import { Monogram } from '../components/Monogram';
import { ErrorState } from '../components/ui/States';
import { Kpi } from '../components/ui/Kpi';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { useEntrepreneur, useUpdateMyProfile } from '../hooks/entrepreneurs';
import { useIncomingOrders, useUpdateOrderStatus } from '../hooks/orders';
import { ListingsManager } from '../components/dashboard/ListingsManager';
import { cn, inr } from '../lib/utils';
import type { OrderItem } from '../types/api';

const customerName = (o: OrderItem): string => (typeof o.customer === 'object' && o.customer ? o.customer.name : 'Customer');

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const profile = user?.profile ?? null;
  const [available, setAvailable] = useState<boolean>(profile?.available ?? true);

  const listing = useEntrepreneur(user?.id);
  const incoming = useIncomingOrders(Boolean(user));
  const updateStatus = useUpdateOrderStatus();
  const updateProfile = useUpdateMyProfile();

  const orders = incoming.data?.orders ?? [];
  const pending = orders.filter((o) => o.status === 'pending');
  const activeCount = orders.filter((o) => o.status === 'accepted').length;
  const earnings = orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + o.price, 0);
  const services = listing.data?.services ?? [];
  const products = listing.data?.products ?? [];

  function toggleAvailability() {
    const next = !available;
    setAvailable(next);
    updateProfile.mutate(
      { available: next },
      {
        onSuccess: () => toast(next ? 'You are now open for work.' : 'Availability paused.', 'success'),
        onError: (err) => {
          setAvailable(!next);
          toast(err instanceof Error ? err.message : 'Could not update availability.', 'error');
        },
      },
    );
  }

  function act(order: OrderItem, status: 'accepted' | 'declined' | 'completed') {
    updateStatus.mutate(
      { id: order.id, status },
      {
        onSuccess: () => toast(`Request ${status}.`, 'success'),
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not update the request.', 'error'),
      },
    );
  }

  if (!user) return null; // route is guarded; keeps types narrow

  return (
    <div className="min-h-screen">
      <PageBar crumb="Dashboard" />
      <main id="main-content" tabIndex={-1} className="px-6 py-10 md:px-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Monogram name={user.name} size={56} />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted">Entrepreneur Dashboard</div>
              <div className="text-[1.6rem] font-medium leading-tight tracking-tight text-fg">{user.name}</div>
              <div className="text-[12px] font-mono text-muted">
                {profile?.craft || '—'}
                {profile?.city ? ` · ${profile.city}` : ''}
              </div>
            </div>
          </div>
          <label className="inline-flex cursor-pointer select-none items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-muted">
            Availability
            <button
              type="button"
              role="switch"
              aria-checked={available}
              onClick={toggleAvailability}
              className={cn('relative h-6 w-12 rounded-full transition-colors', available ? 'bg-fg' : 'bg-line')}
            >
              <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-surface-2 transition-all', available ? 'left-6' : 'left-0.5')} />
            </button>
            <span className={available ? 'text-green-700' : 'text-muted'}>{available ? 'Open' : 'Paused'}</span>
          </label>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi icon={<Wallet size={16} />} label="Earnings (completed)" value={inr(earnings)} />
          <Kpi icon={<Package size={16} />} label="Active orders" value={activeCount} />
          <Kpi icon={<Clock size={16} />} label="Pending requests" value={pending.length} />
          <Kpi icon={<Star size={16} />} label="Rating" value={`${profile?.ratingAvg ?? 0} ★`} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-line bg-surface-2 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted">Service requests</span>
              <span className="text-[11px] font-mono text-muted">{pending.length} pending</span>
            </div>
            {incoming.isLoading ? (
              <div className="p-6 text-[13px] text-muted">Loading…</div>
            ) : incoming.isError ? (
              <div className="p-4">
                <ErrorState message="Could not load requests." onRetry={() => incoming.refetch()} />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-muted">No requests yet.</div>
            ) : (
              <div className="divide-y divide-line">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Monogram name={customerName(o)} size={38} />
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-medium text-fg">{customerName(o)}</div>
                        <div className="truncate text-[12px] text-muted">
                          {o.title} · <span className="font-medium text-fg">{inr(o.price)}</span>
                        </div>
                      </div>
                    </div>
                    {o.status === 'pending' ? (
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => act(o, 'accepted')}
                          disabled={updateStatus.isPending}
                          className="inline-flex items-center gap-1 rounded-md bg-fg px-3 py-2 text-[11px] font-mono uppercase tracking-widest text-surface hover:brightness-110 disabled:opacity-50"
                        >
                          <Check size={13} />
                          Accept
                        </button>
                        <button
                          onClick={() => act(o, 'declined')}
                          disabled={updateStatus.isPending}
                          className="rounded-md border border-line px-3 py-2 text-[11px] font-mono uppercase tracking-widest text-muted hover:border-accent disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    ) : o.status === 'accepted' ? (
                      <button
                        onClick={() => act(o, 'completed')}
                        disabled={updateStatus.isPending}
                        className="shrink-0 rounded-md border border-line px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted hover:border-accent disabled:opacity-50"
                      >
                        Mark complete
                      </button>
                    ) : (
                      <span
                        className={cn(
                          'shrink-0 rounded-md px-3 py-2 text-[10px] font-mono uppercase tracking-widest',
                          o.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-surface text-muted',
                        )}
                      >
                        {o.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <ListingsManager services={services} products={products} isLoading={listing.isLoading} />
        </div>
      </main>
    </div>
  );
}
