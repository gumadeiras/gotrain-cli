# Changelog

## Unreleased

### Fixes

- Fixed npm, git, and Homebrew installs to use verified release artifacts.
- Fixed release publishing to use the stable GitHub Actions Node toolchain.

### Changes

- Added the final `gotrain-cli` release notice. Install `gotrain` now.
- Documented the local release wrapper and normalized release workflow naming.

## 1.2.1 - 2026-03-30

### Changes

- Added release automation scripts.

## 1.2.0 - 2026-03-19

### Features

- Showed ride duration on train boards.

## 1.1.1 - 2026-01-25

### Changes

- Added relevant npm package keywords.

## 1.1.0 - 2026-01-25

Initial release.

### Features

- Added the `gotrain` CLI for MTA system train departures.
- Added commands, tests, favorites support, arrivals, flags, and alerts.
- Added improved alert aesthetics, deduplication, pagination, filtering, and `--all` support.
- Added install script verification and PATH setup.

### Fixes

- Fixed `--help` exit behavior for install verification.
- Fixed download error handling in `install.sh`.
- Fixed transit system output formatting.

### Changes

- Renamed the script from `nyc-train` to `gotrain`.
- Removed runtime dependencies and refactored API output formatting to TSV.
- Updated README installation, usage, examples, favorites, and contributing guidance.
