# 尺素入江 — Project Handoff

## Project and platform

- **Project:** 尺素入江
- **Platform:** Xiaohongshu Creator Service Platform → Builder Hub → 小工具
- **Official XHS skill:** `.codex/minitool-zip-builder/`

## Current state

- Global cinematic polish and mobile interaction fixes are complete.
- Paper, firefly, pavilion narrative, and audio interactions are implemented.
- Choice Echo is intentionally not part of the release.
- The official Xiaohongshu minitool skill is installed and the latest release candidate passes the official size audit and package integrity checks.
- The working tree is the current backup target; do not revert it to an earlier release hash.

## Packaging notes

Raw OGG was rejected by the real XHS uploader. Production audio was therefore converted/embedded into JavaScript-compatible packaged data; runtime code was externalized as required, and compatibility was adjusted to the official skill.

The known earlier official-skill-passing artifact was `chisu-xhs-release.zip` (2,802,201 bytes; SHA-256 `a8aa34081611a820c9e02351b789101b9da0c1afbde7d0bddb9df910076e8fbb`). It is historical only. The latest approved release is `chisu-xhs-release.zip` at `/Users/jiangpeihan/Desktop/chisu-xhs-release.zip` (also copied into this project and `release-snapshot/`): 3,132,263 bytes; SHA-256 `bd385857b4bc87cf4a0d9773f8b98bfb495663f5aa5d921bb2b2ec1756c285e2`; modified 2026-09-04 17:37:57 local time.

## Current release target

- XHS MiniTool ZIP under 10 MB (internal target under 9.5 MB).
- Current local QA report: `xhs-final-qa-report.md`.

## Source-master preservation

The runtime `assets/` path is a symlink to `/Users/jiangpeihan/Desktop/assets`. To make the backup independently restorable, the resolved original fonts, images, and audio are preserved under `source-masters/assets/` (26 files). This snapshot is non-runtime and does not alter the game. After a restore, recreate `assets` as a symlink to `source-masters/assets` if the original Desktop path is unavailable.

## Latest approved real-XHS portrait hotfixes

Portrait scenes now use dedicated WebP artwork through `<picture>` sources at `max-width: 600px` in portrait orientation: `bg_warm_mobile.webp`, `bg_farewell_mobile.webp`, and `bg_pavilion_close_mobile.webp`. Desktop continues to use the original artwork with the default centered object position (`50% 50%`). On portrait screens, opening text is `left: 70%` with `line-height: calc(1em + 12px)`; title placement is `right: 16%`, `bottom: 20%`; and the pavilion narrative is `left: 0%`. The final ending has no seal. QA evidence covers 360×800, 375×812, 390×844, and 430×932, and the current release reaches `FINAL_IDLE` in the tested flows.

No remaining code issue is currently recorded. After restoration, preserve this approved state; only investigate if a newly observed real-XHS-device issue is reproducible.

## Recent checkpoint files

Most recently modified for the approved hotfix: `chisu-xhs-release.zip`, `index.html`, `xhs-dist/index.html`, `work/mobile-framing-390x844-opening.png`, `work/mobile-framing-390x844-pavilion.png`, `work/mobile-framing-430x932-opening.png`, and `work/qa_mobile_framing.mjs`.
