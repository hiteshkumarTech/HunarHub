import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../components/ui/Toast';
import { API_URL, tokenStore } from '../lib/api';
import Dashboard from './Dashboard';

const USER = {
  id: 'ent1',
  name: 'Ramesh Kumar',
  email: 'ramesh@test.local',
  role: 'entrepreneur',
  profile: {
    category: 'potter',
    craft: 'Potter (Kumhar)',
    city: 'Jaipur',
    state: 'Rajasthan',
    exp: 24,
    bio: '',
    startingPrice: 120,
    available: true,
    verified: true,
    ratingAvg: 4.9,
    ratingCount: 128,
  },
};

// 2 completed (250 + 320 = 570), 1 accepted, 1 pending, 1 declined — earnings
// must only sum the completed ones, never declined/accepted/pending.
const ORDERS = [
  { id: 'o1', kind: 'service', title: 'Custom Pot', price: 250, status: 'completed', customer: { id: 'c1', name: 'Priya' }, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'o2', kind: 'product', title: 'Painted Planter', price: 320, status: 'completed', customer: { id: 'c2', name: 'Anita' }, createdAt: '2026-01-02T00:00:00.000Z' },
  { id: 'o3', kind: 'service', title: 'Diya Set', price: 999, status: 'accepted', customer: { id: 'c3', name: 'Rohit' }, createdAt: '2026-01-03T00:00:00.000Z' },
  { id: 'o4', kind: 'service', title: 'Vase', price: 999, status: 'pending', customer: { id: 'c4', name: 'Meera' }, createdAt: '2026-01-04T00:00:00.000Z' },
  { id: 'o5', kind: 'service', title: 'Bowl', price: 999, status: 'declined', customer: { id: 'c5', name: 'Karan' }, createdAt: '2026-01-05T00:00:00.000Z' },
];

function json(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

function mockFetch() {
  return vi.fn(async (url: string) => {
    const path = url.replace(API_URL, '');
    if (path === '/api/auth/me') return json({ user: USER });
    if (path.startsWith('/api/entrepreneurs/ent1')) return json({ entrepreneur: null, services: [], products: [], reviews: [] });
    if (path === '/api/orders/incoming') return json({ orders: ORDERS });
    throw new Error(`Unhandled fetch in Dashboard test: ${path}`);
  });
}

function renderDashboard() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={qc}>
        <ToastProvider>
          <AuthProvider>
            <MemoryRouter initialEntries={['/dashboard']}>
              <Dashboard />
            </MemoryRouter>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe('Dashboard earnings overview', () => {
  beforeEach(() => {
    tokenStore.set('tok123');
    vi.stubGlobal('fetch', mockFetch());
  });
  afterEach(() => {
    tokenStore.clear();
    vi.unstubAllGlobals();
  });

  it('sums only completed orders for earnings and counts completed orders separately', async () => {
    renderDashboard();

    // 250 + 320 = 570 — the accepted/pending/declined 999s must not be included.
    expect(await screen.findByText('₹570')).toBeInTheDocument();

    const completedLabel = await screen.findByText('Completed orders');
    const completedCard = completedLabel.closest('div')?.parentElement;
    expect(completedCard).not.toBeNull();
    expect(completedCard!.textContent).toContain('2');

    const activeLabel = screen.getByText('Active orders');
    const activeCard = activeLabel.closest('div')?.parentElement;
    expect(activeCard!.textContent).toContain('1'); // only the 'accepted' order
  });
});
