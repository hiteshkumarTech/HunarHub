import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ListingImage } from '../../types/api';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function validate(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return `${file.name}: only JPEG, PNG, WebP, or AVIF images are allowed.`;
  if (file.size > MAX_SIZE_BYTES) return `${file.name}: image is too large — 5MB max.`;
  return null;
}

/** One staged (not-yet-uploaded) file, with an object-URL preview that gets cleaned up on removal/unmount. */
function StagedThumb({ file, onRemove, disabled, alt }: { file: File; onRemove: () => void; disabled: boolean; alt: string }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-dashed border-accent bg-surface-2">
      <img src={url} alt={alt} className="h-full w-full object-cover" />
      <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest text-white">
        New
      </span>
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

/**
 * Reusable image picker + preview + gallery editor. Used for both the
 * single-slot service photo (max=1) and the up-to-4 product gallery.
 * The first thumbnail (existing[0], or staged[0] if there's no existing
 * image yet) is always the cover image.
 */
export function ImageUploadField({
  label,
  existing,
  onRemoveExisting,
  staged,
  onAddFiles,
  onRemoveStaged,
  max,
  disabled = false,
  altPrefix,
}: {
  label: string;
  existing: ListingImage[];
  onRemoveExisting: (index: number) => void;
  staged: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveStaged: (index: number) => void;
  max: number;
  disabled?: boolean;
  altPrefix: string;
}) {
  const [error, setError] = useState('');
  const inputId = `image-upload-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const count = existing.length + staged.length;
  const atMax = count >= max;

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow re-selecting the same file later
    if (files.length === 0) return;

    const room = max - count;
    const toAdd = files.slice(0, room);
    if (files.length > room) {
      setError(room === 0 ? `You already have the maximum of ${max} image${max === 1 ? '' : 's'}.` : `Only ${room} more image slot${room === 1 ? '' : 's'} available — added the first ${room}.`);
    } else {
      setError('');
    }

    for (const file of toAdd) {
      const problem = validate(file);
      if (problem) {
        setError(problem);
        return;
      }
    }
    onAddFiles(toAdd);
  }

  return (
    <div>
      <span className="block text-[13px] font-medium text-fg">{label}</span>
      {error && (
        <p role="alert" className="mt-1 text-[12px] text-red-600">
          {error}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {existing.map((img, i) => (
          <div key={img.publicId ?? img.url} className="group relative aspect-square w-20 overflow-hidden rounded-lg border border-line bg-surface-2">
            <img src={img.url} alt={`${altPrefix} photo ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest text-white">
                Cover
              </span>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemoveExisting(i)}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        {staged.map((file, i) => (
          <div key={`${file.name}-${i}`} className="w-20">
            <StagedThumb file={file} onRemove={() => onRemoveStaged(i)} disabled={disabled} alt={`${altPrefix} new photo`} />
          </div>
        ))}
        {!atMax && !disabled && (
          <label
            htmlFor={inputId}
            className={cn(
              'flex aspect-square w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-muted transition-colors hover:border-accent hover:text-accent',
            )}
          >
            <ImagePlus size={18} />
            <span className="text-[9px] font-mono uppercase tracking-widest">Add</span>
            <input
              id={inputId}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              multiple={max > 1}
              onChange={handleFiles}
              disabled={disabled}
              className="sr-only"
            />
          </label>
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-muted">
        {max > 1 ? `Up to ${max} photos — first is the cover image.` : 'JPEG, PNG, WebP, or AVIF · 5MB max.'}
      </p>
    </div>
  );
}
