# Frontend core

- Active static app: `website/frontend/`; `src/main.tsx` renders the scrollytelling `/viz` route or the custom state-driven dashboard `Router` for all other paths. No React Router.
- Dashboard pages: home, conditional probability/spatial pooling, empirical Bayes, neighbor divergence, C2ST, Moran's I, group divergence, and H3 color map.
- `/viz` is a San Diego-region scrollytelling flow: `VizIntroduction` orchestrates `HeroSection`, `StickyGraphic`, and `ScrollNarration` using static JSON.
- Key data contract and regeneration order are documented in `website/README.md` and `website/frontend/AGENTS.md`. Preserve public JSON schemas when reorganizing components.
- Default theme is dark; user can toggle light/dark. Use semantic CSS tokens. The case-study map narrows to Imperial, Orange, Riverside, and San Diego FIPS.
- Large bespoke components include `NeighborDivergence.tsx`, `StickyGraphic.tsx`, and several dashboard maps. Prefer extracting only duplicated stable constants/pure helpers or clear presentation subcomponents; do not introduce a generic map framework without repeated evidence.
- `src/components/ui/` is generated-style reusable UI infrastructure; avoid cosmetic rewrites there unless an active component requires it.