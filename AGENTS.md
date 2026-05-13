# AGENTS.md

## Git

- Commit with `scripts/committer "<subject>" -- <path>...`; it stages only listed paths. Use `--body` or `--body-file` for commit bodies.


## Changelog

- Keep `CHANGELOG.md` updated for user-facing changes. If a commit adds a feature, fix, behavior change, CLI change, GUI change, output-format change, install/release change, or other user-visible change, add or update an entry under the top `Unreleased` section in the same commit.
- Never edit released changelog sections for current work. Corrections, renames, and behavior changes after a release must be recorded only under the top `Unreleased` section unless Gustavo explicitly asks for release-history repair.
- Use these sections when they apply: `Features`, `Fixes`, and `Changes`.
- Omit empty sections.
- Write user-facing entries instead of repository chore notes.
- Do not include pure tests, internal refactors, CI-only changes, or docs-only changes unless they affect user behavior, API, installation, or usage.

