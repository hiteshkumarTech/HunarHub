import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Wrench, Package as PackageIcon } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/StatusBadge';
import { Skeleton, EmptyState, ErrorState } from '../ui/States';
import { buttonStyles } from '../ui/button';
import { useAdminOrders } from '../../hooks/admin';
import { useDebounced } from '../../hooks/useDebounced';
import { inr } from '../../lib/utils';
import type { AdminOrderItem, OrderStatus } from '../../types/api';

const STATUS_TABS: { id: OrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'completed', label: 'Completed' },
  { id: 'declined', label: 'Declined' },
];

const KIND_TABS: { id: 'all' | 'service' | 'product'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'service', label: 'Services' },
  { id: 'product', label: 'Products' },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function OrderRow({ order }: { order: AdminOrderItem }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted">
          {order.kind === 'service' ? <Wrench size={15} /> : <PackageIcon size={15} />}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[14px] font-medium text-fg">{order.title}</span>
            <Badge tone={order.kind === 'service' ? 'accent' : 'neutral'}>{order.kind}</Badge>
          </div>
          <div className="text-[12px] text-muted">
            <Link to={`/profile/${order.entrepreneur.id}`} className="text-accent hover:underline">
              {order.entrepreneur.name}
            </Link>
            {' ← '}
            {order.customer.name}
            {' · '}
            {formatDate(order.createdAt)}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="text-[14px] font-semibold text-fg">{inr(order.price)}</span>
        <StatusBadge status={order.status} />
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-4">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}

/** Admin "Orders" tab — read-only monitoring across every customer/seller
 *  pair. There is deliberately no status-mutation control here: order status
 *  transitions belong to the entrepreneur who owns the order, per the same
 *  business rules Dashboard.tsx enforces (see ROADMAP.md). */
export function AdminOrdersPanel() {
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [kind, setKind] = useState<'all' | 'service' | 'product'>('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q);

  const { data, isLoading, isError, refetch } = useAdminOrders({ status, kind, q: debouncedQ, page });
  const orders = data?.orders ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search order title…"
            aria-label="Search orders"
            className="w-full rounded-full border border-line bg-surface-2 py-2.5 pl-9 pr-4 text-[13px] text-fg outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {KIND_TABS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => {
                setKind(k.id);
                setPage(1);
              }}
              className={
                kind === k.id
                  ? 'rounded-full border border-fg bg-fg px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-surface'
                  : 'rounded-full border border-line px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted hover:border-accent'
              }
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setStatus(s.id);
              setPage(1);
            }}
            className={
              status === s.id
                ? 'rounded-full border border-fg bg-fg px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-surface'
                : 'rounded-full border border-line px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted hover:border-accent'
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="Could not load orders." onRetry={() => refetch()} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders match those filters" hint="Try clearing the search or status filter." />
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
          {data && data.pages > 1 && (
            <div className="mt-6 flex items-center justify-between text-[12px] text-muted">
              <span>
                Page {data.page} of {data.pages} · {data.total} order{data.total === 1 ? '' : 's'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'disabled:opacity-40' })}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'disabled:opacity-40' })}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
