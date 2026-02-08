// ============================================
// Game Data & Round Functions
// ============================================

// ── COLORS ──

/**
 * Color data for the Colors game mode.
 * @type {Array<{name: string, hex: string}>}
 */
const COLORS_DATA = [
    { name: 'red',    hex: '#e74c3c' },
    { name: 'blue',   hex: '#3498db' },
    { name: 'yellow', hex: '#f1c40f' },
    { name: 'green',  hex: '#2ecc71' },
    { name: 'orange', hex: '#e67e22' },
    { name: 'purple', hex: '#9b59b6' },
    { name: 'pink',   hex: '#ff6b9d' },
    { name: 'brown',  hex: '#8B4513' },
];

/**
 * Sets up a Colors round: picks a target color, shows 4 swatch choices,
 * maps keys 1-4 to choices, and speaks the prompt.
 */
function colorsRound() {
    const correct = COLORS_DATA[Math.floor(Math.random() * COLORS_DATA.length)];
    const options = pickN(COLORS_DATA, 4, correct);
    const correctIdx = options.indexOf(correct);

    promptEmoji.textContent = '\uD83C\uDFA8';
    promptText.innerHTML = `Find <span class="prompt-highlight" style="background:${correct.hex}; color:white;">${correct.name}</span>!`;
    extraArea.innerHTML = '';

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((c, i) => {
        const keyNum = String(i + 1);
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.dataset.key = keyNum;
        btn.innerHTML = `<div class="color-swatch" style="background:${c.hex}"></div><span class="choice-label">${c.name}</span><span class="choice-keycap">${keycapHTML(keyNum, i === correctIdx ? 'active-key' : '')}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx));
        choicesEl.appendChild(btn);
        activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);

    scheduleHint(correctIdx);
    setKeyHint(`Press ${correctKey} for ${correct.name}!`);
    setTimeout(() => Audio_.speak(`Find ${correct.name}. Press ${correctKey}!`), 300);
}

// ── SHAPES ──

/**
 * Shape data for the Shapes game mode, each with an inline SVG.
 * @type {Array<{name: string, svg: string}>}
 */
const SHAPES_DATA = [
    { name: 'circle',    svg: `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" fill="#4dc9f6"/></svg>` },
    { name: 'square',    svg: `<svg viewBox="0 0 80 80"><rect x="8" y="8" width="64" height="64" rx="4" fill="#2ecc71"/></svg>` },
    { name: 'triangle',  svg: `<svg viewBox="0 0 80 80"><polygon points="40,5 75,75 5,75" fill="#f1c40f"/></svg>` },
    { name: 'star',      svg: `<svg viewBox="0 0 80 80"><polygon points="40,5 50,30 78,30 55,48 63,75 40,58 17,75 25,48 2,30 30,30" fill="#e67e22"/></svg>` },
    { name: 'heart',     svg: `<svg viewBox="0 0 80 80"><path d="M40,72 C20,50 5,35 5,22 C5,12 13,4 23,4 C30,4 36,8 40,14 C44,8 50,4 57,4 C67,4 75,12 75,22 C75,35 60,50 40,72Z" fill="#e74c3c"/></svg>` },
    { name: 'diamond',   svg: `<svg viewBox="0 0 80 80"><polygon points="40,5 75,40 40,75 5,40" fill="#9b59b6"/></svg>` },
];

/**
 * Sets up a Shapes round: picks a target shape, shows 4 SVG choices,
 * maps keys 1-4 to choices, and speaks the prompt.
 */
function shapesRound() {
    const correct = SHAPES_DATA[Math.floor(Math.random() * SHAPES_DATA.length)];
    const options = pickN(SHAPES_DATA, 4, correct);
    const correctIdx = options.indexOf(correct);

    promptEmoji.textContent = '\uD83D\uDD37';
    promptText.innerHTML = `Find the <b>${correct.name}</b>!`;
    extraArea.innerHTML = '';

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((s, i) => {
        const keyNum = String(i + 1);
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.dataset.key = keyNum;
        btn.innerHTML = `<div class="shape-visual">${s.svg}</div><span class="choice-label">${s.name}</span><span class="choice-keycap">${keycapHTML(keyNum, i === correctIdx ? 'active-key' : '')}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx));
        choicesEl.appendChild(btn);
        activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);

    scheduleHint(correctIdx);
    setKeyHint(`Press ${correctKey} for ${correct.name}!`);
    setTimeout(() => Audio_.speak(`Find the ${correct.name}. Press ${correctKey}!`), 300);
}

// ── COUNTING ──

/**
 * Emoji pool for the counting game's visual items.
 * @type {string[]}
 */
const COUNT_EMOJIS = ['\uD83C\uDF4E', '\uD83D\uDC31', '\u2B50', '\uD83C\uDF38', '\uD83D\uDC1F', '\uD83C\uDF88', '\uD83C\uDF6A', '\uD83E\uDD8B', '\uD83D\uDC38', '\uD83C\uDF4C'];

/**
 * Sets up a Counting round: shows 1-5 emoji items, presents 4 number
 * choices where the key is the number itself, and speaks the prompt.
 */
function countRound() {
    const correctCount = Math.floor(Math.random() * 5) + 1; // 1-5
    const emoji = COUNT_EMOJIS[Math.floor(Math.random() * COUNT_EMOJIS.length)];

    const allNums = [1, 2, 3, 4, 5];
    const options = pickN(allNums, 4, correctCount);
    const correctIdx = options.indexOf(correctCount);

    promptEmoji.textContent = '\uD83D\uDD22';
    promptText.innerHTML = `How many <span style="font-size:1.4em;">${emoji}</span> ?`;

    extraArea.innerHTML = '<div class="count-items" id="count-items"></div>';
    const container = document.getElementById('count-items');
    for (let i = 0; i < correctCount; i++) {
        const item = document.createElement('span');
        item.className = 'count-item';
        item.textContent = emoji;
        item.style.animationDelay = (i * 0.1) + 's';
        container.appendChild(item);
    }

    // For counting, the key IS the number shown on the button
    activeKeyMap = {};
    choicesEl.className = 'choices number-choices';
    choicesEl.innerHTML = '';
    options.forEach((n, i) => {
        const keyStr = String(n);
        const btn = document.createElement('button');
        btn.className = 'choice-btn number-btn';
        btn.dataset.key = keyStr;
        const isCorrect = n === correctCount;
        btn.innerHTML = `<span class="choice-visual">${n}</span><span class="choice-keycap">${keycapHTML(keyStr, isCorrect ? 'active-key' : '')}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx));
        choicesEl.appendChild(btn);
        activeKeyMap[keyStr] = i;
    });
    correctKey = String(correctCount);

    scheduleHint(correctIdx);
    setKeyHint(`Press ${correctCount}!`);
    setTimeout(() => Audio_.speak(`How many? Count them! Press the number!`), 300);
}

// ── LETTERS ──

/**
 * All 26 uppercase letters.
 * @type {string[]}
 */
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Maps each letter to an emoji + word hint (e.g. A -> "Apple").
 * @type {Object<string, string>}
 */
const LETTER_WORDS = {
    A: '\uD83C\uDF4E Apple', B: '\uD83D\uDC3B Bear', C: '\uD83D\uDC31 Cat', D: '\uD83D\uDC15 Dog', E: '\uD83D\uDC18 Elephant',
    F: '\uD83D\uDC1F Fish', G: '\uD83E\uDD92 Giraffe', H: '\uD83C\uDFA9 Hat', I: '\uD83C\uDF66 Ice cream', J: '\uD83E\uDD39 Juggle',
    K: '\uD83E\uDE81 Kite', L: '\uD83E\uDD81 Lion', M: '\uD83C\uDF19 Moon', N: '\uD83D\uDC43 Nose', O: '\uD83D\uDC19 Octopus',
    P: '\uD83D\uDC37 Pig', Q: '\uD83D\uDC78 Queen', R: '\uD83C\uDF08 Rainbow', S: '\u2600\uFE0F Sun', T: '\uD83C\uDF33 Tree',
    U: '\u2602\uFE0F Umbrella', V: '\uD83C\uDFBB Violin', W: '\uD83D\uDC0B Whale', X: '\u274C X-ray', Y: '\uD83D\uDC9B Yellow',
    Z: '\uD83E\uDD93 Zebra'
};

/**
 * Sets up a Letters round: picks a target letter, shows 4 letter choices
 * where the key is the letter itself, and speaks the prompt.
 */
function lettersRound() {
    const correct = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    const options = pickN(LETTERS, 4, correct);
    const correctIdx = options.indexOf(correct);

    const wordHint = LETTER_WORDS[correct] || '';
    promptEmoji.textContent = wordHint.split(' ')[0] || '\uD83D\uDD24';
    promptText.innerHTML = `Press the letter <b style="font-size:1.3em;">${correct}</b>!`;
    extraArea.innerHTML = '';

    // For letters, the key IS the letter itself
    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((l, i) => {
        const keyStr = l.toLowerCase();
        const btn = document.createElement('button');
        btn.className = 'choice-btn letter-btn';
        btn.dataset.key = keyStr;
        const isCorrect = l === correct;
        btn.innerHTML = `<span class="choice-visual">${l}</span><span class="choice-keycap">${keycapHTML(l, isCorrect ? 'active-key' : '')}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx));
        choicesEl.appendChild(btn);
        activeKeyMap[keyStr] = i;
    });
    correctKey = correct.toLowerCase();

    scheduleHint(correctIdx);
    setKeyHint(`Press ${correct} on the keyboard!`);
    setTimeout(() => Audio_.speak(`Press the letter ${correct}! ${correct} for ${(LETTER_WORDS[correct] || '').split(' ').slice(1).join(' ')}`), 300);
}

// ── ANIMALS ──

/**
 * Animal data for the Animals game mode: name, emoji, and characteristic sound.
 * @type {Array<{name: string, emoji: string, sound: string}>}
 */
const ANIMALS_DATA = [
    { name: 'cat',     emoji: '\uD83D\uDC31', sound: 'meow' },
    { name: 'dog',     emoji: '\uD83D\uDC15', sound: 'woof woof' },
    { name: 'cow',     emoji: '\uD83D\uDC04', sound: 'moo' },
    { name: 'pig',     emoji: '\uD83D\uDC37', sound: 'oink oink' },
    { name: 'duck',    emoji: '\uD83E\uDD86', sound: 'quack quack' },
    { name: 'frog',    emoji: '\uD83D\uDC38', sound: 'ribbit' },
    { name: 'bird',    emoji: '\uD83D\uDC26', sound: 'tweet tweet' },
    { name: 'bee',     emoji: '\uD83D\uDC1D', sound: 'buzz buzz' },
    { name: 'lion',    emoji: '\uD83E\uDD81', sound: 'roar' },
    { name: 'snake',   emoji: '\uD83D\uDC0D', sound: 'hiss' },
    { name: 'horse',   emoji: '\uD83D\uDC34', sound: 'neigh' },
    { name: 'sheep',   emoji: '\uD83D\uDC11', sound: 'baa baa' },
];

/**
 * Sets up an Animals round: picks a target animal by its sound,
 * shows 4 emoji choices, maps keys 1-4, and speaks the prompt.
 */
function animalsRound() {
    const correct = ANIMALS_DATA[Math.floor(Math.random() * ANIMALS_DATA.length)];
    const options = pickN(ANIMALS_DATA, 4, correct);
    const correctIdx = options.indexOf(correct);

    promptEmoji.textContent = '\uD83D\uDD0A';
    promptText.innerHTML = `Who says <b>"${correct.sound}"</b>?`;
    extraArea.innerHTML = '';

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((a, i) => {
        const keyNum = String(i + 1);
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.dataset.key = keyNum;
        const isCorrect = a === correct;
        btn.innerHTML = `<span class="choice-visual">${a.emoji}</span><span class="choice-label">${a.name}</span><span class="choice-keycap">${keycapHTML(keyNum, isCorrect ? 'active-key' : '')}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx));
        choicesEl.appendChild(btn);
        activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);

    scheduleHint(correctIdx);
    setKeyHint(`Press ${correctKey} for ${correct.name}!`);
    setTimeout(() => Audio_.speak(`Who says ${correct.sound}? Press ${correctKey}!`), 300);
}

// ── MATH ──

/**
 * Emoji pool for the math game's visual item groups.
 * @type {string[]}
 */
const MATH_EMOJIS = ['\uD83C\uDF4E', '\u2B50', '\uD83C\uDF38', '\uD83D\uDC31', '\u2764\uFE0F', '\uD83C\uDF88', '\uD83C\uDF6A'];

/**
 * Sets up a Math round: generates an addition problem (1-4 + 1-4),
 * shows emoji groups and an equation, presents 4 number choices
 * where the key is the number itself, and speaks the prompt.
 */
function mathRound() {
    const n1 = Math.floor(Math.random() * 4) + 1;
    const n2 = Math.floor(Math.random() * 4) + 1;
    const answer = n1 + n2;
    const emoji = MATH_EMOJIS[Math.floor(Math.random() * MATH_EMOJIS.length)];

    const allNums = [];
    for (let i = Math.max(2, answer - 2); i <= Math.min(9, answer + 2); i++) allNums.push(i);
    if (!allNums.includes(answer)) allNums.push(answer);
    const options = pickN(allNums, 4, answer);
    const correctIdx = options.indexOf(answer);

    promptEmoji.textContent = '\u2795';
    promptText.innerHTML = '';

    extraArea.innerHTML = `
        <div class="math-items">
            <div class="math-group" id="mg1"></div>
            <span class="math-plus">+</span>
            <div class="math-group" id="mg2"></div>
        </div>
        <div class="math-equation">
            <span class="math-num">${n1}</span>
            <span class="math-op">+</span>
            <span class="math-num">${n2}</span>
            <span class="math-eq">=</span>
            <span class="math-answer-slot" id="math-answer-slot">?</span>
        </div>
    `;

    const mg1 = document.getElementById('mg1');
    const mg2 = document.getElementById('mg2');
    for (let i = 0; i < n1; i++) {
        const s = document.createElement('span');
        s.className = 'math-group-item';
        s.textContent = emoji;
        s.style.animationDelay = (i * 0.08) + 's';
        mg1.appendChild(s);
    }
    for (let i = 0; i < n2; i++) {
        const s = document.createElement('span');
        s.className = 'math-group-item';
        s.textContent = emoji;
        s.style.animationDelay = ((n1 + i) * 0.08) + 's';
        mg2.appendChild(s);
    }

    // For math, the key IS the number shown on the button
    activeKeyMap = {};
    choicesEl.className = 'choices number-choices';
    choicesEl.innerHTML = '';
    options.forEach((n, i) => {
        const keyStr = String(n);
        const btn = document.createElement('button');
        btn.className = 'choice-btn number-btn';
        btn.dataset.key = keyStr;
        const isCorrect = n === answer;
        btn.innerHTML = `<span class="choice-visual">${n}</span><span class="choice-keycap">${keycapHTML(keyStr, isCorrect ? 'active-key' : '')}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
            const slot = document.getElementById('math-answer-slot');
            if (slot) {
                slot.textContent = answer;
                slot.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                slot.style.animation = 'none';
            }
        }));
        choicesEl.appendChild(btn);
        activeKeyMap[keyStr] = i;
    });
    correctKey = String(answer);

    scheduleHint(correctIdx);
    setKeyHint(`Press ${answer}!`);
    setTimeout(() => Audio_.speak(`${n1} plus ${n2} equals what? Press the number!`), 300);
}

// ── WORDS ──

/**
 * Word data for the Words spelling game.
 * @type {Array<{word: string, emoji: string, category: string}>}
 */
const WORDS_DATA = [
    // Family
    { word: 'LUA',      emoji: '\uD83D\uDC67', category: 'family' },
    { word: 'SORA',     emoji: '\uD83D\uDC76', category: 'family' },
    { word: 'MAMA',     emoji: '\uD83D\uDC69', category: 'family' },
    { word: 'DADA',     emoji: '\uD83D\uDC68', category: 'family' },

    // Animals
    { word: 'CAT',      emoji: '\uD83D\uDC31', category: 'animal' },
    { word: 'DOG',      emoji: '\uD83D\uDC15', category: 'animal' },
    { word: 'COW',      emoji: '\uD83D\uDC04', category: 'animal' },
    { word: 'PIG',      emoji: '\uD83D\uDC37', category: 'animal' },
    { word: 'BEE',      emoji: '\uD83D\uDC1D', category: 'animal' },
    { word: 'FISH',     emoji: '\uD83D\uDC1F', category: 'animal' },
    { word: 'BIRD',     emoji: '\uD83D\uDC26', category: 'animal' },
    { word: 'FROG',     emoji: '\uD83D\uDC38', category: 'animal' },
    { word: 'DUCK',     emoji: '\uD83E\uDD86', category: 'animal' },
    { word: 'BEAR',     emoji: '\uD83D\uDC3B', category: 'animal' },

    // Things
    { word: 'SUN',      emoji: '\u2600\uFE0F',  category: 'thing' },
    { word: 'HAT',      emoji: '\uD83C\uDFA9', category: 'thing' },
    { word: 'BUS',      emoji: '\uD83D\uDE8C', category: 'thing' },
    { word: 'CAR',      emoji: '\uD83D\uDE97', category: 'thing' },
    { word: 'BALL',     emoji: '\u26BD', category: 'thing' },
    { word: 'TREE',     emoji: '\uD83C\uDF33', category: 'thing' },
    { word: 'STAR',     emoji: '\u2B50', category: 'thing' },
    { word: 'MOON',     emoji: '\uD83C\uDF19', category: 'thing' },
    { word: 'RAIN',     emoji: '\uD83C\uDF27\uFE0F', category: 'thing' },
    { word: 'BOOK',     emoji: '\uD83D\uDCD6', category: 'thing' },

    // Seussisms
    { word: 'GRINCH',   emoji: '\uD83D\uDC9A', category: 'seuss' },
    { word: 'LORAX',    emoji: '\uD83C\uDF33', category: 'seuss' },
    { word: 'SNEETCH',  emoji: '\u2B50', category: 'seuss' },
    { word: 'WOCKET',   emoji: '\uD83D\uDC7B', category: 'seuss' },
    { word: 'YINK',     emoji: '\uD83E\uDE77', category: 'seuss' },
    { word: 'NINK',     emoji: '\uD83D\uDD8A\uFE0F', category: 'seuss' },
    { word: 'FLOOB',    emoji: '\uD83E\uDEE7', category: 'seuss' },
    { word: 'GLOTZ',    emoji: '\uD83D\uDC40', category: 'seuss' },
    { word: 'ZIZZER',   emoji: '\uD83E\uDD8E', category: 'seuss' },
    { word: 'TRUFFULA', emoji: '\uD83C\uDF38', category: 'seuss' },
];

/**
 * Shuffled queue of words remaining in the current session.
 * Refilled when empty.
 * @type {Array<{word: string, emoji: string, category: string}>}
 */
let wordsQueue = [];

/**
 * The word data object for the current Words round.
 * @type {{word: string, emoji: string, category: string}|null}
 */
let currentWordData = null;

/**
 * Index of the next letter the player must type in the current word.
 * @type {number}
 */
let currentWordLetterIdx = 0;

/** Refills and shuffles the words queue from WORDS_DATA. */
function shuffleWordsQueue() {
    wordsQueue = shuffle([...WORDS_DATA]);
}

/**
 * Sets up a Words round: picks the next word from the queue,
 * renders letter tiles, and speaks the word and first letter.
 */
function wordsRound() {
    if (wordsQueue.length === 0) shuffleWordsQueue();
    currentWordData = wordsQueue.pop();
    currentWordLetterIdx = 0;

    promptEmoji.textContent = currentWordData.emoji;
    promptText.innerHTML = `Spell the word!`;

    // Build the letter display
    renderWordLetters();

    // Choices area not used for words - clear it
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';

    // Set up key map: only accept the current letter
    updateWordKeyMap();

    setTimeout(() => Audio_.speak(`Spell ${currentWordData.word}! Press ${currentWordData.word[0]}!`), 300);
}

/**
 * Renders the word letter tiles in extraArea, highlighting the current
 * letter and showing a keycap hint for the expected key.
 */
function renderWordLetters() {
    const word = currentWordData.word;
    let html = '<div class="word-display">';
    for (let i = 0; i < word.length; i++) {
        let cls = 'word-letter ';
        if (i < currentWordLetterIdx) cls += 'completed';
        else if (i === currentWordLetterIdx) cls += 'current';
        else cls += 'pending';
        html += `<span class="${cls}">${word[i]}</span>`;
    }
    html += '</div>';

    // Key hint for current letter
    const currentLetter = word[currentWordLetterIdx];
    if (currentWordLetterIdx < word.length) {
        html += `<div class="word-key-hint"><span class="hint-label">Press:</span> ${keycapHTML(currentLetter, 'large active-key')}</div>`;
    }

    extraArea.innerHTML = html;
    if (currentWordLetterIdx < word.length) {
        setKeyHint(`Press ${currentLetter}!`);
    }
}

/**
 * Updates activeKeyMap for the current word letter. Maps the correct
 * letter to -1 (sentinel) and all other letters to -2 (wrong).
 */
function updateWordKeyMap() {
    activeKeyMap = {};
    if (!currentWordData || currentWordLetterIdx >= currentWordData.word.length) return;
    const expectedKey = currentWordData.word[currentWordLetterIdx].toLowerCase();
    // Map the correct key to a special handler index -1 (word mode)
    activeKeyMap[expectedKey] = -1; // sentinel for word mode
    correctKey = expectedKey;

    // Also map ALL letter keys so wrong presses give feedback
    for (const ch of 'abcdefghijklmnopqrstuvwxyz') {
        if (!activeKeyMap.hasOwnProperty(ch)) {
            activeKeyMap[ch] = -2; // sentinel for wrong letter
        }
    }
}

/**
 * Handles a keypress in Words mode. On correct letter: advances to the
 * next letter (or completes the word). On wrong letter: shakes the
 * current tile and resets the streak.
 * @param {string} key - Lowercase letter key pressed
 */
function handleWordKeyPress(key) {
    if (inputLocked || !currentWordData) return;
    const expected = currentWordData.word[currentWordLetterIdx].toLowerCase();

    if (key === expected) {
        // Correct letter!
        Audio_.correct();
        currentWordLetterIdx++;
        renderWordLetters();

        if (currentWordLetterIdx >= currentWordData.word.length) {
            // Word complete!
            inputLocked = true;
            Audio_.celebration();
            showCelebration();
            earnStar();

            const encouragements = ['Yay!', 'Great job!', 'Awesome!', 'You did it!', 'Super!', 'Amazing!'];
            setTimeout(() => Audio_.speak(`${encouragements[Math.floor(Math.random() * encouragements.length)]} ${currentWordData.word}!`), 400);

            setTimeout(() => {
                if (stars < MAX_STARS) {
                    inputLocked = false;
                    nextRound();
                }
            }, 1600);
        } else {
            updateWordKeyMap();
            // Speak next letter
            setTimeout(() => Audio_.speak(`${currentWordData.word[currentWordLetterIdx]}!`, 1.0), 150);
        }
    } else {
        // Wrong letter
        Audio_.wrong();
        resetStreak();
        // Shake the current letter
        const currentEl = extraArea.querySelector('.word-letter.current');
        if (currentEl) {
            currentEl.style.animation = 'wrongShake 0.4s ease-out';
            setTimeout(() => currentEl.style.animation = '', 400);
        }
    }
}
