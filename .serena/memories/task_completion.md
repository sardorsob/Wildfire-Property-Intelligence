# Task completion

- Documentation-only: verify referenced paths with `rg --files`; inspect `git diff --check`, Markdown structure, and `serena memories check`.
- Frontend source/style: run `cd website/frontend && npm run lint && npm run build`; preview affected routes at desktop and mobile widths when layout or styling changes.
- Notebook source: validate JSON with `python -m json.tool <notebook> >/dev/null` or nbformat; execute top-to-bottom when data/runtime permits; inspect saved outputs/figures at reading size; disclose any notebook not executed.
- Analysis-affecting work: reconcile key outputs with checked-in tables/JSON and confirm formulas, units, group definitions, and conclusions did not drift.
- Always run `git diff --check` and inspect `git status --short`; preserve unrelated/untracked user files.
