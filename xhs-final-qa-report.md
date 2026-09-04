# 尺素入江 — Final Rendered XHS QA

Date: 2026-09-04

## A. FINAL STATUS

PASS — XHS DEVICE TEST STILL REQUIRED

The existing release candidate passed the completed local HTTP rendered-QA matrix. No production P0/P1 defect was reproduced. Production files and the release ZIP were not changed during this QA completion run.

## B. QA SERVER

- URL: `http://127.0.0.1:4180/`
- HTTP status: PASS — HTTP 200 for `index.html` and all 18 runtime references.
- MIME/runtime loading: PASS — WebP, WOFF2, and OGG assets loaded from the loopback release server with correct content types; no 404, MIME, CSP, or gameplay-blocking runtime failure.

## C. VIEWPORTS

| Viewport | Result | Rendered evidence |
|---|---|---|
| 1440×810 | PASS | All five origin controls rendered fully in bounds. |
| 1920×1080 | PASS | All five origin controls rendered fully in bounds. |
| 360×800 | PASS | Five origin controls visible, non-overlapping, in bounds; Journey and destination flow usable. |
| 375×812 | PASS | Five origin controls visible, non-overlapping, in bounds; Journey and destination flow usable. |
| 390×844 | PASS | Full opening-to-ending mobile flow completed with Chrome device touch emulation active (`pointer: coarse`; `hover: none`). |
| 430×932 | PASS | Full opening-to-`FINAL_IDLE` mobile flow completed with Chrome device touch emulation active (`pointer: coarse`; `hover: none`). |

At both full-flow mobile sizes, touch emulation remained active through the interaction sequence. The final still showed the title and seal, with no residual paper and no enabled firefly target.

## D. ORIGIN PATHS

| Choice | Result | Rendered evidence |
|---|---|---|
| 去 | PASS | Distinct Journey content rendered and progressed normally. |
| 做 | PASS | Distinct Journey content rendered and progressed normally. |
| 说 | PASS | Distinct Journey content rendered and progressed normally. |
| 放 | PASS | Distinct Journey content rendered and progressed normally. |
| 写 | PASS | Distinct Journey content rendered and progressed normally; used in the 430×932 full touch flow. |

Choice Echo was not added or tested.

## E. INTERACTIONS

| Item | Result | Evidence |
|---|---|---|
| Paper | PASS | The visible paper target and its rendered hit area were aligned and touch-usable; activation disabled the target, completed submergence, and left zero paper/ripple/wake nodes at `FINAL_IDLE`. |
| Firefly | PASS | The visible guide and 64×64 rendered hit target were aligned and touch-usable; one activation disabled the target and continued the pavilion response. |
| Pavilion | PASS | Observed order: firefly → lantern/water response → quiet beat/cup beat → `亭里的杯盏轻轻一响` → `有人抬头望向江面` → ending. The narrative was not skipped. |
| FINAL_IDLE | PASS | Ending title and seal visible, ending `aria-hidden=false`, `is-cinematic-ending-still` active, paper nodes removed, and firefly target not enabled. |

## F. AUDIO

| Item | Result | Evidence |
|---|---|---|
| Unlock | PASS | The first landing gesture unlocked audio and began the flow without an autoplay failure. |
| Mute | PASS | Mute set `aria-pressed=true`; the muted interaction path continued normally. Unmute restored `aria-pressed=false` and did not block subsequent cues or progression. |
| Restart | PASS | Repeated rendered reloads returned to a clean opening; later flows accepted new origin choices without stale interaction residue or audio lifecycle error. |
| Visibilitychange | PASS | Backgrounding and restoring the QA tab left the flow usable and produced no console/runtime error or duplicated lifecycle failure. |
| Duplicate playback | PASS | Single-use paper/firefly targets disabled immediately; no duplicate-audio lifecycle error appeared. Static/runtime audit retained exactly the six intended OGG cues: river, bamboo, boat, paper-water, firefly-lantern, and cup-chime. |

## G. REDUCED MOTION

PASS

DevTools emulation reported `matchMedia('(prefers-reduced-motion: reduce)').matches === true`. Decorative scene animation computed to `none`; a complete rendered flow still reached `FINAL_IDLE`, and the paper and firefly interactions remained usable. Audio controls remained independent of the reduced-motion media preference.

## H. SELF-CONTAINED / EXTERNAL REQUESTS

PASS

All 18 runtime requests resolved from `127.0.0.1:4180`. No runtime request used an external domain, CDN, API, remote font, remote image, or remote audio. The release HTML contains no `http://`, `https://`, `localhost`, or `127.0.0.1` production reference. The ZIP contains only local release files.

## I. CONSOLE

PASS

Chrome DevTools reported `0` console messages after the final 430×932 full touch flow. No warning, uncaught exception, unhandled rejection, missing-resource 404, autoplay failure, external request, or duplicate-audio lifecycle error was observed during the rendered QA runs.

## J. PERFORMANCE

PASS (observational)

The complete mobile flows showed no obvious freeze, severe frame collapse, runaway animation, or growing interaction DOM. Paper nodes were removed at the ending, the firefly target was disabled after use, and repeated reloads returned to a clean opening without visible timer or ambience stacking.

## K. RELEASE PACKAGE

- Changed during this QA: NO
- ZIP filename: `chisu-xhs-release.zip`
- ZIP bytes: 2,835,173
- SHA-256: `08b68e9098017aab0e5fec6707630f96f94aa93332bfcd82770b28ee6588b183`
- ZIP integrity: PASS — 21 entries; `index.html` at archive root; no nested project folder; no WAV/debug/test/QA artifact packaged.

## L. XHS DEVICE TEST

STILL REQUIRED
