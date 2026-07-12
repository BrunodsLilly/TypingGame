// ============================================
// Progress — localStorage stats, mistake log, and the Progress screen
// ============================================

/**
 * Progress singleton. Persists per-game play stats and a log of mistaken
 * rounds to localStorage. Each mistake stores the round's replay recipe
 * (game + level + seed + stars — see nextRound() in game-engine.js), so
 * tapping it on the Progress screen rebuilds the exact same round.
 *
 * @type {{
 *   recordPlay: (game: string) => void,
 *   recordCorrect: (meta: object, desc: object) => void,
 *   recordWrong: (meta: object, desc: object) => void,
 *   recordFinale: (game: string) => void,
 *   getData: () => object,
 *   getMistakes: () => object[],
 *   reset: () => void
 * }}
 */
const Progress = (() => {
    const STORAGE_KEY = 'luaProgress';
    const MAX_MISTAKES = 50;

    /** Blank data shape (also the migration target for missing fields). */
    function emptyData() {
        return {
            v: 1,
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

    function save() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) { /* ignore */ }
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
     * — retried or not — resolves it. Everything else keys on the full
     * replay recipe.
     */
    function mistakeId(meta, desc) {
        if (desc && desc.word) return `${meta.game}|w|${desc.word}`;
        return `${meta.game}|${meta.level}|${meta.seed}|${meta.stars}`;
    }

    /** Removes a mistake by id. Returns true if one was removed. */
    function removeMistake(id) {
        const before = data.mistakes.length;
        data.mistakes = data.mistakes.filter(m => m.id !== id);
        return data.mistakes.length < before;
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
     * Records a correct answer. If this round was a replayed mistake (or
     * naturally matches a word-keyed mistake), the mistake is resolved.
     */
    function recordCorrect(meta, desc) {
        data.totals.correct++;
        gameStats(meta.game).correct++;

        let resolveId = meta.retryId;
        if (!resolveId && desc && desc.word) {
            resolveId = mistakeId(meta, desc);
        }
        if (resolveId && removeMistake(resolveId)) {
            data.totals.fixed++;
        }
        save();
    }

    /** Records a wrong answer and upserts the round into the mistake log. */
    function recordWrong(meta, desc) {
        data.totals.wrong++;
        gameStats(meta.game).wrong++;

        const id = mistakeId(meta, desc);
        const existing = data.mistakes.find(m => m.id === id);
        if (existing) {
            existing.count++;
            existing.ts = Date.now();
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

    /** Mistakes, most recent first. */
    function getMistakes() {
        return [...data.mistakes].sort((a, b) => b.ts - a.ts);
    }

    /** Erases all saved progress. */
    function reset() {
        data = emptyData();
        save();
    }

    return { recordPlay, recordCorrect, recordWrong, recordFinale, getData: () => data, getMistakes, reset };
})();

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

/**
 * Starts a replay session for a recorded mistake: the first round rebuilds
 * that exact example (same game, level, seed, and star-gated difficulty),
 * then the session continues as normal play at that level.
 * @param {{id: string, game: string, level: number, seed: number, stars: number, word: string|null}} m
 */
function retryMistake(m) {
    Audio_.tap();
    pendingRetry = { id: m.id, game: m.game, level: m.level, seed: m.seed, stars: m.stars, word: m.word || null };
    levelOverride = { game: m.game, level: m.level };
    progressScreen.classList.remove('active');
    startGame(m.game);
}

/** Reads a game's icon emoji from its home screen card. */
function gameIcon(game) {
    const el = document.querySelector(`.game-card[data-game="${game}"] .card-icon`);
    return el ? el.textContent : '🎮';
}

/** Renders the Progress screen content (stats + tricky-ones list). */
function renderProgressScreen() {
    const d = Progress.getData();
    const mistakes = Progress.getMistakes();
    const names = t('gameNames');

    let html = '<div class="pg-header">';
    html += `<button class="back-btn" id="pg-back-btn"><span class="keycap" style="font-size:0.7rem; min-width:24px; height:24px;">Esc</span> <span>${t('back')}</span></button>`;
    html += `<h1 class="pg-title">📊 ${t('pgTitle')}</h1>`;
    html += '</div>';

    // Summary chips
    html += '<div class="pg-chips">';
    html += `<div class="pg-chip"><span class="pg-chip-emoji">🎮</span><span class="pg-chip-num">${d.totals.plays}</span><span class="pg-chip-label">${t('pgPlays')}</span></div>`;
    html += `<div class="pg-chip"><span class="pg-chip-emoji">⭐</span><span class="pg-chip-num">${d.totals.correct}</span><span class="pg-chip-label">${t('pgCorrect')}</span></div>`;
    html += `<div class="pg-chip"><span class="pg-chip-emoji">💪</span><span class="pg-chip-num">${d.totals.fixed}</span><span class="pg-chip-label">${t('pgFixed')}</span></div>`;
    html += `<div class="pg-chip"><span class="pg-chip-emoji">🏆</span><span class="pg-chip-num">${d.totals.finales}</span><span class="pg-chip-label">${t('pgFinales')}</span></div>`;
    html += '</div>';

    // Tricky ones — replayable mistakes
    html += `<h2 class="pg-section-title">🤔 ${t('pgTrickyTitle')}</h2>`;
    if (mistakes.length === 0) {
        html += `<div class="pg-empty">🌈 ${t('pgNoTricky')}</div>`;
    } else {
        html += `<div class="pg-hint">${t('pgTrickyHint')}</div>`;
        html += '<div class="pg-mistakes">';
        mistakes.forEach((m, i) => {
            const tint = GAME_TINTS[m.game] || '#4dc9f6';
            const key = i < 9 ? keycapHTML(String(i + 1), 'small') : '';
            html += `<button class="pg-mistake" data-idx="${i}" style="--pg-tint:${tint}">`;
            html += `<span class="pg-mistake-key">${key}</span>`;
            html += `<span class="pg-mistake-emoji">${m.emoji || '❓'}</span>`;
            html += `<span class="pg-mistake-info"><span class="pg-mistake-label">${m.label}</span>`;
            html += `<span class="pg-mistake-game">${names[m.game] || m.game}</span></span>`;
            if (m.count > 1) html += `<span class="pg-mistake-count">×${m.count}</span>`;
            html += `<span class="pg-mistake-go">🔁</span>`;
            html += '</button>';
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
    progressScreen.querySelectorAll('.pg-mistake').forEach(btn => {
        btn.addEventListener('click', () => {
            const m = mistakes[parseInt(btn.dataset.idx)];
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

// Progress button (bottom bar, next to the language toggle)
const progressBtn = document.getElementById('progress-btn');
progressBtn.addEventListener('click', () => {
    if (progressScreen.classList.contains('active')) closeProgressScreen();
    else if (homeScreen.classList.contains('active')) openProgressScreen();
});

// Keyboard on the Progress screen: Esc = back, 1-9 = retry that mistake
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
    const n = parseInt(key);
    if (n >= 1 && n <= 9) {
        const m = Progress.getMistakes()[n - 1];
        if (m) retryMistake(m);
    }
});
