// ============================================
// Game Data & Round Functions
// ============================================

/**
 * Returns a bilingual choice label. In PT mode shows the PT name
 * with the EN name below; in EN mode shows only the EN name.
 * @param {string} en - English name
 * @param {string} [pt] - Portuguese name (optional)
 * @returns {string} HTML string for the label
 */
function bilingualLabel(en, pt) {
    if (lang === 'pt' && pt) {
        return `<span class="choice-label">${pt}<span class="choice-label-alt">${en}</span></span>`;
    }
    return `<span class="choice-label">${en}</span>`;
}

// ── COLORS ──

/**
 * Color data for the Colors game mode.
 * @type {Array<{name: string, hex: string}>}
 */
const COLORS_BASIC = [
    { name: 'red',    pt: 'vermelho',  hex: '#e74c3c' },
    { name: 'blue',   pt: 'azul',      hex: '#3498db' },
    { name: 'yellow', pt: 'amarelo',   hex: '#f1c40f' },
    { name: 'green',  pt: 'verde',     hex: '#2ecc71' },
    { name: 'orange', pt: 'laranja',   hex: '#e67e22' },
    { name: 'purple', pt: 'roxo',      hex: '#9b59b6' },
    { name: 'pink',   pt: 'rosa',      hex: '#ff6b9d' },
    { name: 'brown',  pt: 'marrom',    hex: '#8B4513' },
];

/**
 * Advanced colors added at 5+ stars for extra challenge.
 * @type {Array<{name: string, hex: string}>}
 */
const COLORS_ADVANCED = [
    { name: 'teal',      pt: 'azul-petr\u00F3leo', hex: '#008080' },
    { name: 'coral',     pt: 'coral',              hex: '#FF7F50' },
    { name: 'navy',      pt: 'azul-marinho',       hex: '#001F3F' },
    { name: 'lavender',  pt: 'lavanda',            hex: '#B57EDC' },
    { name: 'maroon',    pt: 'bord\u00F4',         hex: '#800000' },
    { name: 'lime',      pt: 'lima',               hex: '#32CD32' },
    { name: 'cyan',      pt: 'ciano',              hex: '#00BCD4' },
    { name: 'gold',      pt: 'dourado',            hex: '#FFD700' },
    { name: 'magenta',   pt: 'magenta',            hex: '#FF00FF' },
    { name: 'peach',     pt: 'p\u00EAssego',       hex: '#FFCBA4' },
    { name: 'olive',     pt: 'oliva',              hex: '#808000' },
    { name: 'salmon',    pt: 'salm\u00E3o',        hex: '#FA8072' },
    { name: 'indigo',    pt: '\u00EDndigo',         hex: '#4B0082' },
    { name: 'crimson',   pt: 'carmesim',           hex: '#DC143C' },
    { name: 'turquoise', pt: 'turquesa',           hex: '#40E0D0' },
    { name: 'tan',       pt: 'bege',               hex: '#D2B48C' },
];

/**
 * Sets up a Colors round: picks a target color, shows 4 swatch choices,
 * maps keys 1-4 to choices, and speaks the prompt.
 */
function colorsRound() {
    // Progressive: stars 0-4 use basic colors, stars 5+ mix in advanced colors
    const colorPool = stars < 3 ? COLORS_BASIC : [...COLORS_BASIC, ...COLORS_ADVANCED];
    const correct = colorPool[Math.floor(Math.random() * colorPool.length)];
    const options = pickN(colorPool, 4, correct);
    const correctIdx = options.indexOf(correct);

    const displayName = lang === 'pt' ? correct.pt : correct.name;
    promptEmoji.textContent = '\uD83C\uDFA8';
    promptText.innerHTML = `${t('find')} <span class="prompt-highlight" style="background:${correct.hex}; color:white;">${displayName}</span>!`;
    extraArea.innerHTML = '';

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((c, i) => {
        const keyNum = String(i + 1);
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.dataset.key = keyNum;
        btn.innerHTML = `<div class="color-swatch" style="background:${c.hex}"></div>${bilingualLabel(c.name, c.pt)}<span class="choice-keycap">${keycapHTML(keyNum)}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx));
        choicesEl.appendChild(btn);
        activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);

    setKeyHint(`${t('find')} ${displayName}!`);
    setTimeout(() => Audio_.speak(`${t('find')} ${displayName}!`), 300);
}

// ── SHAPES ──

/**
 * Shape data for the Shapes game mode, each with an inline SVG.
 * @type {Array<{name: string, svg: string}>}
 */
const SHAPES_DATA = [
    { name: 'circle',    pt: 'c\u00EDrculo',   svg: `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" fill="#4dc9f6"/></svg>` },
    { name: 'square',    pt: 'quadrado',        svg: `<svg viewBox="0 0 80 80"><rect x="8" y="8" width="64" height="64" rx="4" fill="#2ecc71"/></svg>` },
    { name: 'triangle',  pt: 'tri\u00E2ngulo',  svg: `<svg viewBox="0 0 80 80"><polygon points="40,5 75,75 5,75" fill="#f1c40f"/></svg>` },
    { name: 'star',      pt: 'estrela',         svg: `<svg viewBox="0 0 80 80"><polygon points="40,5 50,30 78,30 55,48 63,75 40,58 17,75 25,48 2,30 30,30" fill="#e67e22"/></svg>` },
    { name: 'heart',     pt: 'cora\u00E7\u00E3o', svg: `<svg viewBox="0 0 80 80"><path d="M40,72 C20,50 5,35 5,22 C5,12 13,4 23,4 C30,4 36,8 40,14 C44,8 50,4 57,4 C67,4 75,12 75,22 C75,35 60,50 40,72Z" fill="#e74c3c"/></svg>` },
    { name: 'diamond',   pt: 'diamante',        svg: `<svg viewBox="0 0 80 80"><polygon points="40,5 75,40 40,75 5,40" fill="#9b59b6"/></svg>` },
];

/**
 * Sets up a Shapes round: picks a target shape, shows 4 SVG choices,
 * maps keys 1-4 to choices, and speaks the prompt.
 */
function shapesRound() {
    const correct = SHAPES_DATA[Math.floor(Math.random() * SHAPES_DATA.length)];
    const options = pickN(SHAPES_DATA, 4, correct);
    const correctIdx = options.indexOf(correct);

    const displayName = lang === 'pt' ? correct.pt : correct.name;
    const shapePrompt = lang === 'pt' ? `${t('find')} <b>${displayName}</b>!` : `${t('findThe')} <b>${displayName}</b>!`;
    promptEmoji.textContent = '\uD83D\uDD37';
    promptText.innerHTML = shapePrompt;
    extraArea.innerHTML = '';

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((s, i) => {
        const keyNum = String(i + 1);
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.dataset.key = keyNum;
        btn.innerHTML = `<div class="shape-visual">${s.svg}</div>${bilingualLabel(s.name, s.pt)}<span class="choice-keycap">${keycapHTML(keyNum)}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx));
        choicesEl.appendChild(btn);
        activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);

    const shapeHint = lang === 'pt' ? `${t('find')} ${displayName}!` : `${t('findThe')} ${displayName}?`;
    setKeyHint(shapeHint);
    setTimeout(() => Audio_.speak(lang === 'pt' ? `${t('find')} ${displayName}!` : `${t('findThe')} ${displayName}!`), 300);
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
    // Progressive: stars 0-4 count 1-3, stars 5+ count 1-5
    const maxCount = stars < 3 ? 3 : 5;
    const correctCount = Math.floor(Math.random() * maxCount) + 1;
    const emoji = COUNT_EMOJIS[Math.floor(Math.random() * COUNT_EMOJIS.length)];

    const allNums = [];
    for (let i = 1; i <= maxCount; i++) allNums.push(i);
    const options = pickN(allNums, 4, correctCount);
    const correctIdx = options.indexOf(correctCount);

    promptEmoji.textContent = '\uD83D\uDD22';
    promptText.innerHTML = `${t('howMany')} <span style="font-size:1.4em;">${emoji}</span> ?`;

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
        btn.innerHTML = `<span class="choice-visual">${n}</span><span class="choice-keycap">${keycapHTML(keyStr)}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx));
        choicesEl.appendChild(btn);
        activeKeyMap[keyStr] = i;
    });
    correctKey = String(correctCount);


    setKeyHint(t('countThem'));
    setTimeout(() => Audio_.speak(t('countSpeak')), 300);
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
    promptText.innerHTML = `${t('pressLetter')} <b style="font-size:1.3em;">${correct}</b>!`;
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
        btn.innerHTML = `<span class="choice-visual">${l}</span><span class="choice-keycap">${keycapHTML(l)}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx));
        choicesEl.appendChild(btn);
        activeKeyMap[keyStr] = i;
    });
    correctKey = correct.toLowerCase();


    setKeyHint(t('pressOn').replace('%s', correct));
    const wordName = (LETTER_WORDS[correct] || '').split(' ').slice(1).join(' ');
    setTimeout(() => Audio_.speak(`${t('pressLetter')} ${correct}! ${t('letterFor').replace('%s', correct).replace('%s', wordName)}`), 300);
}

// ── ANIMALS ──

/**
 * Animal data for the Animals game mode: name, emoji, and characteristic sound.
 * @type {Array<{name: string, emoji: string, sound: string}>}
 */
const ANIMALS_DATA = [
    { name: 'cat',     pt: 'gato',      emoji: '\uD83D\uDC31', sound: 'meow',        ptSound: 'miau' },
    { name: 'dog',     pt: 'cachorro',   emoji: '\uD83D\uDC15', sound: 'woof woof',   ptSound: 'au au' },
    { name: 'cow',     pt: 'vaca',       emoji: '\uD83D\uDC04', sound: 'moo',         ptSound: 'mu' },
    { name: 'pig',     pt: 'porco',      emoji: '\uD83D\uDC37', sound: 'oink oink',   ptSound: 'oinc oinc' },
    { name: 'duck',    pt: 'pato',       emoji: '\uD83E\uDD86', sound: 'quack quack', ptSound: 'qu\u00E1 qu\u00E1' },
    { name: 'frog',    pt: 'sapo',       emoji: '\uD83D\uDC38', sound: 'ribbit',      ptSound: 'croac' },
    { name: 'bird',    pt: 'p\u00E1ssaro', emoji: '\uD83D\uDC26', sound: 'tweet tweet', ptSound: 'piu piu' },
    { name: 'bee',     pt: 'abelha',     emoji: '\uD83D\uDC1D', sound: 'buzz buzz',   ptSound: 'bzz bzz' },
    { name: 'lion',    pt: 'le\u00E3o',  emoji: '\uD83E\uDD81', sound: 'roar',        ptSound: 'roar' },
    { name: 'snake',   pt: 'cobra',      emoji: '\uD83D\uDC0D', sound: 'hiss',        ptSound: 'sss' },
    { name: 'horse',   pt: 'cavalo',     emoji: '\uD83D\uDC34', sound: 'neigh',       ptSound: 'irrr' },
    { name: 'sheep',   pt: 'ovelha',     emoji: '\uD83D\uDC11', sound: 'baa baa',     ptSound: 'b\u00E9 b\u00E9' },
];

/**
 * Sets up an Animals round: picks a target animal by its sound,
 * shows 4 emoji choices, maps keys 1-4, and speaks the prompt.
 */
function animalsRound() {
    const correct = ANIMALS_DATA[Math.floor(Math.random() * ANIMALS_DATA.length)];
    const options = pickN(ANIMALS_DATA, 4, correct);
    const correctIdx = options.indexOf(correct);

    const animalSound = lang === 'pt' ? correct.ptSound : correct.sound;
    promptEmoji.textContent = '\uD83D\uDD0A';
    promptText.innerHTML = `${t('whoSays')} <b>"${animalSound}"</b>?`;
    extraArea.innerHTML = '';

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((a, i) => {
        const keyNum = String(i + 1);
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.dataset.key = keyNum;
        btn.innerHTML = `<span class="choice-visual">${a.emoji}</span>${bilingualLabel(a.name, a.pt)}<span class="choice-keycap">${keycapHTML(keyNum)}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx));
        choicesEl.appendChild(btn);
        activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);

    setKeyHint(`${t('whoSays')} "${animalSound}"?`);
    setTimeout(() => Audio_.speak(`${t('whoSays')} ${animalSound}?`), 300);
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
    // Progressive: stars 0-4 use 1-2, stars 5+ use 1-4
    const maxN = stars < 3 ? 2 : 4;
    const n1 = Math.floor(Math.random() * maxN) + 1;
    const n2 = Math.floor(Math.random() * maxN) + 1;
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
        btn.innerHTML = `<span class="choice-visual">${n}</span><span class="choice-keycap">${keycapHTML(keyStr)}</span>`;
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


    setKeyHint(t('mathHint').replace('%d', n1).replace('%d', n2));
    setTimeout(() => Audio_.speak(`${n1} ${t('plus')} ${n2} ${t('equalsWhat')}`), 300);
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
    { word: 'DAY',      emoji: '\uD83C\uDF1E', category: 'thing' },

    // Engineering & Space
    { word: 'ROCKET',   emoji: '\uD83D\uDE80', category: 'engineering' },
    { word: 'GEAR',     emoji: '\u2699\uFE0F', category: 'engineering' },
    { word: 'BOLT',     emoji: '\uD83D\uDD29', category: 'engineering' },
    { word: 'TOWER',    emoji: '\uD83D\uDDFC', category: 'engineering' },
    { word: 'BRIDGE',   emoji: '\uD83C\uDF09', category: 'engineering' },
    { word: 'ROBOT',    emoji: '\uD83E\uDD16', category: 'engineering' },
    { word: 'CRANE',    emoji: '\uD83C\uDFD7\uFE0F', category: 'engineering' },
    { word: 'ENGINE',   emoji: '\uD83D\uDD27', category: 'engineering' },
    { word: 'WIRE',     emoji: '\uD83D\uDD0C', category: 'engineering' },

    // Cars & Vehicles
    { word: 'TIRE',     emoji: '\uD83D\uDEDE', category: 'car' },
    { word: 'BRAKE',    emoji: '\uD83D\uDED1', category: 'car' },
    { word: 'HORN',     emoji: '\uD83D\uDCEF', category: 'car' },
    { word: 'TRUCK',    emoji: '\uD83D\uDE9A', category: 'car' },
    { word: 'WHEEL',    emoji: '\u2B55', category: 'car' },
    { word: 'FUEL',     emoji: '\u26FD', category: 'car' },

    // Grown-up world
    { word: 'CLOCK',    emoji: '\u23F0', category: 'world' },
    { word: 'KEY',      emoji: '\uD83D\uDD11', category: 'world' },
    { word: 'PHONE',    emoji: '\uD83D\uDCF1', category: 'world' },
    { word: 'MONEY',    emoji: '\uD83D\uDCB5', category: 'world' },
    { word: 'MAIL',     emoji: '\uD83D\uDCEC', category: 'world' },
    { word: 'BANK',     emoji: '\uD83C\uDFE6', category: 'world' },
    { word: 'STORE',    emoji: '\uD83C\uDFEA', category: 'world' },
    { word: 'TICKET',   emoji: '\uD83C\uDFAB', category: 'world' },
    { word: 'SIGN',     emoji: '\uD83E\uDEA7', category: 'world' },
    { word: 'LAMP',     emoji: '\uD83D\uDCA1', category: 'world' },
    { word: 'LOCK',     emoji: '\uD83D\uDD12', category: 'world' },
    { word: 'STAMP',    emoji: '\uD83D\uDCEE', category: 'world' },
    { word: 'MAP',      emoji: '\uD83D\uDDFA\uFE0F', category: 'world' },
    { word: 'RECEIPT',  emoji: '\uD83E\uDDFE', category: 'world' },
    { word: 'BATTERY',  emoji: '\uD83D\uDD0B', category: 'world' },
    { word: 'WIFI',     emoji: '\uD83D\uDCF6', category: 'world' },
    { word: 'ELEVATOR', emoji: '\uD83D\uDED7', category: 'world' },
    { word: 'PROBABLY', emoji: '\uD83E\uDD14', category: 'world' },
    { word: 'GRATITUDE',emoji: '\uD83D\uDE4F', category: 'world' },

    // Feelings
    { word: 'HAPPY',    emoji: '\uD83D\uDE0A', category: 'feeling' },
    { word: 'SAD',      emoji: '\uD83D\uDE22', category: 'feeling' },
    { word: 'ANGRY',    emoji: '\uD83D\uDE20', category: 'feeling' },
    { word: 'SCARED',   emoji: '\uD83D\uDE28', category: 'feeling' },
    { word: 'BRAVE',    emoji: '\uD83E\uDDB8', category: 'feeling' },
    { word: 'LOVE',     emoji: '\u2764\uFE0F', category: 'feeling' },
    { word: 'PROUD',    emoji: '\uD83C\uDF1F', category: 'feeling' },
    { word: 'SHY',      emoji: '\uD83D\uDE33', category: 'feeling' },
    { word: 'CALM',     emoji: '\uD83D\uDE0C', category: 'feeling' },
    { word: 'SILLY',    emoji: '\uD83E\uDD2A', category: 'feeling' },
    { word: 'TIRED',    emoji: '\uD83E\uDD71', category: 'feeling' },
    { word: 'HUNGRY',   emoji: '\uD83E\uDD24', category: 'feeling' },
    { word: 'EXCITED',  emoji: '\uD83E\uDD29', category: 'feeling' },
    { word: 'KIND',     emoji: '\uD83E\uDD17', category: 'feeling' },
    { word: 'LONELY',   emoji: '\uD83E\uDEE5', category: 'feeling' },
    { word: 'JEALOUS',  emoji: '\uD83D\uDE12', category: 'feeling' },
    { word: 'CURIOUS',  emoji: '\uD83E\uDDD0', category: 'feeling' },
    { word: 'THANKFUL', emoji: '\uD83D\uDE07', category: 'feeling' },

    // Fruits & Vegetables
    { word: 'APPLE',    emoji: '\uD83C\uDF4E', category: 'food' },
    { word: 'BANANA',   emoji: '\uD83C\uDF4C', category: 'food' },
    { word: 'GRAPE',    emoji: '\uD83C\uDF47', category: 'food' },
    { word: 'LEMON',    emoji: '\uD83C\uDF4B', category: 'food' },
    { word: 'PEACH',    emoji: '\uD83C\uDF51', category: 'food' },
    { word: 'PEAR',     emoji: '\uD83C\uDF50', category: 'food' },
    { word: 'CORN',     emoji: '\uD83C\uDF3D', category: 'food' },
    { word: 'CARROT',   emoji: '\uD83E\uDD55', category: 'food' },
    { word: 'TOMATO',   emoji: '\uD83C\uDF45', category: 'food' },
    { word: 'ONION',    emoji: '\uD83E\uDDC5', category: 'food' },
    { word: 'POTATO',   emoji: '\uD83E\uDD54', category: 'food' },
    { word: 'MANGO',    emoji: '\uD83E\uDD6D', category: 'food' },
    { word: 'CHERRY',   emoji: '\uD83C\uDF52', category: 'food' },
    { word: 'MELON',    emoji: '\uD83C\uDF48', category: 'food' },
    { word: 'AVOCADO',  emoji: '\uD83E\uDD51', category: 'food' },
    { word: 'BROCCOLI', emoji: '\uD83E\uDD66', category: 'food' },
    { word: 'PEPPER',   emoji: '\uD83C\uDF36\uFE0F', category: 'food' },
    { word: 'PUMPKIN',  emoji: '\uD83C\uDF83', category: 'food' },

    // House & Household
    { word: 'BED',      emoji: '\uD83D\uDECF\uFE0F', category: 'house' },
    { word: 'TUB',      emoji: '\uD83D\uDEC1', category: 'house' },
    { word: 'DOOR',     emoji: '\uD83D\uDEAA', category: 'house' },
    { word: 'CHAIR',    emoji: '\uD83E\uDE91', category: 'house' },
    { word: 'COUCH',    emoji: '\uD83D\uDECB\uFE0F', category: 'house' },
    { word: 'TABLE',    emoji: '\uD83E\uDE91', category: 'house' },
    { word: 'WINDOW',   emoji: '\uD83E\uDE9F', category: 'house' },
    { word: 'STAIRS',   emoji: '\uD83E\uDDF1', category: 'house' },
    { word: 'KITCHEN',  emoji: '\uD83C\uDF73', category: 'house' },
    { word: 'BATH',     emoji: '\uD83D\uDEC0', category: 'house' },
    { word: 'ROOF',     emoji: '\uD83C\uDFE0', category: 'house' },
    { word: 'FLOOR',    emoji: '\uD83E\uDDF1', category: 'house' },
    { word: 'SINK',     emoji: '\uD83D\uDEB0', category: 'house' },
    { word: 'SOAP',     emoji: '\uD83E\uDDFC', category: 'house' },
    { word: 'TOWEL',    emoji: '\uD83E\uDD9B', category: 'house' },
    { word: 'PILLOW',   emoji: '\uD83D\uDECC', category: 'house' },
    { word: 'MIRROR',   emoji: '\uD83E\uDE9E', category: 'house' },
    { word: 'BLANKET',  emoji: '\uD83D\uDECC', category: 'house' },
    { word: 'FRIDGE',   emoji: '\uD83E\uDDCA', category: 'house' },
    { word: 'OVEN',     emoji: '\uD83C\uDF73', category: 'house' },
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

/**
 * Refills and shuffles the words queue from WORDS_DATA, filtered
 * by current difficulty (star count).
 */
function shuffleWordsQueue() {
    // Progressive: stars 0-2 use words with ≤ 4 letters, stars 3+ use all
    const maxLen = stars < 3 ? 4 : Infinity;
    const pool = WORDS_DATA.filter(w => w.word.length <= maxLen);
    wordsQueue = shuffle([...pool]);
}

/** @type {boolean} True when the player is choosing a word, false when spelling */
let wordSelecting = true;

/** @type {number|null} Timer for auto-scrolling the random word display */
let wordCarouselTimer = null;

/** @type {Array<{word: string, emoji: string, category: string}>} Shuffled pool for random rotation */
let wordCarouselPool = [];

/** @type {number} Current index in the random rotation */
let wordCarouselIdx = 0;

/**
 * Quick-pick favorite words with dedicated number keys.
 * @type {Array<{key: string, word: string, emoji: string}>}
 */
const WORD_FAVORITES = [
    { key: '1', word: 'LUA',  emoji: '\uD83D\uDC67' },
    { key: '2', word: 'SORA', emoji: '\uD83D\uDC76' },
    { key: '3', word: 'MAMA', emoji: '\uD83D\uDC69' },
    { key: '4', word: 'DADA', emoji: '\uD83D\uDC68' },
    { key: '5', word: 'LOVE', emoji: '\u2764\uFE0F' },
    { key: '6', word: 'CAT',  emoji: '\uD83D\uDC31' },
    { key: '7', word: 'ROCKET', emoji: '\uD83D\uDE80' },
    { key: '8', word: 'HAPPY', emoji: '\uD83D\uDE0A' },
];

/**
 * Sets up a Words round: shows a random word rotating in the center
 * (Space to pick it) plus quick-pick favorites on number keys.
 */
function wordsRound() {
    wordSelecting = true;
    currentWordData = null;
    currentWordLetterIdx = 0;

    promptEmoji.textContent = '\uD83D\uDCDD';
    promptText.innerHTML = t('pickWord');

    // Build shuffled pool for random rotation (filtered by difficulty)
    const maxLen = stars < 3 ? 4 : Infinity;
    wordCarouselPool = shuffle(WORDS_DATA.filter(w => w.word.length <= maxLen));
    wordCarouselIdx = 0;

    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    activeKeyMap = {};

    renderWordPicker();
    startWordCarouselTimer();

    setKeyHint(t('pickWordHint'));
    setTimeout(() => Audio_.speak(t('pickWord')), 300);
}

/** Renders the word picker: rotating random word + quick-pick favorites. */
function renderWordPicker() {
    const cur = wordCarouselPool[wordCarouselIdx];

    let html = '<div class="word-carousel">' +
        '<div class="carousel-current">' + cur.emoji + ' ' + cur.word + '</div>' +
    '</div>' +
    '<div class="carousel-controls">' +
        keycapHTML('Space', 'large active-key') + ' <span class="carousel-or">' + t('orPick') + '</span>' +
    '</div>' +
    '<div class="word-favorites">';

    WORD_FAVORITES.forEach(fav => {
        html += '<div class="fav-word">' + keycapHTML(fav.key, 'small') + ' ' + fav.emoji + ' ' + fav.word + '</div>';
    });

    html += '</div>';
    extraArea.innerHTML = html;
}

/** Starts the auto-scroll timer for the random word display. */
function startWordCarouselTimer() {
    clearInterval(wordCarouselTimer);
    wordCarouselTimer = setInterval(() => {
        if (!wordSelecting) return;
        wordCarouselIdx = (wordCarouselIdx + 1) % wordCarouselPool.length;
        // Only update the rotating word, not the whole picker
        const curEl = extraArea.querySelector('.carousel-current');
        if (curEl) {
            const cur = wordCarouselPool[wordCarouselIdx];
            curEl.textContent = cur.emoji + ' ' + cur.word;
        }
    }, 1500);
}

/**
 * Selects a word (from carousel or quick-pick) and switches to spelling mode.
 * @param {{word: string, emoji: string, category: string}} wordObj
 */
function selectWord(wordObj) {
    if (inputLocked || !wordSelecting) return;
    clearInterval(wordCarouselTimer);
    wordSelecting = false;
    currentWordData = wordObj;
    currentWordLetterIdx = 0;

    Audio_.tap();
    promptEmoji.textContent = currentWordData.emoji;
    promptText.innerHTML = t('spellWord');

    renderWordLetters();

    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';

    updateWordKeyMap();

    setTimeout(() => Audio_.speak(`${t('spell')} ${currentWordData.word}! ${t('press')} ${currentWordData.word[0]}!`), 300);
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
        setKeyHint(`${t('press')} ${currentLetter}!`);
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

            const enc = t('encouragements');
            setTimeout(() => Audio_.speak(`${enc[Math.floor(Math.random() * enc.length)]} ${currentWordData.word}!`), 400);

            setTimeout(() => {
                if (stars < MAX_STARS) {
                    inputLocked = false;
                    nextRound();
                }
            }, 1600);
        } else {
            updateWordKeyMap();
            // Speak next letter (delay so the correct chime finishes first)
            setTimeout(() => Audio_.speak(`${currentWordData.word[currentWordLetterIdx]}!`, 1.0), 500);
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
        // Speak the expected letter to help the child learn
        setTimeout(() => Audio_.speak(`${t('press')} ${expected.toUpperCase()}!`, 1.0), 500);
    }
}

// ============================================
// PATTERNS Game — "What comes next?" press 1, 2, 3, 4
// ============================================

/**
 * Pattern templates. Each defines a repeating sequence and the display pool.
 * The pattern array indices refer into the pool for that round.
 * @type {Array<{name: string, pool: string[], pattern: number[]}>}
 */
const PATTERNS_DATA = [
    // AB patterns (simplest)
    { name: 'fruits',   pool: ['🍎', '🍌'],           pattern: [0, 1, 0, 1, 0, 1] },
    { name: 'animals',  pool: ['🐱', '🐕'],           pattern: [0, 1, 0, 1, 0, 1] },
    { name: 'sky',      pool: ['⭐', '🌙'],           pattern: [0, 1, 0, 1, 0, 1] },
    { name: 'nature',   pool: ['🌸', '🌿'],           pattern: [0, 1, 0, 1, 0, 1] },
    { name: 'food',     pool: ['🍪', '🍩'],           pattern: [0, 1, 0, 1, 0, 1] },
    { name: 'hearts',   pool: ['❤️', '💙'],           pattern: [0, 1, 0, 1, 0, 1] },
    // ABC patterns
    { name: 'trio',     pool: ['🔴', '🟡', '🔵'],     pattern: [0, 1, 2, 0, 1, 2] },
    { name: 'pets',     pool: ['🐱', '🐕', '🐟'],     pattern: [0, 1, 2, 0, 1, 2] },
    { name: 'weather',  pool: ['☀️', '☁️', '🌧️'],    pattern: [0, 1, 2, 0, 1, 2] },
    { name: 'shapes',   pool: ['🔵', '🟢', '🟣'],     pattern: [0, 1, 2, 0, 1, 2] },
    // AABB patterns
    { name: 'double',   pool: ['🎈', '🎀'],           pattern: [0, 0, 1, 1, 0, 0] },
    { name: 'paired',   pool: ['🐻', '🐰'],           pattern: [0, 0, 1, 1, 0, 0] },
    // ABB patterns
    { name: 'abb1',     pool: ['🌟', '🌈'],           pattern: [0, 1, 1, 0, 1, 1] },
    { name: 'abb2',     pool: ['🍎', '🍊'],           pattern: [0, 1, 1, 0, 1, 1] },
];

/**
 * Sets up a Patterns round: shows a sequence of emojis with the last
 * one hidden as "?", and 4 choices for what comes next. Keys 1-4.
 */
function patternsRound() {
    // Progressive: stars 0-4 use AB patterns only (first 6), stars 5+ use all patterns
    const pool = stars < 3 ? PATTERNS_DATA.slice(0, 6) : PATTERNS_DATA;
    const template = pool[Math.floor(Math.random() * pool.length)];
    const sequence = template.pattern.map(i => template.pool[i]);

    // The answer is the last item; show all but last, then "?"
    const shown = sequence.slice(0, -1);
    const answer = sequence[sequence.length - 1];

    // Build wrong choices from the pool + some random emojis
    const distractors = ['🎪', '🎭', '🎯', '🎲', '🦄', '🌻', '🍕', '🎸'];
    const wrongPool = [...template.pool.filter(e => e !== answer), ...distractors];
    const options = pickN([answer, ...wrongPool], 4, answer);
    const correctIdx = options.indexOf(answer);

    promptEmoji.textContent = '\uD83D\uDD01';
    promptText.innerHTML = t('whatNext');

    // Show the pattern sequence
    let patternHTML = '<div class="pattern-display">';
    shown.forEach((item, i) => {
        patternHTML += `<span class="pattern-item" style="animation-delay:${i * 0.08}s">${item}</span>`;
    });
    patternHTML += '<span class="pattern-item mystery">❓</span>';
    patternHTML += '</div>';
    extraArea.innerHTML = patternHTML;

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((item, i) => {
        const keyNum = String(i + 1);
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.dataset.key = keyNum;
        btn.innerHTML = `<span class="choice-visual">${item}</span><span class="choice-keycap">${keycapHTML(keyNum)}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
            // Reveal the answer in the pattern
            const mystery = extraArea.querySelector('.pattern-item.mystery');
            if (mystery) {
                mystery.textContent = answer;
                mystery.classList.remove('mystery');
                mystery.style.border = '3px solid var(--green)';
                mystery.style.background = 'linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(46, 204, 113, 0.1))';
            }
        }));
        choicesEl.appendChild(btn);
        activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);


    setKeyHint(t('whatNext'));
    setTimeout(() => Audio_.speak(t('whatNextPattern')), 300);
}

// ============================================
// RHYMES Game — "What rhymes with ___?" press 1, 2, 3, 4
// ============================================

/**
 * Rhyme groups for the Rhymes game. Each group contains words that rhyme.
 * @type {Array<{words: Array<{word: string, emoji: string}>}>}
 */
const RHYMES_DATA = [
    { words: [{ word: 'CAT', emoji: '🐱' }, { word: 'HAT', emoji: '🎩' }, { word: 'BAT', emoji: '🦇' }, { word: 'MAT', emoji: '🟫' }] },
    { words: [{ word: 'DOG', emoji: '🐕' }, { word: 'LOG', emoji: '🪵' }, { word: 'FOG', emoji: '🌫️' }, { word: 'FROG', emoji: '🐸' }] },
    { words: [{ word: 'BEAR', emoji: '🐻' }, { word: 'HAIR', emoji: '💇' }, { word: 'CHAIR', emoji: '🪑' }, { word: 'PEAR', emoji: '🍐' }] },
    { words: [{ word: 'BEE', emoji: '🐝' }, { word: 'TREE', emoji: '🌳' }, { word: 'KEY', emoji: '🔑' }, { word: 'SEA', emoji: '🌊' }] },
    { words: [{ word: 'FISH', emoji: '🐟' }, { word: 'DISH', emoji: '🍽️' }, { word: 'WISH', emoji: '🌠' }] },
    { words: [{ word: 'CAKE', emoji: '🎂' }, { word: 'LAKE', emoji: '🏞️' }, { word: 'SNAKE', emoji: '🐍' }, { word: 'RAKE', emoji: '🧹' }] },
    { words: [{ word: 'MOON', emoji: '🌙' }, { word: 'SPOON', emoji: '🥄' }, { word: 'TUNE', emoji: '🎵' }, { word: 'BALLOON', emoji: '🎈' }] },
    { words: [{ word: 'STAR', emoji: '⭐' }, { word: 'CAR', emoji: '🚗' }, { word: 'JAR', emoji: '🏺' }, { word: 'FAR', emoji: '🔭' }] },
    { words: [{ word: 'KING', emoji: '🤴' }, { word: 'RING', emoji: '💍' }, { word: 'SING', emoji: '🎤' }, { word: 'WING', emoji: '🪽' }] },
    { words: [{ word: 'SUN', emoji: '☀️' }, { word: 'FUN', emoji: '🎉' }, { word: 'RUN', emoji: '🏃' }, { word: 'BUN', emoji: '🍔' }] },
    { words: [{ word: 'PIG', emoji: '🐷' }, { word: 'BIG', emoji: '🏔️' }, { word: 'DIG', emoji: '⛏️' }, { word: 'WIG', emoji: '👩' }] },
    { words: [{ word: 'BALL', emoji: '⚽' }, { word: 'TALL', emoji: '🦒' }, { word: 'WALL', emoji: '🧱' }, { word: 'FALL', emoji: '🍂' }] },
    { words: [{ word: 'BOAT', emoji: '⛵' }, { word: 'GOAT', emoji: '🐐' }, { word: 'COAT', emoji: '🧥' }] },
    { words: [{ word: 'RAIN', emoji: '🌧️' }, { word: 'TRAIN', emoji: '🚂' }, { word: 'BRAIN', emoji: '🧠' }, { word: 'PLANE', emoji: '✈️' }] },
    { words: [{ word: 'BUG', emoji: '🐛' }, { word: 'HUG', emoji: '🤗' }, { word: 'MUG', emoji: '☕' }, { word: 'RUG', emoji: '🟤' }] },
];

/**
 * Non-rhyming distractor words used when a rhyme group has fewer than 4 words.
 * @type {Array<{word: string, emoji: string}>}
 */
const RHYME_DISTRACTORS = [
    { word: 'BOOK', emoji: '📖' }, { word: 'DUCK', emoji: '🦆' }, { word: 'SHOE', emoji: '👟' },
    { word: 'LAMP', emoji: '💡' }, { word: 'DRUM', emoji: '🥁' }, { word: 'MILK', emoji: '🥛' },
    { word: 'SOCK', emoji: '🧦' }, { word: 'BELL', emoji: '🔔' }, { word: 'FROG', emoji: '🐸' },
    { word: 'NEST', emoji: '🪹' }, { word: 'CLOUD', emoji: '☁️' }, { word: 'BIRD', emoji: '🐦' },
];

/**
 * Sets up a Rhymes round: picks a prompt word from a rhyme group, shows
 * one correct rhyming word and 3 wrong choices. Keys 1-4.
 */
function rhymesRound() {
    const group = RHYMES_DATA[Math.floor(Math.random() * RHYMES_DATA.length)];
    // Pick a prompt word and a different rhyming answer
    const shuffledGroup = shuffle(group.words);
    const prompt = shuffledGroup[0];
    const answer = shuffledGroup[1];

    // Build wrong choices: pick from distractors that aren't in this rhyme group
    const groupWords = group.words.map(w => w.word);
    const wrongPool = RHYME_DISTRACTORS.filter(d => !groupWords.includes(d.word));
    const wrongChoices = shuffle(wrongPool).slice(0, 3);

    const options = shuffle([answer, ...wrongChoices]);
    const correctIdx = options.indexOf(answer);

    promptEmoji.textContent = prompt.emoji;
    promptText.innerHTML = `${t('whatRhymes')} <b>${prompt.word}</b>?`;
    extraArea.innerHTML = '';

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((item, i) => {
        const keyNum = String(i + 1);
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.dataset.key = keyNum;
        btn.innerHTML = `<span class="choice-visual">${item.emoji}</span><span class="choice-label">${item.word}</span><span class="choice-keycap">${keycapHTML(keyNum)}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx));
        choicesEl.appendChild(btn);
        activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);


    setKeyHint(`${t('whatRhymes')} ${prompt.word}?`);
    setTimeout(() => Audio_.speak(`${t('whatRhymes')} ${prompt.word}?`), 300);
}

// ============================================
// ELEMENTS Game — "Periodic Table" style element identification
// ============================================

/**
 * Element data for the Periodic Table game. Each element has its atomic number,
 * symbol, name, a kid-friendly emoji, color category, and a fun fact.
 * @type {Array<{number: number, symbol: string, name: string, emoji: string, category: string, color: string, fact: string}>}
 */
const ELEMENTS_DATA = [
    { number: 1,  symbol: 'H',  name: 'Hydrogen',  pt: 'Hidrog\u00EAnio',  emoji: '\uD83D\uDCA7', category: 'gas',        color: '#5DADE2', fact: 'The lightest element! It makes water.', ptFact: 'O elemento mais leve! Ele faz \u00E1gua.' },
    { number: 2,  symbol: 'He', name: 'Helium',     pt: 'H\u00E9lio',      emoji: '\uD83C\uDF88', category: 'noble gas',  color: '#AF7AC5', fact: 'Makes balloons float up high!', ptFact: 'Faz os bal\u00F5es flutuarem bem alto!' },
    { number: 6,  symbol: 'C',  name: 'Carbon',     pt: 'Carbono',         emoji: '\u2666\uFE0F', category: 'nonmetal',   color: '#5D6D7E', fact: 'Diamonds and pencils are made of this!', ptFact: 'Diamantes e l\u00E1pis s\u00E3o feitos disso!' },
    { number: 7,  symbol: 'N',  name: 'Nitrogen',   pt: 'Nitrog\u00EAnio', emoji: '\uD83C\uDF2C\uFE0F', category: 'gas', color: '#5DADE2', fact: 'Most of the air you breathe is nitrogen!', ptFact: 'A maior parte do ar que voc\u00EA respira \u00E9 nitrog\u00EAnio!' },
    { number: 8,  symbol: 'O',  name: 'Oxygen',     pt: 'Oxig\u00EAnio',   emoji: '\uD83E\uDE7B', category: 'gas',        color: '#5DADE2', fact: 'You need this to breathe!', ptFact: 'Voc\u00EA precisa disso para respirar!' },
    { number: 10, symbol: 'Ne', name: 'Neon',        pt: 'Ne\u00F4nio',     emoji: '\uD83D\uDCA1', category: 'noble gas',  color: '#AF7AC5', fact: 'Makes bright glowing signs!', ptFact: 'Faz placas brilhantes!' },
    { number: 11, symbol: 'Na', name: 'Sodium',      pt: 'S\u00F3dio',      emoji: '\uD83E\uDDC2', category: 'metal',      color: '#F5B041', fact: 'Found in table salt!', ptFact: 'Encontrado no sal de cozinha!' },
    { number: 12, symbol: 'Mg', name: 'Magnesium',   pt: 'Magn\u00E9sio',   emoji: '\u2728',       category: 'metal',      color: '#F5B041', fact: 'Burns with a super bright sparkle!', ptFact: 'Queima com um brilho super forte!' },
    { number: 13, symbol: 'Al', name: 'Aluminum',    pt: 'Alum\u00EDnio',   emoji: '\uD83E\uDD6B', category: 'metal',      color: '#F5B041', fact: 'Wraps your food to keep it fresh!', ptFact: 'Embrulha sua comida para manter fresca!' },
    { number: 14, symbol: 'Si', name: 'Silicon',     pt: 'Sil\u00EDcio',    emoji: '\uD83D\uDCBB', category: 'metalloid',  color: '#45B39D', fact: 'Used to make computer chips!', ptFact: 'Usado para fazer chips de computador!' },
    { number: 16, symbol: 'S',  name: 'Sulfur',      pt: 'Enxofre',         emoji: '\uD83D\uDCA9', category: 'nonmetal',   color: '#F4D03F', fact: 'Smells like rotten eggs! Stinky!', ptFact: 'Cheira a ovo podre! Que fedor!' },
    { number: 20, symbol: 'Ca', name: 'Calcium',     pt: 'C\u00E1lcio',     emoji: '\uD83E\uDDB4', category: 'metal',      color: '#F5B041', fact: 'Makes your bones and teeth strong!', ptFact: 'Deixa seus ossos e dentes fortes!' },
    { number: 26, symbol: 'Fe', name: 'Iron',        pt: 'Ferro',           emoji: '\uD83E\uDDF2', category: 'metal',      color: '#E74C3C', fact: 'Makes things magnetic and strong!', ptFact: 'Faz coisas magn\u00E9ticas e fortes!' },
    { number: 29, symbol: 'Cu', name: 'Copper',      pt: 'Cobre',           emoji: '\uD83E\uDE99', category: 'metal',      color: '#E67E22', fact: 'Shiny pennies are made of this!', ptFact: 'Moedas brilhantes s\u00E3o feitas disso!' },
    { number: 47, symbol: 'Ag', name: 'Silver',      pt: 'Prata',           emoji: '\uD83E\uDD48', category: 'metal',      color: '#BDC3C7', fact: 'Shiny and sparkly like jewelry!', ptFact: 'Brilhante como uma j\u00F3ia!' },
    { number: 79, symbol: 'Au', name: 'Gold',        pt: 'Ouro',            emoji: '\uD83E\uDD47', category: 'metal',      color: '#F1C40F', fact: 'The most precious yellow metal!', ptFact: 'O metal amarelo mais precioso!' },
    { number: 80, symbol: 'Hg', name: 'Mercury',     pt: 'Merc\u00FArio',   emoji: '\uD83C\uDF21\uFE0F', category: 'metal', color: '#BDC3C7', fact: 'A liquid metal used in thermometers!', ptFact: 'Um metal l\u00EDquido usado em term\u00F4metros!' },
    { number: 82, symbol: 'Pb', name: 'Lead',        pt: 'Chumbo',          emoji: '\u2B1B',       category: 'metal',      color: '#5D6D7E', fact: 'Very heavy! Used in shields.', ptFact: 'Muito pesado! Usado em escudos.' },
    { number: 50, symbol: 'Sn', name: 'Tin',         pt: 'Estanho',         emoji: '\uD83E\uDD6B', category: 'metal',      color: '#BDC3C7', fact: 'Used to make cans for food!', ptFact: 'Usado para fazer latas de comida!' },
    { number: 78, symbol: 'Pt', name: 'Platinum',    pt: 'Platina',         emoji: '\uD83D\uDC8E', category: 'metal',      color: '#D5D8DC', fact: 'Even more rare than gold!', ptFact: 'Ainda mais rara que ouro!' },
];

/**
 * Sets up an Elements round. Shows an element card with its symbol and atomic
 * number, then asks the child to identify the element name from 4 choices.
 * At 5+ stars, shows only the symbol (no atomic number hint).
 */
function elementsRound() {
    const correct = ELEMENTS_DATA[Math.floor(Math.random() * ELEMENTS_DATA.length)];
    const options = pickN(ELEMENTS_DATA, 4, correct);
    const correctIdx = options.indexOf(correct);

    promptEmoji.textContent = '\u269B\uFE0F';
    promptText.innerHTML = t('whatElement');

    // Build the element card display
    const showNumber = stars < 3;
    extraArea.innerHTML = `
        <div class="element-card-display">
            <div class="element-card-big" style="border-color:${correct.color}; background: linear-gradient(135deg, ${correct.color}22, ${correct.color}11);">
                ${showNumber ? `<span class="element-number">${correct.number}</span>` : ''}
                <span class="element-symbol" style="color:${correct.color}">${correct.symbol}</span>
                <span class="element-emoji">${correct.emoji}</span>
            </div>
        </div>
    `;

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((el, i) => {
        const keyNum = String(i + 1);
        const btn = document.createElement('button');
        btn.className = 'choice-btn element-choice';
        btn.dataset.key = keyNum;
        btn.innerHTML = `<span class="choice-visual">${el.emoji}</span>${bilingualLabel(el.name, el.pt)}<span class="choice-keycap">${keycapHTML(keyNum)}</span>`;
        btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
            // Show the fun fact after correct answer
            const factDiv = document.createElement('div');
            factDiv.className = 'element-fact';
            factDiv.textContent = lang === 'pt' ? correct.ptFact : correct.fact;
            extraArea.appendChild(factDiv);
        }));
        choicesEl.appendChild(btn);
        activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);


    setKeyHint(`${t('whatSymbol')} ${correct.symbol}?`);
    setTimeout(() => Audio_.speak(`${t('whatSymbol')} ${correct.symbol}?`), 300);
}

// ============================================
// MEMORY Game — flip matching pairs with keys 1-8
// ============================================

/**
 * Emoji pool for memory cards.
 * @type {string[]}
 */
const MEMORY_EMOJIS = ['🐱', '🐕', '🌟', '🎈', '🍎', '🐸', '🌈', '🎂', '🦋', '🐻', '🌻', '🍕', '🚀', '🐝', '🎵', '🐷'];

/**
 * State for the current memory game.
 * @type {{cards: string[], revealed: boolean[], matched: boolean[], firstFlip: number|null, pairsLeft: number}}
 */
let memoryState = { cards: [], revealed: [], matched: [], firstFlip: null, pairsLeft: 0 };

/**
 * Sets up a Memory round: creates a 4x2 grid of 4 pairs (8 cards),
 * all face-down. Player presses 1-8 to flip cards and find matches.
 */
function memoryRound() {
    // Pick 4 random emojis, duplicate for pairs, shuffle
    const picked = shuffle(MEMORY_EMOJIS).slice(0, 4);
    const cards = shuffle([...picked, ...picked]);

    memoryState = {
        cards: cards,
        revealed: new Array(8).fill(false),
        matched: new Array(8).fill(false),
        firstFlip: null,
        pairsLeft: 4,
    };

    promptEmoji.textContent = '\uD83E\uDDE0';
    promptText.innerHTML = t('remember');
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';

    // Peek: briefly show all cards face-up so the child can memorize
    inputLocked = true;
    memoryState.revealed.fill(true);
    renderMemoryGrid();
    setKeyHint(t('rememberHint'));
    setTimeout(() => Audio_.speak(t('lookRemember')), 300);

    // Flip cards back after peek duration (progressive: less time at higher stars)
    const peekTime = stars < 3 ? 2500 : 1500;
    setTimeout(() => {
        memoryState.revealed.fill(false);
        renderMemoryGrid();
        inputLocked = false;
        promptText.innerHTML = t('findPairs');
        setKeyHint(t('flipCard'));
    }, peekTime);
}

/** Renders the 4x2 memory card grid into extraArea. */
function renderMemoryGrid() {
    let html = '<div class="memory-grid">';
    for (let i = 0; i < 8; i++) {
        const keyNum = String(i + 1);
        if (memoryState.matched[i]) {
            html += `<div class="memory-card matched"><span>${memoryState.cards[i]}</span><span class="memory-keycap">${keycapHTML(keyNum)}</span></div>`;
        } else if (memoryState.revealed[i]) {
            html += `<div class="memory-card face-up"><span>${memoryState.cards[i]}</span><span class="memory-keycap">${keycapHTML(keyNum)}</span></div>`;
        } else {
            html += `<div class="memory-card face-down"><span class="memory-keycap">${keycapHTML(keyNum, 'active-key')}</span></div>`;
        }
    }
    html += '</div>';
    const pairsText = lang === 'pt'
        ? `${memoryState.pairsLeft} par${memoryState.pairsLeft !== 1 ? 'es' : ''} restante${memoryState.pairsLeft !== 1 ? 's' : ''}`
        : `${memoryState.pairsLeft} pair${memoryState.pairsLeft !== 1 ? 's' : ''} left`;
    html += `<div class="memory-pairs-left">${pairsText}</div>`;
    extraArea.innerHTML = html;
}

/**
 * Handles a keypress in Memory mode. Flips cards, checks for matches,
 * and awards a star for each matched pair.
 * @param {string} key - Key pressed ('1'-'8')
 */
function handleMemoryKeyPress(key) {
    if (inputLocked) return;
    const idx = parseInt(key) - 1;
    if (idx < 0 || idx >= 8) return;
    if (memoryState.matched[idx] || memoryState.revealed[idx]) return;

    Audio_.tap();
    memoryState.revealed[idx] = true;
    renderMemoryGrid();

    if (memoryState.firstFlip === null) {
        // First card of a pair
        memoryState.firstFlip = idx;
        setKeyHint(t('flipAnother'));
    } else {
        // Second card
        const first = memoryState.firstFlip;
        memoryState.firstFlip = null;
        inputLocked = true;

        if (memoryState.cards[first] === memoryState.cards[idx]) {
            // Match!
            setTimeout(() => {
                memoryState.matched[first] = true;
                memoryState.matched[idx] = true;
                memoryState.pairsLeft--;
                renderMemoryGrid();

                Audio_.correct();
                showCelebration();
                earnStar();

                const matchEnc = t('match');
                setTimeout(() => Audio_.speak(matchEnc[Math.floor(Math.random() * matchEnc.length)]), 400);

                setTimeout(() => {
                    inputLocked = false;
                    if (memoryState.pairsLeft <= 0) {
                        // All pairs found — this counts as extra celebration
                        // Stars are already given per pair, move to next round
                        if (stars < MAX_STARS) {
                            nextRound();
                        }
                    } else {
                        setKeyHint(t('flipCard'));
                    }
                }, 800);
            }, 300);
        } else {
            // No match — flip both back after a delay
            Audio_.wrong();
            resetStreak();
            setTimeout(() => Audio_.speak(t('notMatch')), 300);
            setTimeout(() => {
                memoryState.revealed[first] = false;
                memoryState.revealed[idx] = false;
                renderMemoryGrid();
                inputLocked = false;
                setKeyHint(t('tryAgainFlip'));
            }, 1200);
        }
    }
}
