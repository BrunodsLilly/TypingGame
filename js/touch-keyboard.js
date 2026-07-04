// ============================================
// TouchKB — on-screen tap keyboard for touch devices (iPad etc.)
// ============================================

/**
 * On-screen QWERTY keyboard singleton for the typing games (Words
 * spelling phase, Fix the Word). Only ever shows on touch-capable
 * devices; on desktop show() is a no-op.
 *
 * Taps are routed through a synthetic `keydown` event on `document`,
 * so the master keyboard handler in game-engine.js processes them
 * exactly like physical key presses — same sounds, animations, and
 * game logic, with no duplicated input code.
 */
const TouchKB = (() => {
  const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

  /** @type {HTMLElement|null} Lazily-built keyboard root element */
  let el = null;

  /** Builds the keyboard DOM once and appends it to <body>. */
  function build() {
    el = document.createElement('div');
    el.className = 'touch-kb';
    el.id = 'touch-kb';
    ROWS.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'touch-kb-row';
      row.split('').forEach(ch => {
        const key = document.createElement('button');
        key.type = 'button';
        key.className = 'touch-kb-key';
        key.dataset.key = ch.toLowerCase();
        key.textContent = ch;
        key.addEventListener('click', () => {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: ch.toLowerCase() }));
        });
        rowEl.appendChild(key);
      });
      el.appendChild(rowEl);
    });
    document.body.appendChild(el);
  }

  /** Shows the keyboard (touch devices only). */
  function show() {
    if (!IS_TOUCH) return;
    if (!el) build();
    el.classList.add('show');
    document.body.classList.add('kb-open');
  }

  /** Hides the keyboard. */
  function hide() {
    if (!el) return;
    el.classList.remove('show');
    document.body.classList.remove('kb-open');
  }

  return { show, hide, get isTouch() { return IS_TOUCH; } };
})();
