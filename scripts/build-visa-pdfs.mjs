#!/usr/bin/env node
/**
 * Build visa-doc PDFs from the Markdown sources.
 *
 * For every .md file in visa-docs/formal/ + visa-docs/ + the master doc,
 * render to HTML with print-grade CSS and run headless Chrome to produce
 * a real A4 PDF in public/visa-docs/pdf/. README files are skipped — the
 * /visa-docs page links directly to the substantive documents.
 *
 * Usage:   npm run build:pdfs
 */
import { mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const execFileP = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), '..');

const CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const OUT_DIR = join(ROOT, 'public', 'visa-docs', 'pdf');
const TMP_DIR = join(ROOT, '.tmp-pdf');

const SOURCES = [
  // Formal 8-document package — the primary set we want users to download
  { dir: join(ROOT, 'visa-docs', 'formal'), out: 'formal' },
  // Detailed 12-document package — kept for completeness
  { dir: join(ROOT, 'visa-docs'),           out: 'detailed', shallow: true },
];

const MASTER = {
  src: join(ROOT, 'SCHENGEN_VISA_DOCUMENTATION.md'),
  out: 'master/SCHENGEN_VISA_DOCUMENTATION.pdf',
};

// Skip README-style files from the PDF build.
const SKIP_PATTERNS = [/^00-README\.md$/i, /^README\.md$/i];

const PRINT_CSS = `
  @page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
    @bottom-center { content: counter(page) " / " counter(pages); font-size: 9pt; color: #6b7280; }
  }

  :root {
    --text:        #111827;
    --text-muted:  #4b5563;
    --text-faint:  #9ca3af;
    --accent:      #0B5394;
    --rule:        #d1d5db;
    --table-rule:  #e5e7eb;
    --code-bg:     #f3f4f6;
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: "Georgia", "Times New Roman", Times, serif;
    font-size: 10.5pt;
    line-height: 1.5;
    color: var(--text);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .doc-header {
    border-bottom: 2px solid var(--accent);
    padding-bottom: 8pt;
    margin-bottom: 14pt;
  }
  .doc-header .eyebrow {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 8pt;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 4pt;
  }
  .doc-header h1 {
    font-family: "Georgia", serif;
    font-size: 20pt;
    margin: 0;
    color: var(--accent);
    line-height: 1.25;
  }
  .doc-header .meta {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 9pt;
    color: var(--text-muted);
    margin-top: 6pt;
  }

  h1 { font-size: 18pt; margin: 18pt 0 8pt; color: var(--accent); }
  h2 { font-size: 14pt; margin: 16pt 0 6pt; color: var(--accent); border-bottom: 1px solid var(--rule); padding-bottom: 3pt; }
  h3 { font-size: 12pt; margin: 12pt 0 4pt; color: var(--text); }
  h4 { font-size: 10.5pt; margin: 10pt 0 3pt; color: var(--text); font-weight: 700; }

  p { margin: 6pt 0; }
  strong { font-weight: 700; color: var(--text); }
  em { font-style: italic; }

  ul, ol { margin: 6pt 0 6pt 18pt; padding: 0; }
  li { margin: 2pt 0; }

  blockquote {
    margin: 8pt 0;
    padding: 6pt 12pt;
    border-left: 3pt solid var(--accent);
    background: #f8fafc;
    color: var(--text-muted);
    font-size: 9.5pt;
  }
  blockquote p { margin: 2pt 0; }

  hr { border: 0; border-top: 1px solid var(--rule); margin: 14pt 0; }

  code {
    font-family: "SF Mono", Menlo, Consolas, monospace;
    font-size: 9pt;
    background: var(--code-bg);
    padding: 1pt 4pt;
    border-radius: 3pt;
  }
  pre {
    font-family: "SF Mono", Menlo, Consolas, monospace;
    font-size: 8.5pt;
    line-height: 1.45;
    background: var(--code-bg);
    border: 1px solid var(--table-rule);
    border-radius: 4pt;
    padding: 10pt 12pt;
    margin: 8pt 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    page-break-inside: avoid;
  }
  pre code { background: transparent; padding: 0; font-size: inherit; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10pt 0;
    font-size: 9pt;
    page-break-inside: auto;
  }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  th, td {
    border: 1px solid var(--table-rule);
    padding: 5pt 7pt;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #f1f5f9;
    font-weight: 700;
    color: var(--text);
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  tbody tr:nth-child(even) { background: #fafafa; }

  /* Tight emoji-flag rendering */
  table td:first-child, table th:first-child { white-space: normal; }
`;

function htmlShell({ title, meta, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>${PRINT_CSS}</style>
</head>
<body>
<header class="doc-header">
  <div class="eyebrow">Schengen Type C Visa Application · Jamnata Trip Package</div>
  <h1>${escapeHtml(title)}</h1>
  <div class="meta">${escapeHtml(meta)}</div>
</header>
${bodyHtml}
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Pull a human-readable title out of the markdown — prefer the first H1,
 * otherwise fall back to the filename.
 */
function deriveTitle(md, fallback) {
  const h1 = md.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].replace(/[#*`]/g, '').trim();
  return fallback;
}

/**
 * Render markdown → HTML body. Strip the leading H1 since we render a
 * styled header block instead.
 */
function renderBody(md) {
  const stripped = md.replace(/^#\s+.+\n+/, '');
  return marked.parse(stripped, {
    gfm: true,
    breaks: false,
  });
}

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function renderPdf({ srcPath, outPath, eyebrowMeta }) {
  const md = await readFile(srcPath, 'utf8');
  const fallback = basename(srcPath, '.md').replace(/^[\d-]+/, '').replace(/-/g, ' ');
  const title = deriveTitle(md, fallback);
  const bodyHtml = renderBody(md);
  const html = htmlShell({ title, meta: eyebrowMeta, bodyHtml });

  const tmpHtml = join(TMP_DIR, basename(srcPath).replace(/\.md$/, '.html'));
  await writeFile(tmpHtml, html, 'utf8');

  await ensureDir(dirname(outPath));

  // Headless Chrome → PDF.
  // --no-pdf-header-footer omits Chrome's default URL/date strip.
  await execFileP(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--virtual-time-budget=10000',
    `--print-to-pdf=${outPath}`,
    `file://${tmpHtml}`,
  ], { maxBuffer: 50 * 1024 * 1024 });

  return { title, outPath };
}

async function collectMarkdown(dir, shallow = false) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!shallow) {
        files.push(...(await collectMarkdown(join(dir, e.name), false)));
      }
      continue;
    }
    if (!e.name.endsWith('.md')) continue;
    if (SKIP_PATTERNS.some((re) => re.test(e.name))) continue;
    files.push(join(dir, e.name));
  }
  return files.sort();
}

async function main() {
  if (!existsSync(CHROME)) {
    throw new Error(`Google Chrome not found at: ${CHROME}`);
  }

  console.log('• Cleaning output directory…');
  await rm(OUT_DIR, { recursive: true, force: true });
  await rm(TMP_DIR, { recursive: true, force: true });
  await ensureDir(OUT_DIR);
  await ensureDir(TMP_DIR);

  const built = [];

  for (const src of SOURCES) {
    const files = await collectMarkdown(src.dir, src.shallow);
    if (!files.length) continue;
    const outBase = join(OUT_DIR, src.out);
    await ensureDir(outBase);
    console.log(`\n• Rendering ${files.length} document(s) from ${src.dir}`);
    for (const file of files) {
      const outName = basename(file).replace(/\.md$/, '.pdf');
      const outPath = join(outBase, outName);
      const result = await renderPdf({
        srcPath: file,
        outPath,
        eyebrowMeta: `${src.out === 'formal' ? 'Formal 8-document package' : 'Detailed 12-document package'} · 16 June – 6 July 2026`,
      });
      console.log(`    ✓ ${result.title}  →  ${outPath.replace(ROOT + '/', '')}`);
      built.push(result.outPath);
    }
  }

  // Master reference
  if (existsSync(MASTER.src)) {
    console.log('\n• Rendering master reference');
    const outPath = join(OUT_DIR, MASTER.out);
    const result = await renderPdf({
      srcPath: MASTER.src,
      outPath,
      eyebrowMeta: 'Master reference · full 15-section guide',
    });
    console.log(`    ✓ ${result.title}  →  ${outPath.replace(ROOT + '/', '')}`);
    built.push(result.outPath);
  }

  // Clean tmp
  await rm(TMP_DIR, { recursive: true, force: true });

  console.log(`\n✓ Built ${built.length} PDF(s) into ${OUT_DIR.replace(ROOT + '/', '')}\n`);
}

main().catch((err) => {
  console.error('\n✗ PDF build failed:', err);
  process.exit(1);
});
