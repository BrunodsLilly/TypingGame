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
