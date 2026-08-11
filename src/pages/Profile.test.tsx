import { render, screen, waitFor } from '@testing-library/react';
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
function mockFetch({ user }: { user: typeof CUSTOMER | typeof ENTREPRENEUR_USER | null }) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    const path = url.replace(API_URL, '');
    if (path === '/api/auth/me') return user ? json({ user }) : new Response(null, { status: 401 });
    if (path.startsWith('/api/entrepreneurs/ramesh') && method === 'GET') {
      return json({ entrepreneur: ENTREPRENEUR, services: SERVICES, products: PRODUCTS, reviews: [] });
    }
    if (path.startsWith('/api/entrepreneurs?')) return json({ entrepreneurs: [] });
    if (path === '/api/orders' && method === 'POST') return json(ORDER_RESPONSE);
    throw new Error(`Unhandled fetch in Profile test: ${method} ${path}`);
  });
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

describe('Profile — service request flow', () => {
  beforeEach(() => {
    tokenStore.clear();
  });
  afterEach(() => {
    tokenStore.clear();
    vi.unstubAllGlobals();
  });

  it('sticky CTA switches to the Services tab and focuses the first Request button when on another tab', async () => {
    tokenStore.set('tok');
    vi.stubGlobal('fetch', mockFetch({ user: CUSTOMER }));
    Element.prototype.scrollIntoView = vi.fn();
    renderProfile();

    const user = userEvent.setup();
    await screen.findByText('Custom Terracotta Pot');
    await user.click(screen.getByRole('tab', { name: 'Products' }));
    expect(await screen.findByText('Painted Planter')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /request a service/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Request' })[0]).toHaveFocus();
    });
  });

  it('sticky CTA on the Services tab still performs a visible, useful action (not a no-op)', async () => {
    tokenStore.set('tok');
    vi.stubGlobal('fetch', mockFetch({ user: CUSTOMER }));
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /request a service/i }));

    expect(scrollSpy).toHaveBeenCalled();
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Request' })[0]).toHaveFocus());
  });

  it('never auto-submits a request — clicking the sticky CTA with multiple services requires the visitor to still pick one', async () => {
    tokenStore.set('tok');
    const fetchMock = mockFetch({ user: CUSTOMER });
    vi.stubGlobal('fetch', fetchMock);
    Element.prototype.scrollIntoView = vi.fn();
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /request a service/i }));

    expect(fetchMock.mock.calls.some(([url, init]) => url.endsWith('/api/orders') && init?.method === 'POST')).toBe(false);
  });

  it('individual Request button calls the create-order mutation with the right payload', async () => {
    tokenStore.set('tok');
    const fetchMock = mockFetch({ user: CUSTOMER });
    vi.stubGlobal('fetch', fetchMock);
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Request' })[0]);

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([url, init]) => url.endsWith('/api/orders') && init?.method === 'POST')).toBe(true);
    });
    const [, init] = fetchMock.mock.calls.find(([url, i]) => url.endsWith('/api/orders') && i?.method === 'POST')!;
    expect(JSON.parse(init!.body as string)).toMatchObject({ entrepreneurId: 'ramesh', kind: 'service', itemId: 'svc-1' });
    expect(await screen.findByText(/request sent to ramesh kumar/i)).toBeInTheDocument();
  });

  it('shows "Sending…" and disables the button while pending, preventing a duplicate submission', async () => {
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
    const button = screen.getAllByRole('button', { name: 'Request' })[0];
    await user.click(button);

    const sendingButton = await screen.findByRole('button', { name: 'Sending…' });
    expect(sendingButton).toBeDisabled();

    // A click while disabled must not fire a second POST.
    await user.click(sendingButton);
    resolveOrder();

    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Request' })[0]).not.toBeDisabled());
    const orderPosts = fetchMock.mock.calls.filter(([url, init]) => url.endsWith('/api/orders') && init?.method === 'POST');
    expect(orderPosts).toHaveLength(1);
  });

  it('redirects an unauthenticated visitor to login instead of silently doing nothing', async () => {
    vi.stubGlobal('fetch', mockFetch({ user: null }));
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Request' })[0]);

    expect(await screen.findByText('Login page')).toBeInTheDocument();
  });

  it('shows a clear role error, not a silent no-op, for a non-customer account', async () => {
    tokenStore.set('tok');
    vi.stubGlobal('fetch', mockFetch({ user: ENTREPRENEUR_USER }));
    renderProfile();
    await screen.findByText('Custom Terracotta Pot');

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Request' })[0]);

    expect(await screen.findByText('Only customer accounts can place orders.')).toBeInTheDocument();
  });
});
