// ============================================
// Game Engine — Navigation, State, Utils, Answer Handler, Keyboard
// ============================================

// ── DOM References ──

/** @type {HTMLElement} */
const homeScreen = document.getElementById('home');

/** @type {HTMLElement} */
const gameScreen = document.getElementById('game');

/** @type {HTMLElement} */
const promptEmoji = document.getElementById('prompt-emoji');

/** @type {HTMLElement} */
const promptText = document.getElementById('prompt-text');

/** @type {HTMLElement} */
const choicesEl = document.getElementById('choices');

/** @type {HTMLElement} */
const extraArea = document.getElementById('extra-area');

/** @type {HTMLElement} */
const starsBar = document.getElementById('stars-bar');

/** @type {HTMLElement} */
const streakBadge = document.getElementById('streak-badge');

/** @type {HTMLElement} */
const keyHintBar = document.getElementById('key-hint-bar');

/** @type {HTMLElement} */
const keyHintText = document.getElementById('key-hint-text');

// ── State ──

/** @type {string|null} Currently active game mode name, or null when on home screen */
let currentGame = null;

/** @type {number} Stars earned in the current game session (0-10) */
let stars = 0;

/** @type {number} Current consecutive-correct-answer streak */
let streak = 0;

/** @type {boolean} When true, keyboard/click input is ignored (during answer animations) */
let inputLocked = false;

/** @type {number} Number of stars needed to complete a game session */
const MAX_STARS = 5;

/**
 * Maps keyboard key strings to choice indices for the current round.
 * For Words mode, -1 = correct letter, -2 = wrong letter.
 * @type {Object<string, number>}
 */
let activeKeyMap = {};

/** @type {string|null} The key string for the correct answer in the current round */
let correctKey = null;

// ── Level System ──

/**
 * Level definitions per game. Each game can have up to 3 levels.
 * Games without entries here have no level selection (single difficulty).
 * @type {Object<string, Array<{name: string, ptName: string, desc: string, ptDesc: string, emoji: string}>>}
 */
const GAME_LEVELS = {
    count: [
        { name: 'Count Things', ptName: 'Contar', desc: 'Count 1-10', ptDesc: 'Conte 1-10', emoji: '🔢' },
        { name: 'Moving Mix', ptName: 'Mistura', desc: 'Count one kind!', ptDesc: 'Conte um tipo!', emoji: '🦋' },
        { name: 'Shape Count', ptName: 'Formas', desc: 'Shapes & sides', ptDesc: 'Formas e lados', emoji: '📐' },
    ],
    geometry: [
        { name: 'Sides', ptName: 'Lados', desc: 'How many sides?', ptDesc: 'Quantos lados?', emoji: '📏' },
        { name: 'Corners & More', ptName: 'Cantos', desc: 'Corners + matching', ptDesc: 'Cantos + combinar', emoji: '🔶' },
        { name: 'Shape Expert', ptName: 'Expert', desc: 'All types!', ptDesc: 'Todos os tipos!', emoji: '🏆' },
    ],
    colors: [
        { name: 'Basic Colors', ptName: 'B\u00E1sicas', desc: '8 colors', ptDesc: '8 cores', emoji: '🖍️' },
        { name: 'More Colors', ptName: 'Mais Cores', desc: '24 colors', ptDesc: '24 cores', emoji: '🎨' },
        { name: 'Color Expert', ptName: 'Expert', desc: '24 + name the color', ptDesc: '24 + nomeie a cor', emoji: '🌈' },
    ],
};

/**
 * Saved level per game. Loaded from localStorage on startup.
 * @type {Object<string, number>}
 */
let gameLevels = {};

/** @type {boolean} True when the level picker is showing */
let levelPicking = false;

/** @type {string|null} Game being picked for in level picker */
let levelPickingGame = null;

/** Load saved levels from localStorage */
function loadLevels() {
    try {
        const saved = localStorage.getItem('gameLevels');
        if (saved) gameLevels = JSON.parse(saved);
    } catch (_) { /* ignore */ }
}
loadLevels();

/** Save levels to localStorage */
function saveLevels() {
    try { localStorage.setItem('gameLevels', JSON.stringify(gameLevels)); } catch (_) { /* ignore */ }
}

/**
 * Returns the current level (0-indexed) for a game.
 * @param {string} game
 * @returns {number}
 */
function getLevel(game) {
    return gameLevels[game] || 0;
}

// ============================================
// Navigation
// ============================================

/** Returns to the home screen, resetting all game state. */
function goHome() {
    Audio_.tap();
    homeScreen.classList.add('active');
    gameScreen.classList.remove('active');
    keyHintBar.style.display = 'none';
    currentGame = null;
    levelPicking = false;
    levelPickingGame = null;
    activeKeyMap = {};
    correctKey = null;
    if (typeof wordCarouselTimer !== 'undefined') clearInterval(wordCarouselTimer);
    updateHomeLevelBadges();
    startHomeTips();
}

// ============================================
// Language Toggle
// ============================================

/** @type {HTMLElement} */
const langBtn = document.getElementById('lang-btn');

/** Toggles the language between EN and PT and refreshes the UI. */
function toggleLang() {
    lang = lang === 'en' ? 'pt' : 'en';
    Audio_.tap();
    updateLangUI();
    if (currentGame) {
        nextRound();
    }
}

/** Updates all language-dependent UI elements: button text, home card labels, tips. */
function updateLangUI() {
    langBtn.textContent = lang === 'pt' ? '\uD83C\uDDE7\uD83C\uDDF7' : '\uD83C\uDDFA\uD83C\uDDF8';
    // Update home card labels
    const names = t('gameNames');
    document.querySelectorAll('.game-card').forEach(card => {
        const game = card.dataset.game;
        const label = card.querySelector('.card-label');
        if (label && names[game]) label.textContent = names[game];
    });
    // Update level badges on home cards
    updateHomeLevelBadges();
    // Update back button text
    const backText = document.querySelector('.back-hint span:last-child');
    if (backText) backText.textContent = t('back');
    // Restart home tips with new language
    startHomeTips();
}

/** Shows level badges on home screen cards for games that have levels. */
function updateHomeLevelBadges() {
    document.querySelectorAll('.game-card').forEach(card => {
        const game = card.dataset.game;
        let badge = card.querySelector('.card-level-badge');
        if (GAME_LEVELS[game]) {
            const lvl = getLevel(game);
            const lvlData = GAME_LEVELS[game][lvl];
            const text = lvlData.emoji;
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'card-level-badge';
                card.appendChild(badge);
            }
            badge.textContent = text;
        } else if (badge) {
            badge.remove();
        }
    });
}

langBtn.addEventListener('click', toggleLang);

// Home screen click support
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
        Audio_.tap();
        startGame(card.dataset.game);
    });
});

// Rotating home subtitle
let homeTipIdx = 0;
let homeTipTimer = null;
const homeSubtitle = document.querySelector('.home-subtitle');

/** Cycles the home subtitle text every 3 seconds, using current language. */
function startHomeTips() {
    clearInterval(homeTipTimer);
    const tips = t('homeTips');
    homeTipIdx = 0;
    homeSubtitle.textContent = tips[0];
    homeTipTimer = setInterval(() => {
        homeTipIdx = (homeTipIdx + 1) % tips.length;
        homeSubtitle.style.opacity = '0';
        setTimeout(() => {
            homeSubtitle.textContent = t('homeTips')[homeTipIdx];
            homeSubtitle.style.opacity = '1';
        }, 300);
    }, 3500);
}
startHomeTips();
updateHomeLevelBadges();

/**
 * Starts a new game session for the given game mode.
 * @param {string} game - Game mode identifier (e.g. 'colors', 'words')
 */
/**
 * Maps game mode identifiers to their theme colors.
 * @type {Object<string, string>}
 */
const GAME_TINTS = {
    colors: '#ff6b9d', shapes: '#c44dff', count: '#4dc9f6', letters: '#2ecc71',
    animals: '#f1c40f', math: '#e67e22', words: '#1abc9c', patterns: '#e056a0',
    rhymes: '#3dc1d3', memory: '#fd79a8', elements: '#5DADE2', geometry: '#E8A0BF',
};

function startGame(game) {
    clearInterval(homeTipTimer);

    // If this game has levels, show the level picker first
    if (GAME_LEVELS[game] && !levelPicking) {
        showLevelPicker(game);
        return;
    }
    levelPicking = false;

    currentGame = game;
    stars = 0;
    streak = 0;
    renderStars();
    updateStreak();
    homeScreen.classList.remove('active');
    gameScreen.classList.add('active');
    gameScreen.style.setProperty('--game-tint', GAME_TINTS[game] || 'transparent');
    keyHintBar.style.display = 'flex';
    extraArea.innerHTML = '';
    nextRound();
}

/**
 * Shows the level picker overlay on the home screen for games with levels.
 * @param {string} game - Game mode identifier
 */
function showLevelPicker(game) {
    levelPicking = true;
    levelPickingGame = game;
    const levels = GAME_LEVELS[game];
    const currentLvl = getLevel(game);
    const tint = GAME_TINTS[game] || '#4dc9f6';

    // Build level picker HTML inside extraArea on the game screen
    // We'll use the home screen with an overlay
    let html = '<div class="level-picker">';
    html += `<div class="level-title">${lang === 'pt' ? 'Escolha o n\u00EDvel' : 'Pick a level'}</div>`;
    levels.forEach((lvl, i) => {
        const selected = i === currentLvl ? ' level-selected' : '';
        const name = lang === 'pt' ? lvl.ptName : lvl.name;
        const desc = lang === 'pt' ? lvl.ptDesc : lvl.desc;
        html += `<button class="level-btn${selected}" data-level="${i}" style="--lvl-tint: ${tint}">`;
        html += `<span class="level-keycap">${keycapHTML(String(i + 1), i === currentLvl ? 'active-key' : '')}</span>`;
        html += `<span class="level-emoji">${lvl.emoji}</span>`;
        html += `<span class="level-info"><span class="level-name">${name}</span><span class="level-desc">${desc}</span></span>`;
        html += `</button>`;
    });
    html += `<div class="level-esc">${keycapHTML('Esc', 'small')} ${lang === 'pt' ? 'Voltar' : 'Back'}</div>`;
    html += '</div>';

    // Show on game screen temporarily
    homeScreen.classList.remove('active');
    gameScreen.classList.add('active');
    gameScreen.style.setProperty('--game-tint', tint);
    keyHintBar.style.display = 'none';

    // Use prompt area + extra area for the picker
    promptEmoji.textContent = '';
    promptText.innerHTML = '';
    choicesEl.innerHTML = '';
    extraArea.innerHTML = html;

    // Click handlers for level buttons
    extraArea.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lvl = parseInt(btn.dataset.level);
            gameLevels[game] = lvl;
            saveLevels();
            Audio_.tap();
            startGame(game);
        });
    });

    setKeyHint(lang === 'pt' ? 'Aperte 1-' + levels.length + ' para escolher!' : 'Press 1-' + levels.length + ' to pick!');
    keyHintBar.style.display = 'flex';
}

// ============================================
// Progress
// ============================================

/** Renders the star progress bar in the top bar. */
function renderStars() {
    starsBar.innerHTML = '';
    for (let i = 0; i < MAX_STARS; i++) {
        const s = document.createElement('span');
        s.className = 'star' + (i < stars ? ' earned' : '');
        s.textContent = '\u2B50';
        starsBar.appendChild(s);
    }
}

/** Updates the streak badge visibility, count, and fire animation at 5+. */
function updateStreak() {
    if (streak >= 3) {
        streakBadge.textContent = '\uD83D\uDD25 ' + streak;
        streakBadge.classList.add('show');
        if (streak >= 5) {
            streakBadge.classList.add('on-fire');
        } else {
            streakBadge.classList.remove('on-fire');
        }
    } else {
        streakBadge.classList.remove('show');
        streakBadge.classList.remove('on-fire');
    }
}

/**
 * Awards one star and increments the streak.
 * If all stars are earned, speaks congratulations and returns home.
 */
function earnStar() {
    if (stars < MAX_STARS) {
        stars++;
        renderStars();
    }
    streak++;
    updateStreak();
    if (stars >= MAX_STARS) {
        setTimeout(() => {
            showGrandFinale();
            Audio_.celebration();
            Audio_.speak(t('allStars'));
            setTimeout(goHome, 3000);
        }, 1200);
    }
}

/** Resets the streak counter to zero. */
function resetStreak() {
    streak = 0;
    updateStreak();
}

/**
 * Sets the text shown in the bottom keyboard hint bar.
 * @param {string} text - Hint text to display
 */
function setKeyHint(text) {
    keyHintText.textContent = text;
}

// ============================================
// Utility
// ============================================

/**
 * Returns a new array with elements in random order (Fisher-Yates shuffle).
 * @template T
 * @param {T[]} arr - Array to shuffle
 * @returns {T[]} New shuffled array
 */
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Picks n items from arr, guaranteeing mustInclude is present.
 * @template T
 * @param {T[]} arr - Source array
 * @param {number} n - Number of items to pick
 * @param {T|null} [mustInclude=null] - Item that must be included
 * @returns {T[]} Shuffled array of n items
 */
function pickN(arr, n, mustInclude = null) {
    const result = mustInclude !== null ? [mustInclude] : [];
    const pool = arr.filter(x => x !== mustInclude);
    const shuffled = shuffle(pool);
    for (const item of shuffled) {
        if (result.length >= n) break;
        if (!result.includes(item)) result.push(item);
    }
    return shuffle(result);
}

/**
 * Creates an HTML string for a keycap badge.
 * @param {string} label - Text shown on the keycap
 * @param {string} [extraClass=''] - Additional CSS classes
 * @returns {string} HTML string
 */
function keycapHTML(label, extraClass = '') {
    return `<span class="keycap ${extraClass}">${label}</span>`;
}

// ============================================
// Shared Answer Handler
// ============================================

/**
 * Handles a choice-based answer for all non-Words game modes.
 * Marks the selected button correct/wrong, plays audio, awards stars,
 * and advances to the next round on correct answers.
 * @param {number} selectedIdx - Index of the button the player chose
 * @param {number} correctIdx - Index of the correct button
 * @param {(() => void)|null} [onCorrect=null] - Optional callback invoked on correct answer
 */
function handleAnswer(selectedIdx, correctIdx, onCorrect = null) {
    if (inputLocked) return;

    const btns = choicesEl.querySelectorAll('.choice-btn');

    if (selectedIdx === correctIdx) {
        inputLocked = true;
        btns[selectedIdx].classList.add('correct');
        Audio_.correct();
        showCelebration();
        earnStar();

        if (onCorrect) onCorrect();

        const enc = t('encouragements');
        setTimeout(() => Audio_.speak(enc[Math.floor(Math.random() * enc.length)]), 400);

        setTimeout(() => {
            Audio_.celebration();
            if (stars < MAX_STARS) {
                setTimeout(() => {
                    inputLocked = false;
                    nextRound();
                }, 800);
            }
        }, 600);
    } else {
        btns[selectedIdx].classList.add('wrong');
        Audio_.wrong();
        resetStreak();

        const ta = t('tryAgain');
        setTimeout(() => Audio_.speak(ta[Math.floor(Math.random() * ta.length)]), 300);

        btns[selectedIdx].style.pointerEvents = 'none';
        setTimeout(() => {
            btns[selectedIdx].classList.remove('wrong');
            btns[selectedIdx].style.pointerEvents = '';
        }, 800);
    }
}

/**
 * Advances to the next round by dispatching to the current game mode's
 * round function. Clears previous round state first.
 */
function nextRound() {
    extraArea.innerHTML = '';
    choicesEl.innerHTML = '';
    activeKeyMap = {};
    correctKey = null;
    inputLocked = false;  // CRITICAL: unlock input at start of every round

    switch (currentGame) {
        case 'colors':  colorsRound();  break;
        case 'shapes':  shapesRound();  break;
        case 'count':   countRound();   break;
        case 'letters': lettersRound(); break;
        case 'animals': animalsRound(); break;
        case 'math':    mathRound();    break;
        case 'words':    wordsRound();    break;
        case 'patterns': patternsRound(); break;
        case 'rhymes':   rhymesRound();   break;
        case 'memory':   memoryRound();   break;
        case 'elements': elementsRound(); break;
        case 'geometry': geometryRound(); break;
    }
}

// ============================================
// Master Keyboard Handler
// ============================================
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    // ── Home screen ──
    if (currentGame === null && homeScreen.classList.contains('active')) {
        if (key === 'l') {
            toggleLang();
            return;
        }
        const gameMap = { '1': 'colors', '2': 'shapes', '3': 'count', '4': 'letters', '5': 'animals', '6': 'math', '7': 'words', '8': 'patterns', '9': 'rhymes', '0': 'memory', 'e': 'elements', 'g': 'geometry' };
        if (gameMap[key]) {
            // Visual feedback on the card
            const card = document.querySelector(`.game-card[data-key="${key}"]`);
            if (card) {
                card.classList.add('pressed');
                setTimeout(() => card.classList.remove('pressed'), 150);
            }
            Audio_.tap();
            startGame(gameMap[key]);
            return;
        }
        return;
    }

    // ── Level picker ──
    if (levelPicking && levelPickingGame) {
        if (key === 'escape') {
            levelPicking = false;
            levelPickingGame = null;
            gameScreen.classList.remove('active');
            homeScreen.classList.add('active');
            keyHintBar.style.display = 'none';
            startHomeTips();
            return;
        }
        const lvl = parseInt(key) - 1;
        if (lvl >= 0 && lvl < GAME_LEVELS[levelPickingGame].length) {
            // Visual feedback
            const btn = extraArea.querySelector(`.level-btn[data-level="${lvl}"]`);
            if (btn) {
                btn.classList.add('pressed');
                setTimeout(() => btn.classList.remove('pressed'), 150);
            }
            gameLevels[levelPickingGame] = lvl;
            saveLevels();
            Audio_.tap();
            startGame(levelPickingGame);
        }
        return;
    }

    // ── In a game ──
    if (!currentGame) return;

    // Escape goes home
    if (key === 'escape') {
        goHome();
        return;
    }

    if (inputLocked) return;

    // Words mode: pick phase uses Space + number keys, spelling phase uses letters
    if (currentGame === 'words') {
        if (wordSelecting) {
            if (key === ' ' || key === 'enter') {
                // Pick the current rotating word
                selectWord(wordCarouselPool[wordCarouselIdx]);
            } else {
                // Check quick-pick favorites
                const fav = WORD_FAVORITES.find(f => f.key === key);
                if (fav) {
                    const wordObj = WORDS_DATA.find(w => w.word === fav.word);
                    if (wordObj) selectWord(wordObj);
                }
            }
        } else if (/^[a-z]$/.test(key)) {
            // Spelling phase — letter-by-letter
            const keycapEl = extraArea.querySelector('.keycap.active-key');
            if (keycapEl) {
                keycapEl.classList.add('pressed-anim');
                setTimeout(() => keycapEl.classList.remove('pressed-anim'), 150);
            }
            handleWordKeyPress(key);
        }
        return;
    }

    // Memory mode uses direct card flip handling
    if (currentGame === 'memory') {
        if (/^[1-8]$/.test(key)) {
            handleMemoryKeyPress(key);
        }
        return;
    }

    // Check active key map (all other games)
    if (activeKeyMap.hasOwnProperty(key)) {
        const idx = activeKeyMap[key];
        const btns = choicesEl.querySelectorAll('.choice-btn');
        const btn = btns[idx];

        if (btn) {
            // Visual key press animation
            btn.classList.add('key-active');
            const keycap = btn.querySelector('.keycap');
            if (keycap) keycap.classList.add('pressed-anim');
            setTimeout(() => {
                btn.classList.remove('key-active');
                if (keycap) keycap.classList.remove('pressed-anim');
            }, 150);

            // Trigger the click handler
            btn.click();
        }
    }
});
