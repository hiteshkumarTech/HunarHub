import { useState } from 'react';
import { buttonStyles } from './ui/button';
import { useToast } from './ui/Toast';
import { useCreateComplaint } from '../hooks/complaints';

/**
 * Inline "report an issue" disclosure for a single order — same pattern as
 * MyOrders' ReviewForm (open/submit/cancel inline, no modal). Ties the
 * complaint to the order; the backend rejects it if the signed-in user isn't
 * actually a party to that order (see server/src/routes/complaints.ts).
 */
export function ComplaintForm({ orderId, onDone }: { orderId: string; onDone: () => void }) {
  const { toast } = useToast();
  const createComplaint = useCreateComplaint();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  function submit() {
    if (!subject.trim() || !message.trim()) return;
    createComplaint.mutate(
      { subject: subject.trim(), message: message.trim(), orderId },
      {
        onSuccess: () => {
          toast('Issue reported — our team will review it.', 'success');
          onDone();
        },
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not submit the report.', 'error'),
      },
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
      <div className="text-[12px] font-medium">Report an issue with this order</div>
      <label className="mt-3 block text-[11px] font-mono uppercase tracking-widest text-gray-500" htmlFor={`complaint-subject-${orderId}`}>
        Subject
      </label>
      <input
        id={`complaint-subject-${orderId}`}
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        maxLength={120}
        placeholder="Brief summary"
        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-black"
      />
      <label className="mt-3 block text-[11px] font-mono uppercase tracking-widest text-gray-500" htmlFor={`complaint-message-${orderId}`}>
        Details
      </label>
      <textarea
        id={`complaint-message-${orderId}`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="What went wrong?"
        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-black"
      />
      <div className="mt-3 flex gap-2">
        <button
          onClick={submit}
          disabled={createComplaint.isPending || !subject.trim() || !message.trim()}
          className={buttonStyles({ size: 'sm' })}
        >
          {createComplaint.isPending ? 'Submitting…' : 'Submit report'}
        </button>
        <button onClick={onDone} className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
          Cancel
        </button>
      </div>
    </div>
  );
}
