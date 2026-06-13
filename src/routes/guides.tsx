import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { usePacking } from '@/hooks/queries/content';
import { Resource } from '@/components/ui/Resource';

export const Route = createFileRoute('/guides')({
  component: GuidesPage,
});

interface PreTripTask {
  task: string;
  deadline: string;
  done?: boolean;
}

interface PackingChecklist {
  documents: string[];
  electronics: string[];
  clothing: string[];
  toiletries: string[];
  misc: string[];
  preTripTasks: PreTripTask[];
}

const CATEGORY_META: Record<string, { icon: string; title: string; tone: string }> = {
  preTripTasks: { icon: '🗓', title: 'Pre-trip tasks',  tone: '#7C2D12' },
  documents:    { icon: '📄', title: 'Documents',       tone: '#0B5394' },
  electronics:  { icon: '🔌', title: 'Electronics',     tone: '#7E22CE' },
  clothing:     { icon: '👕', title: 'Clothing',        tone: '#0F766E' },
  toiletries:   { icon: '🧴', title: 'Toiletries',      tone: '#B45309' },
  misc:         { icon: '🎒', title: 'Misc',            tone: '#374151' },
};

const ORDER: (keyof PackingChecklist)[] = [
  'preTripTasks', 'documents', 'electronics', 'clothing', 'toiletries', 'misc',
];

function GuidesPage() {
  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <header style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(25px, 7vw, 34px)', margin: '0 0 4px', color: 'var(--text)' }}>
          Europe Trip Packing List
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          Documents, gear and pre-departure tasks. Tap any section to expand.
        </p>
      </header>

      <Resource query={usePacking()}>
        {(packing) => <ChecklistSections packing={packing as PackingChecklist} />}
      </Resource>
    </div>
  );
}

function ChecklistSections({ packing }: { packing: PackingChecklist }) {
  const [openKey, setOpenKey] = useState<string | null>('preTripTasks');

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {ORDER.filter((k) => packing[k]?.length).map((key) => {
        const meta = CATEGORY_META[key];
        const items = packing[key];
        const isOpen = openKey === key;

        return (
          <Section
            key={key}
            icon={meta.icon}
            title={meta.title}
            tone={meta.tone}
            count={items.length}
            open={isOpen}
            onToggle={() => setOpenKey(isOpen ? null : key)}
          >
            {key === 'preTripTasks'
              ? <TaskList tasks={items as PreTripTask[]} tone={meta.tone} />
              : <ItemList items={items as string[]} tone={meta.tone} />}
          </Section>
        );
      })}
    </div>
  );
}

interface SectionProps {
  icon: string;
  title: string;
  tone: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ icon, title, tone, count, open, onToggle, children }: SectionProps) {
  return (
    <div
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          padding: '14px 18px',
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          textAlign: 'left',
          font: 'inherit',
        }}
      >
        <span style={{ fontSize: 24 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{title}</span>
        <span
          style={{
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: tone,
            border: `1.5px solid ${tone}`,
            borderRadius: 999,
            background: 'transparent',
          }}
        >
          {count}
        </span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div style={{ padding: '4px 18px 18px', borderTop: '1px solid var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function ItemList({ items, tone }: { items: string[]; tone: string }) {
  const storageKey = `packing-${tone}`;
  const [checked, setChecked] = useState<Record<number, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as Record<number, boolean>) : {};
    } catch { return {}; }
  });
  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  };
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0 0' }}>
      {items.map((item, i) => (
        <li key={i}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14, lineHeight: 1.5, padding: '12px 0' }}>
            <input
              type="checkbox"
              checked={!!checked[i]}
              onChange={() => toggle(i)}
              style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0, accentColor: tone }}
            />
            <span style={{ color: checked[i] ? 'var(--text-faint)' : 'var(--text)', textDecoration: checked[i] ? 'line-through' : 'none' }}>
              {item}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function TaskList({ tasks, tone }: { tasks: PreTripTask[]; tone: string }) {
  const storageKey = 'packing-pretrip';
  const [checked, setChecked] = useState<Record<number, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as Record<number, boolean>) : {};
    } catch { return {}; }
  });
  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  };
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0 0' }}>
      {tasks.map((t, i) => (
        <li key={i}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '10px 0' }}>
            <input
              type="checkbox"
              checked={!!checked[i]}
              onChange={() => toggle(i)}
              style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0, accentColor: tone }}
            />
            <span style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: checked[i] ? 'var(--text-faint)' : 'var(--text)', textDecoration: checked[i] ? 'line-through' : 'none', lineHeight: 1.4 }}>
                {t.task}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                ⏰ {t.deadline}
              </div>
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
