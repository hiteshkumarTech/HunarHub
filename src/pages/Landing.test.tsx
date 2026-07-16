import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Landing from './Landing';

function renderLanding() {
  return render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>,
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

  it('links the primary CTA to the marketplace', () => {
    renderLanding();
    const exploreLinks = screen.getAllByRole('link', { name: /explore artisans/i });
    expect(exploreLinks.length).toBeGreaterThan(0);
    expect(exploreLinks[0]).toHaveAttribute('href', '/browse');
  });
});
