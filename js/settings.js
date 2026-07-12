// ============================================
// Settings — persisted options + the Settings screen (for grown-ups)
// ============================================

/**
 * Settings singleton. Persists app options to localStorage (key
 * `luaSettings`) and exposes them to the other modules, which read values
 * at call time behind `typeof Settings !== 'undefined'` guards:
 *
 *   name      Child's name — home title & browser tab (default 'Lua')
 *   lang      Startup language 'en'|'pt' (the L toggle persists here too)
 *   maxStars  Stars that finish a game session: 3 | 5 | 7
 *   srsPreset Spaced-repetition schedule: 'quick'|'standard'|'thorough'
 *             (review delays in days per Leitner box — see progress.js)
 *   voiceRate Speech rate multiplier: 0.8 | 1 | 1.15
 *
 * @type {{
 *   get: (key: string) => *,
 *   set: (key: string, value: *) => void,
 *   srsDelays: () => number[],
 *   SRS_PRESETS: Object<string, number[]>
 * }}
 */
const Settings = (() => {
    const STORAGE_KEY = 'luaSettings';
    const DEFAULTS = { name: 'Lua', lang: 'en', maxStars: 5, srsPreset: 'standard', voiceRate: 1 };

    /** Review delay (days) per Leitner box, per schedule preset. */
    const SRS_PRESETS = {
        quick: [0, 1, 2],
        standard: [0, 1, 3],
        thorough: [0, 1, 3, 7],
    };

    let data = { ...DEFAULTS };
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) data = Object.assign({ ...DEFAULTS }, JSON.parse(saved));
    } catch (_) { /* ignore — use defaults */ }

    function save() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) { /* ignore */ }
    }

    return {
        get: key => data[key],
        set: (key, value) => { data[key] = value; save(); },
        srsDelays: () => SRS_PRESETS[data.srsPreset] || SRS_PRESETS.standard,
        SRS_PRESETS,
    };
})();

/** Applies the child's name to the home title and browser tab. */
function applyChildName() {
    const name = (Settings.get('name') || 'Lua').trim() || 'Lua';
    const title = t('homeTitle').replace('%s', name);
    const titleEl = document.querySelector('.home-title');
    if (titleEl) titleEl.textContent = title;
    document.title = title + '!';
}

// ============================================
// Settings Screen
// ============================================

/** @type {HTMLElement} */
const settingsScreen = document.getElementById('settings');

/** Opens the Settings screen from the home screen. */
function openSettingsScreen() {
    Audio_.tap();
    clearInterval(homeTipTimer);
    homeScreen.classList.remove('active');
    settingsScreen.classList.add('active');
    renderSettingsScreen();
}

/** Closes the Settings screen and returns home. */
function closeSettingsScreen() {
    Audio_.tap();
    settingsScreen.classList.remove('active');
    homeScreen.classList.add('active');
    startHomeTips();
}

/**
 * Builds one row of choice pills.
 * @param {string} setting - Settings key the row controls
 * @param {Array<{value: *, label: string, desc?: string}>} choices
 * @param {*} current - Currently selected value
 * @returns {string} HTML
 */
function stChoicesHTML(setting, choices, current) {
    let html = '<div class="st-choices">';
    choices.forEach(c => {
        const sel = c.value === current ? ' selected' : '';
        html += `<button class="st-choice${sel}" data-setting="${setting}" data-value="${c.value}">`;
        html += `<span class="st-choice-label">${c.label}</span>`;
        if (c.desc) html += `<span class="st-choice-desc">${c.desc}</span>`;
        html += '</button>';
    });
    html += '</div>';
    return html;
}

/** Renders the Settings screen content. */
function renderSettingsScreen() {
    let html = '<div class="pg-header">';
    html += `<button class="back-btn" id="st-back-btn"><span class="keycap" style="font-size:0.7rem; min-width:24px; height:24px;">Esc</span> <span>${t('back')}</span></button>`;
    html += `<h1 class="pg-title">⚙️ ${t('stTitle')}</h1>`;
    html += '</div>';

    // Child's name
    html += `<div class="st-section"><h2 class="st-label">👧 ${t('stName')}</h2>`;
    html += `<input class="st-input" id="st-name" type="text" maxlength="20" value="${(Settings.get('name') || '').replace(/"/g, '&quot;')}"></div>`;

    // Language
    html += `<div class="st-section"><h2 class="st-label">🗣 ${t('stLang')}</h2>`;
    html += stChoicesHTML('lang', [
        { value: 'en', label: '🇺🇸 English' },
        { value: 'pt', label: '🇧🇷 Português' },
    ], lang) + '</div>';

    // Stars per game session
    html += `<div class="st-section"><h2 class="st-label">⭐ ${t('stStars')}</h2>`;
    html += `<div class="st-desc">${t('stStarsDesc')}</div>`;
    html += stChoicesHTML('maxStars', [
        { value: 3, label: '⭐⭐⭐' },
        { value: 5, label: '⭐ 5' },
        { value: 7, label: '⭐ 7' },
    ], MAX_STARS) + '</div>';

    // Spaced repetition schedule
    html += `<div class="st-section"><h2 class="st-label">🌱 ${t('stSrs')}</h2>`;
    html += `<div class="st-desc">${t('stSrsDesc')}</div>`;
    html += stChoicesHTML('srsPreset', [
        { value: 'quick', label: `🐇 ${t('stSrsQuick')}`, desc: t('stSrsQuickDesc') },
        { value: 'standard', label: `🐢 ${t('stSrsStandard')}`, desc: t('stSrsStandardDesc') },
        { value: 'thorough', label: `🐘 ${t('stSrsThorough')}`, desc: t('stSrsThoroughDesc') },
    ], Settings.get('srsPreset')) + '</div>';

    // Voice speed
    html += `<div class="st-section"><h2 class="st-label">🔊 ${t('stVoice')}</h2>`;
    html += stChoicesHTML('voiceRate', [
        { value: 0.8, label: `🐌 ${t('stVoiceSlow')}` },
        { value: 1, label: `${t('stVoiceNormal')}` },
        { value: 1.15, label: `🐆 ${t('stVoiceFast')}` },
    ], Settings.get('voiceRate')) + '</div>';

    settingsScreen.innerHTML = html;

    // Wire up
    settingsScreen.querySelector('#st-back-btn').addEventListener('click', closeSettingsScreen);

    const nameInput = settingsScreen.querySelector('#st-name');
    nameInput.addEventListener('input', () => {
        Settings.set('name', nameInput.value.trim());
        applyChildName();
    });

    settingsScreen.querySelectorAll('.st-choice').forEach(btn => {
        btn.addEventListener('click', () => {
            Audio_.tap();
            const setting = btn.dataset.setting;
            let value = btn.dataset.value;
            if (setting === 'maxStars' || setting === 'voiceRate') value = parseFloat(value);
            Settings.set(setting, value);

            if (setting === 'lang') {
                lang = value;
                updateLangUI();
            } else if (setting === 'maxStars') {
                MAX_STARS = value;
            } else if (setting === 'voiceRate') {
                Audio_.speak(t('encouragements')[0]); // preview the speed
            }
            renderSettingsScreen();
        });
    });
}

// Settings button (bottom bar) — a grown-up screen, so button-only (no home hotkey)
const settingsBtn = document.getElementById('settings-btn');
settingsBtn.addEventListener('click', () => {
    if (settingsScreen.classList.contains('active')) closeSettingsScreen();
    else if (homeScreen.classList.contains('active')) openSettingsScreen();
});

// Keyboard on the Settings screen: Esc = back (other keys type into the name field)
document.addEventListener('keydown', (e) => {
    if (!settingsScreen.classList.contains('active')) return;
    if (e.key === 'Escape') closeSettingsScreen();
});

// ── Apply persisted settings on startup ──
lang = Settings.get('lang') === 'pt' ? 'pt' : 'en';
MAX_STARS = [3, 5, 7].includes(Settings.get('maxStars')) ? Settings.get('maxStars') : 5;
updateLangUI(); // refreshes card labels, tips, lang button — and the title via applyChildName()
