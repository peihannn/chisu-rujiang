# Restore 尺素入江 on a new Mac

1. Install Codex and the usual development tools, including Git and GitHub CLI.
2. Clone the private GitHub repository: `https://github.com/peihannn/chisu-rujiang.git`.
3. Confirm `.codex/minitool-zip-builder/` exists.
4. Read `PROJECT_HANDOFF.md` and the files in `docs/codex-history/`.
5. The original source masters are committed under `source-masters/assets/`. Recreate `assets` as a symlink to that directory if the original `/Users/jiangpeihan/Desktop/assets` path is unavailable. The full archive provides a second copy; verify its supplied SHA-256 checksum first.
6. Open the restored project directory in Codex.
7. Run a simple local preview using the existing project scripts; do not rebuild from scratch.
8. Preserve the approved portrait adaptation documented in `PROJECT_HANDOFF.md`; do not rebuild from scratch or redo the hotfix. Continue only from a newly observed, reproducible XHS device issue, if one exists.

The full archive is an independent recovery copy and contains hidden `.codex` files, assets, release artifacts, QA evidence, and documentation.
