import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge, OrderTimeline } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders a human-readable label per status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Awaiting confirmation')).toBeInTheDocument();
  });
});

describe('OrderTimeline', () => {
  it('shows the three tracking steps', () => {
    render(<OrderTimeline status="accepted" />);
    expect(screen.getByText('Requested')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('explains a declined request instead of showing steps', () => {
    render(<OrderTimeline status="declined" />);
    expect(screen.getByText(/was declined/i)).toBeInTheDocument();
    expect(screen.queryByText('Requested')).not.toBeInTheDocument();
  });
});
