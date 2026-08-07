import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tabs, TabPanel } from './Tabs';

const ITEMS = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
] as const;

function Harness() {
  const [value, setValue] = useState<'a' | 'b' | 'c'>('a');
  return (
    <>
      <Tabs items={ITEMS as unknown as { id: 'a' | 'b' | 'c'; label: string }[]} value={value} onChange={setValue} />
      <TabPanel id="a" activeId={value}>
        Panel A
      </TabPanel>
      <TabPanel id="b" activeId={value}>
        Panel B
      </TabPanel>
    </>
  );
}

describe('Tabs', () => {
  it('exposes correct ARIA roles and selection', () => {
    render(<Harness />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel A');
  });

  it('moves selection with arrow keys', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('tab', { name: 'Alpha' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel B');
  });

  it('wraps from the first tab to the last with ArrowLeft', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('tab', { name: 'Alpha' }));
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'true');
  });
});
