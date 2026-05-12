import { createFileRoute } from '@tanstack/react-router';
import type { CSSProperties } from 'react';

export const Route = createFileRoute('/visa-docs')({
  component: VisaDocsPage,
});

interface DocEntry {
  /** filename under public/visa-docs/pdf/<folder>/ */
  file: string;
  title: string;
  description: string;
  pages: string;
  notes?: string[];
}

interface DocSection {
  key: string;
  title: string;
  subtitle: string;
  folder: string;
  tone: string;
  docs: DocEntry[];
}

const SECTIONS: DocSection[] = [
  {
    key: 'formal',
    title: 'Formal 8-document package',
    subtitle: 'Print in this exact order. Each applicant signs Documents 1 and 6 in blue ink.',
    folder: 'formal',
    tone: '#0B5394',
    docs: [
      {
        file: '01-cover-letter.pdf',
        title: '01 · Cover letter',
        description: '7-paragraph narrative addressed to the visa officer.',
        pages: '2',
        notes: ['One per applicant', 'Sign in blue ink'],
      },
      {
        file: '02-day-by-day-itinerary.pdf',
        title: '02 · Day-by-day itinerary',
        description: '21-day table with addresses, hosts, check-in/out, activities, costs, refs.',
        pages: '4–6',
        notes: ['Landscape A4', 'Sign final page'],
      },
      {
        file: '03-accommodation-summary.pdf',
        title: '03 · Accommodation summary',
        description: '10-line booking table with gap audit + per-applicant cost breakdown.',
        pages: '2–3',
      },
      {
        file: '04-transport-connectivity.pdf',
        title: '04 · Transport & connectivity',
        description: 'Flights, trains, coach, ground transport with refs, times, border crossings.',
        pages: '2–3',
      },
      {
        file: '05-financial-breakdown.pdf',
        title: '05 · Financial breakdown & capacity',
        description: 'Sponsor split, per-applicant costs, capacity ratio analysis.',
        pages: '2–3',
      },
      {
        file: '06-sponsorship-explanation.pdf',
        title: '06 · Sponsorship explanation letter',
        description: 'Applicant statement on bounded sponsorship, non-employment, return intent.',
        pages: '1–2',
        notes: ['One per applicant', 'Sign in blue ink'],
      },
      {
        file: '07-employment-leave-verification.pdf',
        title: '07 · Employment & leave verification',
        description: 'Cover summary preceding the employer-issued employment + leave letters.',
        pages: '1',
      },
      {
        file: '08-executive-summary.pdf',
        title: '08 · Executive summary',
        description: 'One-page officer-facing overview — first page in the file.',
        pages: '1',
      },
    ],
  },
  {
    key: 'detailed',
    title: 'Detailed 12-document package',
    subtitle: 'Granular versions — includes invitation letter, budget table, interview cheat-sheet.',
    folder: 'detailed',
    tone: '#7C2D12',
    docs: [
      { file: '01-cover-letter.pdf', title: '01 · Cover letter (detailed)', description: 'Long-form narrative version.', pages: '1' },
      {
        file: '02-invitation-letter-from-sponsor.pdf',
        title: '02 · Invitation letter from sponsor',
        description: 'Template for eduneon GmbH on company letterhead, signed + stamped.',
        pages: '2',
        notes: ['Sponsor produces on letterhead'],
      },
      { file: '03-day-by-day-itinerary.pdf', title: '03 · Day-by-day itinerary', description: 'Long-form itinerary version.', pages: '4' },
      { file: '04-trip-budget-table.pdf', title: '04 · Trip budget table', description: 'One-page sponsored vs self-funded split.', pages: '1' },
      {
        file: '05-employment-letter-template.pdf',
        title: '05 · Employment letter template',
        description: 'Template for your Nepal employer to issue on letterhead.',
        pages: '1',
        notes: ['Employer issues on letterhead'],
      },
      {
        file: '06-leave-approval-letter.pdf',
        title: '06 · Leave approval letter',
        description: 'Separate leave-dates letter from the same employer.',
        pages: '1',
        notes: ['Employer issues on letterhead'],
      },
      { file: '07-financial-statement-letter.pdf', title: '07 · Financial statement letter', description: "Applicant's one-page summary of finances.", pages: '1' },
      {
        file: '08-interview-prep-cheatsheet.pdf',
        title: '08 · Interview prep cheat-sheet',
        description: 'Personal-use Q&A — do not submit.',
        pages: '2',
        notes: ['DO NOT submit'],
      },
      { file: '09-document-index-cover-sheet.pdf', title: '09 · Document index cover sheet', description: 'Front cover of the physical file.', pages: '1' },
      { file: '10-flight-summary-sheet.pdf', title: '10 · Flight summary sheet', description: 'One-page flight summary for Tab 11.', pages: '1' },
      { file: '11-accommodation-summary-sheet.pdf', title: '11 · Accommodation summary sheet', description: 'One-page accommodation list with gap audit.', pages: '1' },
      {
        file: '12-insurance-requirements-spec.pdf',
        title: '12 · Insurance requirements spec',
        description: 'Specifications to send to the insurance provider before buying.',
        pages: '2',
      },
    ],
  },
];

const MASTER_DOC = {
  file: 'SCHENGEN_VISA_DOCUMENTATION.pdf',
  title: 'Master reference — 15-section guide',
  description:
    'Full explanatory document: checklist, templates, risk analysis, formatting rules, rejection traps.',
  pages: '~50',
};

const SUPPORTING = [
  {
    href: 'tickets/turkish-airlines-tca424.pdf',
    title: 'Turkish Airlines e-ticket — PNR TCA424',
    description: 'Round-trip Delhi ↔ Europe for 3 passengers · EUR 3,826.59 paid by eduneon GmbH.',
    type: 'pdf',
  },
  {
    href: 'guides/europe_packing_checklist.pdf',
    title: 'Europe packing checklist',
    description: 'Personal-use checklist — not part of the visa submission.',
    type: 'pdf',
  },
  {
    href: 'guides/austria_begins.pdf',
    title: 'Austria-segment briefing',
    description: 'Personal-use briefing for the Salzburg / Hallstatt / Vienna days.',
    type: 'pdf',
  },
];

/* ───────────────────────────── Page ───────────────────────────── */

function VisaDocsPage() {
  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <header style={{ marginBottom: 26 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 34, margin: '0 0 6px', color: 'var(--text)' }}>
          Schengen Visa Documents
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
          Type C application package · Embassy of Germany, Kathmandu · 16 June – 6 July 2026
          <br />
          Applicants: Sagar Ghimire · Sajan Ghimire · Pratikshya Dhakal · Sponsor: eduneon GmbH (PNR TCA424)
        </p>
      </header>

      <FactStrip />
      <DownloadAllBanner />

      {SECTIONS.map((section) => (
        <SectionBlock key={section.key} section={section} />
      ))}

      <SectionDivider title="Master reference" />
      <MasterCard />

      <SectionDivider title="Supporting attachments" />
      <SupportingGrid />

      <Footnote />
    </div>
  );
}

/* ───────────────────────────── Components ───────────────────────────── */

function FactStrip() {
  const items = [
    ['Trip', '16 Jun → 6 Jul 2026 (21 days)'],
    ['Entry / Exit', 'FCO → AMS'],
    ['Longest stay', 'Berlin (5 nights) → German Embassy'],
    ['Flight PNR', 'TCA424 · EUR 3,826.59 · PAID'],
  ] as const;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 10,
        marginBottom: 16,
        padding: 14,
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 14,
      }}
    >
      {items.map(([label, value]) => (
        <div key={label}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 3 }}>
            {label}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function DownloadAllBanner() {
  const tone = '#0B5394';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        padding: '14px 18px',
        marginBottom: 28,
        background: `${tone}0d`,
        border: `1px solid ${tone}33`,
        borderRadius: 12,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
          All documents available as A4 PDFs
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          Print-ready · embedded fonts · page-break-safe tables · click any tile below to download.
        </div>
      </div>
    </div>
  );
}

function SectionBlock({ section }: { section: DocSection }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: '0 0 2px', color: section.tone }}>
            {section.title}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {section.subtitle}
          </p>
        </div>
        <span
          style={{
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: section.tone,
            border: `1.5px solid ${section.tone}`,
            borderRadius: 999,
            whiteSpace: 'nowrap',
          }}
        >
          {section.docs.length} documents
        </span>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {section.docs.map((doc) => (
          <DocCard key={doc.file} doc={doc} folder={section.folder} tone={section.tone} />
        ))}
      </div>
    </section>
  );
}

function DocCard({ doc, folder, tone }: { doc: DocEntry; folder: string; tone: string }) {
  const href = `${import.meta.env.BASE_URL}visa-docs/pdf/${folder}/${doc.file}`;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 14,
        alignItems: 'center',
        padding: '14px 16px',
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
          {doc.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.45 }}>
          {doc.description}
        </div>
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <Pill label="PDF" tone={tone} />
          <Pill label={`${doc.pages} ${doc.pages === '1' ? 'page' : 'pages'}`} tone={tone} />
          {doc.notes?.map((n) => (
            <Pill key={n} label={n} tone={tone} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <ActionLink href={href} download={doc.file} label="Download PDF" tone={tone} primary />
        <ActionLink href={href} target="_blank" rel="noopener noreferrer" label="View" tone={tone} />
      </div>
    </div>
  );
}

function MasterCard() {
  const href = `${import.meta.env.BASE_URL}visa-docs/pdf/master/${MASTER_DOC.file}`;
  const tone = '#374151';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 14,
        alignItems: 'center',
        padding: '16px 18px',
        background: 'var(--bg-raised)',
        border: `1px dashed ${tone}`,
        borderRadius: 14,
      }}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
          {MASTER_DOC.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {MASTER_DOC.description}
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <Pill label="PDF" tone={tone} />
          <Pill label={`${MASTER_DOC.pages} pages`} tone={tone} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <ActionLink href={href} download={MASTER_DOC.file} label="Download PDF" tone={tone} primary />
        <ActionLink href={href} target="_blank" rel="noopener noreferrer" label="View" tone={tone} />
      </div>
    </div>
  );
}

function SupportingGrid() {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {SUPPORTING.map((item) => {
        const href = `${import.meta.env.BASE_URL}${item.href}`;
        const tone = '#0F766E';
        return (
          <div
            key={item.href}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 14,
              alignItems: 'center',
              padding: '14px 16px',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {item.description}
              </div>
              <div style={{ marginTop: 8 }}>
                <Pill label={item.type.toUpperCase()} tone={tone} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <ActionLink href={href} download label="Download" tone={tone} primary />
              <ActionLink href={href} target="_blank" rel="noopener noreferrer" label="View" tone={tone} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--serif)',
        fontSize: 20,
        margin: '32px 0 14px',
        color: 'var(--text)',
        borderTop: '1px solid var(--border)',
        paddingTop: 18,
      }}
    >
      {title}
    </h2>
  );
}

function Footnote() {
  return (
    <p style={{ marginTop: 32, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55, textAlign: 'center' }}>
      Personal-data fields are marked in the documents with{' '}
      <code style={{ background: 'var(--bg-raised)', padding: '1px 6px', borderRadius: 4 }}>[BRACKETS]</code>.
      Re-run <code style={{ background: 'var(--bg-raised)', padding: '1px 6px', borderRadius: 4 }}>npm run build:pdfs</code> after editing any source markdown to regenerate the PDFs.
    </p>
  );
}

/* ───────────────────────────── Atoms ───────────────────────────── */

function Pill({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      style={{
        padding: '2px 8px',
        fontSize: 11,
        fontWeight: 600,
        color: tone,
        border: `1px solid ${tone}33`,
        background: `${tone}11`,
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

interface ActionLinkProps {
  href: string;
  label: string;
  tone: string;
  primary?: boolean;
  download?: boolean | string;
  target?: string;
  rel?: string;
}

function ActionLink({ href, label, tone, primary, download, target, rel }: ActionLinkProps) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 999,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  };
  const style: CSSProperties = primary
    ? { ...base, color: '#fff', background: tone, border: `1px solid ${tone}` }
    : { ...base, color: tone, background: 'transparent', border: `1.5px solid ${tone}` };

  return (
    <a
      href={href}
      style={style}
      download={download === true ? '' : download}
      target={target}
      rel={rel}
    >
      {label}
    </a>
  );
}
