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
  index.html            HTML shell — links CSS and 5 JS files
  css/
    styles.css          All CSS: variables, animations, responsive breakpoints
  js/
    audio.js            Audio_ IIFE (Web Audio API + SpeechSynthesis) + sound button
    celebration.js      Celebration overlay, CHEERS data, particle burst, grand finale
    i18n.js             Language state (lang), I18N translations dict, t() helper
    game-engine.js      Navigation, state, utils, answer handler, keyboard listener
    game-rounds.js      All game data constants + all 11 round functions + helpers
  CLAUDE.md             This file
```

### Script Load Order

```html
<script src="js/audio.js"></script>        <!-- no deps, defines Audio_ -->
<script src="js/celebration.js"></script>   <!-- no deps besides DOM -->
<script src="js/i18n.js"></script>          <!-- defines lang, I18N, t() -->
<script src="js/game-engine.js"></script>   <!-- needs Audio_, showCelebration, t() -->
<script src="js/game-rounds.js"></script>   <!-- needs everything above -->
```

All scripts share the global scope (no modules, no bundler). The load order matters because later scripts reference globals defined by earlier ones.

## Architecture

### Key Architectural Patterns

**Screen Navigation**: Two `<div class="screen">` elements toggled via `.active` class. The `#game` screen is shared across all 11 modes — its content is rebuilt each round.

**Keyboard-First Input**: All interaction is keyboard-driven (critical constraint — the target user can only use a keyboard, not a mouse). Each game mode populates `activeKeyMap` (a dict mapping key strings to choice indices) and sets `correctKey`. The master `keydown` listener in `game-engine.js` dispatches through this map.

**Game Mode Pattern**: Each mode follows the same structure:
- A `*Round()` function (e.g., `colorsRound()`, `wordsRound()`) in `game-rounds.js` that sets up the prompt, choices, `activeKeyMap`, `correctKey`, hint timer, and voice prompt
- `handleAnswer(selectedIdx, correctIdx)` in `game-engine.js` is the shared handler for choice-based games
- Words mode uses `handleWordKeyPress(key)` for letter-by-letter typing
- Memory mode uses `handleMemoryKeyPress(key)` for card flipping

**11 Game Modes** (keys 1-9, 0, E):
1. **Colors** — Find the named color swatch
2. **Shapes** — Find the named shape (SVG)
3. **Count** — Count emoji items and press the number
4. **Letters/ABCs** — Press the shown letter on keyboard
5. **Animals** — Match animal to its sound
6. **Math** — Addition problems with visual emoji groups
7. **Words** — Pick a word from 3 choices (keys 1/2/3), then spell it letter-by-letter
8. **Patterns** — Complete the repeating pattern sequence
9. **Rhymes** — Find the word that rhymes
0. **Memory** — Flip cards to find matching pairs
E. **Elements** — Identify periodic table elements from their symbol

**Progressive Difficulty**: Colors (advanced colors at 3+), Count, Math, Patterns, Words, and Elements (no atomic number at 3+) get harder at 3+ stars.

**No Answer Giveaways**: Choice-based games do NOT highlight the correct answer or auto-hint. The child is expected to be supervised by an adult who provides contextual help when needed. Voice prompts ask the question without revealing which key to press.

**Audio**: `Audio_` singleton in `audio.js` using Web Audio API for sound effects (tones) and Web Speech API (`SpeechSynthesis`) for voice prompts. No external audio files or API keys.

**Progress**: 5-star system per session, streak counter with fire badge at 3+ (animated fire at 5+). Completing all 5 stars triggers a grand finale celebration with multi-wave particle burst.

**Color Theming**: Each game has a theme color that tints the game screen header area, matching the home screen card border color.

**Bilingual Mode (EN/PT)**: A language toggle button (bottom-left, or `L` key on home screen) switches between English and Portuguese. When PT is active: voice prompts speak Portuguese (pt-BR), choice labels show both languages (e.g. "vermelho" with "red" below), home card labels switch to Portuguese names. The `lang` global ('en'|'pt') is defined in `i18n.js`. All UI strings go through the `t()` helper. Words and Rhymes games remain English-only (spelling/rhyming is language-specific). Game data objects have `pt` fields for Portuguese names (Colors, Shapes, Animals, Elements).

## Design Constraints

- **Keyboard-only**: Never introduce mouse/touch-dependent interactions. Every game must work via keyboard keys with visual keycap badges showing which key to press.
- **No build tools**: Plain `<script>` tags sharing global scope. No modules, no bundler, no transpiler.
- **No external dependencies**: Everything is self-contained. No CDN links, no npm packages.
- **3-year-old audience**: Large visuals, simple choices (max 4 options), encouraging voice feedback. No auto-hints — adult supervision provides contextual scaffolding.
- **Voice**: Questions are spoken aloud. Wrong answers get encouraging "try again" speech. The correct key is NOT revealed in voice prompts — the 5-second auto-hint provides help when needed.
