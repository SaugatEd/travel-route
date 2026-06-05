import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { JOURNEYS, CALENDAR, STOPS } from '@/data/tripData.js';
import { tintFor } from '@/lib/country';
import { DayPlanSections, hasPlanContent } from '@/components/day/DayPlanSections';
import { useNprRate } from '@/hooks/useNprRate';
import { useCurrencyMode } from '@/store/useUiStore';
import type { Journey, CalendarDay, Stop } from '@/types';
import './trains.css';

/* ── Per-leg visual metadata, keyed by journey.type ──────────────── */
const LEG_META: Record<string, { icon: string; label: string; color: string }> = {
  flight:    { icon: '✈',  label: 'Flight',      color: '#4338CA' },
  highspeed: { icon: '⚡',  label: 'High-speed',  color: '#C2410C' },
  regional:  { icon: '🚆', label: 'Regional',    color: '#166534' },
  scenic:    { icon: '🎬', label: 'Scenic',      color: '#0891B2' },
  nightjet:  { icon: '🌙', label: 'Night train', color: '#4338CA' },
  train:     { icon: '🚆', label: 'Train',       color: '#166534' },
  walk:      { icon: '🚶', label: 'Walk',        color: '#6B7280' },
  ferry:     { icon: '⛴',  label: 'Ferry',       color: '#0E7490' },
  bus:       { icon: '🚌', label: 'Bus',         color: '#16A34A' },
  flixbus:   { icon: '🚌', label: 'Night bus',   color: '#16A34A' },
};
const legMeta = (t: string) => LEG_META[t] ?? LEG_META.train;

/* ── Country resolution from free-text station names ─────────────── */
const EUROPE = ['Italy', 'Switzerland', 'Austria', 'Czechia', 'Germany', 'Netherlands'] as const;
type Group = (typeof EUROPE)[number];

const COUNTRY_KEYWORDS: { re: RegExp; country: Group | 'Transit' }[] = [
  { re: /\b(rome|roma|fco|fiumicino|trastevere|milan|milano|como)\b/i, country: 'Italy' },
  { re: /\b(lucerne|luzern|interlaken|lauterbrunnen|grindelwald|bern|z[üu]rich|lugano|gotthard)\b/i, country: 'Switzerland' },
  { re: /\b(bregenz|lauterach|innsbruck|salzburg|hallstatt|schafberg|gilgen|wien|vienna|zell am see)\b/i, country: 'Austria' },
  { re: /\b(prague|praha)\b/i, country: 'Czechia' },
  { re: /\b(berlin|freilassing|munich|m[üu]nchen|freising)\b/i, country: 'Germany' },
  { re: /\b(amsterdam|alkmaar|schiphol|ruijterkade|centraal)\b/i, country: 'Netherlands' },
  { re: /\b(delhi|del|nepal|kathmandu|ktm|istanbul|ist)\b/i, country: 'Transit' },
];
function countryOf(text: string | undefined): Group | 'Transit' | null {
  if (!text) return null;
  for (const { re, country } of COUNTRY_KEYWORDS) if (re.test(text)) return country;
  return null;
}

const STOP_COUNTRY_EXTRA: Record<string, string> = { ktm: 'Transit', bregenz: 'Austria', imst: 'Austria' };

const MONTHS: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
/** "Sat 20 Jun 10:15" → sortable number (month·10000 + day·100 + fractional hours). */
function sortKey(s: string): number {
  const d = s.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
  const t = s.match(/(\d{1,2}):(\d{2})/);
  const date = d ? MONTHS[d[2]] * 10000 + Number(d[1]) * 100 : 0;
  const mins = t ? (Number(t[1]) * 60 + Number(t[2])) / 60 : 0;
  return date + mins;
}
const dayKey = (s: string) => Math.floor(sortKey(s) / 100);

function durMins(d: string | undefined): number {
  if (!d) return 0;
  const h = d.match(/(\d+)\s*h/);
  const m = d.match(/(\d+)\s*m(?:in)?\b/);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

function parseCost(cost: string | undefined): { value: number; cur: string } | null {
  if (!cost || /included/i.test(cost)) return null;
  const num = cost.match(/[\d.]+/);
  if (!num) return null;
  const cur = /CHF/i.test(cost) ? 'CHF' : /CZK/i.test(cost) ? 'CZK' : /\$/.test(cost) ? 'USD' : 'EUR';
  return { value: parseFloat(num[0]), cur };
}

const stripWeekday = (s: string) => s.replace(/^[A-Za-z]{3}\s+/, '');
const stripLeadEmoji = (s: string) => s.replace(/^[\p{Extended_Pictographic}️\s]+/u, '');

/* ── View models ─────────────────────────────────────────────────── */
interface DayVM { day: CalendarDay; legs: Journey[] }
interface CountryVM {
  id: string;
  name: Group;
  flag: string;
  tint: ReturnType<typeof tintFor>;
  days: DayVM[];
  trainCount: number;
  daysCount: number;
  dateLabel: string;
}

function buildCountries(): CountryVM[] {
  const stops = STOPS as unknown as Stop[];
  const cal = CALENDAR as CalendarDay[];
  const stopCountry = new Map<string, string>();
  stops.forEach((s) => stopCountry.set(s.id, s.country as string));
  const dayCountry = (d: CalendarDay) => stopCountry.get(d.stop) ?? STOP_COUNTRY_EXTRA[d.stop] ?? countryOf(d.city) ?? 'Transit';

  // Resolve each journey to its destination country + the calendar day it lands on.
  const resolve = (j: Journey) => {
    const country = countryOf(j.to) ?? countryOf(j.from) ?? 'Transit';
    const dep = dayKey(j.date);
    const arrival = cal
      .filter((d) => dayCountry(d) === country && dayKey(d.date) >= dep)
      .sort((a, b) => dayKey(a.date) - dayKey(b.date))[0]
      ?? cal.find((d) => dayKey(d.date) === dep);
    return { country, day: arrival };
  };

  const byCountry = new Map<string, Map<number, DayVM>>();
  for (const j of JOURNEYS as Journey[]) {
    const { country, day } = resolve(j);
    if (!day || !(EUROPE as readonly string[]).includes(country)) continue;
    if (!byCountry.has(country)) byCountry.set(country, new Map());
    const days = byCountry.get(country)!;
    if (!days.has(day.dayN)) days.set(day.dayN, { day, legs: [] });
    days.get(day.dayN)!.legs.push(j);
  }

  const out: CountryVM[] = [];
  for (const [name, dayMap] of byCountry) {
    const days = [...dayMap.values()].sort((a, b) => a.day.dayN - b.day.dayN);
    days.forEach((d) => d.legs.sort((a, b) => sortKey(a.date) - sortKey(b.date)));
    const inCountry = cal.filter((d) => dayCountry(d) === name);
    out.push({
      id: `c-${name.toLowerCase()}`,
      name: name as Group,
      flag: (stops.find((s) => s.country === name)?.flag as string) ?? days[0].day.flag,
      tint: tintFor(name),
      days,
      trainCount: days.reduce((n, d) => n + d.legs.length, 0),
      daysCount: inCountry.length || days.length,
      dateLabel: rangeLabel(days),
    });
  }
  return out.sort((a, b) => a.days[0].day.dayN - b.days[0].day.dayN);
}

function rangeLabel(days: DayVM[]): string {
  const first = stripWeekday(days[0].day.date);
  const last = stripWeekday(days[days.length - 1].day.date);
  return first === last ? first : `${first} – ${last}`;
}

/* ── Single leg card ─────────────────────────────────────────────── */
function LegCard({ j, npr }: { j: Journey; npr: string | null }) {
  const meta = legMeta(j.type);
  const style = { '--leg-color': meta.color } as CSSProperties;
  const body = (
    <>
      <span className="trains-leg-icon" aria-hidden>{meta.icon}</span>
      <div className="trains-leg-main">
        <div className="trains-leg-title">
          <span className="trains-leg-name">{stripLeadEmoji(j.via)}</span>
          <span className="trains-leg-type">{meta.label}</span>
        </div>
        <div className="trains-leg-route">
          {j.from} <span className="arrow">→</span> {j.to}
        </div>
        <div className="trains-leg-meta">{stripWeekday(j.date)} · {j.dur}</div>
        {j.costNote && <div className="trains-leg-note">💶 {j.costNote}</div>}
      </div>
      <div className="trains-leg-end">
        <span className="trains-leg-cost">{j.cost}</span>
        {npr && <span className="trains-leg-npr">~{npr}</span>}
        {j.bookingUrl && <span className="trains-leg-go">Book →</span>}
      </div>
    </>
  );

  return j.bookingUrl ? (
    <a className="trains-leg" style={style} href={j.bookingUrl} target="_blank" rel="noreferrer">
      {body}
    </a>
  ) : (
    <div className="trains-leg" style={style}>{body}</div>
  );
}

/* ── Component ────────────────────────────────────────────────────── */
export function TrainsByCountry() {
  const showNPR = useCurrencyMode() === 'npr';
  const { data: rate } = useNprRate();
  const npr = rate?.npr;

  const countries = useMemo(buildCountries, []);
  const totalTrains = countries.reduce((n, c) => n + c.trainCount, 0);
  const totalMins = countries.reduce(
    (n, c) => n + c.days.reduce((m, d) => m + d.legs.reduce((s, l) => s + (l.type === 'flight' ? 0 : durMins(l.dur)), 0), 0),
    0,
  );

  const [activeId, setActiveId] = useState(countries[0]?.id ?? '');
  const sectionRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-72px 0px -60% 0px', threshold: 0 },
    );
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [countries]);

  const jumpTo = (id: string) => sectionRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const nprFor = (cost: string, type: string): string | null => {
    if (!showNPR || !npr || type === 'flight') return null;
    const p = parseCost(cost);
    return p ? npr(p.value, p.cur) : null;
  };

  return (
    <div className="trains">
      <header className="trains-head">
        <div className="trains-kicker">🚄 Country by country</div>
        <h1 className="trains-title">Trains &amp; route</h1>
        <p className="trains-lede">
          Every leg of the ground journey, grouped by the country it carries you into — with the
          plan for each travel day right under its train. Tap any ride to book it.
        </p>
        <div className="trains-stats">
          <div className="trains-stat"><b>{totalTrains}</b><span>journeys</span></div>
          <div className="trains-stat"><b>{Math.floor(totalMins / 60)}h {totalMins % 60}m</b><span>on the rails</span></div>
          <div className="trains-stat"><b>{countries.length}</b><span>countries</span></div>
        </div>
      </header>

      <nav className="trains-jump" aria-label="Jump to country">
        {countries.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`trains-chip${activeId === c.id ? ' is-active' : ''}`}
            style={{ '--chip-accent': c.tint.accent } as CSSProperties}
            onClick={() => jumpTo(c.id)}
          >
            <span aria-hidden>{c.flag}</span>
            {c.name}
            <span className="trains-chip-count">{c.trainCount}</span>
          </button>
        ))}
      </nav>

      {countries.map((c) => (
        <section
          key={c.id}
          id={c.id}
          className="trains-country"
          ref={(el) => {
            if (el) sectionRefs.current.set(c.id, el);
            else sectionRefs.current.delete(c.id);
          }}
          style={{
            '--c-accent': c.tint.accent,
            '--country-tint': c.tint.tint,
            '--country-strip': c.tint.strip,
          } as CSSProperties}
        >
          <header className="trains-country-head">
            <span className="trains-country-strip" aria-hidden />
            <span className="trains-country-flag" aria-hidden>{c.flag}</span>
            <h2 className="trains-country-name">{c.name}</h2>
            <div className="trains-country-meta">
              <span className="big">{c.trainCount} {c.trainCount === 1 ? 'journey' : 'journeys'} · {c.daysCount} {c.daysCount === 1 ? 'day' : 'days'}</span>
              <span className="small">{c.dateLabel}</span>
            </div>
          </header>

          <div className="trains-rail">
            {c.days.map((d) => {
              const plan = d.day.plan;
              return (
                <div className="trains-day" key={d.day.dayN}>
                  <span className="trains-day-dot" aria-hidden />
                  <div className="trains-day-body">
                    <div className="trains-day-head">
                      <span className="trains-day-n">DAY {d.day.dayN}</span>
                      <span className="trains-day-city">{d.day.city}</span>
                      <span className="trains-day-date">{d.day.date}</span>
                    </div>

                    <div className="trains-legs">
                      {d.legs.map((j) => (
                        <LegCard key={`${j.from}-${j.to}-${j.date}`} j={j} npr={nprFor(j.cost, j.type)} />
                      ))}
                    </div>

                    {hasPlanContent(plan) && (
                      <div className="trains-day-plan">
                        <DayPlanSections plan={plan} accent={c.tint.accent} hideTransit />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <p className="trains-foot">
        {countries.length} countries · {totalTrains} journeys · {Math.floor(totalMins / 60)}h {totalMins % 60}m on the rails
      </p>
    </div>
  );
}
