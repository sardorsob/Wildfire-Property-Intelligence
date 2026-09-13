# Frontend Source Polish Design

## Goal

Make the active React frontend easier to read and maintain without changing
what visitors see, what the pages say, or how the application behaves.

## Scope

- Clean only handwritten source under `website/frontend/src/`.
- Leave generated components under `website/frontend/src/components/ui/`
  untouched.
- Centralize only constants and transformations that are already duplicated or
  form an obvious feature boundary.
- Split the neighbor-comparison presentation where repeated county cards and
  summary panels obscure the map lifecycle.
- Keep the archived backend, public data, PDFs, images, and analytical source
  outside this phase.

## Preserved contracts

- Keep every route, navigation item, URL hash, default theme, visible string,
  Tailwind class, inline style, icon, control, loading state, and error state the
  same.
- Keep map styles, camera settings, source and layer identifiers, paint and
  layout properties, popups, event handlers, keyboard shortcuts, and cleanup
  behavior the same.
- Keep all fetch URLs, request timing, public JSON shapes, FIPS formatting, data
  calculations, thresholds, ordering, and fallback behavior the same.
- Keep the `/viz` scene order, scene timing, San Diego spotlight behavior,
  narrative copy, card placement, legends, and transitions the same.
- Do not redesign, restyle, rewrite copy, replace routing, add a state library,
  add a generic data-fetch layer, or create a reusable map framework.
- Add no runtime or development dependency. Use the existing TypeScript, ESLint,
  Vite, and Node toolchain.
- Comments should be short, natural, and limited to purpose or a non-obvious
  constraint.
- Every commit must omit `Co-authored-by` and every other co-author trailer.

## Code shape

### Shared stable values

Move the identical dashboard basemap URL and the identical property-color
palette into small modules under `src/lib/`. Callers with intentionally different
palettes keep their local values. These modules contain values only; they do not
become a general configuration layer.

### Conditional pooling

Use `src/lib/conditionalPooling.ts` as the single definition of conditional
pooling types and county-detail construction. Remove the byte-for-byte local
equivalent from `ConditionalProbability.tsx`. Keep map-data construction and map
ownership on that page.

### Scrollytelling

Move the pure JSON-to-view transformations and comparison selection from
`VizIntroduction.tsx` into one feature-local data module. Keep the reducer,
scene application, fetching, refs, and MapLibre lifecycle in their current
owners. Keep `StickyGraphic.tsx` intact except for compact local cleanup that
does not reorder effects or handlers.

### Neighbor divergence

Move distribution pooling and comparison derivation into a feature-local model
module. Extract the repeated county distribution cards and the selected-pair
panel into feature-local presentation components while preserving their exact
markup, classes, ordering, and callbacks. Keep both MapLibre instances, their
refs, effects, layers, handlers, and keyboard behavior in
`NeighborDivergence.tsx`.

### Remaining handwritten components

Apply only local cleanup: import order, descriptive names, readable multiline
types, small repeated expressions, and comments that explain rather than
narrate. A file that is already clear stays as it is.

## Verification

Establish a baseline before production edits with `npm run lint`,
`npm run build`, and browser captures of every route at desktop width plus the
responsive dashboard and `/viz` entry points at mobile width. After each batch,
run the smallest relevant check and the full lint/build gates. Compare affected
routes against the baseline after changes.

Pure transformations receive focused Node tests when they can be exercised
without a browser or a new dependency. Refactor work starts from current
behavior: record characterization expectations before moving the implementation,
then keep those expectations green through the move.

Each task receives an independent preservation and code-quality review. The
completed frontend receives a whole-diff correctness review and a Ponytail
over-engineering review before the final handoff.
