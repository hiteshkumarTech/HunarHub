import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { ImageUploadField } from './ImageUploadField';
import type { ListingImage } from '../../types/api';

// jsdom has no real object-URL implementation.
beforeAll(() => {
  vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL: vi.fn() });
});
afterAll(() => vi.unstubAllGlobals());

function Harness({ existing = [], max = 4 }: { existing?: ListingImage[]; max?: number }) {
  const [ex, setEx] = useState(existing);
  const [staged, setStaged] = useState<File[]>([]);
  return (
    <ImageUploadField
      label="Photos"
      altPrefix="Test Item"
      max={max}
      existing={ex}
      onRemoveExisting={(i) => setEx((cur) => cur.filter((_, idx) => idx !== i))}
      staged={staged}
      onAddFiles={(files) => setStaged((cur) => [...cur, ...files])}
      onRemoveStaged={(i) => setStaged((cur) => cur.filter((_, idx) => idx !== i))}
    />
  );
}

describe('ImageUploadField', () => {
  it('renders the add control when below the max', () => {
    render(<Harness />);
    expect(screen.getByLabelText(/add/i)).toBeInTheDocument();
  });

  it('renders an existing image with useful alt text, not "image"', () => {
    render(<Harness existing={[{ url: 'https://example.com/a.jpg', publicId: 'p1' }]} />);
    const img = screen.getByAltText('Test Item photo 1');
    expect(img).toBeInTheDocument();
    expect(img).not.toHaveAttribute('alt', 'image');
  });

  it('adds a staged preview after selecting a valid image', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/add/i);
    await user.upload(input, file);
    expect(screen.getByAltText('Test Item new photo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove photo\.jpg/i })).toBeInTheDocument();
  });

  it('rejects an unsupported file type with a visible error, no staged preview', () => {
    render(<Harness />);
    const file = new File(['x'], 'virus.exe', { type: 'application/x-msdownload' });
    // A real OS file picker would already filter this out via `accept` (and
    // userEvent.upload faithfully emulates that, so it can't be used to
    // reach this branch) — fireEvent bypasses that filtering to exercise the
    // component's own defense-in-depth validation directly, the same way a
    // drag-and-drop or a non-conforming browser could still reach it.
    fireEvent.change(screen.getByLabelText(/add/i), { target: { files: [file] } });
    expect(screen.getByRole('alert')).toHaveTextContent(/JPEG, PNG, WebP, or AVIF/i);
    expect(screen.queryByAltText('Test Item new photo')).not.toBeInTheDocument();
  });

  it('hides the add control once at the max image count', () => {
    render(
      <Harness
        max={1}
        existing={[{ url: 'https://example.com/a.jpg', publicId: 'p1' }]}
      />,
    );
    expect(screen.queryByLabelText(/add/i)).not.toBeInTheDocument();
  });

  it('removing an existing image drops it from the list', async () => {
    const user = userEvent.setup();
    render(<Harness existing={[{ url: 'https://example.com/a.jpg', publicId: 'p1' }]} />);
    await user.click(screen.getByRole('button', { name: /remove photo 1/i }));
    expect(screen.queryByAltText('Test Item photo 1')).not.toBeInTheDocument();
    // The add control reappears now that there's room again.
    expect(screen.getByLabelText(/add/i)).toBeInTheDocument();
  });
});
