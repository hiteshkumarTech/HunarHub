import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../components/ui/Toast';
import { API_URL, tokenStore } from '../lib/api';
import Profile from './Profile';

const ENTREPRENEUR = {
  id: 'ramesh',
  name: 'Ramesh Kumar',
  category: 'potter',
  craft: 'Potter (Kumhar)',
  city: 'Jaipur',
  state: 'Rajasthan',
  exp: 24,
  rating: 4.9,
  reviews: 2,
  start: 120,
  available: true,
  verified: true,
  bio: 'Third-generation kumhar.',
};

const SERVICES = [
  { id: 'svc-1', name: 'Custom Terracotta Pot', price: 250, dur: '3 days', images: [] },
  { id: 'svc-2', name: 'Diwali Diya Set', price: 120, dur: '1 day', images: [] },
];

const PRODUCTS = [{ id: 'prod-1', name: 'Painted Planter', price: 320, images: [] }];

const CUSTOMER = { id: 'cust1', name: 'Priya Sharma', email: 'priya@test.local', role: 'customer', profile: null };
const ENTREPRENEUR_USER = {
  id: 'ent1',
  name: 'Ramesh Kumar',
  email: 'ramesh@test.local',
  role: 'entrepreneur',
  profile: {
    category: 'potter',
    craft: 'Potter',
    city: 'Jaipur',
    state: 'Rajasthan',
    exp: 24,
    bio: '',
    startingPrice: 100,
    available: true,
    verified: true,
    ratingAvg: 4.9,
    ratingCount: 2,
  },
};

function json(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

const ORDER_RESPONSE = { order: { id: 'order1', kind: 'service', title: 'x', price: 100, status: 'pending', createdAt: new Date(0).toISOString() } };

/** Base fetch mock: auth session (or none), entrepreneur detail, the "similar
 *  makers" browse query, and a normal (immediately resolving) order POST. */
function mockFetch({ user, services = SERVICES }: { user: typeof CUSTOMER | typeof ENTREPRENEUR_USER | null; services?: typeof SERVICES }) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    const path = url.replace(API_URL, '');
    if (path === '/api/auth/me') return user ? json({ user }) : new Response(null, { status: 401 });
    if (path.startsWith('/api/entrepreneurs/ramesh') && method === 'GET') {
      return json({ entrepreneur: ENTREPRENEUR, services, products: PRODUCTS, reviews: [] });
    }
    if (path.startsWith('/api/entrepreneurs?')) return json({ entrepreneurs: [] });
    if (path === '/api/orders' && method === 'POST') return json(ORDER_RESPONSE);
    throw new Error(`Unhandled fetch in Profile test: ${method} ${path}`);
  });
}

function findOrderPosts(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(([url, init]: [string, RequestInit?]) => url.endsWith('/api/orders') && init?.method === 'POST');
}

function renderProfile() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={qc}>
        <ToastProvider>
          <AuthProvider>
            <MemoryRouter initialEntries={['/profile/ramesh']}>
              <Routes>
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/login" element={<div>Login page</div>} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe('Profile — service request dialog', () => {
  beforeEach(() => {
    tokenStore.clear();
  });
  afterEach(() => {
    tokenStore.clear();
    vi.unstubAllGlobals();
  });

  it('individual Request opens a confirmation dialog with the right details, without submitting', async () => {
    tokenStore.set('tok');
    const fetchMock = mockFetch({ user: CUSTOMER });
    vi.stubGlobal('fetch', fetchMock);
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Request' })[0]);

    const dialog = await screen.findByRole('dialog', { name: /request this service/i });
    expect(within(dialog).getByText('Custom Terracotta Pot')).toBeInTheDocument();
    expect(within(dialog).getByText('Ramesh Kumar')).toBeInTheDocument();
    expect(within(dialog).getByText('₹250')).toBeInTheDocument();
    expect(within(dialog).getByText('3 days')).toBeInTheDocument();
    expect(findOrderPosts(fetchMock)).toHaveLength(0);
  });

  it('includes an optional note in the create-order payload', async () => {
    tokenStore.set('tok');
    const fetchMock = mockFetch({ user: CUSTOMER });
    vi.stubGlobal('fetch', fetchMock);
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Request' })[0]);
    await screen.findByRole('dialog');
    await user.type(screen.getByLabelText(/note/i), 'Please make it terracotta red.');
    await user.click(screen.getByRole('button', { name: /send request/i }));

    await waitFor(() => expect(findOrderPosts(fetchMock)).toHaveLength(1));
    const [, init] = findOrderPosts(fetchMock)[0];
    expect(JSON.parse(init!.body as string)).toMatchObject({
      entrepreneurId: 'ramesh',
      kind: 'service',
      itemId: 'svc-1',
      note: 'Please make it terracotta red.',
    });
  });

  it('Send Request calls the mutation exactly once and closes the dialog on success', async () => {
    tokenStore.set('tok');
    const fetchMock = mockFetch({ user: CUSTOMER });
    vi.stubGlobal('fetch', fetchMock);
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Request' })[0]);
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: /send request/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(findOrderPosts(fetchMock)).toHaveLength(1);
    expect(await screen.findByText(/request sent to ramesh kumar/i)).toBeInTheDocument();
  });

  it('disables Send Request and shows "Sending…" while pending, preventing a duplicate submission', async () => {
    tokenStore.set('tok');
    let resolveOrder!: () => void;
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET';
      const path = url.replace(API_URL, '');
      if (path === '/api/auth/me') return json({ user: CUSTOMER });
      if (path.startsWith('/api/entrepreneurs/ramesh') && method === 'GET') {
        return json({ entrepreneur: ENTREPRENEUR, services: SERVICES, products: PRODUCTS, reviews: [] });
      }
      if (path.startsWith('/api/entrepreneurs?')) return json({ entrepreneurs: [] });
      if (path === '/api/orders' && method === 'POST') {
        return new Promise<Response>((resolve) => {
          resolveOrder = () => resolve(json(ORDER_RESPONSE));
        });
      }
      throw new Error(`Unhandled fetch: ${method} ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Request' })[0]);
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: /send request/i }));

    const sendingButton = await screen.findByRole('button', { name: 'Sending…' });
    expect(sendingButton).toBeDisabled();
    await user.click(sendingButton); // disabled — must not fire a second POST
    resolveOrder();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(findOrderPosts(fetchMock)).toHaveLength(1);
  });

  it('Cancel closes the dialog without submitting', async () => {
    tokenStore.set('tok');
    const fetchMock = mockFetch({ user: CUSTOMER });
    vi.stubGlobal('fetch', fetchMock);
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Request' })[0]);
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(findOrderPosts(fetchMock)).toHaveLength(0);
  });

  it('Escape closes the dialog without submitting', async () => {
    tokenStore.set('tok');
    const fetchMock = mockFetch({ user: CUSTOMER });
    vi.stubGlobal('fetch', fetchMock);
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Request' })[0]);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(findOrderPosts(fetchMock)).toHaveLength(0);
  });

  it('sticky CTA with multiple services opens a service chooser first', async () => {
    tokenStore.set('tok');
    vi.stubGlobal('fetch', mockFetch({ user: CUSTOMER }));
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /request a service/i }));

    const dialog = await screen.findByRole('dialog', { name: /choose a service/i });
    expect(within(dialog).getByText('Custom Terracotta Pot')).toBeInTheDocument();
    expect(within(dialog).getByText('Diwali Diya Set')).toBeInTheDocument();
  });

  it('selecting a service from the chooser then sending uses that service’s id', async () => {
    tokenStore.set('tok');
    const fetchMock = mockFetch({ user: CUSTOMER });
    vi.stubGlobal('fetch', fetchMock);
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /request a service/i }));
    const chooser = await screen.findByRole('dialog', { name: /choose a service/i });
    await user.click(within(chooser).getByText('Diwali Diya Set'));

    await screen.findByRole('dialog', { name: /request this service/i });
    await user.click(screen.getByRole('button', { name: /send request/i }));

    await waitFor(() => expect(findOrderPosts(fetchMock)).toHaveLength(1));
    const [, init] = findOrderPosts(fetchMock)[0];
    expect(JSON.parse(init!.body as string)).toMatchObject({ itemId: 'svc-2' });
  });

  it('preselects the single service and skips the chooser when there is only one', async () => {
    tokenStore.set('tok');
    vi.stubGlobal('fetch', mockFetch({ user: CUSTOMER, services: [SERVICES[0]] }));
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /request a service/i }));

    expect(await screen.findByRole('dialog', { name: /request this service/i })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /choose a service/i })).not.toBeInTheDocument();
  });

  it('redirects an unauthenticated visitor to login without opening the dialog', async () => {
    vi.stubGlobal('fetch', mockFetch({ user: null }));
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Request' })[0]);

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows a role error for a non-customer without opening the dialog', async () => {
    tokenStore.set('tok');
    vi.stubGlobal('fetch', mockFetch({ user: ENTREPRENEUR_USER }));
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Request' })[0]);

    expect(await screen.findByText('Only customer accounts can place orders.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows no dead CTA when there are no services', async () => {
    tokenStore.set('tok');
    vi.stubGlobal('fetch', mockFetch({ user: CUSTOMER, services: [] }));
    renderProfile();

    const matches = await screen.findAllByText('No services listed yet');
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('button', { name: /request a service/i })).not.toBeInTheDocument();
  });
});
