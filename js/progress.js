// ============================================
// Progress — localStorage stats, spaced-repetition mistake log, Progress screen
// ============================================

/**
 * Progress singleton. Persists per-game play stats and a spaced-repetition
 * log of mistaken rounds to localStorage. Each mistake stores the round's
 * replay recipe (game + level + seed + stars — see nextRound() in
 * game-engine.js) so it can be rebuilt exactly, plus Leitner-box scheduling
 * state:
 *
 *   box 0 🌱 due immediately → box 1 🌿 due next day → box 2 🌳 due in
 *   3 days → answering a DUE box-2 item correctly graduates it (mastered).
 *
 * A correct answer only promotes an item when it was actually due — so
 * hammering the same item repeatedly can't skip the spacing. Any wrong
 * answer knocks the item back to box 0 (and blocks promotion for the rest
 * of that round, via a `lapsed` flag stamped on the round's meta object).
 *
 * @type {{
 *   recordPlay: (game: string) => void,
 *   recordCorrect: (meta: object, desc: object) => void,
 *   recordWrong: (meta: object, desc: object) => void,
 *   recordFinale: (game: string) => void,
 *   getData: () => object,
 *   getDue: () => object[],
 *   getGrowing: () => object[],
 *   reset: () => void
 * }}
 */
const Progress = (() => {
    const STORAGE_KEY = 'luaProgress';
    const MAX_MISTAKES = 50;
    const DAY_MS = 24 * 60 * 60 * 1000;

    /**
     * Days until an item is due again after being promoted INTO each box.
     * Index = box. Box 0 is always due immediately.
     */
    const BOX_DELAY_DAYS = [0, 1, 3];

    /** Blank data shape (also the migration target for missing fields). */
    function emptyData() {
        return {
            v: 2,
            totals: { plays: 0, correct: 0, wrong: 0, fixed: 0, finales: 0 },
            games: {},
            mistakes: [],
        };
    }

    /** @type {ReturnType<typeof emptyData>} */
    let data = emptyData();
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) data = Object.assign(emptyData(), JSON.parse(saved));
    } catch (_) { /* ignore — start fresh */ }
    // Migrate v1 mistakes (no scheduling fields): treat as box 0, due now
    data.mistakes.forEach(m => {
        if (typeof m.box !== 'number') m.box = 0;
        if (typeof m.due !== 'number') m.due = 0;
    });

    function save() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) { /* ignore */ }
        if (typeof updateProgressBadge === 'function') updateProgressBadge();
    }

    /** Midnight (local) of the day containing ts. */
    function startOfDay(ts) {
        const d = new Date(ts);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }

    /** Due timestamp for an item promoted into `box` today. */
    function dueForBox(box) {
        const days = BOX_DELAY_DAYS[box] || 0;
        return days === 0 ? Date.now() : startOfDay(Date.now()) + days * DAY_MS;
    }

    /** Returns (creating if needed) the stats bucket for a game. */
    function gameStats(game) {
        if (!data.games[game]) {
            data.games[game] = { plays: 0, correct: 0, wrong: 0, finales: 0, last: 0 };
        }
        return data.games[game];
    }

    /**
     * Builds the mistake's identity. Word-based mistakes (Words game) key on
     * the word itself so repeats merge and spelling the word correctly later
     * — reviewed or not — counts. Everything else keys on the replay recipe.
     */
    function mistakeId(meta, desc) {
        if (desc && desc.word) return `${meta.game}|w|${desc.word}`;
        return `${meta.game}|${meta.level}|${meta.seed}|${meta.stars}`;
    }

    /** Records a game session start. */
    function recordPlay(game) {
        data.totals.plays++;
        const g = gameStats(game);
        g.plays++;
        g.last = Date.now();
        save();
    }

    /**
     * Records a correct answer and applies spaced-repetition promotion:
     * a due item moves up one box (graduating past the last box); an item
     * that lapsed this round, or isn't due yet, stays where it is.
     */
    function recordCorrect(meta, desc) {
        data.totals.correct++;
        gameStats(meta.game).correct++;

        let id = meta.retryId;
        if (!id && desc && desc.word) {
            const wid = mistakeId(meta, desc);
            if (data.mistakes.some(m => m.id === wid)) id = wid;
        }
        const m = id && data.mistakes.find(x => x.id === id);
        if (m && !meta.lapsed && Date.now() >= m.due) {
            m.box++;
            if (m.box >= BOX_DELAY_DAYS.length) {
                // Graduated — mastered!
                data.mistakes = data.mistakes.filter(x => x.id !== m.id);
                data.totals.fixed++;
            } else {
                m.due = dueForBox(m.box);
                m.ts = Date.now();
            }
        }
        save();
    }

    /**
     * Records a wrong answer: upserts the round into the mistake log,
     * knocks a known item back to box 0 (due immediately), and stamps the
     * round's meta as lapsed so the eventual correct answer in this same
     * round doesn't promote the item.
     */
    function recordWrong(meta, desc) {
        data.totals.wrong++;
        gameStats(meta.game).wrong++;
        meta.lapsed = true;

        const id = mistakeId(meta, desc);
        const existing = data.mistakes.find(m => m.id === id);
        if (existing) {
            existing.count++;
            existing.ts = Date.now();
            existing.box = 0;
            existing.due = Date.now();
        } else {
            data.mistakes.unshift({
                id,
                game: meta.game,
                level: meta.level,
                seed: meta.seed,
                stars: meta.stars,
                label: desc.label || '',
                emoji: desc.emoji || '',
                word: desc.word || null,
                count: 1,
                box: 0,
                due: Date.now(),
                ts: Date.now(),
            });
            if (data.mistakes.length > MAX_MISTAKES) data.mistakes.length = MAX_MISTAKES;
        }
        save();
    }

    /** Records a 5-star grand finale. */
    function recordFinale(game) {
        data.totals.finales++;
        gameStats(game).finales++;
        save();
    }

    /** Mistakes due for review now, grouped by game then oldest-due first. */
    function getDue() {
        const now = Date.now();
        return data.mistakes
            .filter(m => m.due <= now)
            .sort((a, b) => a.game === b.game ? a.due - b.due : (a.game < b.game ? -1 : 1));
    }

    /** Mistakes scheduled for a later day, soonest first. */
    function getGrowing() {
        const now = Date.now();
        return data.mistakes.filter(m => m.due > now).sort((a, b) => a.due - b.due);
    }

    /** Erases all saved progress. */
    function reset() {
        data = emptyData();
        save();
    }

    return { recordPlay, recordCorrect, recordWrong, recordFinale, getData: () => data, getDue, getGrowing, reset };
})();

// ============================================
// Review Sessions (spaced repetition)
// ============================================

/** Growth-stage emoji per Leitner box. */
const STAGE_EMOJI = ['🌱', '🌿', '🌳'];

/**
 * Starts a review session over the given mistakes. Each item replays its
 * exact round (see retry flow in game-engine.js); solving one advances to
 * the next via advanceReviewSession(), and emptying the queue celebrates.
 * @param {object[]} items - Mistakes to review (usually Progress.getDue())
 */
function startReviewSession(items) {
    if (!items.length) return;
    Audio_.tap();
    progressScreen.classList.remove('active');
    reviewMode = true;
    reviewQueue = [...items];
    advanceReviewSession();
}

/**
 * Review driver, called by nextRound() (game-engine.js) whenever a review
 * round has resolved: loads the next queued mistake into pendingRetry and
 * (re)starts its game, or ends the session with a celebration and returns
 * to the Progress screen. Returns true when it handled the round.
 * @returns {boolean}
 */
function advanceReviewSession() {
    let m = reviewQueue.shift();
    while (m && !GAME_TINTS[m.game]) m = reviewQueue.shift(); // skip unknown games from stale data

    if (!m) {
        // Queue empty — review complete!
        reviewMode = false;
        inputLocked = true; // nothing valid on screen until we navigate away
        showGrandFinale();
        Audio_.celebration();
        Audio_.speak(t('pgReviewDone'));
        setTimeout(() => {
            goHome();
            openProgressScreen();
        }, 2800);
        return true;
    }

    pendingRetry = { id: m.id, game: m.game, level: m.level, seed: m.seed, stars: m.stars, word: m.word || null };
    levelOverride = { game: m.game, level: m.level };
    // startGame gives every review item a fresh mini-session (stars reset),
    // so the 5-star finale can never hijack a longer review queue.
    startGame(m.game);
    return true;
}

/**
 * Reviews a single recorded mistake (a one-item review session), replaying
 * that exact round.
 * @param {object} m
 */
function retryMistake(m) {
    startReviewSession([m]);
}

// ============================================
// Progress Screen
// ============================================

/** @type {HTMLElement} */
const progressScreen = document.getElementById('progress');

/** Opens the Progress screen from the home screen. */
function openProgressScreen() {
    Audio_.tap();
    clearInterval(homeTipTimer);
    homeScreen.classList.remove('active');
    progressScreen.classList.add('active');
    renderProgressScreen();
}

/** Closes the Progress screen and returns home. */
function closeProgressScreen() {
    Audio_.tap();
    progressScreen.classList.remove('active');
    homeScreen.classList.add('active');
    updateHomeLevelBadges();
    startHomeTips();
}

/** Reads a game's icon emoji from its home screen card. */
function gameIcon(game) {
    const el = document.querySelector(`.game-card[data-game="${game}"] .card-icon`);
    return el ? el.textContent : '🎮';
}

/** Kid-friendly "when is it back" text for a growing item. */
function dueLabel(due) {
    const days = Math.round((startOfDayLocal(due) - startOfDayLocal(Date.now())) / 86400000);
    if (days <= 1) return t('pgBackTomorrow');
    return t('pgBackDays').replace('%d', days);
}

/** Midnight (local) of the day containing ts. */
function startOfDayLocal(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

/** Renders the Progress screen content (stats + review lists). */
function renderProgressScreen() {
    const d = Progress.getData();
    const due = Progress.getDue();
    const growing = Progress.getGrowing();
    const names = t('gameNames');

    let html = '<div class="pg-header">';
    html += `<button class="back-btn" id="pg-back-btn"><span class="keycap" style="font-size:0.7rem; min-width:24px; height:24px;">Esc</span> <span>${t('back')}</span></button>`;
    html += `<h1 class="pg-title">📊 ${t('pgTitle')}</h1>`;
    html += '</div>';

    // Summary chips
    html += '<div class="pg-chips">';
    html += `<div class="pg-chip"><span class="pg-chip-emoji">🎮</span><span class="pg-chip-num">${d.totals.plays}</span><span class="pg-chip-label">${t('pgPlays')}</span></div>`;
    html += `<div class="pg-chip"><span class="pg-chip-emoji">⭐</span><span class="pg-chip-num">${d.totals.correct}</span><span class="pg-chip-label">${t('pgCorrect')}</span></div>`;
    html += `<div class="pg-chip"><span class="pg-chip-emoji">🌟</span><span class="pg-chip-num">${d.totals.fixed}</span><span class="pg-chip-label">${t('pgFixed')}</span></div>`;
    html += `<div class="pg-chip"><span class="pg-chip-emoji">🏆</span><span class="pg-chip-num">${d.totals.finales}</span><span class="pg-chip-label">${t('pgFinales')}</span></div>`;
    html += '</div>';

    // Due now — ready to practice
    html += `<h2 class="pg-section-title">💧 ${t('pgDueTitle')}</h2>`;
    if (due.length === 0 && growing.length === 0) {
        html += `<div class="pg-empty">🌈 ${t('pgNoTricky')}</div>`;
    } else if (due.length === 0) {
        html += `<div class="pg-empty">✅ ${t('pgAllDoneToday')}</div>`;
    } else {
        html += `<div class="pg-hint">${t('pgTrickyHint')}</div>`;
        html += `<button class="pg-review-all" id="pg-review-all">${keycapHTML('R', 'small active-key')} 💪 ${t('pgReviewAll')} (${due.length})</button>`;
        html += '<div class="pg-mistakes">';
        due.forEach((m, i) => {
            const tint = GAME_TINTS[m.game] || '#4dc9f6';
            const key = i < 9 ? keycapHTML(String(i + 1), 'small') : '';
            html += `<button class="pg-mistake" data-idx="${i}" style="--pg-tint:${tint}">`;
            html += `<span class="pg-mistake-key">${key}</span>`;
            html += `<span class="pg-mistake-emoji">${m.emoji || '❓'}</span>`;
            html += `<span class="pg-mistake-info"><span class="pg-mistake-label">${m.label}</span>`;
            html += `<span class="pg-mistake-game">${names[m.game] || m.game}</span></span>`;
            html += `<span class="pg-mistake-stage">${STAGE_EMOJI[m.box] || '🌱'}</span>`;
            if (m.count > 1) html += `<span class="pg-mistake-count">×${m.count}</span>`;
            html += `<span class="pg-mistake-go">🔁</span>`;
            html += '</button>';
        });
        html += '</div>';
    }

    // Growing — scheduled for later days (display only; spacing is the point)
    if (growing.length > 0) {
        html += `<h2 class="pg-section-title">🌿 ${t('pgGrowingTitle')}</h2>`;
        html += '<div class="pg-growing">';
        growing.forEach(m => {
            const tint = GAME_TINTS[m.game] || '#4dc9f6';
            html += `<div class="pg-grow" style="--pg-tint:${tint}">`;
            html += `<span class="pg-mistake-stage">${STAGE_EMOJI[m.box] || '🌱'}</span>`;
            html += `<span class="pg-mistake-emoji">${m.emoji || '❓'}</span>`;
            html += `<span class="pg-mistake-info"><span class="pg-mistake-label">${m.label}</span>`;
            html += `<span class="pg-mistake-game">${names[m.game] || m.game}</span></span>`;
            html += `<span class="pg-grow-when">⏰ ${dueLabel(m.due)}</span>`;
            html += '</div>';
        });
        html += '</div>';
    }

    // Per-game stats, most recently played first
    const played = Object.keys(d.games).sort((a, b) => d.games[b].last - d.games[a].last);
    html += `<h2 class="pg-section-title">🎮 ${t('pgGamesTitle')}</h2>`;
    if (played.length === 0) {
        html += `<div class="pg-empty">${t('pgNoPlays')}</div>`;
    } else {
        html += '<div class="pg-games">';
        played.forEach(game => {
            const g = d.games[game];
            const tint = GAME_TINTS[game] || '#4dc9f6';
            html += `<div class="pg-game" style="--pg-tint:${tint}">`;
            html += `<span class="pg-game-icon">${gameIcon(game)}</span>`;
            html += `<span class="pg-game-name">${names[game] || game}</span>`;
            html += `<span class="pg-game-stats">⭐ ${g.correct} &nbsp; ❌ ${g.wrong} &nbsp; 🏆 ${g.finales}</span>`;
            html += '</div>';
        });
        html += '</div>';
    }

    html += `<button class="pg-reset" id="pg-reset-btn">🗑 ${t('pgReset')}</button>`;

    progressScreen.innerHTML = html;

    // Wire up taps
    progressScreen.querySelector('#pg-back-btn').addEventListener('click', closeProgressScreen);
    const reviewAllBtn = progressScreen.querySelector('#pg-review-all');
    if (reviewAllBtn) reviewAllBtn.addEventListener('click', () => startReviewSession(Progress.getDue()));
    progressScreen.querySelectorAll('.pg-mistake').forEach(btn => {
        btn.addEventListener('click', () => {
            const m = due[parseInt(btn.dataset.idx)];
            if (m) retryMistake(m);
        });
    });
    progressScreen.querySelector('#pg-reset-btn').addEventListener('click', () => {
        if (confirm(t('pgResetConfirm'))) {
            Progress.reset();
            renderProgressScreen();
        }
    });
}

// Progress button (bottom bar, next to the language toggle) + due badge
const progressBtn = document.getElementById('progress-btn');
progressBtn.addEventListener('click', () => {
    if (progressScreen.classList.contains('active')) closeProgressScreen();
    else if (homeScreen.classList.contains('active')) openProgressScreen();
});

/** Shows how many items are due for review on the 📊 button. */
function updateProgressBadge() {
    const badge = document.getElementById('progress-badge');
    if (!badge) return;
    const n = Progress.getDue().length;
    badge.textContent = n > 9 ? '9+' : String(n);
    badge.style.display = n > 0 ? 'flex' : 'none';
}
updateProgressBadge();

// Keyboard on the Progress screen: Esc = back, R = review all due, 1-9 = review one
document.addEventListener('keydown', (e) => {
    if (!progressScreen.classList.contains('active')) return;
    const key = e.key.toLowerCase();
    // Note: 's' can't toggle the screen closed here — the master keydown
    // listener (game-engine.js) runs first on the same event and would have
    // just opened it, so handling 's' here would close it again instantly.
    if (key === 'escape') {
        closeProgressScreen();
        return;
    }
    if (key === 'r') {
        startReviewSession(Progress.getDue());
        return;
    }
    const n = parseInt(key);
    if (n >= 1 && n <= 9) {
        const m = Progress.getDue()[n - 1];
        if (m) retryMistake(m);
    }
});
