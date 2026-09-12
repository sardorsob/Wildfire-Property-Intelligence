# Conventions

- Preservation-first capstone maintenance: retain methodological formulas, filters, thresholds, metric semantics, source paths, and reported conclusions unless the user explicitly authorizes analytical change.
- Treat checked-in `results/tables/`, `figures/`, and website JSON as capstone evidence. Do not refresh them during editorial work.
- The intended handoff layout is `results/tables/<stage>/`; existing notebook paths are not yet normalized into a runnable serial pipeline.
- Frontend uses function components/hooks, Tailwind utility classes, and `cn()` from `src/lib/utils.ts` for conditional classes.
- Frontend import alias `@/` maps to `website/frontend/src/`.
- FIPS values are five-character strings in UI code; normalize numeric inputs with `String(fips).padStart(5, "0")`.
- Use semantic theme tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `--button-accent`) instead of hardcoded light-only grays/whites.
- MapLibre instances live in refs; register/unregister event handlers carefully and avoid recreating maps during React renders.
- Property color tokens `foo` and `bar` are source-data error placeholders and intentionally display as gray; do not rename them as ordinary colors.
