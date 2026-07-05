/* ============================================================
   MEDIA — curated real-photo layer for the vocabulary games
   ============================================================
   Every photo-bearing game entry carries a `wiki` key (a Wikipedia
   article title). For each key this file resolves ONE image URL by
   trying, in order:

     1. A vendored local copy   img/vocab/<slug>.jpg
        (created by `node tools/download-media.js` — lets the game
        run fully offline and lets a parent review every picture)
     2. Hand-pinned Wikimedia Commons photos from MEDIA_PHOTOS below
        (famous, community-vetted pictures chosen for a toddler)
     3. The Wikipedia article's own lead-image thumbnail
     4. Nothing — the game falls back to the entry's emoji

   The resolved URL (or null) is cached in MEDIA_CACHE, shared by the
   Korean, Portuguese, and Animals games. All fetching happens in the
   child's browser; there are no API keys and no build step.
*/

/**
 * Curation manifest: every media key used by game data must appear
 * here (an empty list means "no pinned photo — use the Wikipedia
 * lead image"). Values are Wikimedia Commons file names, best first.
 * SAFETY: only add pictures appropriate for a 3-year-old. Anything
 * that can't be safely illustrated (e.g. bathing) gets NO media key
 * on its game entry and stays an emoji.
 * @type {Object<string, string[]>}
 */
const MEDIA_PHOTOS = {
  // ── Vocabulary words (Match the Picture / Say It) ──
  'Apple':      ['Red Apple.jpg', 'Honeycrisp.jpg'],
  'Banana':     ['Banana-Single.jpg'],
  'Cat':        ['Cat03.jpg', 'Kittyply edit1.jpg'],
  'Dog':        ['Golde33443.jpg', 'Labrador on Quantock (2175262184).jpg'],
  'Rabbit':     ['Oryctolagus cuniculus Rcdo.jpg', 'Feldhase Schiermonnikoog.JPG'],
  'Fish':       ['Common goldfish.JPG', 'Goldfish3.jpg'],
  'Butterfly':  ['Monarch In May.jpg'],
  'Star':       ['Pleiades large.jpg'],
  'Moon':       ['FullMoon2010.jpg'],
  'Sun':        ["The Sun by the Atmospheric Imaging Assembly of NASA's Solar Dynamics Observatory - 20100819.jpg"],
  'Flower':     ['Sunflower sky backdrop.jpg', 'Rose Amber Flush 20070601.jpg'],
  'Water':      ['Stilles Mineralwasser.jpg'],
  'Book':       [],
  'Ball_(association_football)': [],
  'House':      [],
  'Bird':       ['Eopsaltria australis - Mogo Campground.jpg'],
  'Bear':       ['Medved mzoo.jpg', '2010-kodiak-bear-1.jpg'],
  'Tree':       ['Ash Tree - geograph.org.uk - 590710.jpg'],
  'Car':        [],
  'Shoe':       [],
  'Hat':        [],
  'Umbrella':   [],
  'Strawberry': ['Garden strawberry (Fragaria × ananassa) single2.jpg', 'PerfectStrawberry.jpg'],
  'Grape':      ['Table grapes on white.jpg'],

  // ── "Ask Nicely" request items ──
  'Bottled_water': ['Stilles Mineralwasser.jpg'],
  'Milk':          ['Milk glass.jpg'],
  'Cooked_rice':   [],
  'Cookie':        ['2ChocolateChipCookies.jpg', 'Chocolate chip cookies.jpg'],
  'Bread':         ['Fresh made bread 05.jpg', 'Vekni.jpg'],
  'Juice':         ['Orange juice 1 edit1.jpg', 'Orangejuice.jpg'],

  // ── Body parts ──
  'Human_eye':   ['Iris - left eye of a girl.jpg'],
  'Human_nose':  [],
  'Human_mouth': [],
  'Ear':         [],
  'Hand':        ['Human-Hands-Front-Back.jpg'],
  'Foot':        [],
  'Human_leg':   [],
  'Human_tooth': [],

  // ── Action verbs ──
  'Eating':   [],
  'Drinking': [],
  'Sleep':    [],
  'Running':  [],
  'Dance':    [],
  'Laughter': [],
  'Crying':   [],

  // ── Family phrases (concrete ones only) ──
  'Hug':           [],
  'Holding_hands': [],
  'Toilet':        [],

  // ── Animals game ──
  'Cattle': ['Cow female black white.jpg'],
  'Pig':    ['Sow with piglet.jpg'],
  'Duck':   [],
  'Frog':   ['Atelopus zeteki1.jpg'],
  'Bee':    ['European honey bee extracts nectar.jpg'],
  'Lion':   ['Lion waiting in Namibia.jpg'],
  'Snake':  [],
  'Horse':  ['Nokota Horses cropped.jpg'],
  'Sheep':  ['Flock of sheep.jpg'],
};

/** Thumbnail width requested from Commons / used when vendoring. */
const MEDIA_WIDTH = 320;

/** URL of a Commons file rendered as a MEDIA_WIDTH-wide thumbnail. */
function commonsThumbURL(file) {
  return 'https://commons.wikimedia.org/wiki/Special:FilePath/'
    + encodeURIComponent(file) + '?width=' + MEDIA_WIDTH;
}

/** Filesystem-friendly slug for a media key ("Human_eye" → "human-eye"). */
function mediaSlug(key) {
  return key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Path a vendored local copy of this key's photo would live at. */
function localVocabURL(key) {
  return 'img/vocab/' + mediaSlug(key) + '.jpg';
}

/**
 * Resolved image URL per media key: string when a picture loaded,
 * null when every source failed (render the emoji instead).
 * @type {Object<string, string|null>}
 */
const MEDIA_CACHE = {};

/** In-flight resolutions so concurrent rounds share one lookup. */
const MEDIA_PENDING = {};

/** Resolves once an image URL actually loads in this browser, or null. */
function tryLoadImage(url) {
  return new Promise(resolve => {
    const im = new Image();
    im.onload = () => resolve(url);
    im.onerror = () => resolve(null);
    im.src = url;
  });
}

/** Lead-image thumbnail of the Wikipedia article named by `title`. */
async function fetchWikiThumb(title) {
  try {
    const res = await fetch(
      'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title)
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve the best available photo for a media key (see the cascade
 * at the top of this file). Idempotent and memoized.
 * @returns {Promise<string|null>}
 */
function resolveMedia(key) {
  if (key in MEDIA_CACHE) return Promise.resolve(MEDIA_CACHE[key]);
  if (MEDIA_PENDING[key]) return MEDIA_PENDING[key];
  MEDIA_PENDING[key] = (async () => {
    const candidates = [
      localVocabURL(key),
      ...(MEDIA_PHOTOS[key] || []).map(commonsThumbURL),
    ];
    let found = null;
    for (const url of candidates) {
      found = await tryLoadImage(url);
      if (found) break;
    }
    if (!found) {
      const wikiURL = await fetchWikiThumb(key.replace(/_/g, ' '));
      if (wikiURL) found = await tryLoadImage(wikiURL);
    }
    MEDIA_CACHE[key] = found;
    delete MEDIA_PENDING[key];
    return found;
  })();
  return MEDIA_PENDING[key];
}

/** <img> tag for a resolved photo, with a live emoji fallback. */
function mediaImgTag(url, alt, emoji, px) {
  return `<img src="${url}" alt="${alt}" data-emoji="${emoji}"
      onerror="mediaImgError(this)"
      style="width:${px}px;height:${px}px;object-fit:cover;border-radius:10px;display:block;margin:0 auto 4px;box-shadow:0 2px 8px rgba(0,0,0,0.18);">`;
}

/** onerror handler: swap a broken <img> for its entry's emoji. */
function mediaImgError(img) {
  const span = document.createElement('span');
  span.style.fontSize = '2em';
  span.textContent = img.dataset.emoji || '❓';
  img.replaceWith(span);
}

/**
 * Visual for a game entry: its photo when already resolved, otherwise
 * its emoji inside a hydratable slot that upgrades to the photo as
 * soon as hydrateMedia() resolves it (so even the first round gets
 * pictures a moment after they load).
 * @param {{wiki?: string, img?: string, en?: string, emoji?: string}} item
 * @param {number} [px] - Rendered square size in CSS pixels.
 * @param {boolean} [hideEmoji] - Render nothing (instead of the emoji)
 *   while unresolved; used where an emoji is already shown elsewhere.
 */
function mediaVisualHTML(item, px = 90, hideEmoji = false) {
  const key = item.wiki || '';
  const alt = item.en || item.name || '';
  const emoji = item.emoji || '❓';
  const url = item.img || (key && MEDIA_CACHE[key]) || null;
  const inner = url
    ? mediaImgTag(url, alt, emoji, px)
    : (hideEmoji ? '' : `<span style="font-size:2em;">${emoji}</span>`);
  return `<span class="media-slot" data-media-key="${key}" data-media-px="${px}"` +
    ` data-media-alt="${alt}" data-media-emoji="${emoji}">${inner}</span>`;
}

/**
 * Kick off photo resolution for a round's entries and, when each photo
 * arrives, upgrade any still-rendered media slots for it in place.
 * Call after the round has built its DOM.
 */
function hydrateMedia(items) {
  items.forEach(item => {
    const key = item.wiki;
    if (!key || item.img) return;
    resolveMedia(key).then(url => {
      if (!url) return;
      document.querySelectorAll('.media-slot[data-media-key="' + CSS.escape(key) + '"]')
        .forEach(slot => {
          if (slot.querySelector('img')) return;
          const d = slot.dataset;
          slot.innerHTML = mediaImgTag(url, d.mediaAlt, d.mediaEmoji, d.mediaPx);
        });
    });
  });
}
