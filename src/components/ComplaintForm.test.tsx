import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from './ui/Toast';
import { ComplaintForm } from './ComplaintForm';
import { api } from '../lib/api';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return { ...actual, api: { ...actual.api, post: vi.fn() } };
});

function renderForm(onDone = vi.fn()) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <ComplaintForm orderId="order1" onDone={onDone} />
      </ToastProvider>
    </QueryClientProvider>,
  );
  return { onDone };
}

describe('ComplaintForm', () => {
  afterEach(() => vi.clearAllMocks());

  it('keeps submit disabled until both subject and message are filled', async () => {
    renderForm();
    const submit = screen.getByRole('button', { name: /submit report/i });
    expect(submit).toBeDisabled();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/subject/i), 'Wrong item');
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(/details/i), 'Received the wrong product.');
    expect(submit).toBeEnabled();
  });

  it('submits subject/message tied to the order id, and calls onDone on success', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ complaint: { id: 'c1' } });
    const { onDone } = renderForm();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/subject/i), 'Wrong item');
    await user.type(screen.getByLabelText(/details/i), 'Received the wrong product.');
    await user.click(screen.getByRole('button', { name: /submit report/i }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(api.post).toHaveBeenCalledWith('/api/complaints', {
      subject: 'Wrong item',
      message: 'Received the wrong product.',
      orderId: 'order1',
    });
  });

  it('shows an error toast and does not close the form when the request fails', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('You can only report an issue on your own order'));
    const { onDone } = renderForm();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/subject/i), 'Wrong item');
    await user.type(screen.getByLabelText(/details/i), 'Received the wrong product.');
    await user.click(screen.getByRole('button', { name: /submit report/i }));

    expect(await screen.findByText('You can only report an issue on your own order')).toBeInTheDocument();
    expect(onDone).not.toHaveBeenCalled();
  });
});
