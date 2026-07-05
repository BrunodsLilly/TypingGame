#!/usr/bin/env node
/* ============================================================
   download-media.js — vendor the game's photos locally
   ============================================================
   Downloads every curated photo from js/media.js's MEDIA_PHOTOS
   manifest into img/vocab/, so that:

     • the game works fully offline (local files are tried first)
     • a parent can open img/vocab/ and REVIEW every picture the
       child will see (delete any you don't like — the game falls
       back to the next source or the emoji)

   Usage:  node tools/download-media.js [--force]

   No dependencies; needs only Node (the same Node that runs
   `npx http-server`). Re-running skips files that already exist
   unless --force is given. Sources and licenses are recorded in
   img/vocab/CREDITS.md (Wikimedia content is CC-licensed or
   public domain; see each file's source page).
*/

const fs = require('fs');
const path = require('path');
const https = require('https');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'img', 'vocab');
const FORCE = process.argv.includes('--force');
const UA = 'LuasLearningAdventure/1.0 (personal educational game; media vendoring script)';

// Pull MEDIA_PHOTOS + helpers out of the browser script without a bundler.
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'media.js'), 'utf8'), ctx);
const { MEDIA_PHOTOS, MEDIA_WIDTH, mediaSlug } = vm.runInContext(
  '({ MEDIA_PHOTOS, MEDIA_WIDTH, mediaSlug })', ctx
);

/** GET a URL as a Buffer, following redirects. */
function httpGet(url, hops = 0) {
  return new Promise((resolve, reject) => {
    if (hops > 5) return reject(new Error('too many redirects'));
    https.get(url, { headers: { 'User-Agent': UA } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        const next = new URL(res.headers.location, url).href;
        return resolve(httpGet(next, hops + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('HTTP ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/** Commons thumbnail URL for a pinned file name. */
function commonsThumb(file) {
  return 'https://commons.wikimedia.org/wiki/Special:FilePath/'
    + encodeURIComponent(file) + '?width=' + MEDIA_WIDTH;
}

/** Lead-image thumbnail + page URL for a Wikipedia article. */
async function wikiThumb(title) {
  const api = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title);
  const data = JSON.parse((await httpGet(api)).toString('utf8'));
  return data.thumbnail && data.thumbnail.source
    ? { url: data.thumbnail.source, page: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title) }
    : null;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const credits = [];
  let ok = 0, skipped = 0, failed = 0;

  for (const [key, pins] of Object.entries(MEDIA_PHOTOS)) {
    const dest = path.join(OUT_DIR, mediaSlug(key) + '.jpg');
    if (fs.existsSync(dest) && !FORCE) { skipped++; continue; }

    // Same cascade as the browser: pinned Commons files, then the
    // Wikipedia article's own lead image.
    const candidates = pins.map(f => ({
      url: commonsThumb(f),
      page: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(f.replace(/ /g, '_')),
    }));

    let saved = null;
    for (const cand of candidates) {
      try {
        const buf = await httpGet(cand.url);
        if (buf.length < 1000) throw new Error('suspiciously small response');
        fs.writeFileSync(dest, buf);
        saved = cand;
        break;
      } catch (e) {
        console.warn(`  ${key}: candidate failed (${e.message}): ${cand.url}`);
      }
    }
    if (!saved) {
      try {
        const wt = await wikiThumb(key.replace(/_/g, ' '));
        if (wt) {
          fs.writeFileSync(dest, await httpGet(wt.url));
          saved = wt;
        }
      } catch (e) {
        console.warn(`  ${key}: wikipedia fallback failed (${e.message})`);
      }
    }

    if (saved) {
      ok++;
      credits.push(`- \`${mediaSlug(key)}.jpg\` (${key}): ${saved.page}`);
      console.log(`✓ ${key} → ${path.relative(ROOT, dest)}`);
    } else {
      failed++;
      console.error(`✗ ${key}: no source worked (game will use its emoji)`);
    }
  }

  if (credits.length) {
    const header = '# Photo credits\n\n'
      + 'Images vendored from Wikimedia by tools/download-media.js.\n'
      + 'Each image is freely licensed (Creative Commons or public\n'
      + 'domain) — see its source page below for the exact license.\n'
      + 'PARENTS: please look through this folder once; delete any\n'
      + 'picture you don\'t want and the game falls back to an emoji.\n\n';
    const existing = fs.existsSync(path.join(OUT_DIR, 'CREDITS.md'))
      ? fs.readFileSync(path.join(OUT_DIR, 'CREDITS.md'), 'utf8').split('\n').filter(l => l.startsWith('- '))
      : [];
    const merged = [...new Set([...existing, ...credits])].sort();
    fs.writeFileSync(path.join(OUT_DIR, 'CREDITS.md'), header + merged.join('\n') + '\n');
  }

  console.log(`\nDone: ${ok} downloaded, ${skipped} already present, ${failed} failed.`);
  console.log('Review the pictures in img/vocab/ — delete any you don\'t like.');
}

main().catch(e => { console.error(e); process.exit(1); });
