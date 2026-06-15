// Post-build: inject the full list of built assets into dist/sw.js so the
// service worker precaches the entire app (every code-split route, css, font,
// icon) — making the deployed site work fully offline after one online visit.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SW = join(DIST, 'sw.js');

const PRECACHE_EXT = /\.(js|css|html|svg|png|ico|woff2?|json|webmanifest)$/i;
const SKIP = new Set(['sw.js', '404.html']);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const assets = walk(DIST)
  .map((f) => relative(DIST, f).split('\\').join('/'))
  .filter((p) => PRECACHE_EXT.test(p) && !SKIP.has(p))
  .sort();

const build = createHash('sha1').update(assets.join('|')).digest('hex').slice(0, 12);

let sw = readFileSync(SW, 'utf8');
sw = sw
  .replace("const BUILD = '__BUILD__';", `const BUILD = '${build}';`)
  .replace('const PRECACHE_ASSETS = [];', `const PRECACHE_ASSETS = ${JSON.stringify(assets)};`);
writeFileSync(SW, sw);

console.log(`sw.js: precached ${assets.length} assets · build ${build}`);
