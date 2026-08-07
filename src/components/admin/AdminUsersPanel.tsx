import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, ShieldOff } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Stars } from '../Stars';
import { Skeleton, EmptyState, ErrorState } from '../ui/States';
import { buttonStyles } from '../ui/button';
import { useAdminUsers, useVerifyEntrepreneur } from '../../hooks/admin';
import { useDebounced } from '../../hooks/useDebounced';
import { useToast } from '../ui/Toast';
import type { AdminUserItem, Role } from '../../types/api';

const ROLE_TABS: { id: Role | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'customer', label: 'Customers' },
  { id: 'entrepreneur', label: 'Entrepreneurs' },
  { id: 'admin', label: 'Admins' },
];

const roleTone: Record<Role, 'accent' | 'neutral' | 'dark'> = {
  customer: 'neutral',
  entrepreneur: 'accent',
  admin: 'dark',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function UserRow({ user }: { user: AdminUserItem }) {
  const { toast } = useToast();
  const verify = useVerifyEntrepreneur();
  const isEntrepreneur = user.role === 'entrepreneur' && user.profile;

  function toggleVerify() {
    if (!isEntrepreneur) return;
    verify.mutate(
      { id: user.id, verified: !user.profile!.verified },
      { onError: (err) => toast(err instanceof Error ? err.message : 'Could not update verification.', 'error') },
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={user.name} size={40} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[14px] font-medium text-fg">{user.name}</span>
            <Badge tone={roleTone[user.role]}>{user.role}</Badge>
            {isEntrepreneur && user.profile!.verified && (
              <span title="Verified" className="text-blue-600">
                <ShieldCheck size={14} />
              </span>
            )}
          </div>
          <div className="truncate text-[12px] text-muted">{user.email}</div>
          {isEntrepreneur && (
            <div className="mt-1 flex items-center gap-1.5">
              <Stars value={user.profile!.ratingAvg} size={11} />
              <span className="text-[11px] text-muted">
                {user.profile!.ratingAvg} ({user.profile!.ratingCount})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
        <span className="text-[11px] font-mono text-muted">Joined {formatDate(user.createdAt)}</span>
        <div className="flex items-center gap-2">
          {isEntrepreneur && (
            <Link
              to={`/profile/${user.id}`}
              className="text-[12px] font-medium text-accent hover:underline"
            >
              View profile
            </Link>
          )}
          {isEntrepreneur && (
            <button
              type="button"
              onClick={toggleVerify}
              disabled={verify.isPending}
              className={buttonStyles({
                variant: user.profile!.verified ? 'ghost' : 'primary',
                size: 'sm',
                className: 'gap-1.5 disabled:opacity-50',
              })}
            >
              {user.profile!.verified ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
              {user.profile!.verified ? 'Unverify' : 'Verify'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}

/** Admin "Users" tab — every account on the platform, searchable + filterable by role. */
export function AdminUsersPanel() {
  const [role, setRole] = useState<Role | 'all'>('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q);

  const { data, isLoading, isError, refetch } = useAdminUsers({ role, q: debouncedQ, page });
  const users = data?.users ?? [];

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
            placeholder="Search name or email…"
            aria-label="Search users"
            className="w-full rounded-full border border-line bg-surface-2 py-2.5 pl-9 pr-4 text-[13px] text-fg outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLE_TABS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setRole(r.id);
                setPage(1);
              }}
              className={
                role === r.id
                  ? 'rounded-full border border-fg bg-fg px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-surface'
                  : 'rounded-full border border-line px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted hover:border-accent'
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="Could not load users." onRetry={() => refetch()} />
      ) : users.length === 0 ? (
        <EmptyState title="No users match those filters" hint="Try clearing the search or role filter." />
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {users.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </div>
          {data && data.pages > 1 && (
            <div className="mt-6 flex items-center justify-between text-[12px] text-muted">
              <span>
                Page {data.page} of {data.pages} · {data.total} user{data.total === 1 ? '' : 's'}
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
