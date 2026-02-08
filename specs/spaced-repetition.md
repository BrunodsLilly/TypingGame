# Plan: Persistence API + Spaced Repetition

## Context
Games currently select items randomly. We want cross-session spaced repetition so items the child struggles with appear more often. This requires persisting interaction events to disk via a local API server, and an SR algorithm that weights item selection based on the event history.

Architecture: dumb backend (append-only event store), smart frontend (SR algorithm). No logic duplication.

## New Files

```
TypingGame/
  server.js                 NEW — static file server + /api/events endpoint (~50 lines)
  data/events.jsonl         NEW — append-only event log (auto-created)
  js/persistence.js         NEW — API adapter: appendEvent(), getEvents()
  js/spaced-repetition.js   NEW — SM-2 algorithm, getWeightedItem(), logSREvent()
  jsconfig.json             NEW — enables VS Code type-checking on JSDoc
```

## Modified Files

```
  index.html                Add 2 <script> tags (persistence.js, spaced-repetition.js)
  js/game-engine.js         Add currentRoundItem global, SR hooks in handleAnswer + startGame
  js/game-rounds.js         Replace Math.random() item picks with getWeightedItem() in all 10 games
  CLAUDE.md                 Document persistence and SR
```

## Script Load Order

```html
<script src="js/audio.js"></script>
<script src="js/celebration.js"></script>
<script src="js/game-engine.js"></script>
<script src="js/persistence.js"></script>          <!-- NEW: API adapter -->
<script src="js/spaced-repetition.js"></script>    <!-- NEW: SR algorithm -->
<script src="js/game-rounds.js"></script>
```

## 1. server.js

Minimal Node.js server, zero dependencies (uses built-in `http`, `fs`, `path`):

- Serves static files from project root (replaces `npx http-server`)
- `GET /api/events` — returns `data/events.jsonl` as text/plain (empty 200 if file doesn't exist)
- `POST /api/events` — appends one JSON line to `data/events.jsonl`, returns 201
- Auto-creates `data/` directory on first write
- Start with: `node server.js` (port 8766)

## 2. js/persistence.js (~30 lines)

```js
const Persistence = {
  async getEvents() → fetch GET, parse JSONL into array
  async appendEvent(event) → fetch POST, fire-and-forget
}
```

## 3. Event Schema

Each event is one JSON line:
```json
{"ts":1707350400000,"game":"colors","item":"teal","ok":true,"session":"2026-02-08T04:00Z","stars":3}
```

| Field | Type | Description |
|-------|------|-------------|
| `ts` | number | Date.now() |
| `game` | string | Game mode ID |
| `item` | string | Unique item key (see per-game table below) |
| `ok` | boolean | Correct on first attempt |
| `session` | string | ISO timestamp from startGame() |
| `stars` | number | Star count at time of answer |

**Item keys per game:**
- colors: `c.name` ("red", "teal")
- shapes: `s.name` ("circle")
- count: `String(n)` ("3")
- letters: the letter ("A")
- animals: `a.name` ("cat")
- math: `n1+"+"+n2` ("2+3")
- words: `w.word` ("CAT")
- patterns: `p.name` ("fruits")
- rhymes: `prompt.word+"->"+answer.word` ("CAT->HAT")
- elements: `e.symbol` ("Au")
- memory: **excluded from SR** (spatial recall doesn't fit the model)

## 4. js/spaced-repetition.js (~200 lines)

### SM-2 Adaptation

**Binary quality mapping:**
- Correct → q=4 (not q=5, since 4-choice has 25% guess rate)
- Wrong → q=1 (child sees correct answer after, so not total blackout)

**EF update (standard SM-2):**
```
EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
Correct: EF unchanged (q=4 → delta = 0.0)
Wrong:   EF -= 0.54  (q=1, clamped at 1.3 min)
```

**Interval progression (correct streak):**
```
rep 1: interval = 1 session
rep 2: interval = 3 sessions
rep n: interval = round(prev × EF), capped at floor(poolSize × 0.5)
```

Wrong answer: reset repetition=0, interval=1.

**Per-item state:**
```js
{ ef: 2.5, interval: 1, repetition: 0, lastSession: 0, lastTs: 0, totalCorrect: 0, totalAttempts: 0 }
```

### Selection: getWeightedItem(pool, gameId, keyFn)

```
30% → pure random (exploration / confidence building)
70% → weighted by SR score:
```

**Weight function:**
| Situation | Weight |
|-----------|--------|
| Never seen | 10.0 (or 0.5 if 3+ new items already this session) |
| Just reviewed (overdue ratio ≈ 0) | 0.1 |
| Due now (ratio = 1.0) | 2.0 |
| 2x overdue (ratio = 2.0) | 4.0 |
| Shown in last 2 rounds | weight × 0.1 (dedup penalty) |

Formula:
```
overdueRatio = sessionsSinceLast / cappedInterval
if ratio >= 1: weight = 2.0 + (ratio - 1) * 2.0
if ratio < 1:  weight = 0.1 + ratio * 0.5
```

### Startup

```js
async function initSpacedRepetition() {
  const events = await Persistence.getEvents();
  scoreTable = buildScoreTable(events);  // replay all events through SM-2
}
```

### Event Logging

`logSREvent(gameId, itemKey, wasCorrect)`:
1. Update in-memory scoreTable (synchronous)
2. Fire-and-forget POST via Persistence.appendEvent()

## 5. Integration into game-engine.js

**New global:** `let currentRoundItem = null;`

**startGame(game):** Add session init:
```js
currentSessionId = new Date().toISOString();
sessionCounts[game] = (sessionCounts[game] || 0) + 1;
newItemsThisSession = 0;
recentItems[game] = [];
```

**handleAnswer():** Log on first attempt:
```js
if (currentRoundItem) {
  logSREvent(currentGame, currentRoundItem, selectedIdx === correctIdx);
  if (selectedIdx === correctIdx) currentRoundItem = null;
}
```

Only clear `currentRoundItem` on correct — wrong answer logs once, then retries don't re-log.

## 6. Integration into game-rounds.js

Each round function changes in 2 lines:

**Before:**
```js
const correct = POOL[Math.floor(Math.random() * POOL.length)];
```

**After:**
```js
const correct = getWeightedItem(POOL, 'gameId', item => item.key);
currentRoundItem = item.key;
```

**Special cases:**
- **Count:** Build pool `[1,2,...,maxCount]`, use `getWeightedItem(pool, 'count', n => String(n))`
- **Math:** Build pool of `{n1, n2}` objects for all combinations, use `getWeightedItem(pool, 'math', p => p.n1+'+'+p.n2)`
- **Words:** Replace queue with `getWeightedItem(wordPool, 'words', w => w.word)`. Track `wordHadError` flag, log single event on word completion.
- **Rhymes:** SR selects the group, then prompt/answer shuffled within group. `currentRoundItem = prompt.word + '->' + answer.word`
- **Memory:** No SR. Keep random. Don't set `currentRoundItem`.

## 7. jsconfig.json

```json
{
  "compilerOptions": {
    "checkJs": true,
    "strict": true
  },
  "include": ["js/**/*.js"]
}
```

## 8. Graceful Degradation

If the server is down: `getEvents()` returns [], scoreTable stays empty, every item gets weight 10.0 → uniform random (original behavior). `appendEvent()` silently fails. Games work exactly as before.

## Implementation Steps

1. Write `server.js` (static server + JSONL API)
2. Write `js/persistence.js` (API adapter)
3. Write `js/spaced-repetition.js` (SM-2, getWeightedItem, buildScoreTable, logSREvent)
4. Edit `js/game-engine.js` (currentRoundItem, SR hooks in handleAnswer + startGame)
5. Edit `js/game-rounds.js` (replace random picks in all 10 non-memory games)
6. Edit `index.html` (add 2 script tags)
7. Write `jsconfig.json`
8. Update `CLAUDE.md`

## Verification

1. Start with `node server.js`, open http://localhost:8766
2. Play Elements game — answer a few correctly, one wrong
3. Check `data/events.jsonl` has the logged events
4. Reload the page — verify the item answered wrong appears sooner
5. Play Colors at 5+ stars — verify advanced colors appear and SR weights them
6. Check no console errors beyond favicon.ico 404
7. Kill the server, reload — verify game still works (random fallback)
