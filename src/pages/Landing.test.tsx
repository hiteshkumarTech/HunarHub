import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import Landing from './Landing';

beforeEach(() => {
  // Keep the smoke test hermetic — no real network from data-driven sections.
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ entrepreneurs: [] }), { status: 200, headers: { 'content-type': 'application/json' } })),
  );
});

function renderLanding() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('Landing page', () => {
  it('renders every major marketing section', () => {
    renderLanding();
    expect(screen.getByText('Popular categories')).toBeInTheDocument();
    expect(screen.getByText('Featured local entrepreneurs')).toBeInTheDocument();
    expect(screen.getByText('Trending handmade products')).toBeInTheDocument();
    expect(screen.getByText('Hire local talent in three steps')).toBeInTheDocument();
    expect(screen.getByText('Loved by makers and customers alike')).toBeInTheDocument();
  });

  it('exposes a labelled search input', () => {
    renderLanding();
    expect(screen.getByLabelText('Search artisans and crafts')).toBeInTheDocument();
  });
});
