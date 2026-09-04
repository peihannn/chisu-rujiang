# XHS real-device hotfixes

## Issues and final fixes

Portrait framing used to crop important visual subjects. The final adaptation switches portrait screens (maximum width 600px, portrait orientation) to dedicated production WebP assets: `bg_warm_mobile.webp`, `bg_farewell_mobile.webp`, and `bg_pavilion_close_mobile.webp`. Desktop retains the original centered background treatment.

The final source values are: opening text `left: 70%`, `line-height: calc(1em + 12px)`; opening title `right: 16%`, `bottom: 20%`; pavilion narrative `left: 0%`. The end screen has no seal.

## Verification

Current QA evidence covers 360×800, 375×812, 390×844, and 430×932 portrait viewports. The tested flows reach `FINAL_IDLE`. ZIP integrity passed; the official size audit passed with a recommendation warning only (2.99 MiB versus the 2 MiB recommendation, below the 10 MiB hard limit).

## Release

- File: `chisu-xhs-release.zip`
- Source path: `/Users/jiangpeihan/Desktop/chisu-xhs-release.zip`
- Bytes: 3,132,263
- SHA-256: `bd385857b4bc87cf4a0d9773f8b98bfb495663f5aa5d921bb2b2ec1756c285e2`
- Modified: 2026-09-04 17:37:57 +0800

## Remaining issue

No remaining reproducible XHS device issue is recorded at this checkpoint.
