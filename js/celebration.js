// ============================================
// Celebration / Particles
// ============================================

/** @type {HTMLElement} */
const celebOverlay = document.getElementById('celebration');

/** @type {HTMLElement} */
const celebText = document.getElementById('celeb-text');

/**
 * Pool of cheer messages shown during celebration overlays.
 * @type {Array<{text: string, color: string}>}
 */
const CHEERS = [
    { text: 'YAY!', color: '#2ecc71' },
    { text: 'WOW!', color: '#f1c40f' },
    { text: 'GREAT!', color: '#e67e22' },
    { text: 'SUPER!', color: '#4dc9f6' },
    { text: 'COOL!', color: '#c44dff' },
    { text: 'NICE!', color: '#ff6b9d' },
];

/**
 * Displays a celebration overlay with a random cheer message
 * and emoji particle burst from the center of the screen.
 */
function showCelebration() {
    const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
    celebText.textContent = cheer.text;
    celebText.style.color = cheer.color;
    celebOverlay.classList.add('active');

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const emojis = ['\u2B50', '\uD83C\uDF89', '\u2728', '\uD83D\uDC96', '\uD83C\uDF1F', '\uD83C\uDF88'];
    for (let i = 0; i < 14; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.fontSize = (1.2 + Math.random() * 1.5) + 'rem';
        p.style.left = cx + 'px';
        p.style.top = cy + 'px';
        const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.5;
        const dist = 80 + Math.random() * 140;
        p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * dist - 40 + 'px');
        p.style.setProperty('--tr', (Math.random() * 360) + 'deg');
        celebOverlay.appendChild(p);
        setTimeout(() => p.remove(), 1300);
    }

    setTimeout(() => {
        celebOverlay.classList.remove('active');
        celebText.style.transform = '';
    }, 1200);
}

/**
 * Displays a grand finale celebration when all stars are earned.
 * Shows multiple waves of confetti, a big congratulations message,
 * and firework-style particle bursts from multiple positions.
 */
function showGrandFinale() {
    celebText.textContent = (typeof t === 'function') ? t('allStarsText') : '\u2B50 ALL STARS! \u2B50';
    celebText.style.color = '#f1c40f';
    celebOverlay.classList.add('active');

    const emojis = ['\u2B50', '\uD83C\uDF89', '\u2728', '\uD83D\uDC96', '\uD83C\uDF1F', '\uD83C\uDF88', '\uD83C\uDF86', '\uD83E\uDD73', '\uD83C\uDFC6', '\uD83D\uDCAB'];
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Three waves of particles from different positions
    for (let wave = 0; wave < 3; wave++) {
        setTimeout(() => {
            const cx = w * (0.2 + Math.random() * 0.6);
            const cy = h * (0.3 + Math.random() * 0.4);
            for (let i = 0; i < 20; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                p.style.fontSize = (1.5 + Math.random() * 2) + 'rem';
                p.style.left = cx + 'px';
                p.style.top = cy + 'px';
                const angle = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.5;
                const dist = 100 + Math.random() * 200;
                p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
                p.style.setProperty('--ty', Math.sin(angle) * dist - 60 + 'px');
                p.style.setProperty('--tr', (Math.random() * 720) + 'deg');
                p.style.animationDuration = '1.8s';
                celebOverlay.appendChild(p);
                setTimeout(() => p.remove(), 2000);
            }
        }, wave * 500);
    }

    setTimeout(() => {
        celebOverlay.classList.remove('active');
        celebText.style.transform = '';
    }, 2500);
}
