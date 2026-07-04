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
  { name: 'red', pt: 'vermelho', hex: '#e74c3c' },
  { name: 'blue', pt: 'azul', hex: '#3498db' },
  { name: 'yellow', pt: 'amarelo', hex: '#f1c40f' },
  { name: 'green', pt: 'verde', hex: '#2ecc71' },
  { name: 'orange', pt: 'laranja', hex: '#e67e22' },
  { name: 'purple', pt: 'roxo', hex: '#9b59b6' },
  { name: 'pink', pt: 'rosa', hex: '#ff6b9d' },
  { name: 'brown', pt: 'marrom', hex: '#8B4513' },
];

/**
 * Advanced colors added at 5+ stars for extra challenge.
 * @type {Array<{name: string, hex: string}>}
 */
const COLORS_ADVANCED = [
  { name: 'teal', pt: 'azul-petr\u00F3leo', hex: '#008080' },
  { name: 'coral', pt: 'coral', hex: '#FF7F50' },
  { name: 'navy', pt: 'azul-marinho', hex: '#001F3F' },
  { name: 'lavender', pt: 'lavanda', hex: '#B57EDC' },
  { name: 'maroon', pt: 'bord\u00F4', hex: '#800000' },
  { name: 'lime', pt: 'lima', hex: '#32CD32' },
  { name: 'cyan', pt: 'ciano', hex: '#00BCD4' },
  { name: 'gold', pt: 'dourado', hex: '#FFD700' },
  { name: 'magenta', pt: 'magenta', hex: '#FF00FF' },
  { name: 'peach', pt: 'p\u00EAssego', hex: '#FFCBA4' },
  { name: 'olive', pt: 'oliva', hex: '#808000' },
  { name: 'salmon', pt: 'salm\u00E3o', hex: '#FA8072' },
  { name: 'indigo', pt: '\u00EDndigo', hex: '#4B0082' },
  { name: 'crimson', pt: 'carmesim', hex: '#DC143C' },
  { name: 'turquoise', pt: 'turquesa', hex: '#40E0D0' },
  { name: 'tan', pt: 'bege', hex: '#D2B48C' },
];

/**
 * Sets up a Colors round: picks a target color, shows 4 swatch choices,
 * maps keys 1-4 to choices, and speaks the prompt.
 * Level 0: 8 basic colors, Level 1: 24 colors, Level 2: 24 + reverse (show swatch, name the color)
 */
function colorsRound() {
  const level = getLevel('colors');
  const colorPool = level === 0 ? COLORS_BASIC : [...COLORS_BASIC, ...COLORS_ADVANCED];
  const correct = colorPool[Math.floor(Math.random() * colorPool.length)];
  const options = pickN(colorPool, 4, correct);
  const correctIdx = options.indexOf(correct);

  const displayName = lang === 'pt' ? correct.pt : correct.name;

  // Level 2: reverse mode — show the swatch, pick the name
  if (level === 2) {
    promptEmoji.textContent = '\uD83C\uDFA8';
    promptText.innerHTML = `${t('nameColor')}`;
    extraArea.innerHTML = `<div style="display:flex;justify-content:center;margin:8px 0 12px;"><div class="color-swatch-big" style="background:${correct.hex}"></div></div>`;

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((c, i) => {
      const keyNum = String(i + 1);
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.dataset.key = keyNum;
      btn.innerHTML = `${bilingualLabel(c.name, c.pt)}<span class="choice-keycap">${keycapHTML(keyNum)}</span>`;
      btn.addEventListener('click', () => handleAnswer(i, correctIdx));
      choicesEl.appendChild(btn);
      activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);

    setKeyHint(lang === 'pt' ? 'Qual \u00E9 essa cor?' : 'What color is this?');
    setTimeout(() => Audio_.speak(lang === 'pt' ? 'Qual \u00E9 essa cor?' : 'What color is this?'), 300);
    return;
  }

  // Level 0 & 1: standard — show name, pick the swatch
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
  { name: 'circle', pt: 'círculo', svg: `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" fill="#4dc9f6"/></svg>` },
  { name: 'square', pt: 'quadrado', svg: `<svg viewBox="0 0 80 80"><rect x="8" y="8" width="64" height="64" rx="4" fill="#2ecc71"/></svg>` },
  { name: 'triangle', pt: 'triângulo', svg: `<svg viewBox="0 0 80 80"><polygon points="40,5 75,75 5,75" fill="#f1c40f"/></svg>` },
  { name: 'star', pt: 'estrela', svg: `<svg viewBox="0 0 80 80"><polygon points="40,5 50,30 78,30 55,48 63,75 40,58 17,75 25,48 2,30 30,30" fill="#e67e22"/></svg>` },
  { name: 'heart', pt: 'coração', svg: `<svg viewBox="0 0 80 80"><path d="M40,72 C20,50 5,35 5,22 C5,12 13,4 23,4 C30,4 36,8 40,14 C44,8 50,4 57,4 C67,4 75,12 75,22 C75,35 60,50 40,72Z" fill="#e74c3c"/></svg>` },
  { name: 'hexagon', pt: 'hexágono', svg: `<svg viewBox="0 0 80 80"><polygon points="20,10 60,10 70,40 60,70 20,70 10,40" fill="#9b59b6"/></svg>` },
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
const COUNT_EMOJIS = ['🍎', '🐱', '⭐', '🌸', '🐟', '🎈', '🍪', '🦋', '🐸', '🍌'];

/**
 * Target + distractor emoji sets for Count Level 1 (moving mix).
 */
const COUNT_MOVING_SETS = [
  { target: '🦋', targetName: 'butterflies', targetPt: 'borboletas', distractor: '🐝' },
  { target: '🐟', targetName: 'fish', targetPt: 'peixes', distractor: '🐙' },
  { target: '⭐', targetName: 'stars', targetPt: 'estrelas', distractor: '🌙' },
  { target: '🍎', targetName: 'apples', targetPt: 'maçãs', distractor: '🍊' },
  { target: '🐱', targetName: 'cats', targetPt: 'gatos', distractor: '🐕' },
  { target: '🌸', targetName: 'flowers', targetPt: 'flores', distractor: '🍃' },
  { target: '🐸', targetName: 'frogs', targetPt: 'sapos', distractor: '🐢' },
  { target: '🎈', targetName: 'balloons', targetPt: 'balões', distractor: '🪁' },
];

/**
 * Geometry shape data shared between Count Level 2 and Geometry game.
 */
const GEOMETRY_SHAPES = [
  {
    name: 'circle', pt: 'círculo', sides: 0, corners: 0, color: '#4dc9f6',
    svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="#4dc9f6" stroke="#fff" stroke-width="2"/></svg>',
    svgVertices: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="#4dc9f6" stroke="#fff" stroke-width="2"/></svg>',
    factEn: 'A circle has no straight sides — it curves forever!',
    factPt: 'Um círculo não tem lados retos — ele curva para sempre!',
  },
  {
    name: 'triangle', pt: 'triângulo', sides: 3, corners: 3, color: '#f1c40f',
    svg: '<svg viewBox="0 0 100 100"><polygon points="50,8 92,88 8,88" fill="#f1c40f" stroke="#fff" stroke-width="2"/></svg>',
    svgVertices: '<svg viewBox="0 0 100 100"><polygon points="50,8 92,88 8,88" fill="#f1c40f" stroke="#fff" stroke-width="2"/><circle cx="50" cy="8" r="5" fill="white"/><circle cx="92" cy="88" r="5" fill="white"/><circle cx="8" cy="88" r="5" fill="white"/></svg>',
    factEn: 'Tri means 3 — a triangle has 3 sides and 3 corners!',
    factPt: 'Tri quer dizer 3 — um triângulo tem 3 lados e 3 cantos!',
  },
  {
    name: 'square', pt: 'quadrado', sides: 4, corners: 4, color: '#2ecc71',
    svg: '<svg viewBox="0 0 100 100"><rect x="12" y="12" width="76" height="76" rx="2" fill="#2ecc71" stroke="#fff" stroke-width="2"/></svg>',
    svgVertices: '<svg viewBox="0 0 100 100"><rect x="12" y="12" width="76" height="76" rx="2" fill="#2ecc71" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="white"/><circle cx="88" cy="12" r="5" fill="white"/><circle cx="88" cy="88" r="5" fill="white"/><circle cx="12" cy="88" r="5" fill="white"/></svg>',
    factEn: 'All 4 sides of a square are exactly the same length!',
    factPt: 'Todos os 4 lados de um quadrado são do mesmo tamanho!',
  },
  {
    name: 'rectangle', pt: 'retângulo', sides: 4, corners: 4, color: '#e67e22',
    svg: '<svg viewBox="0 0 100 100"><rect x="8" y="22" width="84" height="56" rx="2" fill="#e67e22" stroke="#fff" stroke-width="2"/></svg>',
    svgVertices: '<svg viewBox="0 0 100 100"><rect x="8" y="22" width="84" height="56" rx="2" fill="#e67e22" stroke="#fff" stroke-width="2"/><circle cx="8" cy="22" r="5" fill="white"/><circle cx="92" cy="22" r="5" fill="white"/><circle cx="92" cy="78" r="5" fill="white"/><circle cx="8" cy="78" r="5" fill="white"/></svg>',
    factEn: 'A rectangle has 2 long sides and 2 short sides!',
    factPt: 'Um retângulo tem 2 lados longos e 2 lados curtos!',
  },
  {
    name: 'pentagon', pt: 'pentágono', sides: 5, corners: 5, color: '#9b59b6',
    svg: '<svg viewBox="0 0 100 100"><polygon points="50,8 95,38 77,88 23,88 5,38" fill="#9b59b6" stroke="#fff" stroke-width="2"/></svg>',
    svgVertices: '<svg viewBox="0 0 100 100"><polygon points="50,8 95,38 77,88 23,88 5,38" fill="#9b59b6" stroke="#fff" stroke-width="2"/><circle cx="50" cy="8" r="5" fill="white"/><circle cx="95" cy="38" r="5" fill="white"/><circle cx="77" cy="88" r="5" fill="white"/><circle cx="23" cy="88" r="5" fill="white"/><circle cx="5" cy="38" r="5" fill="white"/></svg>',
    factEn: 'Penta means 5 — like the Pentagon building in Washington!',
    factPt: 'Penta quer dizer 5 — como o prédio Pentágono!',
  },
  {
    name: 'diamond', pt: 'diamante', sides: 4, corners: 4, color: '#a855f7',
    svg: '<svg viewBox="0 0 100 100"><polygon points="50,8 92,50 50,92 8,50" fill="#a855f7" stroke="#fff" stroke-width="2"/></svg>',
    svgVertices: '<svg viewBox="0 0 100 100"><polygon points="50,8 92,50 50,92 8,50" fill="#a855f7" stroke="#fff" stroke-width="2"/><circle cx="50" cy="8" r="5" fill="white"/><circle cx="92" cy="50" r="5" fill="white"/><circle cx="50" cy="92" r="5" fill="white"/><circle cx="8" cy="50" r="5" fill="white"/></svg>',
    factEn: 'A diamond is a square turned sideways — 4 equal sides!',
    factPt: 'Um diamante é um quadrado virado de lado — 4 lados iguais!',
  },
  {
    name: 'hexagon', pt: 'hexágono', sides: 6, corners: 6, color: '#e74c3c',
    svg: '<svg viewBox="0 0 100 100"><polygon points="50,5 93,27 93,73 50,95 7,73 7,27" fill="#e74c3c" stroke="#fff" stroke-width="2"/></svg>',
    svgVertices: '<svg viewBox="0 0 100 100"><polygon points="50,5 93,27 93,73 50,95 7,73 7,27" fill="#e74c3c" stroke="#fff" stroke-width="2"/><circle cx="50" cy="5" r="5" fill="white"/><circle cx="93" cy="27" r="5" fill="white"/><circle cx="93" cy="73" r="5" fill="white"/><circle cx="50" cy="95" r="5" fill="white"/><circle cx="7" cy="73" r="5" fill="white"/><circle cx="7" cy="27" r="5" fill="white"/></svg>',
    factEn: 'Hexa means 6 — honeycombs are hexagons!',
    factPt: 'Hexa quer dizer 6 — favos de mel são hexágonos!',
  },
];

/** Count round dispatcher. */
function countRound() {
  const level = getLevel('count');
  if (level === 0) return countRoundStatic();
  if (level === 1) return countRoundMoving();
  return countRoundShapes();
}

/** Count Level 0: Static single-emoji counting 1-10. */
function countRoundStatic() {
  const correctCount = Math.floor(Math.random() * 10) + 1;
  const emoji = COUNT_EMOJIS[Math.floor(Math.random() * COUNT_EMOJIS.length)];

  const allNums = [];
  const lo = Math.max(1, correctCount - 2);
  const hi = Math.min(10, correctCount + 2);
  for (let i = lo; i <= hi; i++) allNums.push(i);
  if (!allNums.includes(correctCount)) allNums.push(correctCount);
  const options = pickN(allNums, 4, correctCount);
  const correctIdx = options.indexOf(correctCount);

  promptEmoji.textContent = '🔢';
  promptText.innerHTML = `${t('howMany')}?`;

  extraArea.innerHTML = '<div class="count-items" id="count-items"></div>';
  const container = document.getElementById('count-items');
  for (let i = 0; i < correctCount; i++) {
    const item = document.createElement('span');
    item.className = 'count-item';
    item.textContent = emoji;
    item.style.animationDelay = (i * 0.05) + 's';
    container.appendChild(item);
  }

  activeKeyMap = {};
  choicesEl.className = 'choices number-choices';
  choicesEl.innerHTML = '';

  const useDirectKeys = options.every(n => n <= 9);
  options.forEach((n, i) => {
    const keyStr = useDirectKeys ? String(n) : String(i + 1);
    const btn = document.createElement('button');
    btn.className = 'choice-btn number-btn';
    btn.dataset.key = keyStr;
    btn.innerHTML = `<span class="choice-visual">${n}</span><span class="choice-keycap">${keycapHTML(keyStr)}</span>`;
    btn.addEventListener('click', () => handleAnswer(i, correctIdx));
    choicesEl.appendChild(btn);
    activeKeyMap[keyStr] = i;
  });
  correctKey = useDirectKeys ? String(correctCount) : String(correctIdx + 1);

  setKeyHint(t('countThem'));
  setTimeout(() => Audio_.speak(t('countSpeak')), 300);
}

/** Count Level 1: Moving mixed icons — count one kind with distractors. */
function countRoundMoving() {
  const set = COUNT_MOVING_SETS[Math.floor(Math.random() * COUNT_MOVING_SETS.length)];
  const targetCount = Math.floor(Math.random() * 5) + 2; // 2-6
  const distractorCount = Math.floor(Math.random() * 3) + 1; // 1-3
  const targetName = lang === 'pt' ? set.targetPt : set.targetName;

  const allNums = [];
  const lo = Math.max(1, targetCount - 2);
  const hi = Math.min(9, targetCount + 2);
  for (let i = lo; i <= hi; i++) allNums.push(i);
  if (!allNums.includes(targetCount)) allNums.push(targetCount);
  const options = pickN(allNums, 4, targetCount);
  const correctIdx = options.indexOf(targetCount);

  promptEmoji.textContent = set.target;
  promptText.innerHTML = t('howManyShapes').replace('%s', targetName) + '?';

  const floatClasses = ['countFloat1','countFloat2','countFloat3','countFloat4','countFloat5','countFloat6'];
  let arenaHTML = '<div class="count-target-label"><span class="target-emoji">' + set.target + '</span> ' + t('countMovingHint').replace('%s', targetName) + '</div>';
  arenaHTML += '<div class="count-arena">';
  for (let i = 0; i < targetCount; i++) {
    const left = 10 + Math.random() * 70;
    const top = 10 + Math.random() * 60;
    const anim = floatClasses[i % floatClasses.length];
    const delay = (Math.random() * 2).toFixed(1);
    const dur = (2.5 + Math.random() * 1.5).toFixed(1);
    arenaHTML += '<span class="count-arena-item" style="left:' + left + '%;top:' + top + '%;animation-name:' + anim + ';animation-delay:' + delay + 's;animation-duration:' + dur + 's">' + set.target + '</span>';
  }
  for (let i = 0; i < distractorCount; i++) {
    const left = 10 + Math.random() * 70;
    const top = 10 + Math.random() * 60;
    const anim = floatClasses[(targetCount + i) % floatClasses.length];
    const delay = (Math.random() * 2).toFixed(1);
    const dur = (2.5 + Math.random() * 1.5).toFixed(1);
    arenaHTML += '<span class="count-arena-item distractor" style="left:' + left + '%;top:' + top + '%;animation-name:' + anim + ';animation-delay:' + delay + 's;animation-duration:' + dur + 's">' + set.distractor + '</span>';
  }
  arenaHTML += '</div>';
  extraArea.innerHTML = arenaHTML;

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
  correctKey = String(targetCount);

  setKeyHint(t('countMovingHint').replace('%s', targetName));
  setTimeout(() => Audio_.speak(t('countMovingSpeak').replace('%s', targetName)), 300);
}

/** Count Level 2: Shape counting + sides questions. */
function countRoundShapes() {
  if (Math.random() < 0.5) {
    // Mode A: Count shapes
    const shapesWithSides = GEOMETRY_SHAPES.filter(s => s.sides > 0);
    const target = shapesWithSides[Math.floor(Math.random() * shapesWithSides.length)];
    const targetCount = Math.floor(Math.random() * 4) + 2;
    const otherShapes = shapesWithSides.filter(s => s.name !== target.name);
    const distractorCount = Math.floor(Math.random() * 3) + 1;
    const targetName = lang === 'pt' ? target.pt + 's' : target.name + 's';

    let items = [];
    for (let i = 0; i < targetCount; i++) items.push({ svg: target.svg, isTarget: true });
    for (let i = 0; i < distractorCount; i++) {
      const d = otherShapes[Math.floor(Math.random() * otherShapes.length)];
      items.push({ svg: d.svg, isTarget: false });
    }
    items = shuffle(items);

    let html = '<div class="count-shapes-area">';
    items.forEach((item, i) => {
      html += '<div class="count-shape-item" style="animation-delay:' + (i * 0.06) + 's">' + item.svg + '</div>';
    });
    html += '</div>';

    promptEmoji.textContent = '📐';
    promptText.innerHTML = t('howManyShapes').replace('%s', targetName) + '?';
    extraArea.innerHTML = html;

    const allNums = [];
    const lo = Math.max(1, targetCount - 2);
    const hi = Math.min(9, targetCount + 2);
    for (let i = lo; i <= hi; i++) allNums.push(i);
    if (!allNums.includes(targetCount)) allNums.push(targetCount);
    const options = pickN(allNums, 4, targetCount);
    const correctIdx = options.indexOf(targetCount);

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
    correctKey = String(targetCount);

    setKeyHint(t('howManyShapes').replace('%s', targetName) + '?');
    setTimeout(() => Audio_.speak(t('countShapesSpeak').replace('%s', targetName)), 300);
  } else {
    // Mode B: How many sides?
    const shape = GEOMETRY_SHAPES[Math.floor(Math.random() * GEOMETRY_SHAPES.length)];
    const correctSides = shape.sides;

    promptEmoji.textContent = '📐';
    promptText.innerHTML = t('howManySides');
    extraArea.innerHTML = '<div class="geometry-display"><div class="geometry-shape-big">' + shape.svg + '</div></div>';

    const sideOptions = pickN([0, 3, 4, 5, 6], 4, correctSides);
    const correctIdx = sideOptions.indexOf(correctSides);

    activeKeyMap = {};
    choicesEl.className = 'choices number-choices';
    choicesEl.innerHTML = '';
    sideOptions.forEach((n, i) => {
      const keyStr = String(n);
      const btn = document.createElement('button');
      btn.className = 'choice-btn number-btn';
      btn.dataset.key = keyStr;
      btn.innerHTML = `<span class="choice-visual">${n}</span><span class="choice-keycap">${keycapHTML(keyStr)}</span>`;
      btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
        const fact = lang === 'pt' ? shape.factPt : shape.factEn;
        const factDiv = document.createElement('div');
        factDiv.className = 'geometry-info';
        factDiv.textContent = fact;
        extraArea.appendChild(factDiv);
      }));
      choicesEl.appendChild(btn);
      activeKeyMap[keyStr] = i;
    });
    correctKey = String(correctSides);

    setKeyHint(t('howManySides'));
    setTimeout(() => Audio_.speak(t('sidesSpeak')), 300);
  }
}

// ── GEOMETRY GAME ──

/** Geometry round dispatcher. */
function geometryRound() {
  const level = getLevel('geometry');
  if (level === 0) return geoRoundSides();
  if (level === 1) return geoRoundCornersOrMatch();
  return geoRoundExpert();
}

/** Geometry Level 0: Show a shape, pick the side count. */
function geoRoundSides() {
  const shape = GEOMETRY_SHAPES[Math.floor(Math.random() * GEOMETRY_SHAPES.length)];
  const correctSides = shape.sides;

  promptEmoji.textContent = '📐';
  promptText.innerHTML = t('geoSides');
  extraArea.innerHTML = '<div class="geometry-display"><div class="geometry-shape-big">' + shape.svg + '</div></div>';

  const sideOptions = pickN([0, 3, 4, 5, 6], 4, correctSides);
  const correctIdx = sideOptions.indexOf(correctSides);

  activeKeyMap = {};
  choicesEl.className = 'choices number-choices';
  choicesEl.innerHTML = '';
  sideOptions.forEach((n, i) => {
    const keyStr = String(n);
    const btn = document.createElement('button');
    btn.className = 'choice-btn number-btn';
    btn.dataset.key = keyStr;
    btn.innerHTML = `<span class="choice-visual">${n}</span><span class="choice-keycap">${keycapHTML(keyStr)}</span>`;
    btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
      const fact = lang === 'pt' ? shape.factPt : shape.factEn;
      const factDiv = document.createElement('div');
      factDiv.className = 'geometry-info';
      factDiv.textContent = fact;
      extraArea.appendChild(factDiv);
    }));
    choicesEl.appendChild(btn);
    activeKeyMap[keyStr] = i;
  });
  correctKey = String(correctSides);

  setKeyHint(t('geoSides'));
  setTimeout(() => Audio_.speak(t('sidesSpeak')), 300);
}

/** Geometry Level 1: corners question OR "which shape has N sides?" */
function geoRoundCornersOrMatch() {
  if (Math.random() < 0.5) {
    const shape = GEOMETRY_SHAPES[Math.floor(Math.random() * GEOMETRY_SHAPES.length)];
    const correctCorners = shape.corners;

    promptEmoji.textContent = '🔶';
    promptText.innerHTML = t('geoCorners');
    extraArea.innerHTML = '<div class="geometry-display"><div class="geometry-shape-big">' + shape.svgVertices + '</div></div>';

    const cornerOptions = pickN([0, 3, 4, 5, 6], 4, correctCorners);
    const correctIdx = cornerOptions.indexOf(correctCorners);

    activeKeyMap = {};
    choicesEl.className = 'choices number-choices';
    choicesEl.innerHTML = '';
    cornerOptions.forEach((n, i) => {
      const keyStr = String(n);
      const btn = document.createElement('button');
      btn.className = 'choice-btn number-btn';
      btn.dataset.key = keyStr;
      btn.innerHTML = `<span class="choice-visual">${n}</span><span class="choice-keycap">${keycapHTML(keyStr)}</span>`;
      btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
        const fact = lang === 'pt' ? shape.factPt : shape.factEn;
        const factDiv = document.createElement('div');
        factDiv.className = 'geometry-info';
        factDiv.textContent = fact;
        extraArea.appendChild(factDiv);
      }));
      choicesEl.appendChild(btn);
      activeKeyMap[keyStr] = i;
    });
    correctKey = String(correctCorners);

    setKeyHint(t('geoCorners'));
    setTimeout(() => Audio_.speak(t('cornersSpeak')), 300);
  } else {
    const correct = GEOMETRY_SHAPES[Math.floor(Math.random() * GEOMETRY_SHAPES.length)];
    const options = pickN(GEOMETRY_SHAPES, 4, correct);
    const correctIdx = options.indexOf(correct);

    const sidesText = t('geoWhichShape').replace('%d', correct.sides);
    promptEmoji.textContent = '🔶';
    promptText.innerHTML = sidesText;
    extraArea.innerHTML = '';

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((s, i) => {
      const keyNum = String(i + 1);
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.dataset.key = keyNum;
      btn.innerHTML = '<div class="shape-visual">' + s.svg + '</div>' + bilingualLabel(s.name, s.pt) + '<span class="choice-keycap">' + keycapHTML(keyNum) + '</span>';
      btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
        const fact = lang === 'pt' ? correct.factPt : correct.factEn;
        const factDiv = document.createElement('div');
        factDiv.className = 'geometry-info';
        factDiv.textContent = fact;
        extraArea.appendChild(factDiv);
      }));
      choicesEl.appendChild(btn);
      activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);

    setKeyHint(sidesText);
    setTimeout(() => Audio_.speak(sidesText), 300);
  }
}

/** Geometry Level 2: Expert — mix of all question types. */
function geoRoundExpert() {
  const questionType = Math.floor(Math.random() * 4);

  if (questionType === 0) {
    geoRoundSides();
  } else if (questionType === 1) {
    // Corners
    const shape = GEOMETRY_SHAPES[Math.floor(Math.random() * GEOMETRY_SHAPES.length)];
    const correctCorners = shape.corners;

    promptEmoji.textContent = '🏆';
    promptText.innerHTML = t('geoCorners');
    extraArea.innerHTML = '<div class="geometry-display"><div class="geometry-shape-big">' + shape.svgVertices + '</div></div>';

    const cornerOptions = pickN([0, 3, 4, 5, 6], 4, correctCorners);
    const correctIdx = cornerOptions.indexOf(correctCorners);

    activeKeyMap = {};
    choicesEl.className = 'choices number-choices';
    choicesEl.innerHTML = '';
    cornerOptions.forEach((n, i) => {
      const keyStr = String(n);
      const btn = document.createElement('button');
      btn.className = 'choice-btn number-btn';
      btn.dataset.key = keyStr;
      btn.innerHTML = `<span class="choice-visual">${n}</span><span class="choice-keycap">${keycapHTML(keyStr)}</span>`;
      btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
        const fact = lang === 'pt' ? shape.factPt : shape.factEn;
        const factDiv = document.createElement('div');
        factDiv.className = 'geometry-info';
        factDiv.textContent = fact;
        extraArea.appendChild(factDiv);
      }));
      choicesEl.appendChild(btn);
      activeKeyMap[keyStr] = i;
    });
    correctKey = String(correctCorners);

    setKeyHint(t('geoCorners'));
    setTimeout(() => Audio_.speak(t('cornersSpeak')), 300);
  } else if (questionType === 2) {
    // Which has more sides?
    const pair = shuffle([...GEOMETRY_SHAPES]).slice(0, 2);
    if (pair[0].sides === pair[1].sides) {
      pair[0] = GEOMETRY_SHAPES.find(s => s.sides === 0); // circle
      pair[1] = GEOMETRY_SHAPES.find(s => s.sides === 6); // hexagon
    }
    const correct = pair[0].sides > pair[1].sides ? pair[0] : pair[1];
    const options = shuffle([...pair]);
    const correctIdx = options.indexOf(correct);

    promptEmoji.textContent = '🏆';
    promptText.innerHTML = t('geoWhichHasMore');
    extraArea.innerHTML = '<div class="geometry-display">' +
      '<div class="geometry-shape-big">' + options[0].svg + '</div>' +
      '<span class="geometry-vs">VS</span>' +
      '<div class="geometry-shape-big">' + options[1].svg + '</div>' +
      '</div>';

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((s, i) => {
      const keyNum = String(i + 1);
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.dataset.key = keyNum;
      btn.innerHTML = '<div class="shape-visual">' + s.svg + '</div>' + bilingualLabel(s.name, s.pt) + '<span class="choice-keycap">' + keycapHTML(keyNum) + '</span>';
      btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
        const fact = lang === 'pt' ? correct.factPt : correct.factEn;
        const factDiv = document.createElement('div');
        factDiv.className = 'geometry-info';
        factDiv.textContent = correct.sides + ' ' + (lang === 'pt' ? 'lados' : 'sides') + '! ' + fact;
        extraArea.appendChild(factDiv);
      }));
      choicesEl.appendChild(btn);
      activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);

    setKeyHint(t('geoWhichHasMore'));
    setTimeout(() => Audio_.speak(t('geoWhichHasMore')), 300);
  } else {
    // Name this shape
    const correct = GEOMETRY_SHAPES[Math.floor(Math.random() * GEOMETRY_SHAPES.length)];
    const options = pickN(GEOMETRY_SHAPES, 4, correct);
    const correctIdx = options.indexOf(correct);

    promptEmoji.textContent = '🏆';
    promptText.innerHTML = t('geoNameShape');
    extraArea.innerHTML = '<div class="geometry-display"><div class="geometry-shape-big">' + correct.svg + '</div></div>';

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((s, i) => {
      const keyNum = String(i + 1);
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.dataset.key = keyNum;
      btn.innerHTML = bilingualLabel(s.name, s.pt) + '<span class="choice-keycap">' + keycapHTML(keyNum) + '</span>';
      btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
        const fact = lang === 'pt' ? correct.factPt : correct.factEn;
        const factDiv = document.createElement('div');
        factDiv.className = 'geometry-info';
        factDiv.textContent = fact;
        extraArea.appendChild(factDiv);
      }));
      choicesEl.appendChild(btn);
      activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);

    setKeyHint(t('geoNameShape'));
    setTimeout(() => Audio_.speak(t('geoNameShape')), 300);
  }
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
  { name: 'cat', pt: 'gato', emoji: '\uD83D\uDC31', sound: 'meow', ptSound: 'miau' },
  { name: 'dog', pt: 'cachorro', emoji: '\uD83D\uDC15', sound: 'woof woof', ptSound: 'au au' },
  { name: 'cow', pt: 'vaca', emoji: '\uD83D\uDC04', sound: 'moo', ptSound: 'mu' },
  { name: 'pig', pt: 'porco', emoji: '\uD83D\uDC37', sound: 'oink oink', ptSound: 'oinc oinc' },
  { name: 'duck', pt: 'pato', emoji: '\uD83E\uDD86', sound: 'quack quack', ptSound: 'qu\u00E1 qu\u00E1' },
  { name: 'frog', pt: 'sapo', emoji: '\uD83D\uDC38', sound: 'ribbit', ptSound: 'croac' },
  { name: 'bird', pt: 'p\u00E1ssaro', emoji: '\uD83D\uDC26', sound: 'tweet tweet', ptSound: 'piu piu' },
  { name: 'bee', pt: 'abelha', emoji: '\uD83D\uDC1D', sound: 'buzz buzz', ptSound: 'bzz bzz' },
  { name: 'lion', pt: 'le\u00E3o', emoji: '\uD83E\uDD81', sound: 'roar', ptSound: 'roar' },
  { name: 'snake', pt: 'cobra', emoji: '\uD83D\uDC0D', sound: 'hiss', ptSound: 'sss' },
  { name: 'horse', pt: 'cavalo', emoji: '\uD83D\uDC34', sound: 'neigh', ptSound: 'irrr' },
  { name: 'sheep', pt: 'ovelha', emoji: '\uD83D\uDC11', sound: 'baa baa', ptSound: 'b\u00E9 b\u00E9' },
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

// ── MORE & LESS ──

/**
 * Emoji sets shared by the More & Less game modes.
 * @type {Array<{emoji: string, name: string, pt: string}>}
 */
const COMPARE_SETS = [
  { emoji: '🍎', name: 'apples', pt: 'maçãs' },
  { emoji: '🐱', name: 'cats', pt: 'gatos' },
  { emoji: '⭐', name: 'stars', pt: 'estrelas' },
  { emoji: '🌸', name: 'flowers', pt: 'flores' },
  { emoji: '🎈', name: 'balloons', pt: 'balões' },
  { emoji: '🍪', name: 'cookies', pt: 'biscoitos' },
];

/** More & Less round dispatcher. */
function numberfunRound() {
  const level = getLevel('numberfun');
  if (level === 0) return compareRound();
  if (level === 1) return oneMoreLessRound();
  return makeFrameRound();
}

/**
 * More & Less Level 0: two groups side by side — which has more (or fewer)?
 * Builds the comparison sense that addition/subtraction grow from.
 */
function compareRound() {
  const set = COMPARE_SETS[Math.floor(Math.random() * COMPARE_SETS.length)];
  const max = stars < 3 ? 5 : 8;
  const a = Math.floor(Math.random() * max) + 1;
  let b;
  do { b = Math.floor(Math.random() * max) + 1; } while (b === a);
  const counts = [a, b];
  const askMore = Math.random() < 0.5;
  const correctIdx = askMore ? (a > b ? 0 : 1) : (a < b ? 0 : 1);

  const itemName = lang === 'pt' ? set.pt : set.name;
  const promptStr = t(askMore ? 'whichMore' : 'whichFewer').replace('%s', itemName);
  promptEmoji.textContent = '⚖️';
  promptText.innerHTML = promptStr;
  extraArea.innerHTML = '';

  activeKeyMap = {};
  choicesEl.className = 'choices';
  choicesEl.innerHTML = '';
  counts.forEach((n, i) => {
    const keyNum = String(i + 1);
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.key = keyNum;
    let group = '<div class="compare-group">';
    for (let j = 0; j < n; j++) group += `<span class="compare-item" style="animation-delay:${(j * 0.06).toFixed(2)}s">${set.emoji}</span>`;
    group += '</div>';
    btn.innerHTML = `${group}<span class="choice-keycap">${keycapHTML(keyNum)}</span>`;
    btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
      // Reveal the counts so the child links the groups to numerals
      choicesEl.querySelectorAll('.compare-group').forEach((g, gi) => {
        const label = document.createElement('div');
        label.className = 'compare-count';
        label.textContent = counts[gi];
        g.parentElement.insertBefore(label, g.nextSibling);
      });
    }));
    choicesEl.appendChild(btn);
    activeKeyMap[keyNum] = i;
  });
  correctKey = String(correctIdx + 1);

  setKeyHint(promptStr);
  setTimeout(() => Audio_.speak(promptStr), 300);
}

/**
 * More & Less Level 1: one more / one less on a number line.
 * Counting on and counting back — the first real addition/subtraction strategy.
 */
function oneMoreLessRound() {
  const more = Math.random() < 0.5;
  const n = more
    ? Math.floor(Math.random() * 7) + 1   // 1-7, answer 2-8
    : Math.floor(Math.random() * 7) + 2;  // 2-8, answer 1-7
  const answer = more ? n + 1 : n - 1;
  const set = COMPARE_SETS[Math.floor(Math.random() * COMPARE_SETS.length)];

  const promptStr = t(more ? 'oneMoreQ' : 'oneLessQ').replace('%d', n);
  promptEmoji.textContent = more ? '⬆️' : '⬇️';
  promptText.innerHTML = promptStr;

  let itemsHTML = '<div class="count-items">';
  for (let i = 0; i < n; i++) {
    itemsHTML += `<span class="count-item count-item-small" style="animation-delay:${(i * 0.05).toFixed(2)}s">${set.emoji}</span>`;
  }
  itemsHTML += '</div>';
  let lineHTML = '<div class="number-line" id="number-line">';
  for (let i = 1; i <= 9; i++) {
    lineHTML += `<span class="${i === n ? 'nl-current' : ''}" data-num="${i}">${i}</span>`;
  }
  lineHTML += '</div>';
  extraArea.innerHTML = itemsHTML + lineHTML;

  const allNums = [];
  const lo = Math.max(1, answer - 2);
  const hi = Math.min(9, answer + 2);
  for (let i = lo; i <= hi; i++) allNums.push(i);
  const options = pickN(allNums, 4, answer);
  const correctIdx = options.indexOf(answer);

  activeKeyMap = {};
  choicesEl.className = 'choices number-choices';
  choicesEl.innerHTML = '';
  options.forEach((num, i) => {
    const keyStr = String(num);
    const btn = document.createElement('button');
    btn.className = 'choice-btn number-btn';
    btn.dataset.key = keyStr;
    btn.innerHTML = `<span class="choice-visual">${num}</span><span class="choice-keycap">${keycapHTML(keyStr)}</span>`;
    btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
      const cell = extraArea.querySelector(`.number-line span[data-num="${answer}"]`);
      if (cell) cell.classList.add('nl-answer');
    }));
    choicesEl.appendChild(btn);
    activeKeyMap[keyStr] = i;
  });
  correctKey = String(answer);

  setKeyHint(promptStr);
  setTimeout(() => Audio_.speak(promptStr), 300);
}

/**
 * More & Less Level 2: number bonds on a five-frame (ten-frame at 3+ stars).
 * "3 dots — how many more to make 5?" teaches part + part = whole.
 */
function makeFrameRound() {
  const total = stars < 3 ? 5 : 10;
  const filled = Math.floor(Math.random() * (total - 1)) + 1; // 1..total-1
  const answer = total - filled;

  const promptStr = t('makeN').replace('%d', total);
  promptEmoji.textContent = total === 5 ? '🖐️' : '🙌';
  promptText.innerHTML = promptStr;

  let frameHTML = '<div class="bond-frame" id="bond-frame">';
  for (let i = 0; i < total; i++) {
    frameHTML += `<span class="bond-cell${i < filled ? ' filled' : ''}"></span>`;
  }
  frameHTML += '</div>';
  extraArea.innerHTML = frameHTML;

  const allNums = [];
  const lo = Math.max(1, answer - 2);
  const hi = Math.min(9, answer + 2);
  for (let i = lo; i <= hi; i++) allNums.push(i);
  const options = pickN(allNums, 4, answer);
  const correctIdx = options.indexOf(answer);

  activeKeyMap = {};
  choicesEl.className = 'choices number-choices';
  choicesEl.innerHTML = '';
  options.forEach((num, i) => {
    const keyStr = String(num);
    const btn = document.createElement('button');
    btn.className = 'choice-btn number-btn';
    btn.dataset.key = keyStr;
    btn.innerHTML = `<span class="choice-visual">${num}</span><span class="choice-keycap">${keycapHTML(keyStr)}</span>`;
    btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
      // Fill the empty cells green and show the bond fact
      extraArea.querySelectorAll('.bond-cell:not(.filled)').forEach(cell => cell.classList.add('answer-fill'));
      const fact = document.createElement('div');
      fact.className = 'geometry-info';
      fact.textContent = t('bondFact').replace('%d', filled).replace('%d', answer).replace('%d', total);
      extraArea.appendChild(fact);
    }));
    choicesEl.appendChild(btn);
    activeKeyMap[keyStr] = i;
  });
  correctKey = String(answer);

  setKeyHint(promptStr);
  setTimeout(() => Audio_.speak(t('makeNSpeak').replace('%d', filled).replace('%d', total)), 300);
}

// ── TAKE AWAY ──

/**
 * Food + eater pairs for the Take Away story mode.
 * @type {Array<{food: string, name: string, pt: string, eater: string, eaterName: string, eaterPt: string}>}
 */
const MUNCH_SETS = [
  { food: '🍪', name: 'cookies', pt: 'biscoitos', eater: '🦖', eaterName: 'dinosaur', eaterPt: 'dinossauro' },
  { food: '🍎', name: 'apples', pt: 'maçãs', eater: '🐻', eaterName: 'bear', eaterPt: 'urso' },
  { food: '🐟', name: 'fish', pt: 'peixes', eater: '🐱', eaterName: 'cat', eaterPt: 'gato' },
  { food: '🍌', name: 'bananas', pt: 'bananas', eater: '🐵', eaterName: 'monkey', eaterPt: 'macaco' },
  { food: '🍓', name: 'strawberries', pt: 'morangos', eater: '👾', eaterName: 'monster', eaterPt: 'monstrinho' },
  { food: '🥕', name: 'carrots', pt: 'cenouras', eater: '🐰', eaterName: 'bunny', eaterPt: 'coelho' },
];

/** Take Away round dispatcher. */
function takeawayRound() {
  const level = getLevel('takeaway');
  if (level === 0) return munchRound();
  if (level === 1) return minusRound();
  return plusMinusRound();
}

/**
 * Take Away Level 0: story subtraction. A hungry animal eats some treats
 * (shown faded with an X) and the child counts how many are left.
 */
function munchRound() {
  const set = MUNCH_SETS[Math.floor(Math.random() * MUNCH_SETS.length)];
  const total = stars < 3
    ? Math.floor(Math.random() * 4) + 2   // 2-5
    : Math.floor(Math.random() * 5) + 3;  // 3-7
  const eaten = Math.floor(Math.random() * (total - 1)) + 1; // 1..total-1
  const left = total - eaten;

  const foodName = lang === 'pt' ? set.pt : set.name;
  const eaterName = lang === 'pt' ? set.eaterPt : set.eaterName;
  promptEmoji.textContent = set.eater;
  promptText.innerHTML = t('munchStory').replace('%s', eaterName).replace('%d', eaten);

  let itemsHTML = '<div class="munch-scene"><span class="muncher">' + set.eater + '</span><div class="count-items">';
  for (let i = 0; i < total; i++) {
    // Eaten treats sit next to the muncher; remaining ones stay bright for counting
    const isEaten = i < eaten;
    itemsHTML += `<span class="count-item count-item-small${isEaten ? ' ta-eaten' : ''}" style="animation-delay:${(i * 0.05).toFixed(2)}s">` +
      `<span class="ta-food">${set.food}</span>${isEaten ? '<span class="ta-x">✖</span>' : ''}</span>`;
  }
  itemsHTML += '</div></div>';
  extraArea.innerHTML = itemsHTML;

  const allNums = [];
  const lo = Math.max(1, left - 2);
  const hi = Math.min(9, left + 2);
  for (let i = lo; i <= hi; i++) allNums.push(i);
  const options = pickN(allNums, 4, left);
  const correctIdx = options.indexOf(left);

  activeKeyMap = {};
  choicesEl.className = 'choices number-choices';
  choicesEl.innerHTML = '';
  options.forEach((num, i) => {
    const keyStr = String(num);
    const btn = document.createElement('button');
    btn.className = 'choice-btn number-btn';
    btn.dataset.key = keyStr;
    btn.innerHTML = `<span class="choice-visual">${num}</span><span class="choice-keycap">${keycapHTML(keyStr)}</span>`;
    btn.addEventListener('click', () => handleAnswer(i, correctIdx));
    choicesEl.appendChild(btn);
    activeKeyMap[keyStr] = i;
  });
  correctKey = String(left);

  setKeyHint(t('howManyLeft'));
  const speech = t('munchSpeak').replace('%d', total).replace('%s', foodName).replace('%s', eaterName).replace('%d', eaten);
  setTimeout(() => Audio_.speak(speech), 300);
}

/**
 * Take Away Level 1: visual subtraction equation. Shows n1 items with n2
 * crossed out, plus the equation n1 − n2 = ?, mirroring the Math game.
 */
function minusRound() {
  const maxN = stars < 3 ? 5 : 9;
  const n1 = Math.floor(Math.random() * (maxN - 1)) + 2; // 2..maxN
  const n2 = Math.floor(Math.random() * (n1 - 1)) + 1;   // 1..n1-1
  const answer = n1 - n2;
  const emoji = MATH_EMOJIS[Math.floor(Math.random() * MATH_EMOJIS.length)];

  const allNums = [];
  for (let i = Math.max(1, answer - 2); i <= Math.min(9, answer + 2); i++) allNums.push(i);
  const options = pickN(allNums, 4, answer);
  const correctIdx = options.indexOf(answer);

  promptEmoji.textContent = '➖';
  promptText.innerHTML = '';

  let groupHTML = '<div class="math-items"><div class="math-group">';
  for (let i = 0; i < n1; i++) {
    // The last n2 items are the ones taken away
    const crossed = i >= answer;
    groupHTML += `<span class="math-group-item${crossed ? ' ta-eaten' : ''}" style="animation-delay:${(i * 0.08).toFixed(2)}s">` +
      `<span class="ta-food">${emoji}</span>${crossed ? '<span class="ta-x">✖</span>' : ''}</span>`;
  }
  groupHTML += '</div></div>';
  extraArea.innerHTML = groupHTML + `
        <div class="math-equation">
            <span class="math-num">${n1}</span>
            <span class="math-op">−</span>
            <span class="math-num">${n2}</span>
            <span class="math-eq">=</span>
            <span class="math-answer-slot" id="math-answer-slot">?</span>
        </div>
    `;

  activeKeyMap = {};
  choicesEl.className = 'choices number-choices';
  choicesEl.innerHTML = '';
  options.forEach((num, i) => {
    const keyStr = String(num);
    const btn = document.createElement('button');
    btn.className = 'choice-btn number-btn';
    btn.dataset.key = keyStr;
    btn.innerHTML = `<span class="choice-visual">${num}</span><span class="choice-keycap">${keycapHTML(keyStr)}</span>`;
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

  setKeyHint(t('takeHint').replace('%d', n1).replace('%d', n2));
  setTimeout(() => Audio_.speak(`${n1} ${t('minus')} ${n2} ${t('equalsWhat')}`), 300);
}

/**
 * Take Away Level 2: mixed practice — randomly an addition round (from the
 * Math game) or a subtraction round, so + and − must be told apart.
 */
function plusMinusRound() {
  if (Math.random() < 0.5) return mathRound();
  return minusRound();
}

// ── WORDS ──

/**
 * Word data for the Words spelling game.
 * @type {Array<{word: string, emoji: string, category: string}>}
 */
const WORDS_DATA = [
  // Family
  { word: 'LUA', emoji: '\uD83D\uDC67', category: 'family' },
  { word: 'SORA', emoji: '\uD83D\uDC76', category: 'family' },
  { word: 'MAMA', emoji: '\uD83D\uDC69', category: 'family' },
  { word: 'DADA', emoji: '\uD83D\uDC68', category: 'family' },

  // Animals
  { word: 'CAT', emoji: '\uD83D\uDC31', category: 'animal' },
  { word: 'DOG', emoji: '\uD83D\uDC15', category: 'animal' },
  { word: 'COW', emoji: '\uD83D\uDC04', category: 'animal' },
  { word: 'PIG', emoji: '\uD83D\uDC37', category: 'animal' },
  { word: 'BEE', emoji: '\uD83D\uDC1D', category: 'animal' },
  { word: 'FISH', emoji: '\uD83D\uDC1F', category: 'animal' },
  { word: 'BIRD', emoji: '\uD83D\uDC26', category: 'animal' },
  { word: 'FROG', emoji: '\uD83D\uDC38', category: 'animal' },
  { word: 'DUCK', emoji: '\uD83E\uDD86', category: 'animal' },
  { word: 'BEAR', emoji: '\uD83D\uDC3B', category: 'animal' },

  // Things
  { word: 'SUN', emoji: '\u2600\uFE0F', category: 'thing' },
  { word: 'HAT', emoji: '\uD83C\uDFA9', category: 'thing' },
  { word: 'BUS', emoji: '\uD83D\uDE8C', category: 'thing' },
  { word: 'CAR', emoji: '\uD83D\uDE97', category: 'thing' },
  { word: 'BALL', emoji: '\u26BD', category: 'thing' },
  { word: 'TREE', emoji: '\uD83C\uDF33', category: 'thing' },
  { word: 'STAR', emoji: '\u2B50', category: 'thing' },
  { word: 'MOON', emoji: '\uD83C\uDF19', category: 'thing' },
  { word: 'RAIN', emoji: '\uD83C\uDF27\uFE0F', category: 'thing' },
  { word: 'BOOK', emoji: '\uD83D\uDCD6', category: 'thing' },
  { word: 'DAY', emoji: '\uD83C\uDF1E', category: 'thing' },

  // Engineering & Space
  { word: 'ROCKET', emoji: '\uD83D\uDE80', category: 'engineering' },
  { word: 'GEAR', emoji: '\u2699\uFE0F', category: 'engineering' },
  { word: 'BOLT', emoji: '\uD83D\uDD29', category: 'engineering' },
  { word: 'TOWER', emoji: '\uD83D\uDDFC', category: 'engineering' },
  { word: 'BRIDGE', emoji: '\uD83C\uDF09', category: 'engineering' },
  { word: 'ROBOT', emoji: '\uD83E\uDD16', category: 'engineering' },
  { word: 'CRANE', emoji: '\uD83C\uDFD7\uFE0F', category: 'engineering' },
  { word: 'ENGINE', emoji: '\uD83D\uDD27', category: 'engineering' },
  { word: 'WIRE', emoji: '\uD83D\uDD0C', category: 'engineering' },

  // Cars & Vehicles
  { word: 'TIRE', emoji: '\uD83D\uDEDE', category: 'car' },
  { word: 'BRAKE', emoji: '\uD83D\uDED1', category: 'car' },
  { word: 'HORN', emoji: '\uD83D\uDCEF', category: 'car' },
  { word: 'TRUCK', emoji: '\uD83D\uDE9A', category: 'car' },
  { word: 'WHEEL', emoji: '\u2B55', category: 'car' },
  { word: 'FUEL', emoji: '\u26FD', category: 'car' },

  // Grown-up world
  { word: 'CLOCK', emoji: '\u23F0', category: 'world' },
  { word: 'KEY', emoji: '\uD83D\uDD11', category: 'world' },
  { word: 'PHONE', emoji: '\uD83D\uDCF1', category: 'world' },
  { word: 'MONEY', emoji: '\uD83D\uDCB5', category: 'world' },
  { word: 'MAIL', emoji: '\uD83D\uDCEC', category: 'world' },
  { word: 'BANK', emoji: '\uD83C\uDFE6', category: 'world' },
  { word: 'STORE', emoji: '\uD83C\uDFEA', category: 'world' },
  { word: 'TICKET', emoji: '\uD83C\uDFAB', category: 'world' },
  { word: 'SIGN', emoji: '\uD83E\uDEA7', category: 'world' },
  { word: 'LAMP', emoji: '\uD83D\uDCA1', category: 'world' },
  { word: 'LOCK', emoji: '\uD83D\uDD12', category: 'world' },
  { word: 'STAMP', emoji: '\uD83D\uDCEE', category: 'world' },
  { word: 'MAP', emoji: '\uD83D\uDDFA\uFE0F', category: 'world' },
  { word: 'RECEIPT', emoji: '\uD83E\uDDFE', category: 'world' },
  { word: 'BATTERY', emoji: '\uD83D\uDD0B', category: 'world' },
  { word: 'WIFI', emoji: '\uD83D\uDCF6', category: 'world' },
  { word: 'ELEVATOR', emoji: '\uD83D\uDED7', category: 'world' },
  { word: 'PROBABLY', emoji: '\uD83E\uDD14', category: 'world' },
  { word: 'GRATITUDE', emoji: '\uD83D\uDE4F', category: 'world' },

  // Feelings
  { word: 'HAPPY', emoji: '\uD83D\uDE0A', category: 'feeling' },
  { word: 'SAD', emoji: '\uD83D\uDE22', category: 'feeling' },
  { word: 'ANGRY', emoji: '\uD83D\uDE20', category: 'feeling' },
  { word: 'SCARED', emoji: '\uD83D\uDE28', category: 'feeling' },
  { word: 'BRAVE', emoji: '\uD83E\uDDB8', category: 'feeling' },
  { word: 'LOVE', emoji: '\u2764\uFE0F', category: 'feeling' },
  { word: 'PROUD', emoji: '\uD83C\uDF1F', category: 'feeling' },
  { word: 'SHY', emoji: '\uD83D\uDE33', category: 'feeling' },
  { word: 'CALM', emoji: '\uD83D\uDE0C', category: 'feeling' },
  { word: 'SILLY', emoji: '\uD83E\uDD2A', category: 'feeling' },
  { word: 'TIRED', emoji: '\uD83E\uDD71', category: 'feeling' },
  { word: 'HUNGRY', emoji: '\uD83E\uDD24', category: 'feeling' },
  { word: 'EXCITED', emoji: '\uD83E\uDD29', category: 'feeling' },
  { word: 'KIND', emoji: '\uD83E\uDD17', category: 'feeling' },
  { word: 'LONELY', emoji: '\uD83E\uDEE5', category: 'feeling' },
  { word: 'JEALOUS', emoji: '\uD83D\uDE12', category: 'feeling' },
  { word: 'CURIOUS', emoji: '\uD83E\uDDD0', category: 'feeling' },
  { word: 'THANKFUL', emoji: '\uD83D\uDE07', category: 'feeling' },

  // Fruits & Vegetables
  { word: 'APPLE', emoji: '\uD83C\uDF4E', category: 'food' },
  { word: 'BANANA', emoji: '\uD83C\uDF4C', category: 'food' },
  { word: 'GRAPE', emoji: '\uD83C\uDF47', category: 'food' },
  { word: 'LEMON', emoji: '\uD83C\uDF4B', category: 'food' },
  { word: 'PEACH', emoji: '\uD83C\uDF51', category: 'food' },
  { word: 'PEAR', emoji: '\uD83C\uDF50', category: 'food' },
  { word: 'CORN', emoji: '\uD83C\uDF3D', category: 'food' },
  { word: 'CARROT', emoji: '\uD83E\uDD55', category: 'food' },
  { word: 'TOMATO', emoji: '\uD83C\uDF45', category: 'food' },
  { word: 'ONION', emoji: '\uD83E\uDDC5', category: 'food' },
  { word: 'POTATO', emoji: '\uD83E\uDD54', category: 'food' },
  { word: 'MANGO', emoji: '\uD83E\uDD6D', category: 'food' },
  { word: 'CHERRY', emoji: '\uD83C\uDF52', category: 'food' },
  { word: 'MELON', emoji: '\uD83C\uDF48', category: 'food' },
  { word: 'AVOCADO', emoji: '\uD83E\uDD51', category: 'food' },
  { word: 'BROCCOLI', emoji: '\uD83E\uDD66', category: 'food' },
  { word: 'PEPPER', emoji: '\uD83C\uDF36\uFE0F', category: 'food' },
  { word: 'PUMPKIN', emoji: '\uD83C\uDF83', category: 'food' },

  // House & Household
  { word: 'BED', emoji: '\uD83D\uDECF\uFE0F', category: 'house' },
  { word: 'TUB', emoji: '\uD83D\uDEC1', category: 'house' },
  { word: 'DOOR', emoji: '\uD83D\uDEAA', category: 'house' },
  { word: 'CHAIR', emoji: '\uD83E\uDE91', category: 'house' },
  { word: 'COUCH', emoji: '\uD83D\uDECB\uFE0F', category: 'house' },
  { word: 'TABLE', emoji: '\uD83E\uDE91', category: 'house' },
  { word: 'WINDOW', emoji: '\uD83E\uDE9F', category: 'house' },
  { word: 'STAIRS', emoji: '\uD83E\uDDF1', category: 'house' },
  { word: 'KITCHEN', emoji: '\uD83C\uDF73', category: 'house' },
  { word: 'BATH', emoji: '\uD83D\uDEC0', category: 'house' },
  { word: 'ROOF', emoji: '\uD83C\uDFE0', category: 'house' },
  { word: 'FLOOR', emoji: '\uD83E\uDDF1', category: 'house' },
  { word: 'SINK', emoji: '\uD83D\uDEB0', category: 'house' },
  { word: 'SOAP', emoji: '\uD83E\uDDFC', category: 'house' },
  { word: 'TOWEL', emoji: '\uD83E\uDD9B', category: 'house' },
  { word: 'PILLOW', emoji: '\uD83D\uDECC', category: 'house' },
  { word: 'MIRROR', emoji: '\uD83E\uDE9E', category: 'house' },
  { word: 'BLANKET', emoji: '\uD83D\uDECC', category: 'house' },
  { word: 'FRIDGE', emoji: '\uD83E\uDDCA', category: 'house' },
  { word: 'OVEN', emoji: '\uD83C\uDF73', category: 'house' },

  // Nature
  { word: 'CLOUD', emoji: '\u2601\uFE0F', category: 'nature' },
  { word: 'SNOW', emoji: '\u2744\uFE0F', category: 'nature' },
  { word: 'LEAF', emoji: '\uD83C\uDF43', category: 'nature' },
  { word: 'ROCK', emoji: '\uD83E\uDEA8', category: 'nature' },
  { word: 'WAVE', emoji: '\uD83C\uDF0A', category: 'nature' },
  { word: 'FIRE', emoji: '\uD83D\uDD25', category: 'nature' },
  { word: 'GRASS', emoji: '\uD83C\uDF31', category: 'nature' },
  { word: 'BEACH', emoji: '\uD83C\uDFD6\uFE0F', category: 'nature' },
  { word: 'RAINBOW', emoji: '\uD83C\uDF08', category: 'nature' },

  // Body
  { word: 'HAND', emoji: '\u270B', category: 'body' },
  { word: 'FOOT', emoji: '\uD83E\uDDB6', category: 'body' },
  { word: 'NOSE', emoji: '\uD83D\uDC43', category: 'body' },
  { word: 'EAR', emoji: '\uD83D\uDC42', category: 'body' },
  { word: 'EYE', emoji: '\uD83D\uDC41\uFE0F', category: 'body' },
  { word: 'MOUTH', emoji: '\uD83D\uDC44', category: 'body' },
  { word: 'KNEE', emoji: '\uD83E\uDDB5', category: 'body' },
  { word: 'TOOTH', emoji: '\uD83E\uDDB7', category: 'body' },

  // Actions
  { word: 'RUN', emoji: '\uD83C\uDFC3', category: 'action' },
  { word: 'JUMP', emoji: '\uD83E\uDD38', category: 'action' },
  { word: 'HUG', emoji: '\uD83E\uDD17', category: 'action' },
  { word: 'KISS', emoji: '\uD83D\uDE18', category: 'action' },
  { word: 'CLAP', emoji: '\uD83D\uDC4F', category: 'action' },
  { word: 'SING', emoji: '\uD83C\uDFA4', category: 'action' },
  { word: 'DANCE', emoji: '\uD83D\uDC83', category: 'action' },
  { word: 'SWIM', emoji: '\uD83C\uDFCA', category: 'action' },
  { word: 'SLEEP', emoji: '\uD83D\uDE34', category: 'action' },
  { word: 'WALK', emoji: '\uD83D\uDEB6', category: 'action' },
  { word: 'EAT', emoji: '\uD83D\uDE0B', category: 'action' },
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
  { key: '1', word: 'LUA', emoji: '\uD83D\uDC67' },
  { key: '2', word: 'SORA', emoji: '\uD83D\uDC76' },
  { key: '3', word: 'MAMA', emoji: '\uD83D\uDC69' },
  { key: '4', word: 'DADA', emoji: '\uD83D\uDC68' },
  { key: '5', word: 'LOVE', emoji: '\u2764\uFE0F' },
  { key: '6', word: 'CAT', emoji: '\uD83D\uDC31' },
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
// FIX THE WORD Game — type the missing letter(s)
// ============================================

/** @type {{word: string, emoji: string, category: string}|null} Word for the current Fix the Word round */
let fixWordData = null;

/** @type {number[]} Sorted indices of the blank (missing) letters */
let fixBlanks = [];

/** @type {number} How many blanks have been filled so far */
let fixFilledCount = 0;

/** @type {number} Wrong guesses on the current blank (drives escalating hints) */
let fixWrongCount = 0;

/**
 * Sets up a Fix the Word round: shows a word with one or two letters
 * hidden (per level) plus its emoji, and the child types what's missing.
 * Unlike the Words game there is no on-screen key hint — she has to
 * recall the letter from hearing the word.
 * Level 0: first letter hidden. Level 1: any one letter. Level 2: two letters.
 */
function fixwordRound() {
  const level = getLevel('fixword');
  // Progressive: short words first, longer words at 3+ stars
  const maxLen = stars < 3 ? 4 : 6;
  const minLen = level === 2 ? 4 : 3; // two blanks need at least 4 letters
  const pool = WORDS_DATA.filter(w => w.word.length >= minLen && w.word.length <= maxLen);
  fixWordData = pool[Math.floor(Math.random() * pool.length)];
  const word = fixWordData.word;

  if (level === 0) {
    fixBlanks = [0];
  } else if (level === 1) {
    fixBlanks = [Math.floor(Math.random() * word.length)];
  } else {
    const a = Math.floor(Math.random() * word.length);
    let b;
    do { b = Math.floor(Math.random() * word.length); } while (b === a);
    fixBlanks = [a, b].sort((x, y) => x - y);
  }
  fixFilledCount = 0;
  fixWrongCount = 0;

  promptEmoji.textContent = fixWordData.emoji;
  promptText.innerHTML = t('fixPrompt');

  renderFixWord();

  choicesEl.className = 'choices';
  choicesEl.innerHTML = '';
  activeKeyMap = {};
  correctKey = word[fixBlanks[0]].toLowerCase();

  setKeyHint(t('fixHint'));
  setTimeout(() => Audio_.speak(`${word}! ${t('fixPrompt')}`), 300);
}

/**
 * Renders the Fix the Word tiles: given letters are shown, filled blanks
 * turn green, the current blank pulses with a "?", later blanks show "?".
 */
function renderFixWord() {
  const word = fixWordData.word;
  let html = '<div class="word-display">';
  for (let i = 0; i < word.length; i++) {
    const blankPos = fixBlanks.indexOf(i);
    if (blankPos === -1) {
      html += `<span class="word-letter given">${word[i]}</span>`;
    } else if (blankPos < fixFilledCount) {
      html += `<span class="word-letter completed">${word[i]}</span>`;
    } else if (blankPos === fixFilledCount) {
      html += `<span class="word-letter current">?</span>`;
    } else {
      html += `<span class="word-letter pending">?</span>`;
    }
  }
  html += '</div>';
  extraArea.innerHTML = html;
}

/**
 * Handles a letter keypress in Fix the Word mode. Correct letter fills
 * the blank (round completes when all blanks are filled). Wrong letters
 * shake the tile; the word is re-spoken, and after two misses on the
 * same blank the expected letter is spoken as a rescue hint.
 * @param {string} key - Lowercase letter key pressed
 */
function handleFixWordKeyPress(key) {
  if (inputLocked || !fixWordData) return;
  const word = fixWordData.word;
  const expected = word[fixBlanks[fixFilledCount]].toLowerCase();

  if (key === expected) {
    Audio_.correct();
    fixFilledCount++;
    fixWrongCount = 0;
    renderFixWord();

    if (fixFilledCount >= fixBlanks.length) {
      // Word fixed!
      inputLocked = true;
      Audio_.celebration();
      showCelebration();
      earnStar();

      const enc = t('encouragements');
      setTimeout(() => Audio_.speak(`${enc[Math.floor(Math.random() * enc.length)]} ${word}!`), 400);

      setTimeout(() => {
        if (stars < MAX_STARS) {
          inputLocked = false;
          nextRound();
        }
      }, 1600);
    } else {
      correctKey = word[fixBlanks[fixFilledCount]].toLowerCase();
      setTimeout(() => Audio_.speak(word, 0.9), 500);
    }
  } else {
    Audio_.wrong();
    resetStreak();
    fixWrongCount++;
    const currentEl = extraArea.querySelector('.word-letter.current');
    if (currentEl) {
      currentEl.style.animation = 'wrongShake 0.4s ease-out';
      setTimeout(() => currentEl.style.animation = '', 400);
    }
    // First miss: re-speak the word. Two or more: rescue hint with the letter.
    if (fixWrongCount >= 2) {
      setTimeout(() => Audio_.speak(`${t('press')} ${expected.toUpperCase()}!`, 1.0), 500);
    } else {
      setTimeout(() => Audio_.speak(word, 0.85), 500);
    }
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
  { name: 'fruits', pool: ['🍎', '🍌'], pattern: [0, 1, 0, 1, 0, 1] },
  { name: 'animals', pool: ['🐱', '🐕'], pattern: [0, 1, 0, 1, 0, 1] },
  { name: 'sky', pool: ['⭐', '🌙'], pattern: [0, 1, 0, 1, 0, 1] },
  { name: 'nature', pool: ['🌸', '🌿'], pattern: [0, 1, 0, 1, 0, 1] },
  { name: 'food', pool: ['🍪', '🍩'], pattern: [0, 1, 0, 1, 0, 1] },
  { name: 'hearts', pool: ['❤️', '💙'], pattern: [0, 1, 0, 1, 0, 1] },
  // ABC patterns
  { name: 'trio', pool: ['🔴', '🟡', '🔵'], pattern: [0, 1, 2, 0, 1, 2] },
  { name: 'pets', pool: ['🐱', '🐕', '🐟'], pattern: [0, 1, 2, 0, 1, 2] },
  { name: 'weather', pool: ['☀️', '☁️', '🌧️'], pattern: [0, 1, 2, 0, 1, 2] },
  { name: 'shapes', pool: ['🔵', '🟢', '🟣'], pattern: [0, 1, 2, 0, 1, 2] },
  // AABB patterns
  { name: 'double', pool: ['🎈', '🎀'], pattern: [0, 0, 1, 1, 0, 0] },
  { name: 'paired', pool: ['🐻', '🐰'], pattern: [0, 0, 1, 1, 0, 0] },
  // ABB patterns
  { name: 'abb1', pool: ['🌟', '🌈'], pattern: [0, 1, 1, 0, 1, 1] },
  { name: 'abb2', pool: ['🍎', '🍊'], pattern: [0, 1, 1, 0, 1, 1] },
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
// READING Game — onset-rime blending for early readers
// ============================================

/**
 * Word families for the Reading game. Each family shares a rime (ending sound)
 * and has 4 words with distinct onsets (starting sounds).
 * @type {Array<{rime: string, words: Array<{onset: string, word: string, emoji: string}>}>}
 */
const WORD_FAMILIES = [
  { rime: 'at', words: [
    { onset: 'c', word: 'cat', emoji: '🐱' },
    { onset: 'h', word: 'hat', emoji: '🎩' },
    { onset: 'b', word: 'bat', emoji: '🦇' },
    { onset: 'r', word: 'rat', emoji: '🐀' },
  ]},
  { rime: 'an', words: [
    { onset: 'c', word: 'can', emoji: '🥫' },
    { onset: 'f', word: 'fan', emoji: '🪭' },
    { onset: 'm', word: 'man', emoji: '👨' },
    { onset: 'v', word: 'van', emoji: '🚐' },
  ]},
  { rime: 'og', words: [
    { onset: 'd', word: 'dog', emoji: '🐕' },
    { onset: 'l', word: 'log', emoji: '🪵' },
    { onset: 'f', word: 'fog', emoji: '🌫️' },
    { onset: 'h', word: 'hog', emoji: '🐗' },
  ]},
  { rime: 'ug', words: [
    { onset: 'b', word: 'bug', emoji: '🐛' },
    { onset: 'm', word: 'mug', emoji: '☕' },
    { onset: 'h', word: 'hug', emoji: '🤗' },
    { onset: 'j', word: 'jug', emoji: '🫗' },
  ]},
  { rime: 'un', words: [
    { onset: 's', word: 'sun', emoji: '☀️' },
    { onset: 'f', word: 'fun', emoji: '🎉' },
    { onset: 'r', word: 'run', emoji: '🏃' },
    { onset: 'b', word: 'bun', emoji: '🍞' },
  ]},
  { rime: 'en', words: [
    { onset: 'h', word: 'hen', emoji: '🐔' },
    { onset: 'p', word: 'pen', emoji: '🖊️' },
    { onset: 't', word: 'ten', emoji: '🔟' },
    { onset: 'd', word: 'den', emoji: '🏠' },
  ]},
  { rime: 'ig', words: [
    { onset: 'p', word: 'pig', emoji: '🐷' },
    { onset: 'b', word: 'big', emoji: '🐘' },
    { onset: 'd', word: 'dig', emoji: '⛏️' },
    { onset: 'w', word: 'wig', emoji: '💇' },
  ]},
  { rime: 'op', words: [
    { onset: 'h', word: 'hop', emoji: '🐸' },
    { onset: 'm', word: 'mop', emoji: '🧹' },
    { onset: 'p', word: 'pop', emoji: '💥' },
    { onset: 't', word: 'top', emoji: '🔝' },
  ]},
];

/**
 * Sets up a Reading round.
 * Stars 0-2: Onset-rime — show picture + rime, child presses the starting letter.
 * Stars 3-4: Full CVC blending — show letters sounded out, child picks the picture.
 */
function readingRound() {
  const family = WORD_FAMILIES[Math.floor(Math.random() * WORD_FAMILIES.length)];
  const target = family.words[Math.floor(Math.random() * family.words.length)];

  if (stars < 3) {
    // ---- Onset-rime mode ----
    promptEmoji.textContent = target.emoji;
    promptText.innerHTML = t('whatStarts') + ' <strong>' + target.word + '</strong>?';

    // Show the rime with a slot for the missing onset
    extraArea.innerHTML = '<div class="blend-display">' +
      '<span class="blend-slot">?</span>' +
      '<span class="blend-rime-text">' + family.rime + '</span>' +
      '</div>';

    // 4 letter choices from this word family (press actual letter keys!)
    const options = shuffle([...family.words]);
    const correctIdx = options.indexOf(target);

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((w, i) => {
      const key = w.onset.toLowerCase();
      const btn = document.createElement('button');
      btn.className = 'choice-btn blend-choice';
      btn.dataset.key = key;
      btn.innerHTML = '<span class="choice-visual blend-letter">' + w.onset.toUpperCase() +
        '</span><span class="choice-keycap">' + keycapHTML(key.toUpperCase()) + '</span>';
      btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
        extraArea.innerHTML = '<div class="blend-result">' +
          '<span class="blend-onset-big">' + target.onset + '</span>' +
          '<span class="blend-rime-text">' + family.rime + '</span>' +
          '<span class="blend-arrow">→</span>' +
          '<span class="blend-word-big">' + target.word + '!</span></div>';
        setTimeout(() => Audio_.speak(target.onset + '...' + family.rime + '...' + target.word + '!'), 200);
      }));
      choicesEl.appendChild(btn);
      activeKeyMap[key] = i;
    });
    correctKey = target.onset.toLowerCase();

    setKeyHint(t('pressLetter') + ' ' + target.onset.toUpperCase() + '!');
    setTimeout(() => Audio_.speak(target.word + '! What sound does ' + target.word + ' start with?'), 300);

  } else {
    // ---- Full CVC blending mode ----
    const letters = target.word.split('');
    promptEmoji.textContent = '📖';
    promptText.innerHTML = t('whatWordIs');

    // Show individual letters being sounded out
    extraArea.innerHTML = '<div class="blend-display">' +
      letters.map(l => '<span class="blend-letter-big">' + l + '</span>').join('<span class="blend-dot">·</span>') +
      '</div>';

    // 4 picture choices: correct + 3 from other families
    const otherWords = WORD_FAMILIES.filter(f => f !== family).flatMap(f => f.words);
    const distractors = shuffle(otherWords).slice(0, 3);
    const options = shuffle([target, ...distractors]);
    const correctIdx = options.indexOf(target);

    activeKeyMap = {};
    choicesEl.className = 'choices';
    choicesEl.innerHTML = '';
    options.forEach((w, i) => {
      const keyNum = String(i + 1);
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.dataset.key = keyNum;
      btn.innerHTML = '<span class="choice-visual">' + w.emoji +
        '</span><span class="choice-label">' + w.word +
        '</span><span class="choice-keycap">' + keycapHTML(keyNum) + '</span>';
      btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
        setTimeout(() => Audio_.speak(letters.join('...') + '...' + target.word + '!'), 200);
      }));
      choicesEl.appendChild(btn);
      activeKeyMap[keyNum] = i;
    });
    correctKey = String(correctIdx + 1);

    setKeyHint(letters.join(' · ') + ' = ?');
    setTimeout(() => Audio_.speak(letters.join('...') + '... what word?'), 300);
  }
}

// ============================================
// OPPOSITES Game — find the opposite concept
// ============================================

/**
 * Opposite pairs for the Opposites game.
 * Each pair has two concepts with emoji visuals and bilingual names.
 * @type {Array<{a: {emoji: string, name: string, pt: string}, b: {emoji: string, name: string, pt: string}}>}
 */
const OPPOSITES_DATA = [
  { a: { emoji: '🐘', name: 'Big', pt: 'Grande' },     b: { emoji: '🐜', name: 'Small', pt: 'Pequeno' } },
  { a: { emoji: '🔥', name: 'Hot', pt: 'Quente' },     b: { emoji: '🧊', name: 'Cold', pt: 'Frio' } },
  { a: { emoji: '🐆', name: 'Fast', pt: 'Rápido' },    b: { emoji: '🐢', name: 'Slow', pt: 'Lento' } },
  { a: { emoji: '😊', name: 'Happy', pt: 'Feliz' },    b: { emoji: '😢', name: 'Sad', pt: 'Triste' } },
  { a: { emoji: '☀️', name: 'Day', pt: 'Dia' },        b: { emoji: '🌙', name: 'Night', pt: 'Noite' } },
  { a: { emoji: '⬆️', name: 'Up', pt: 'Cima' },        b: { emoji: '⬇️', name: 'Down', pt: 'Baixo' } },
  { a: { emoji: '🧸', name: 'Soft', pt: 'Macio' },     b: { emoji: '🪨', name: 'Hard', pt: 'Duro' } },
  { a: { emoji: '🌞', name: 'Light', pt: 'Claro' },    b: { emoji: '🌑', name: 'Dark', pt: 'Escuro' } },
  { a: { emoji: '📢', name: 'Loud', pt: 'Alto' },      b: { emoji: '🤫', name: 'Quiet', pt: 'Silêncio' } },
  { a: { emoji: '🏋️', name: 'Heavy', pt: 'Pesado' },   b: { emoji: '🪶', name: 'Light', pt: 'Leve' } },
  { a: { emoji: '🧓', name: 'Old', pt: 'Velho' },      b: { emoji: '👶', name: 'Young', pt: 'Novo' } },
  { a: { emoji: '🏔️', name: 'Tall', pt: 'Alto' },      b: { emoji: '🍄', name: 'Short', pt: 'Baixo' } },
  { a: { emoji: '📦', name: 'Full', pt: 'Cheio' },     b: { emoji: '🫙', name: 'Empty', pt: 'Vazio' } },
  { a: { emoji: '🌊', name: 'Wet', pt: 'Molhado' },    b: { emoji: '🏜️', name: 'Dry', pt: 'Seco' } },
];

/**
 * Sets up an Opposites round. Shows a concept (emoji + name spoken aloud),
 * asks the child to find its opposite from 4 emoji choices.
 */
function oppositesRound() {
  const pair = OPPOSITES_DATA[Math.floor(Math.random() * OPPOSITES_DATA.length)];
  // Randomly pick which side is the prompt and which is the answer
  const flip = Math.random() < 0.5;
  const prompt = flip ? pair.a : pair.b;
  const answer = flip ? pair.b : pair.a;

  // Build 4 choices: the correct opposite + 3 random distractors
  const otherSides = OPPOSITES_DATA
    .filter(p => p !== pair)
    .flatMap(p => [p.a, p.b]);
  const distractors = shuffle(otherSides).slice(0, 3);
  const options = shuffle([answer, ...distractors]);
  const correctIdx = options.indexOf(answer);

  // Show the prompt concept with large emoji
  promptEmoji.textContent = prompt.emoji;
  const promptName = lang === 'pt' ? prompt.pt : prompt.name;
  promptText.innerHTML = t('findOpposite') + ' <strong>' + promptName + '</strong>';
  extraArea.innerHTML = '';

  activeKeyMap = {};
  choicesEl.className = 'choices';
  choicesEl.innerHTML = '';
  options.forEach((opt, i) => {
    const keyNum = String(i + 1);
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.key = keyNum;
    btn.innerHTML = '<span class="choice-visual">' + opt.emoji + '</span>' + bilingualLabel(opt.name, opt.pt) + '<span class="choice-keycap">' + keycapHTML(keyNum) + '</span>';
    btn.addEventListener('click', () => handleAnswer(i, correctIdx));
    choicesEl.appendChild(btn);
    activeKeyMap[keyNum] = i;
  });
  correctKey = String(correctIdx + 1);

  const speakName = lang === 'pt' ? prompt.pt : prompt.name;
  setKeyHint(t('findOpposite') + ' ' + speakName);
  setTimeout(() => Audio_.speak(t('oppositeOf') + ' ' + speakName + '?'), 300);
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
      html += `<div class="memory-card face-down" data-idx="${i}"><span class="memory-keycap">${keycapHTML(keyNum, 'active-key')}</span></div>`;
    }
  }
  html += '</div>';
  const pairsText = lang === 'pt'
    ? `${memoryState.pairsLeft} par${memoryState.pairsLeft !== 1 ? 'es' : ''} restante${memoryState.pairsLeft !== 1 ? 's' : ''}`
    : `${memoryState.pairsLeft} pair${memoryState.pairsLeft !== 1 ? 's' : ''} left`;
  html += `<div class="memory-pairs-left">${pairsText}</div>`;
  extraArea.innerHTML = html;

  // Add click handlers to cards
  extraArea.querySelectorAll('.memory-card[data-idx]').forEach(card => {
    card.addEventListener('click', () => {
      handleMemoryKeyPress(String(parseInt(card.dataset.idx) + 1));
    });
  });
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

        const matchEnc = t('match');
        setTimeout(() => Audio_.speak(matchEnc[Math.floor(Math.random() * matchEnc.length)]), 400);

        setTimeout(() => {
          inputLocked = false;
          if (memoryState.pairsLeft <= 0) {
            // All pairs found — award one star for completing the minigame
            earnStar();
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

// ── KOREAN ──

/**
 * Korean vocabulary: each entry has an emoji fallback, English name,
 * Korean word (Hangul), romanization, and optional Wikipedia article title
 * used to fetch a real photo thumbnail.
 */
const KOREAN_WORDS = [
  { emoji: '🍎', en: 'apple',     kr: '사과',   rom: 'sagwa',   wiki: 'Apple' },
  { emoji: '🍌', en: 'banana',    kr: '바나나',  rom: 'banana',  wiki: 'Banana' },
  { emoji: '🐱', en: 'cat',       kr: '고양이',  rom: 'goyangi', wiki: 'Cat' },
  { emoji: '🐶', en: 'dog',       kr: '강아지',  rom: 'gangaji', wiki: 'Dog' },
  { emoji: '🐰', en: 'rabbit',    kr: '토끼',   rom: 'tokki',   wiki: 'Rabbit' },
  { emoji: '🐟', en: 'fish',      kr: '물고기',  rom: 'mulgogi', wiki: 'Fish' },
  { emoji: '🦋', en: 'butterfly', kr: '나비',   rom: 'nabi',    wiki: 'Butterfly' },
  { emoji: '⭐', en: 'star',      kr: '별',    rom: 'byeol',   wiki: 'Star' },
  { emoji: '🌙', en: 'moon',      kr: '달',    rom: 'dal',     wiki: 'Moon' },
  { emoji: '☀️', en: 'sun',       kr: '해',    rom: 'hae',     wiki: 'Sun' },
  { emoji: '🌸', en: 'flower',    kr: '꽃',    rom: 'kkot',    wiki: 'Flower' },
  { emoji: '💧', en: 'water',     kr: '물',    rom: 'mul',     wiki: 'Water' },
  { emoji: '📚', en: 'book',      kr: '책',    rom: 'chaek',   wiki: 'Book' },
  { emoji: '⚽', en: 'ball',      kr: '공',    rom: 'gong',    wiki: 'Ball_(association_football)' },
  { emoji: '🏠', en: 'house',     kr: '집',    rom: 'jip',     wiki: 'House' },
  { emoji: '🐦', en: 'bird',      kr: '새',    rom: 'sae',     wiki: 'Bird' },
  { emoji: '🐻', en: 'bear',      kr: '곰',    rom: 'gom',     wiki: 'Bear' },
  { emoji: '🌳', en: 'tree',      kr: '나무',   rom: 'namu',    wiki: 'Tree' },
  { emoji: '🚗', en: 'car',       kr: '자동차',  rom: 'jadongcha', wiki: 'Car' },
  { emoji: '👟', en: 'shoes',     kr: '신발',   rom: 'sinbal',  wiki: 'Shoe' },
  { emoji: '🧢', en: 'hat',       kr: '모자',   rom: 'moja',    wiki: 'Hat' },
  { emoji: '☂️', en: 'umbrella',  kr: '우산',   rom: 'usan',    wiki: 'Umbrella' },
  { emoji: '🍓', en: 'strawberry', kr: '딸기',  rom: 'ttalgi',  wiki: 'Strawberry' },
  { emoji: '🍇', en: 'grapes',    kr: '포도',   rom: 'podo',    wiki: 'Grape' },
];

/**
 * Daily family phrases a toddler uses when talking to family.
 * Each: composite-emoji "scene", English meaning, Korean (Hangul),
 * and romanization. Used by the "What It Means" comprehension level.
 */
const KOREAN_PHRASES = [
  { emoji: '🥰❤️', en: 'I love you',      kr: '사랑해요',         rom: 'saranghaeyo' },
  { emoji: '🙏😊', en: 'thank you',       kr: '고마워요',         rom: 'gomawoyo' },
  { emoji: '😋🍚', en: "I'm hungry",      kr: '배고파요',         rom: 'baegopayo', img: 'img/korean/hungry.jpg' },
  { emoji: '😴💤', en: "I'm sleepy",      kr: '졸려요',          rom: 'jollyeoyo' },
  { emoji: '🤗',   en: 'hug me please',   kr: '안아 주세요',       rom: 'ana juseyo' },
  { emoji: '😋👍', en: "it's yummy",      kr: '맛있어요',         rom: 'masisseoyo' },
  { emoji: '😨',   en: "I'm scared",      kr: '무서워요',         rom: 'museowoyo' },
  { emoji: '🤕',   en: 'it hurts / ouch', kr: '아파요',          rom: 'apayo', img: 'img/korean/hurts.jpg' },
  { emoji: '👋😊', en: 'hello',           kr: '안녕하세요',       rom: 'annyeonghaseyo' },
  { emoji: '👋🚪', en: 'goodbye',         kr: '안녕히 가세요',    rom: 'annyeonghi gaseyo' },
  { emoji: '😔🙏', en: "I'm sorry",       kr: '미안해요',         rom: 'mianhaeyo' },
  { emoji: '🚽',   en: 'I need potty',    kr: '화장실 가고 싶어요', rom: 'hwajangsil gago sipeoyo' },
  { emoji: '🧸😄', en: 'I want to play',  kr: '놀고 싶어요',       rom: 'nolgo sipeoyo', img: 'img/korean/play.jpg' },
  { emoji: '🚶‍♀️🚶', en: "let's go together", kr: '같이 가요', rom: 'gachi gayo' },
  { emoji: '🤝',   en: 'hold my hand',    kr: '손 잡아요',        rom: 'son jabayo' },
  { emoji: '👩‍👧', en: 'mommy',           kr: '엄마',           rom: 'eomma', img: 'img/korean/mommy.jpg' },
  { emoji: '👨‍👧', en: 'daddy',           kr: '아빠',           rom: 'appa', img: 'img/korean/daddy.jpg' },
  { emoji: '➕🍽️', en: 'more please',     kr: '더 주세요',        rom: 'deo juseyo' },
  { emoji: '💧🥤', en: 'water please',    kr: '물 주세요',        rom: 'mul juseyo' },
  { emoji: '🆘🙏', en: 'help me',         kr: '도와주세요',       rom: 'dowajuseyo' },
];

/**
 * Things a toddler can politely ask for with the "___ 주세요" frame.
 * Used by the "Ask Nicely" build level. The child picks the right word
 * and the app speaks the full polite request.
 */
const KOREAN_REQUEST_ITEMS = [
  { emoji: '💧', en: 'water',  kr: '물',    rom: 'mul',    wiki: 'Bottled_water' },
  { emoji: '🥛', en: 'milk',   kr: '우유',   rom: 'uyu',    wiki: 'Milk' },
  { emoji: '🍚', en: 'rice',   kr: '밥',    rom: 'bap',    wiki: 'Cooked_rice' },
  { emoji: '🍪', en: 'snack',  kr: '과자',   rom: 'gwaja',  wiki: 'Cookie' },
  { emoji: '🍞', en: 'bread',  kr: '빵',    rom: 'ppang',  wiki: 'Bread' },
  { emoji: '🍎', en: 'apple',  kr: '사과',   rom: 'sagwa',  wiki: 'Apple' },
  { emoji: '🍌', en: 'banana', kr: '바나나',  rom: 'banana', wiki: 'Banana' },
  { emoji: '🧃', en: 'juice',  kr: '주스',   rom: 'juseu',  wiki: 'Juice' },
];

/**
 * Korean color words for the "Colors & Numbers" level.
 * @type {Array<{en: string, kr: string, rom: string, hex: string}>}
 */
const KOREAN_COLORS = [
  { en: 'red',    kr: '빨간색', rom: 'ppalgansaek',  hex: '#e74c3c' },
  { en: 'blue',   kr: '파란색', rom: 'paransaek',    hex: '#3498db' },
  { en: 'yellow', kr: '노란색', rom: 'noransaek',    hex: '#f1c40f' },
  { en: 'green',  kr: '초록색', rom: 'choroksaek',   hex: '#2ecc71' },
  { en: 'purple', kr: '보라색', rom: 'borasaek',     hex: '#9b59b6' },
  { en: 'pink',   kr: '분홍색', rom: 'bunhongsaek',  hex: '#ff6b9d' },
  { en: 'orange', kr: '주황색', rom: 'juhwangsaek',  hex: '#e67e22' },
  { en: 'white',  kr: '하얀색', rom: 'hayansaek',    hex: '#f5f5f5' },
  { en: 'black',  kr: '검은색', rom: 'geomeunsaek',  hex: '#111111' },
  { en: 'brown',  kr: '갈색',  rom: 'galsaek',      hex: '#8B4513' },
];

/**
 * Native Korean numbers 1-5 (the ones used for counting things).
 * Index i holds the word for i+1.
 * @type {Array<{kr: string, rom: string}>}
 */
const KOREAN_NUMBERS = [
  { kr: '하나', rom: 'hana' },
  { kr: '둘',  rom: 'dul' },
  { kr: '셋',  rom: 'set' },
  { kr: '넷',  rom: 'net' },
  { kr: '다섯', rom: 'daseot' },
];

/**
 * Body-part words for the "My Body & Actions" level.
 * @type {Array<{emoji: string, en: string, kr: string, rom: string}>}
 */
const KOREAN_BODY = [
  { emoji: '👀', en: 'eyes',  kr: '눈',  rom: 'nun' },
  { emoji: '👃', en: 'nose',  kr: '코',  rom: 'ko' },
  { emoji: '👄', en: 'mouth', kr: '입',  rom: 'ip' },
  { emoji: '👂', en: 'ears',  kr: '귀',  rom: 'gwi' },
  { emoji: '✋', en: 'hand',  kr: '손',  rom: 'son' },
  { emoji: '🦶', en: 'foot',  kr: '발',  rom: 'bal' },
  { emoji: '🦵', en: 'leg',   kr: '다리', rom: 'dari' },
  { emoji: '🦷', en: 'teeth', kr: '이',  rom: 'i' },
];

/**
 * Everyday action verbs (polite -요 form) for "My Body & Actions".
 * @type {Array<{emoji: string, en: string, kr: string, rom: string}>}
 */
const KOREAN_ACTIONS = [
  { emoji: '😋🍚', en: 'eat',   kr: '먹어요', rom: 'meogeoyo' },
  { emoji: '🥤',   en: 'drink', kr: '마셔요', rom: 'masyeoyo' },
  { emoji: '😴',   en: 'sleep', kr: '자요',  rom: 'jayo' },
  { emoji: '🏃',   en: 'run',   kr: '뛰어요', rom: 'ttwieoyo' },
  { emoji: '💃',   en: 'dance', kr: '춤춰요', rom: 'chumchwoyo' },
  { emoji: '😄',   en: 'laugh', kr: '웃어요', rom: 'useoyo' },
  { emoji: '😢',   en: 'cry',   kr: '울어요', rom: 'ureoyo' },
  { emoji: '🛁',   en: 'wash',  kr: '씻어요', rom: 'ssiseoyo' },
];

/**
 * Image cache: wiki title → URL string, or null if the fetch failed.
 * @type {Object<string, string|null>}
 */
const KOREAN_IMAGE_CACHE = {};

/**
 * Fetch a Wikipedia thumbnail for a single KOREAN_WORDS entry and
 * store the result in KOREAN_IMAGE_CACHE keyed by wiki title.
 */
async function fetchKoreanImage(word) {
  if (word.wiki in KOREAN_IMAGE_CACHE) return;
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word.wiki)}`
    );
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    KOREAN_IMAGE_CACHE[word.wiki] = data.thumbnail?.source ?? null;
  } catch {
    KOREAN_IMAGE_CACHE[word.wiki] = null;
  }
}

/** Pre-warm the image cache for a list of items that have a `wiki` field
 * (fire-and-forget). */
function preloadKoreanImagesFor(items) {
  items.forEach(w => fetchKoreanImage(w));
}

/** Pre-warm the image cache for all Match Picture vocabulary words. */
function preloadKoreanImages() {
  preloadKoreanImagesFor(KOREAN_WORDS);
}

/** Builds a big tappable 🔊 button that re-speaks the prompt. Essential on
 * iPad/touch devices, where the auto-spoken prompt may be suppressed and
 * there is no keyboard. Speaking happens directly inside the tap handler so
 * iOS allows it. Returns the element; caller appends it to extraArea. */
function koreanSpeakerButton(text, langCode) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'text-align:center;margin:6px 0 2px;';
  const b = document.createElement('button');
  b.className = 'choice-btn';
  b.style.cssText = 'display:inline-flex;flex-direction:row;align-items:center;gap:8px;padding:10px 20px;min-width:0;';
  b.innerHTML = '<span style="font-size:1.6em;">🔊</span><span style="font-size:0.8em;color:#666;">tap to hear</span>';
  const replay = () => Audio_.speak(text, 0.75, langCode);
  b.addEventListener('click', replay);
  wrap.appendChild(b);
  return wrap;
}

/** Dispatches to the correct Korean sub-round based on current level. */
function koreanRound() {
  const level = getLevel('korean');
  if (level === 1) return koreanPhraseRound();
  if (level === 2) return koreanAskRound();
  if (level === 3) return koreanColorNumberRound();
  if (level === 4) return koreanBodyActionRound();
  if (level === 5) return koreanSayItRound();
  return koreanMatchPicture();
}

/** Korean Level 0 – "Match the Picture!"
 * Speaks the Korean word aloud; player picks the matching real-photo
 * choice from 4 buttons (keys 1–4). Falls back to emoji when no image
 * has been cached yet.
 */
function koreanMatchPicture() {
  preloadKoreanImages();

  const correct = KOREAN_WORDS[Math.floor(Math.random() * KOREAN_WORDS.length)];
  const options = pickN(KOREAN_WORDS, 4, correct);
  const correctIdx = options.indexOf(correct);

  promptEmoji.textContent = '🇰🇷';
  promptText.innerHTML =
    `<span style="font-size:1.8em;font-weight:bold;">${correct.kr}</span>` +
    `<br><span style="font-size:0.85em;color:#888;">${correct.rom}</span>`;
  extraArea.innerHTML = '';
  extraArea.appendChild(koreanSpeakerButton(correct.kr, 'ko'));

  activeKeyMap = {};
  choicesEl.className = 'choices';
  choicesEl.innerHTML = '';

  options.forEach((w, i) => {
    const keyNum = String(i + 1);
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.key = keyNum;

    const imgUrl = KOREAN_IMAGE_CACHE[w.wiki];
    const visualHTML = imgUrl
      ? `<img src="${imgUrl}" alt="${w.en}"
             style="width:90px;height:90px;object-fit:cover;border-radius:10px;display:block;margin:0 auto 4px;">`
      : `<span style="font-size:2em;">${w.emoji}</span>`;

    btn.innerHTML =
      `<span class="choice-visual">${visualHTML}</span>` +
      `<span class="choice-subtext" style="font-size:0.75em;color:#888;">${w.en}</span>` +
      `<span class="choice-keycap">${keycapHTML(keyNum)}</span>`;

    btn.addEventListener('click', () => handleAnswer(i, correctIdx));
    choicesEl.appendChild(btn);
    activeKeyMap[keyNum] = i;
  });

  correctKey = String(correctIdx + 1);
  setKeyHint(`${correct.kr} (${correct.rom}) — find the picture!`);
  setTimeout(() => Audio_.speak(correct.kr, 0.75, 'ko'), 300);
  setTimeout(() => Audio_.speak(correct.kr, 0.75, 'ko'), 1600);
}

/** Korean Level 1 – "What It Means!"
 * Speaks a daily family phrase in Korean; player picks the emoji scene
 * that matches its meaning (keys 1–4). English meaning shown as subtext.
 */
function koreanPhraseRound() {
  const correct = KOREAN_PHRASES[Math.floor(Math.random() * KOREAN_PHRASES.length)];
  const options = pickN(KOREAN_PHRASES, 4, correct);
  const correctIdx = options.indexOf(correct);

  promptEmoji.textContent = '🇰🇷';
  promptText.innerHTML =
    `<span style="font-size:1.6em;font-weight:bold;">${correct.kr}</span>` +
    `<br><span style="font-size:0.8em;color:#888;">${correct.rom}</span>`;
  extraArea.innerHTML = '';
  extraArea.appendChild(koreanSpeakerButton(correct.kr, 'ko'));

  activeKeyMap = {};
  choicesEl.className = 'choices';
  choicesEl.innerHTML = '';

  options.forEach((p, i) => {
    const keyNum = String(i + 1);
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.key = keyNum;
    const visualHTML = p.img
      ? `<img src="${p.img}" alt="${p.en}"
             style="width:84px;height:84px;object-fit:cover;border-radius:10px;display:block;margin:0 auto 4px;">`
      : `<span style="font-size:2em;">${p.emoji}</span>`;
    btn.innerHTML =
      `<span class="choice-visual">${visualHTML}</span>` +
      `<span class="choice-subtext" style="font-size:0.75em;color:#888;">${p.en}</span>` +
      `<span class="choice-keycap">${keycapHTML(keyNum)}</span>`;
    btn.addEventListener('click', () => handleAnswer(i, correctIdx));
    choicesEl.appendChild(btn);
    activeKeyMap[keyNum] = i;
  });

  correctKey = String(correctIdx + 1);
  setKeyHint(`${correct.kr} (${correct.rom}) = “${correct.en}”`);
  setTimeout(() => Audio_.speak(correct.kr, 0.8, 'ko'), 300);
  setTimeout(() => Audio_.speak(correct.kr, 0.8, 'ko'), 1800);
}

/** Korean Level 2 – "Ask Nicely!"
 * Shows what the toddler wants (emoji) and the polite frame "___ 주세요".
 * Player picks the right Korean word (keys 1–4); on success the full
 * polite request "<word> 주세요" is spoken back in Korean.
 */
function koreanAskRound() {
  preloadKoreanImagesFor(KOREAN_REQUEST_ITEMS);

  const correct = KOREAN_REQUEST_ITEMS[Math.floor(Math.random() * KOREAN_REQUEST_ITEMS.length)];
  const options = pickN(KOREAN_REQUEST_ITEMS, 4, correct);
  const correctIdx = options.indexOf(correct);
  const fullSentence = `${correct.kr} 주세요`;

  promptEmoji.textContent = correct.emoji;
  promptText.innerHTML =
    `Ask for <b>${correct.en}</b> nicely!` +
    `<br><span style="font-size:0.9em;color:#888;">___ 주세요 (please)</span>`;
  extraArea.innerHTML = '';
  extraArea.appendChild(koreanSpeakerButton(`Ask for ${correct.en}`, 'en'));

  activeKeyMap = {};
  choicesEl.className = 'choices';
  choicesEl.innerHTML = '';

  options.forEach((item, i) => {
    const keyNum = String(i + 1);
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.key = keyNum;

    const imgUrl = KOREAN_IMAGE_CACHE[item.wiki];
    const visualHTML = imgUrl
      ? `<img src="${imgUrl}" alt="${item.en}"
             style="width:72px;height:72px;object-fit:cover;border-radius:10px;display:block;margin:0 auto 4px;">`
      : `<span style="font-size:1.5em;">${item.emoji}</span>`;

    btn.innerHTML =
      `<span class="choice-visual">${visualHTML}</span>` +
      `<span class="choice-visual" style="font-size:1.4em;font-weight:bold;">${item.kr}</span>` +
      `<span class="choice-subtext" style="font-size:0.7em;color:#888;">${item.rom}</span>` +
      `<span class="choice-keycap">${keycapHTML(keyNum)}</span>`;
    btn.addEventListener('click', () => handleAnswer(i, correctIdx, speakReward));
    choicesEl.appendChild(btn);
    activeKeyMap[keyNum] = i;
  });

  correctKey = String(correctIdx + 1);
  setKeyHint(`${correct.en} → ${fullSentence} (${correct.rom} juseyo)`);
  setTimeout(() => Audio_.speak(`Ask for ${correct.en}`, 0.85, 'en'), 300);
  // On a correct pick, speak the whole polite sentence so the child hears
  // it assembled: "<word> 주세요".
  function speakReward() {
    setTimeout(() => Audio_.speak(fullSentence, 0.75, 'ko'), 1100);
  }
}

/** Korean Level 3 – "Colors & Numbers!"
 * Alternates between color rounds (hear the Korean color, pick the
 * swatch) and number rounds (hear a native Korean number 1-5, press it).
 */
function koreanColorNumberRound() {
  if (Math.random() < 0.5) return koreanColorRound();
  return koreanNumberRound();
}

/** Colors half of Level 3: Korean color word → pick the color swatch. */
function koreanColorRound() {
  const correct = KOREAN_COLORS[Math.floor(Math.random() * KOREAN_COLORS.length)];
  const options = pickN(KOREAN_COLORS, 4, correct);
  const correctIdx = options.indexOf(correct);

  promptEmoji.textContent = '🎨';
  promptText.innerHTML =
    `<span style="font-size:1.8em;font-weight:bold;">${correct.kr}</span>` +
    `<br><span style="font-size:0.85em;color:#888;">${correct.rom}</span>`;
  extraArea.innerHTML = '';
  extraArea.appendChild(koreanSpeakerButton(correct.kr, 'ko'));

  activeKeyMap = {};
  choicesEl.className = 'choices';
  choicesEl.innerHTML = '';
  options.forEach((c, i) => {
    const keyNum = String(i + 1);
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.key = keyNum;
    btn.innerHTML =
      `<div class="color-swatch" style="background:${c.hex}; border:2px solid rgba(255,255,255,0.35);"></div>` +
      `<span class="choice-subtext" style="font-size:0.75em;color:#888;">${c.en}</span>` +
      `<span class="choice-keycap">${keycapHTML(keyNum)}</span>`;
    btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
      setTimeout(() => Audio_.speak(correct.kr, 0.75, 'ko'), 1100);
    }));
    choicesEl.appendChild(btn);
    activeKeyMap[keyNum] = i;
  });

  correctKey = String(correctIdx + 1);
  setKeyHint(`${correct.kr} (${correct.rom}) = ${correct.en} — find the color!`);
  setTimeout(() => Audio_.speak(correct.kr, 0.75, 'ko'), 300);
  setTimeout(() => Audio_.speak(correct.kr, 0.75, 'ko'), 1600);
}

/** Numbers half of Level 3: hear a native Korean number, press 1-5.
 * On success a matching group of emoji pops in so the child sees the
 * quantity the word names.
 */
function koreanNumberRound() {
  const n = Math.floor(Math.random() * 5) + 1; // 1-5
  const word = KOREAN_NUMBERS[n - 1];
  const emoji = COUNT_EMOJIS[Math.floor(Math.random() * COUNT_EMOJIS.length)];

  promptEmoji.textContent = '🔢';
  promptText.innerHTML =
    `<span style="font-size:1.8em;font-weight:bold;">${word.kr}</span>` +
    `<br><span style="font-size:0.85em;color:#888;">${word.rom}</span>`;
  extraArea.innerHTML = '';
  extraArea.appendChild(koreanSpeakerButton(word.kr, 'ko'));

  const options = pickN([1, 2, 3, 4, 5], 4, n);
  const correctIdx = options.indexOf(n);

  activeKeyMap = {};
  choicesEl.className = 'choices number-choices';
  choicesEl.innerHTML = '';
  options.forEach((num, i) => {
    const keyStr = String(num);
    const btn = document.createElement('button');
    btn.className = 'choice-btn number-btn';
    btn.dataset.key = keyStr;
    btn.innerHTML = `<span class="choice-visual">${num}</span><span class="choice-keycap">${keycapHTML(keyStr)}</span>`;
    btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
      // Show the quantity the word names, then re-speak the word
      let itemsHTML = '<div class="count-items">';
      for (let j = 0; j < n; j++) {
        itemsHTML += `<span class="count-item count-item-small" style="animation-delay:${(j * 0.08).toFixed(2)}s">${emoji}</span>`;
      }
      itemsHTML += '</div>';
      const div = document.createElement('div');
      div.innerHTML = itemsHTML;
      extraArea.appendChild(div);
      setTimeout(() => Audio_.speak(word.kr, 0.75, 'ko'), 1100);
    }));
    choicesEl.appendChild(btn);
    activeKeyMap[keyStr] = i;
  });

  correctKey = String(n);
  setKeyHint(`${word.kr} (${word.rom}) — press the number!`);
  setTimeout(() => Audio_.speak(word.kr, 0.75, 'ko'), 300);
  setTimeout(() => Audio_.speak(word.kr, 0.75, 'ko'), 1600);
}

/** Korean Level 4 – "My Body & Actions!"
 * Alternates between body parts and everyday action verbs: hear the
 * Korean word, pick the matching emoji (keys 1-4).
 */
function koreanBodyActionRound() {
  const pool = Math.random() < 0.5 ? KOREAN_BODY : KOREAN_ACTIONS;
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const options = pickN(pool, 4, correct);
  const correctIdx = options.indexOf(correct);

  promptEmoji.textContent = '🇰🇷';
  promptText.innerHTML =
    `<span style="font-size:1.8em;font-weight:bold;">${correct.kr}</span>` +
    `<br><span style="font-size:0.85em;color:#888;">${correct.rom}</span>`;
  extraArea.innerHTML = '';
  extraArea.appendChild(koreanSpeakerButton(correct.kr, 'ko'));

  activeKeyMap = {};
  choicesEl.className = 'choices';
  choicesEl.innerHTML = '';
  options.forEach((w, i) => {
    const keyNum = String(i + 1);
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.key = keyNum;
    btn.innerHTML =
      `<span class="choice-visual" style="font-size:2em;">${w.emoji}</span>` +
      `<span class="choice-subtext" style="font-size:0.75em;color:#888;">${w.en}</span>` +
      `<span class="choice-keycap">${keycapHTML(keyNum)}</span>`;
    btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
      setTimeout(() => Audio_.speak(correct.kr, 0.75, 'ko'), 1100);
    }));
    choicesEl.appendChild(btn);
    activeKeyMap[keyNum] = i;
  });

  correctKey = String(correctIdx + 1);
  setKeyHint(`${correct.kr} (${correct.rom}) = ${correct.en}`);
  setTimeout(() => Audio_.speak(correct.kr, 0.75, 'ko'), 300);
  setTimeout(() => Audio_.speak(correct.kr, 0.75, 'ko'), 1600);
}

/** Korean Level 5 – "Say It in Korean!"
 * The reverse of Match Picture and the hardest level: shows a picture
 * and its English name; player picks the Korean word (Hangul, keys 1-4).
 * Recognition of the written word, production direction.
 */
function koreanSayItRound() {
  preloadKoreanImages();

  const correct = KOREAN_WORDS[Math.floor(Math.random() * KOREAN_WORDS.length)];
  const options = pickN(KOREAN_WORDS, 4, correct);
  const correctIdx = options.indexOf(correct);

  promptEmoji.textContent = correct.emoji;
  promptText.innerHTML =
    `How do you say <b>${correct.en}</b> in Korean?`;
  extraArea.innerHTML = '';
  const imgUrl = KOREAN_IMAGE_CACHE[correct.wiki];
  if (imgUrl) {
    const pic = document.createElement('div');
    pic.style.cssText = 'text-align:center;margin:4px 0;';
    pic.innerHTML = `<img src="${imgUrl}" alt="${correct.en}"
        style="width:110px;height:110px;object-fit:cover;border-radius:14px;">`;
    extraArea.appendChild(pic);
  }
  extraArea.appendChild(koreanSpeakerButton(`How do you say ${correct.en} in Korean?`, 'en'));

  activeKeyMap = {};
  choicesEl.className = 'choices';
  choicesEl.innerHTML = '';
  options.forEach((w, i) => {
    const keyNum = String(i + 1);
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.key = keyNum;
    btn.innerHTML =
      `<span class="choice-visual" style="font-size:1.5em;font-weight:bold;">${w.kr}</span>` +
      `<span class="choice-subtext" style="font-size:0.7em;color:#888;">${w.rom}</span>` +
      `<span class="choice-keycap">${keycapHTML(keyNum)}</span>`;
    btn.addEventListener('click', () => handleAnswer(i, correctIdx, () => {
      // Reward: hear the word she just "said"
      setTimeout(() => Audio_.speak(correct.kr, 0.75, 'ko'), 1100);
    }));
    choicesEl.appendChild(btn);
    activeKeyMap[keyNum] = i;
  });

  correctKey = String(correctIdx + 1);
  setKeyHint(`${correct.en} = ${correct.kr} (${correct.rom})`);
  setTimeout(() => Audio_.speak(`How do you say ${correct.en} in Korean?`, 0.85, 'en'), 300);
}
