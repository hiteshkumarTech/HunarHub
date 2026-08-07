import { useRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface TabItem<T extends string> {
  id: T;
  label: ReactNode;
}

/**
 * Accessible tab list: proper ARIA roles plus roving focus with
 * Left/Right/Home/End keys (WAI-ARIA authoring practice).
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  idPrefix = 'tab',
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  idPrefix?: string;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: React.KeyboardEvent) {
    const i = items.findIndex((t) => t.id === value);
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % items.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    if (next === -1) return;
    e.preventDefault();
    const id = items[next].id;
    onChange(id);
    refs.current[id]?.focus();
  }

  return (
    <div role="tablist" onKeyDown={onKeyDown} className={cn('flex gap-8 border-b border-line', className)}>
      {items.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            role="tab"
            id={`${idPrefix}-${t.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${t.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cn(
              'relative pb-3 text-[11px] font-mono uppercase tracking-widest transition-colors',
              selected ? 'text-fg' : 'text-muted hover:text-fg',
            )}
          >
            {t.label}
            {selected && <span className="absolute -bottom-[1px] left-0 h-[2px] w-full bg-fg" />}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, activeId, idPrefix = 'tab', children }: { id: string; activeId: string; idPrefix?: string; children: ReactNode }) {
  if (id !== activeId) return null;
  return (
    <div role="tabpanel" id={`${idPrefix}-panel-${id}`} aria-labelledby={`${idPrefix}-${id}`} tabIndex={0}>
      {children}
    </div>
  );
}
