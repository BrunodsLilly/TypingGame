# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Lua's Learning Adventure" — a keyboard-only educational game for a 3-year-old. No build tools, no frameworks, no dependencies. Plain HTML/CSS/JS served via any static HTTP server.

## Running Locally

Serve via any static HTTP server (no build step):
```bash
npx http-server -p 8766 -c-1
# Then open http://localhost:8766/index.html
```

There are no tests, linter, or CI pipeline.

## File Structure

```
TypingGame/
  index.html            HTML shell — links CSS and 7 JS files
  css/
    styles.css          All CSS: variables, animations, responsive breakpoints
  js/
    audio.js            Audio_ IIFE (Web Audio API + SpeechSynthesis) + sound button
    celebration.js      Celebration overlay, CHEERS data, particle burst, grand finale
    touch-keyboard.js   TouchKB IIFE — on-screen QWERTY for touch devices (typing games)
    i18n.js             Language state (lang), I18N translations dict, t() helper
    game-engine.js      Navigation, state, utils, answer handler, keyboard listener
    game-rounds.js      All game data constants + all round functions + helpers
    progress.js         Progress IIFE (localStorage stats + mistake log) + Progress screen
  CLAUDE.md             This file
```

### Script Load Order

```html
<script src="js/audio.js"></script>          <!-- no deps, defines Audio_ -->
<script src="js/celebration.js"></script>    <!-- no deps besides DOM -->
<script src="js/touch-keyboard.js"></script> <!-- no deps, defines TouchKB -->
<script src="js/i18n.js"></script>           <!-- defines lang, I18N, t() -->
<script src="js/game-engine.js"></script>    <!-- needs Audio_, showCelebration, t() -->
<script src="js/game-rounds.js"></script>    <!-- needs everything above -->
<script src="js/progress.js"></script>       <!-- needs everything above; engine calls it via typeof guards -->
```

All scripts share the global scope (no modules, no bundler). The load order matters because later scripts reference globals defined by earlier ones.

## Architecture

### Key Architectural Patterns

**Screen Navigation**: Three `<div class="screen">` elements (`#home`, `#game`, `#progress`) toggled via `.active` class. The `#game` screen is shared across all 19 modes — its content is rebuilt each round.

**Keyboard-First Input**: All interaction is keyboard-driven. Each game mode populates `activeKeyMap` (a dict mapping key strings to choice indices) and sets `correctKey`. The master `keydown` listener in `game-engine.js` dispatches through this map.

**Touch/iPad Support**: Every keyboard interaction has a touch equivalent. Choice buttons, memory cards, level-picker buttons, and the Words picker (carousel + favorites) are tappable. The free-typing games (Words spelling phase, Fix the Word) show `TouchKB` — an on-screen QWERTY (`touch-keyboard.js`) that appears only on touch-capable devices and routes taps through synthetic `keydown` events, so the master keyboard handler processes them identically to physical keys. Rounds call `TouchKB.show()`/`TouchKB.hide()`; `goHome()` always hides it.

**Game Mode Pattern**: Each mode follows the same structure:
- A `*Round()` function (e.g., `colorsRound()`, `wordsRound()`) in `game-rounds.js` that sets up the prompt, choices, `activeKeyMap`, `correctKey`, hint timer, and voice prompt
- `handleAnswer(selectedIdx, correctIdx)` in `game-engine.js` is the shared handler for choice-based games
- Words mode uses `handleWordKeyPress(key)` for letter-by-letter typing
- Fix the Word mode uses `handleFixWordKeyPress(key)` for free letter typing
- Memory mode uses `handleMemoryKeyPress(key)` for card flipping
- Word Search mode uses `handleWordSearchKey(key)` for row/column picking

**19 Game Modes** (keys 1-9, 0, E, R, G, K, N, T, F, P, W):
1. **Colors** — Find the named color swatch
2. **Shapes** — Find the named shape (SVG)
3. **Count** — Count emoji items and press the number
4. **Letters/ABCs** — See a picture (e.g. a kite), guess what letter it starts with, and press that key
5. **Animals** — Match animal to its sound
6. **Math** — Addition problems with visual emoji groups
7. **Words** — Pick a word from 3 choices (keys 1/2/3), then spell it letter-by-letter
8. **Patterns** — Complete the repeating pattern sequence
9. **Rhymes** — Find the word that rhymes
0. **Memory** — Flip cards to find matching pairs
E. **Opposites** — Find the opposite concept (big/small, hot/cold, etc.)
R. **Reading** — Onset-rime blending (press starting letter), then full CVC blending at 3+ stars
G. **Geometry** — Sides, corners, and shape names (3 levels)
K. **Korean** — Korean words and phrases (6 levels): match pictures to spoken vocabulary, phrase comprehension, polite "___ 주세요" requests, colors & native numbers 1-5, body parts & action verbs, and reverse mode (see a picture, pick the Hangul word)
N. **More & Less** — Pre-addition number sense (3 levels): compare which group has more/fewer, one more/one less on a number line, number bonds on a five-frame (ten-frame at 3+ stars)
T. **Take Away** — Subtraction (3 levels): story mode where an animal eats treats and the child counts what's left, visual `n − k = ?` equations with crossed-out items, and mixed +/− practice
F. **Fix the Word** — Free-typing spelling recall (3 levels): a word from `WORDS_DATA` appears with hidden letters and the child types what's missing — first letter, any one letter, or two letters. Uses `handleFixWordKeyPress(key)`; no on-screen key hint (the word is spoken instead; the letter is spoken as a rescue hint after two misses)
P. **Portuguese** — Brazilian Portuguese words and phrases (6 levels), mirroring the Korean game's structure: match pictures to spoken vocabulary, phrase comprehension, polite "___, por favor" requests, colors & numbers 1-5, body parts & action verbs, and reverse mode (see a picture, pick the Portuguese word). Shares Wikipedia photo thumbnails with the Korean game via `KOREAN_IMAGE_CACHE` (keyed by wiki title)
W. **Word Search** — Find a word from `WORDS_DATA` hidden in a letter grid (3 levels): press the number of the row that hides it (level 1), rows 1-4 or columns 5-8 (level 2), and level 3 adds a look-alike decoy word so every letter must be checked. The word and emoji clue are shown, but its location is never hinted at; the letters light up and are spelled aloud only after a correct pick. `wsBuildGrid()` guarantees exactly one row/column contains the word

**Progressive Difficulty**: Colors (advanced colors at 3+), Count, Math, Patterns, Words, More & Less, Take Away, Fix the Word, and Word Search (longer words, trickier filler letters) get harder at 3+ stars.

**No Answer Giveaways**: Choice-based games do NOT highlight the correct answer or auto-hint. The child is expected to be supervised by an adult who provides contextual help when needed. Voice prompts ask the question without revealing which key to press.

**Audio**: `Audio_` singleton in `audio.js` using Web Audio API for sound effects (tones) and Web Speech API (`SpeechSynthesis`) for voice prompts. No external audio files or API keys.

**Progress**: 5-star system per session, streak counter with fire badge at 3+ (animated fire at 5+). Completing all 5 stars triggers a grand finale celebration with multi-wave particle burst.

**Persistent Progress & Mistake Replay** (`progress.js`): The `Progress` IIFE persists per-game stats (plays, correct, wrong, finales) and a mistake log to localStorage (key `luaProgress`). Rounds are generated deterministically: `nextRound()` swaps `Math.random` for a seeded PRNG (`mulberry32`) for the synchronous duration of the round function, so `game + level + seed + stars` fully reconstruct any round — including star-gated difficulty, since `stars` is temporarily set to the recorded value during replay. Wrong answers are recorded via the shared `resetStreak()` hook (every mode calls it exactly once per wrong answer; Memory is excluded because mismatched flips are normal gameplay); correct answers via `earnStar()`. Words-mode mistakes store the word itself and replay jumps straight into spelling it (`selectWord`). New game modes get all of this for free as long as they generate the round synchronously inside their `*Round()` function and call `resetStreak()`/`earnStar()` once per answer.

**Spaced Repetition** (`progress.js`): Each mistake carries Leitner-box state (`box`, `due`): box 0 🌱 is due immediately, a correct *due* review promotes it (box 1 🌿 due next day, box 2 🌳 due in 3 days), and a correct due review at box 2 graduates it ("Mastered"). Promotion only happens when the item is actually due (early practice is a no-op), and any wrong answer demotes to box 0 and stamps `meta.lapsed` so the same round's eventual correct answer doesn't promote. Due timestamps are local-midnight based so "tomorrow" means any time the next day. The Progress screen (`#progress`, opened with `S` on home or the 📊 button, which shows a due-count badge) has a "Ready to Practice" list (tap or press 1-9 to replay one, `R`/"Practice All" to review everything due) and a display-only "Growing" list showing when each item comes back. Review sessions chain items across game modes: `nextRound()` calls `advanceReviewSession()` (driven by the `reviewMode`/`reviewQueue` globals in game-engine.js) which feeds each mistake through the `pendingRetry` replay path with a fresh mini-session per item (stars reset, so the 5-star finale can't hijack the queue), and ends with a grand-finale celebration back on the Progress screen. Retries/reviews don't count as plays; Escape exits a review cleanly via `goHome()`.

**Color Theming**: Each game has a theme color that tints the game screen header area, matching the home screen card border color.

**Bilingual Mode (EN/PT)**: A language toggle button (bottom-left, or `L` key on home screen) switches between English and Portuguese. When PT is active: voice prompts speak Portuguese (pt-BR), choice labels show both languages (e.g. "vermelho" with "red" below), home card labels switch to Portuguese names. The `lang` global ('en'|'pt') is defined in `i18n.js`. All UI strings go through the `t()` helper. Words, Fix the Word, Word Search, and Rhymes games use English words (spelling/rhyming is language-specific); Word Search UI strings still translate. Game data objects have `pt` fields for Portuguese names (Colors, Shapes, Animals, Elements).

## Design Constraints

- **Keyboard-first, touch-supported**: Every game must work via keyboard keys with visual keycap badges showing which key to press. Every interaction must ALSO work by tapping (iPad support): give buttons click handlers, and use `TouchKB` for any free-typing input.
- **No build tools**: Plain `<script>` tags sharing global scope. No modules, no bundler, no transpiler.
- **No external dependencies**: Everything is self-contained. No CDN links, no npm packages.
- **3-year-old audience**: Large visuals, simple choices (max 4 options), encouraging voice feedback. No auto-hints — adult supervision provides contextual scaffolding.
- **Voice**: Questions are spoken aloud. Wrong answers get encouraging "try again" speech. The correct key is NOT revealed in voice prompts — the 5-second auto-hint provides help when needed.
