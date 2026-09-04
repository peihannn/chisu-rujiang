# 尺素入江 — Project Handoff

## Project and platform

- **Project:** 尺素入江
- **Platform:** Xiaohongshu Creator Service Platform → Builder Hub → 小工具
- **Official XHS skill:** `.codex/minitool-zip-builder/`

## Current state

- Global cinematic polish and mobile interaction fixes are complete.
- Paper, firefly, pavilion narrative, and audio interactions are implemented.
- Choice Echo is intentionally not part of the release.
- The official Xiaohongshu minitool skill is installed, used, and previously passed validation.
- The working tree is the current backup target; do not revert it to an earlier release hash.

## Packaging notes

Raw OGG was rejected by the real XHS uploader. Production audio was therefore converted/embedded into JavaScript-compatible packaged data; runtime code was externalized as required, and compatibility was adjusted to the official skill.

The known earlier official-skill-passing artifact was `chisu-xhs-release.zip` (2,802,201 bytes; SHA-256 `a8aa34081611a820c9e02351b789101b9da0c1afbde7d0bddb9df910076e8fbb`). It is historical only. The current ZIP is newer: 2,627,144 bytes; SHA-256 `acf655cc0fe2d076474bc4228d666be98100b935e6d908d9e1dfce824f1b4362` (modified 2026-09-04 16:43:05 local time).

## Current release target

- XHS MiniTool ZIP under 10 MB (internal target under 9.5 MB).
- Current local QA report: `xhs-final-qa-report.md`.

## Source-master preservation

The runtime `assets/` path is a symlink to `/Users/jiangpeihan/Desktop/assets`. To make the backup independently restorable, the resolved original fonts, images, and audio are preserved under `source-masters/assets/` (26 files). This snapshot is non-runtime and does not alter the game. After a restore, recreate `assets` as a symlink to `source-masters/assets` if the original Desktop path is unavailable.

## Remaining real-device task

Portrait framing/cropping requires a final real-XHS-device review/hotfix. Some portrait scenes can crop important background subjects: the raft may be too cropped and the pavilion may be mostly outside the visible crop.

After restoration, do only **FAST XHS MOBILE FRAMING HOTFIX ONLY**: retain full-bleed backgrounds and use scene-specific mobile `object-position` / `background-position`. Do not redesign the game.

## Recent checkpoint files

Most recently modified before backup documentation: `chisu-xhs-release.zip`, `work/mobile-framing-390x844-ending.png`, `work/mobile-framing-430x932-ending.png`, `work/mobile-framing-390x844-pavilion.png`, `work/mobile-framing-430x932-pavilion.png`, `work/mobile-framing-390x844-opening.png`, `work/mobile-framing-430x932-opening.png`, and `work/qa_mobile_framing.mjs`.
