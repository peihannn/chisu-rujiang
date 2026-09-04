# 尺素入江 — Project Handoff

## Project and platform

- **Project:** 尺素入江
- **Platform:** Xiaohongshu Creator Service Platform → Builder Hub → 小工具
- **Official XHS skill:** `.codex/minitool-zip-builder/`

## Current state

- Global cinematic polish and mobile interaction fixes are complete.
- Paper, firefly, pavilion narrative, and audio interactions are implemented.
- Choice Echo is intentionally not part of the release.
- The official Xiaohongshu minitool skill is installed, used, and the latest release candidate passed validation.
- The working tree is the current backup target; do not revert it to an earlier release hash.

## Packaging notes

Raw OGG was rejected by the real XHS uploader. Production audio was therefore converted/embedded into JavaScript-compatible packaged data; runtime code was externalized as required, and compatibility was adjusted to the official skill.

The known earlier official-skill-passing artifact was `chisu-xhs-release.zip` (2,802,201 bytes; SHA-256 `a8aa34081611a820c9e02351b789101b9da0c1afbde7d0bddb9df910076e8fbb`). It is historical only. The latest approved local/XHS-skill-validated release candidate is `chisu-xhs-release.zip`: 2,627,161 bytes; SHA-256 `c3427c104648e2faee632096a063f1bc8696bf6343fc9ff80a40df01ebecfbf9`.

## Current release target

- XHS MiniTool ZIP under 10 MB (internal target under 9.5 MB).
- Current local QA report: `xhs-final-qa-report.md`.

## Source-master preservation

The runtime `assets/` path is a symlink to `/Users/jiangpeihan/Desktop/assets`. To make the backup independently restorable, the resolved original fonts, images, and audio are preserved under `source-masters/assets/` (26 files). This snapshot is non-runtime and does not alter the game. After a restore, recreate `assets` as a symlink to `source-masters/assets` if the original Desktop path is unavailable.

## Latest approved mobile framing hotfix

The real-device mobile framing hotfix is complete. On mobile, the opening focal point is `30% 50%`; the raft is approximately 75% visible; and the title is positioned at right 16%, bottom 20%. Desktop remains `50% 50%`. The complete flow reaches `FINAL_IDLE` at both 390×844 and 430×932. The official Xiaohongshu validator passed.

After restoration, preserve this approved state; do not redo the framing hotfix unless a new real-device issue is observed.

## Recent checkpoint files

Most recently modified for the approved hotfix: `chisu-xhs-release.zip`, `index.html`, `xhs-dist/index.html`, `work/mobile-framing-390x844-opening.png`, `work/mobile-framing-390x844-pavilion.png`, `work/mobile-framing-430x932-opening.png`, and `work/qa_mobile_framing.mjs`.
