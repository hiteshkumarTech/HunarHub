import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Modal } from './ui/Modal';
import { buttonStyles } from './ui/button';
import { inr } from '../lib/utils';
import type { ServiceItem } from '../types/api';

/**
 * Confirmation dialog for requesting a service — opened by either the
 * per-service "Request" button (pre-selects that service, skips the picker)
 * or the sticky "Request a service" CTA (shows a picker first when there's
 * more than one service; auto-selects when there's exactly one). Nothing is
 * submitted until the visitor explicitly clicks "Send Request".
 */
export function ServiceRequestDialog({
  open,
  onClose,
  entrepreneurName,
  services,
  initialServiceId,
  onSubmit,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  entrepreneurName: string;
  services: ServiceItem[];
  /** Pre-selects this service and skips the picker — set when opened from
   *  that specific service's own Request button. */
  initialServiceId?: string;
  onSubmit: (service: ServiceItem, note: string) => void;
  pending: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  // Reset to a clean state each time the dialog opens — not on every
  // `services`/`initialServiceId` change, so an in-progress note the visitor
  // is typing never gets silently wiped by an unrelated re-render.
  useEffect(() => {
    if (!open) return;
    setSelectedId(initialServiceId ?? (services.length === 1 ? services[0].id : null));
    setNote('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialServiceId]);

  const selected = services.find((s) => s.id === selectedId) ?? null;

  function submit() {
    if (!selected || pending) return;
    onSubmit(selected, note.trim());
  }

  return (
    <Modal open={open} onClose={onClose} title={selected ? 'Request this service' : 'Choose a service'}>
      {!selected ? (
        <div className="space-y-2">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedId(s.id)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left transition-colors hover:border-black"
            >
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-medium">{s.name}</span>
                <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wide text-gray-500">
                  <Clock size={11} />
                  {s.dur}
                </span>
              </span>
              <span className="shrink-0 text-[14px] font-semibold">{inr(s.price)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <dl className="space-y-2 rounded-lg bg-gray-50 p-4 text-[13px]">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Service</dt>
              <dd className="text-right font-medium text-[#111]">{selected.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Entrepreneur</dt>
              <dd className="text-right font-medium text-[#111]">{entrepreneurName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Price</dt>
              <dd className="text-right font-medium text-[#111]">{inr(selected.price)}</dd>
            </div>
            {selected.dur && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Duration</dt>
                <dd className="text-right font-medium text-[#111]">{selected.dur}</dd>
              </div>
            )}
          </dl>

          <label htmlFor="request-note" className="mt-4 block text-[13px] font-medium text-gray-700">
            Note <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="request-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Describe what you need — preferred size, colour, timing, etc."
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-[13px] outline-none focus:border-black"
          />

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onClose} disabled={pending} className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
              Cancel
            </button>
            <button type="button" onClick={submit} disabled={pending} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
              {pending ? 'Sending…' : 'Send Request'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
