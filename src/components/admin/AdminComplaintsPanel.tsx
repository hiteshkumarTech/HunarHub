import { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Skeleton, EmptyState, ErrorState } from '../ui/States';
import { buttonStyles } from '../ui/button';
import { useToast } from '../ui/Toast';
import { useAdminComplaints, useUpdateComplaint } from '../../hooks/admin';
import type { ComplaintItem, ComplaintStatus } from '../../types/api';

const STATUS_TABS: { id: ComplaintStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'in_review', label: 'In review' },
  { id: 'resolved', label: 'Resolved' },
];

const STATUS_OPTIONS: ComplaintStatus[] = ['open', 'in_review', 'resolved'];

const STATUS_TONE: Record<ComplaintStatus, 'warning' | 'accent' | 'success'> = {
  open: 'warning',
  in_review: 'accent',
  resolved: 'success',
};

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  open: 'Open',
  in_review: 'In review',
  resolved: 'Resolved',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

/** One complaint row — status is changed immediately (a select, like the
 *  category active toggle); the admin note is free text so it's saved
 *  explicitly via a button rather than firing a request per keystroke. */
function ComplaintRow({ complaint }: { complaint: ComplaintItem }) {
  const { toast } = useToast();
  const update = useUpdateComplaint();
  const [note, setNote] = useState(complaint.adminNote);
  const noteDirty = note !== complaint.adminNote;

  function changeStatus(status: ComplaintStatus) {
    update.mutate(
      { id: complaint.id, status },
      { onError: (err) => toast(err instanceof Error ? err.message : 'Could not update status.', 'error') },
    );
  }

  function saveNote() {
    update.mutate(
      { id: complaint.id, adminNote: note },
      {
        onSuccess: () => toast('Note saved.', 'success'),
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not save note.', 'error'),
      },
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface-2 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[14px] font-medium text-fg">{complaint.subject}</span>
            <Badge tone={STATUS_TONE[complaint.status]}>{STATUS_LABEL[complaint.status]}</Badge>
          </div>
          <div className="mt-1 text-[12px] text-muted">
            {complaint.reporter.name}
            {complaint.order ? ' · order-linked' : ''} · {formatDate(complaint.createdAt)}
          </div>
        </div>
        <label className="shrink-0 text-[11px] font-mono uppercase tracking-widest text-muted">
          <span className="sr-only">Status for “{complaint.subject}”</span>
          <select
            value={complaint.status}
            onChange={(e) => changeStatus(e.target.value as ComplaintStatus)}
            disabled={update.isPending}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] text-fg outline-none focus:border-accent disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-3 text-[13px] text-fg">{complaint.message}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Internal note (not shown to the reporter)"
          aria-label={`Admin note for "${complaint.subject}"`}
          className="min-w-[220px] flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-[12px] text-fg outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={saveNote}
          disabled={!noteDirty || update.isPending}
          className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'disabled:opacity-40' })}
        >
          {update.isPending ? 'Saving…' : 'Save note'}
        </button>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border border-line bg-surface-2 p-4">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-2.5 w-1/2" />
    </div>
  );
}

/** Admin "Complaints" tab — every reported issue, any reporter, filterable
 *  by status, with a status changer + private note. */
export function AdminComplaintsPanel() {
  const [status, setStatus] = useState<ComplaintStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useAdminComplaints({ status, page });
  const complaints = data?.complaints ?? [];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
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
                ? 'rounded-full border border-fg bg-fg px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-surface'
                : 'rounded-full border border-line px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted hover:border-accent'
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="Could not load complaints." onRetry={() => refetch()} />
      ) : complaints.length === 0 ? (
        <EmptyState title="No complaints match that filter" hint="Nothing reported yet, or try a different status." />
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {complaints.map((c) => (
              <ComplaintRow key={c.id} complaint={c} />
            ))}
          </div>
          {data && data.pages > 1 && (
            <div className="mt-6 flex items-center justify-between text-[12px] text-muted">
              <span>
                Page {data.page} of {data.pages} · {data.total} complaint{data.total === 1 ? '' : 's'}
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
