import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../ui/Toast';
import { AdminComplaintsPanel } from './AdminComplaintsPanel';
import { api } from '../../lib/api';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');
  return { ...actual, api: { ...actual.api, get: vi.fn(), patch: vi.fn() } };
});

const COMPLAINT = {
  id: 'c1',
  reporter: { id: 'u1', name: 'Priya Sharma' },
  order: 'o1',
  subject: 'Late delivery',
  message: 'The order arrived a week late.',
  status: 'open' as const,
  adminNote: '',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function renderPanel() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <AdminComplaintsPanel />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('AdminComplaintsPanel', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders complaints from the admin endpoint with reporter and subject', async () => {
    vi.mocked(api.get).mockResolvedValue({ complaints: [COMPLAINT], total: 1, page: 1, pages: 1 });
    renderPanel();

    expect(await screen.findByText('Late delivery')).toBeInTheDocument();
    expect(screen.getByText(/priya sharma/i)).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/api/admin/complaints?page=1'));
  });

  it('changing the status select calls the update endpoint with the new status', async () => {
    vi.mocked(api.get).mockResolvedValue({ complaints: [COMPLAINT], total: 1, page: 1, pages: 1 });
    vi.mocked(api.patch).mockResolvedValue({ complaint: { ...COMPLAINT, status: 'in_review' } });
    renderPanel();

    await screen.findByText('Late delivery');
    const user = userEvent.setup();
    await user.selectOptions(screen.getByRole('combobox'), 'in_review');

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/api/admin/complaints/c1', { status: 'in_review' }));
  });

  it('re-fetches with the selected status filter', async () => {
    vi.mocked(api.get).mockResolvedValue({ complaints: [COMPLAINT], total: 1, page: 1, pages: 1 });
    renderPanel();
    await screen.findByText('Late delivery');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Open' }));

    await waitFor(() => expect(api.get).toHaveBeenLastCalledWith(expect.stringContaining('status=open')));
  });

  it('shows an empty state when nothing matches the filter', async () => {
    vi.mocked(api.get).mockResolvedValue({ complaints: [], total: 0, page: 1, pages: 1 });
    renderPanel();
    expect(await screen.findByText(/no complaints match/i)).toBeInTheDocument();
  });
});
