# Metagrid electrical-suite tests

Verification harnesses for the single-file electrical apps (`residential-wiring-reference.html`,
`basement-planner.html`, `panel-schedule-56HA.html`) and the shared rules module `wiring-shared.js`.

These are plain Node scripts (no test framework). They use `jsdom` (a devDependency) to load each
single-file app, polyfill the bits jsdom lacks (`structuredClone`, a real `localStorage`, SVG CTM),
and exercise real behavior.

## Run

`jsdom` is intentionally **not** in the site's `package.json` (the electrical suite is zero-dependency
and we keep the marketing-site lockfile clean). Install it as a dev-only tool, then run:

```bash
npm i -D jsdom --no-save   # dev-only; not committed to package.json
npm run test:suite         # runs all four suites
# or individually:
node tests/regression.test.js
```

## What each suite covers

| File | Covers |
|------|--------|
| `regression.test.js` | `boxFill` (NEC 314.16 **per-gauge** model) and `loadEstimate` (NEC 220.83) are **regression-equal** to the inline math — an oracle replicates the inline arithmetic verbatim and is fuzzed against the module (~8000 assertions). This is the tripwire if the inline `calc()` ever drifts. |
| `t1-deeplinks.test.js` | `wiring-shared.js` loads in all three apps; deep links open the target (`#part6`/`#calc`, `#circuit=11`, `#circuit=4+6` with literal `+`). |
| `t2-bridge.test.js` | Two jsdom contexts sharing one `localStorage`: panel publishes `circuits[]`/`loads[]`, planner assigns an item to a circuit via the real inspector dropdown, `circuitId` round-trips through `metagrid.project.v1`; cross-tab re-publish and focus re-read preserve the link. |
| `t3-touch.test.js` | Pointer events: place / drag / undo / floor-switch / delete via the real handlers; mobile action bar + drawer toggle. |

## Notes

- The box-fill math is **per-gauge mixed-gauge** (`cond14`/`cond12`/`cond10`); grounds/clamps/devices
  count at the largest conductor present (NEC 314.16(B)(5)). Keep the module and the inline `calc()`
  output-identical — `regression.test.js` enforces it.
- `spacingCheck()` and `bom()` are new helpers with no inline original; their geometric outputs are
  schematic / `[ASSUMED]` (planner coords are NOT TO SCALE).
