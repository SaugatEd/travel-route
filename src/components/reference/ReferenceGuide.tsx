import { useEffect, useMemo, useRef, useState } from 'react';
import './reference.css';

export interface RefItem {
  head: string;
  detail?: string;
}

export interface RefGroup {
  id: string;
  title: string;
  cities?: string;
  items: RefItem[];
}

export interface RefData {
  intro: { headline: string; body: string };
  groups: RefGroup[];
}

type Tone = 'accent' | 'red' | 'green';

interface ReferenceGuideProps {
  icon: string;
  title: string;
  kicker: string;
  data: RefData;
  tone?: Tone;
  /** When true, cards show a 1-based index badge instead of the leading emoji. */
  numbered?: boolean;
}

// Leading emoji (incl. flags = two regional indicators) or null.
const LEADING_EMOJI = /^(\p{Regional_Indicator}{2}|\p{Extended_Pictographic}️?)\s*/u;

function splitHead(head: string): { icon: string | null; text: string } {
  const m = head.match(LEADING_EMOJI);
  if (!m) return { icon: null, text: head };
  return { icon: m[1], text: head.slice(m[0].length) };
}

export function ReferenceGuide({
  icon,
  title,
  kicker,
  data,
  tone = 'accent',
  numbered = false,
}: ReferenceGuideProps) {
  const { groups, intro } = data;
  const totalTips = useMemo(
    () => groups.reduce((n, g) => n + g.items.length, 0),
    [groups],
  );

  const [activeId, setActiveId] = useState(groups[0]?.id ?? '');
  const sectionRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-72px 0px -55% 0px', threshold: 0 },
    );
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [groups]);

  const jumpTo = (id: string) => {
    sectionRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={`ref${tone === 'accent' ? '' : ` ref--${tone}`}`}>
      <header className="ref-head">
        <div className="ref-kicker">{kicker}</div>
        <h1 className="ref-title">
          <span className="ref-title-icon" aria-hidden>{icon}</span>
          {title}
        </h1>
        <div className="ref-lede">
          <strong>{intro.headline}</strong>
          <span>{intro.body}</span>
        </div>
      </header>

      <nav className="ref-jump" aria-label={`${title} sections`}>
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`ref-chip${activeId === g.id ? ' is-active' : ''}`}
            onClick={() => jumpTo(g.id)}
          >
            {shortTitle(g.title)}
            <span className="ref-chip-count">{g.items.length}</span>
          </button>
        ))}
      </nav>

      {groups.map((g, gi) => (
        <section
          key={g.id}
          id={g.id}
          className="ref-group"
          ref={(el) => {
            if (el) sectionRefs.current.set(g.id, el);
            else sectionRefs.current.delete(g.id);
          }}
        >
          <div className="ref-group-head">
            <span className="ref-group-index">{String(gi + 1).padStart(2, '0')}</span>
            <h2 className="ref-group-title">{g.title}</h2>
            {g.cities && <span className="ref-group-cities">{g.cities}</span>}
          </div>

          <div className="ref-cards">
            {g.items.map((item, i) => {
              const { icon: emoji, text } = splitHead(item.head);
              const showNum = numbered || !emoji;
              return (
                <article key={i} className="ref-card">
                  <div className={`ref-badge${showNum ? ' ref-badge--num' : ''}`} aria-hidden>
                    {showNum ? i + 1 : emoji}
                  </div>
                  <div className="ref-card-body">
                    <div className="ref-card-head">{text}</div>
                    {item.detail && <div className="ref-card-detail">{item.detail}</div>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <p
        style={{
          textAlign: 'center',
          margin: '34px 0 8px',
          fontSize: 12,
          color: 'var(--text-dim)',
          fontFamily: 'var(--mono)',
        }}
      >
        {groups.length} sections · {totalTips} notes
      </p>
    </div>
  );
}

// Trim verbose group titles down for the jump chips (keep the part before an em dash / colon).
function shortTitle(title: string): string {
  const cut = title.split(/\s+[—–-]\s+|:\s+/)[0].trim();
  return cut.length > 26 ? `${cut.slice(0, 24)}…` : cut;
}
