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

/** @type {number|null} Timer ID for the auto-hint timeout */
let hintTimer = null;

/** @type {number} Number of stars needed to complete a game session */
const MAX_STARS = 10;

/**
 * Maps keyboard key strings to choice indices for the current round.
 * For Words mode, -1 = correct letter, -2 = wrong letter.
 * @type {Object<string, number>}
 */
let activeKeyMap = {};

/** @type {string|null} The key string for the correct answer in the current round */
let correctKey = null;

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
    activeKeyMap = {};
    correctKey = null;
    clearTimeout(hintTimer);
    startHomeTips();
}

// Home screen click support
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
        Audio_.tap();
        startGame(card.dataset.game);
    });
});

// Rotating home subtitle
const HOME_TIPS = [
    'Press a number to play!',
    '10 games to explore!',
    'Learn colors, shapes & more!',
    'Spell words letter by letter!',
    'Find patterns & rhymes!',
    'Train your memory!',
];
let homeTipIdx = 0;
let homeTipTimer = null;
const homeSubtitle = document.querySelector('.home-subtitle');

/** Cycles the home subtitle text every 3 seconds. */
function startHomeTips() {
    clearInterval(homeTipTimer);
    homeTipTimer = setInterval(() => {
        homeTipIdx = (homeTipIdx + 1) % HOME_TIPS.length;
        homeSubtitle.style.opacity = '0';
        setTimeout(() => {
            homeSubtitle.textContent = HOME_TIPS[homeTipIdx];
            homeSubtitle.style.opacity = '1';
        }, 300);
    }, 3500);
}
startHomeTips();

/**
 * Starts a new game session for the given game mode.
 * @param {string} game - Game mode identifier (e.g. 'colors', 'words')
 */
function startGame(game) {
    clearInterval(homeTipTimer);
    currentGame = game;
    stars = 0;
    streak = 0;
    renderStars();
    updateStreak();
    homeScreen.classList.remove('active');
    gameScreen.classList.add('active');
    keyHintBar.style.display = 'flex';
    extraArea.innerHTML = '';
    nextRound();
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

/** Updates the streak badge visibility and count. */
function updateStreak() {
    if (streak >= 3) {
        streakBadge.textContent = '\uD83D\uDD25 ' + streak;
        streakBadge.classList.add('show');
    } else {
        streakBadge.classList.remove('show');
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
            Audio_.speak("You got all the stars! Amazing job!");
            setTimeout(goHome, 3000);
        }, 1200);
    }
}

/** Resets the streak counter to zero. */
function resetStreak() {
    streak = 0;
    updateStreak();
}

// ============================================
// Hints
// ============================================

/**
 * Schedules an auto-hint to glow the correct choice after 5 seconds.
 * @param {number} correctIdx - Index of the correct choice button
 */
function scheduleHint(correctIdx) {
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => {
        const btns = choicesEl.querySelectorAll('.choice-btn');
        if (btns[correctIdx]) {
            btns[correctIdx].classList.add('hint-glow');
            // Also pulse the keycap
            const keycap = btns[correctIdx].querySelector('.keycap');
            if (keycap) keycap.classList.add('active-key');
        }
    }, 5000);
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
    clearTimeout(hintTimer);

    const btns = choicesEl.querySelectorAll('.choice-btn');

    if (selectedIdx === correctIdx) {
        inputLocked = true;
        btns[selectedIdx].classList.add('correct');
        Audio_.correct();
        showCelebration();
        earnStar();

        if (onCorrect) onCorrect();

        const encouragements = ['Yay!', 'Great job!', 'Awesome!', 'You did it!', 'Super!', 'Amazing!', 'Wonderful!'];
        setTimeout(() => Audio_.speak(encouragements[Math.floor(Math.random() * encouragements.length)]), 400);

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

        const tryAgainPhrases = ['Oops! Try again!', 'Not quite! Try again!', 'Almost! Try again!'];
        setTimeout(() => Audio_.speak(tryAgainPhrases[Math.floor(Math.random() * tryAgainPhrases.length)]), 300);

        btns[selectedIdx].style.pointerEvents = 'none';
        setTimeout(() => {
            btns[selectedIdx].classList.remove('wrong');
            btns[selectedIdx].style.pointerEvents = '';
            // Hint correct after wrong
            btns[correctIdx].classList.add('hint-glow');
            const keycap = btns[correctIdx].querySelector('.keycap');
            if (keycap) keycap.classList.add('active-key');
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
    }
}

// ============================================
// Master Keyboard Handler
// ============================================
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    // ── Home screen ──
    if (currentGame === null && homeScreen.classList.contains('active')) {
        const gameMap = { '1': 'colors', '2': 'shapes', '3': 'count', '4': 'letters', '5': 'animals', '6': 'math', '7': 'words', '8': 'patterns', '9': 'rhymes', '0': 'memory' };
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

    // ── In a game ──
    if (!currentGame) return;

    // Escape goes home
    if (key === 'escape') {
        goHome();
        return;
    }

    if (inputLocked) return;

    // Words mode uses direct letter-by-letter handling
    if (currentGame === 'words') {
        if (/^[a-z]$/.test(key)) {
            // Animate the keycap in the hint area
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
