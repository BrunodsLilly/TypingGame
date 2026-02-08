# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Lua's Learning Adventure" — a keyboard-only educational game for a 3-year-old, built as a single-file HTML/CSS/JS application (`index.html`). No build tools, no frameworks, no dependencies.

## Running Locally

Serve via any static HTTP server (no build step):
```bash
npx http-server -p 8766 -c-1
# Then open http://localhost:8766/index.html
```

There are no tests, linter, or CI pipeline.

## Architecture

Everything lives in `index.html` (~1550 lines). The file is structured in order:

1. **CSS** — Custom properties (`:root`), animations (`@keyframes`), responsive breakpoints
2. **HTML** — Two screens: `#home` (game selection grid) and `#game` (reused for all modes), plus celebration overlay and key hint bar
3. **JavaScript** — Organized into clearly labeled sections:

### Key Architectural Patterns

**Screen Navigation**: Two `<div class="screen">` elements toggled via `.active` class. The `#game` screen is shared across all 7 modes — its content is rebuilt each round.

**Keyboard-First Input**: All interaction is keyboard-driven (critical constraint — the target user can only use a keyboard, not a mouse). Each game mode populates `activeKeyMap` (a dict mapping key strings to choice indices) and sets `correctKey`. The master `keydown` listener at the bottom dispatches through this map.

**Game Mode Pattern**: Each mode follows the same structure:
- A `*Round()` function (e.g., `colorsRound()`, `wordsRound()`) that sets up the prompt, choices, `activeKeyMap`, `correctKey`, hint timer, and voice prompt
- `handleAnswer(selectedIdx, correctIdx)` is the shared handler for all choice-based games (Colors, Shapes, Count, Letters, Animals, Math)
- Words mode is special — it uses `handleWordKeyPress(key)` for letter-by-letter typing instead of the shared answer handler

**7 Game Modes**: Colors (1), Shapes (2), Count (3), Letters/ABCs (4), Animals (5), Math (6), Words (7). Home screen maps number keys 1-7 to games via `gameMap`.

**Audio**: `Audio_` singleton using Web Audio API for sound effects (tones) and Web Speech API (`SpeechSynthesis`) for voice prompts. No external audio files or API keys.

**Progress**: 10-star system per session, streak counter with fire badge at 3+. Completing all 10 stars triggers congratulations and returns home.

## Design Constraints

- **Keyboard-only**: Never introduce mouse/touch-dependent interactions. Every game must work via keyboard keys with visual keycap badges showing which key to press.
- **Single file**: Keep everything in `index.html`. No external dependencies, no build step.
- **3-year-old audience**: Large visuals, simple choices (max 4 options), encouraging voice feedback, auto-hints after 5 seconds, pulsing keycap on correct answer.
- **Voice**: The correct key to press is always spoken aloud and shown visually.
