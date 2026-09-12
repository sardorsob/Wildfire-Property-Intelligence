# Suggested commands

- Frontend install: `cd website/frontend && npm ci` (prefer lockfile-reproducible CI install; `npm install` for dependency updates only).
- Frontend dev: `cd website/frontend && npm run dev`.
- Frontend checks: `cd website/frontend && npm run lint && npm run build`.
- Frontend preview: `cd website/frontend && npm run preview`.
- Notebook inspection: read `notebooks/README.md`, then verify the notebook's own input and working-directory assumptions before execution. There is no supported project-wide notebook command.
- Merge tree data: `python scripts/build_merge_tree.py` from project root.
- Serena memory reference check: `serena memories check` from project root.
