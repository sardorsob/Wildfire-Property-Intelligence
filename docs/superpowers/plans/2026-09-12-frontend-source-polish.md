# Frontend Source Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean and organize the active React frontend without changing its rendered design, copy, data behavior, routes, or interactions.

**Architecture:** Preserve page ownership and MapLibre lifecycles while moving only proven shared values and pure feature logic to focused modules. Split the oversized neighbor-comparison presentation at its existing repeated UI seams; keep smaller pages structurally local.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, MapLibre GL, D3, Node 24, ESLint

**Spec:** `docs/superpowers/specs/2026-09-12-frontend-source-polish-design.md`

## Global Constraints

- Keep every route, navigation item, URL hash, default theme, visible string, Tailwind class, inline style, icon, control, loading state, and error state the same.
- Keep map styles, camera settings, source and layer identifiers, paint and layout properties, popups, event handlers, keyboard shortcuts, and cleanup behavior the same.
- Keep all fetch URLs, request timing, public JSON shapes, FIPS formatting, data calculations, thresholds, ordering, and fallback behavior the same.
- Keep the `/viz` scene order, scene timing, San Diego spotlight behavior, narrative copy, card placement, legends, and transitions the same.
- Do not modify `website/frontend/src/components/ui/`, `website/frontend/public/`, `website/_archive/backend/`, PDFs, images, or analytical source.
- Do not redesign, restyle, rewrite copy, replace routing, add a state library, add a generic data-fetch layer, or create a reusable map framework.
- Add no runtime or development dependency.
- Comments explain purpose or a non-obvious constraint in short, natural language.
- Every commit message and body must omit `Co-authored-by` and every other co-author trailer.

---

### Task 1: Frontend baseline and stable shared values

**Files:**
- Create: `website/frontend/src/lib/dashboardMap.ts`
- Create: `website/frontend/src/lib/propertyColors.ts`
- Modify: `website/frontend/src/ConditionalProbability.tsx`
- Modify: `website/frontend/src/EmpiricalBayesPooling.tsx`
- Modify: `website/frontend/src/NeighborDivergence.tsx`
- Modify: `website/frontend/src/C2STMap.tsx`
- Modify: `website/frontend/src/MoransIMap.tsx`
- Modify: `website/frontend/src/GroupDivergence.tsx`
- Modify: `website/frontend/src/ColorMap.tsx`
- Modify: `website/frontend/src/viz-intro/constants.ts`
- Modify: `website/frontend/src/viz-intro/KLDivergenceCard.tsx`

**Interfaces:**
- Produces: `DASHBOARD_MAP_STYLE: string` and `PROPERTY_COLORS: Readonly<Record<string, string>>`.
- Consumes: the exact existing Carto Voyager URL and the exact shared property-color name-to-hex mapping.

- [ ] **Step 1: Record the behavior baseline**

Run `npm ci`, `npm run lint`, and `npm run build` from `website/frontend/`.
Start the current app and capture all eight dashboard routes plus `/viz` at a
desktop viewport. Capture `/`, one map dashboard, and `/viz` at a mobile
viewport. Save the capture paths and any pre-existing console or network issues
in the task report.

- [ ] **Step 2: Add the two value modules**

Create `dashboardMap.ts` with the existing URL:

```ts
export const DASHBOARD_MAP_STYLE =
    'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
```

Create `propertyColors.ts` with the exact palette currently shared by
`ConditionalProbability`, `EmpiricalBayesPooling`, `NeighborDivergence`,
`C2STMap`, and `KLDivergenceCard`:

```ts
export const PROPERTY_COLORS: Readonly<Record<string, string>> = {
    // Copy the current keys and hex values without adding, deleting, or sorting keys.
}
```

- [ ] **Step 3: Replace identical local constants**

Import `DASHBOARD_MAP_STYLE` in each dashboard map and from
`viz-intro/constants.ts`; replace only the identical URL literals. Import
`PROPERTY_COLORS` only in the five callers with the exact shared palette.
Keep `ColorMap.COLOR_HEX`, `GroupDivergence.COLOR_MAP`,
`ColorPoolDendrogram` colors, and `COLOR_GROUPS_MAP` local because their values
serve different displays.

- [ ] **Step 4: Verify and commit**

Run `npm run lint`, `npm run build`, `git diff --check`, and compare the affected
routes to the baseline. Commit only this task as
`refactor: centralize frontend visual constants` with no commit trailers.

### Task 2: Conditional pooling data flow

**Files:**
- Create: `website/frontend/src/lib/conditionalPooling.test.ts`
- Modify: `website/frontend/src/lib/conditionalPooling.ts`
- Modify: `website/frontend/src/ConditionalProbability.tsx`
- Modify: `website/frontend/package.json`

**Interfaces:**
- Consumes: `SummaryRow[]`, `DetailRow[]`, `GeoJSON.Feature[]`, a numeric FIPS, and an optional land-cover filter.
- Produces: the existing `CountyDetail` shape through `buildCountyDetail` and `buildCountyDetailAllLandcover`.

- [ ] **Step 1: Add characterization cases**

Add the script `"test": "node --test"`. Write Node tests with hand-checked
fixtures for these existing behaviors:

```ts
test('buildCountyDetail keeps the selected land-cover rows and padded FIPS', () => {
    // Two summary land covers, two matching detail rows, one county feature.
    // Assert the literal filtered CountyDetail result for one land cover.
})

test('buildCountyDetailAllLandcover combines color counts before normalizing', () => {
    // Repeat one color across two land covers.
    // Assert literal totals and proportions for the combined color.
})
```

Run `npm test` against the current shared helper and record the green
characterization result before changing its consumers.

- [ ] **Step 2: Use the shared model from the page**

Import `buildCountyDetail` and its row/detail types from
`lib/conditionalPooling.ts`. Delete the equivalent local interfaces and local
`buildCountyDetail` from `ConditionalProbability.tsx`. Keep `buildMapData`, its
metric choice, filtering, stats, and all component state/effects unchanged.

- [ ] **Step 3: Tighten only explanatory comments**

Replace the file banner and line-by-line grouping narration with short comments
only where the land-cover aggregation rule is not obvious. Do not reorder the
returned distributions or change division-by-zero behavior.

- [ ] **Step 4: Verify and commit**

Run `npm test`, `npm run lint`, `npm run build`, `git diff --check`, and compare
the conditional-probability route plus `/viz` KL scene to the baseline. Commit
only this task as `refactor: share conditional pooling model` with no commit
trailers.

### Task 3: Scrollytelling data model

**Files:**
- Create: `website/frontend/src/viz-intro/data.ts`
- Create: `website/frontend/src/viz-intro/data.test.ts`
- Modify: `website/frontend/src/VizIntroduction.tsx`
- Modify: `website/frontend/src/viz-intro/StickyGraphic.tsx`

**Interfaces:**
- Produces: `processPooledJsdByFips`, `processKLByFipsSdOnly`, `selectComparisonData`, and the existing `ComparisonData` type.
- Consumes: pooled pair scores, conditional-pooling summary rows, selected FIPS pairs, pair-comparison data, and San Diego case-study comparisons.

- [ ] **Step 1: Record characterization expectations**

Write table-driven Node tests with literal expectations for maximum pooled JSD
per county, mean KL for only FIPS `06025`, `06059`, `06065`, and `06073`, the
default San Diego/Orange comparison, reverse pair lookup, and the fallback that
combines base distributions with case-study pooled JSD.

Before moving production logic, capture the same outputs from the current
functions in the task report. The production change that each test protects is
wrong pair direction, wrong maximum/mean aggregation, loss of FIPS padding, or
loss of the pooled fallback.

- [ ] **Step 2: Move the pure logic**

Move the two aggregation functions, `ComparisonData`, the case-study shape, and
the comparison-selection IIFE into `viz-intro/data.ts`. Give
`selectComparisonData` explicit inputs and return `ComparisonData | null`.
Preserve the six current San Diego pair keys and every lookup/fallback branch.

- [ ] **Step 3: Keep orchestration local**

Replace the IIFE in `VizIntroduction.tsx` with the pure selector call. Keep the
reducer, `applyScene`, refs, fetch order, state initialization, callbacks, and
render tree in place. In `StickyGraphic.tsx`, limit cleanup to short comments and
readable local names; do not move, merge, or reorder effects or MapLibre calls.

- [ ] **Step 4: Verify and commit**

Run `npm test`, `npm run lint`, `npm run build`, `git diff --check`, and compare
all six `/viz` scenes at desktop plus the `/viz` entry at mobile width. Commit
only this task as `refactor: clarify viz data flow` with no commit trailers.

### Task 4: Neighbor divergence model and comparison panel

**Files:**
- Create: `website/frontend/src/neighbor-divergence/model.ts`
- Create: `website/frontend/src/neighbor-divergence/model.test.ts`
- Create: `website/frontend/src/neighbor-divergence/ComparisonPanel.tsx`
- Modify: `website/frontend/src/NeighborDivergence.tsx`

**Interfaces:**
- Produces: the current distribution, pair, comparison, and derived-summary types; `poolDistributions`; the current label formatter; and a `ComparisonPanel` controlled entirely by props.
- Consumes: the selected pair, the existing comparison result, pooled/original toggle state, panel expanded state, color maps, and the same toggle/close callbacks.

- [ ] **Step 1: Characterize the model**

Write Node tests with literal fixtures covering grouped color totals,
renormalized proportions, unique/shared flags, placeholder `foo`/`bar` handling,
and the current group-label formatting. Record current literal outputs before
moving the implementation.

- [ ] **Step 2: Extract pure model logic**

Move only the types and pure distribution/comparison derivation to
`neighbor-divergence/model.ts`. Preserve `COLOR_GROUPS_MAP`, its insertion order,
group names, sort order, sums, JSD values from the loaded data, and empty/error
behavior. Do not create a generic dashboard model.

- [ ] **Step 3: Extract repeated presentation**

Move the selected-pair bottom panel, its two repeated county distribution cards,
and the three unique/shared summaries to `ComparisonPanel.tsx`. Preserve the
existing DOM order, element types, visible strings, Tailwind classes, inline
colors, percentages, `slice(0, 15)`, responsive breakpoints, expand toggle, and
close action exactly. Pass derived values through explicit props; add no context
or new state.

- [ ] **Step 4: Preserve map ownership**

Keep both map containers, refs, initialization effects, layers, event handlers,
keyboard shortcuts, control state, and cleanup in `NeighborDivergence.tsx`.
Clean only names and comments around the extracted seams.

- [ ] **Step 5: Verify and commit**

Run `npm test`, `npm run lint`, `npm run build`, `git diff --check`, and compare
the neighbor-divergence route in its initial, selected-pair, pooled, collapsed,
and fullscreen states at desktop and mobile widths. Commit only this task as
`refactor: separate neighbor comparison view` with no commit trailers.

### Task 5: Remaining handwritten source hygiene

**Files:**
- Review and modify only when a concrete readability issue exists:
  `website/frontend/src/{C2STMap,ColorMap,EmpiricalBayesPooling,GroupDivergence,HomePage,MoransIMap,Router}.tsx`
- Review and modify only when a concrete readability issue exists:
  `website/frontend/src/components/{PdfViewerModal,ThemeToggle,app-sidebar,nav-main,site-header}.tsx`
- Review and modify only when a concrete readability issue exists:
  `website/frontend/src/viz-intro/{ColorPoolDendrogram,HeroSection,KLDivergenceCard,PostPoolingScoresCard,ScrollNarration,SpotlightComparison}.tsx`
- Do not modify: `website/frontend/src/components/ui/**`

**Interfaces:**
- Consumes and produces: the exact existing component props, route keys, hashes, rendered trees, and browser behavior.

- [ ] **Step 1: Run the Ponytail source pass**

For each handwritten file, remove only unused imports, stale narration, needless
temporary aliases, and formatting that hides a type or control flow. Keep local
helpers local. Do not extract a helper used once unless it makes a long render
branch materially easier to read.

- [ ] **Step 2: Check compatibility surfaces**

Use `rg` and the baseline record to confirm route keys, hashes, fetch paths,
displayed strings, MapLibre layer/source IDs, CSS classes, and inline style
values are unchanged in this task.

- [ ] **Step 3: Verify and commit**

Run `npm test`, `npm run lint`, `npm run build`, and `git diff --check`. Compare
every modified route with its baseline capture. If the pass finds no worthwhile
edit, record that result and make no empty commit. Otherwise commit only this
task as `refactor: tidy handwritten frontend source` with no commit trailers.

### Task 6: Final preservation review

**Files:**
- Review only: changes made by Tasks 1-5 plus this design and plan.

**Interfaces:**
- Consumes: the complete frontend refactor.
- Produces: evidence that the source cleanup stayed inside the approved preservation boundary.

- [ ] **Step 1: Run full automated gates**

Run `npm test`, `npm run lint`, `npm run build`, `git diff --check`, and scan all
new commits for co-author trailers. Confirm `src/components/ui/`, `public/`, and
the archived backend have no diff.

- [ ] **Step 2: Run final browser comparison**

Repeat the desktop route matrix and mobile entry-point checks from Task 1.
Exercise theme switching, navigation, PDF hashes, map controls, selected county
or pair details, pooled/original toggles, fullscreen/Escape, and all `/viz`
scenes. Record any environmental map-tile issue separately from application
regressions.

- [ ] **Step 3: Run independent reviews**

Run a whole-diff correctness and scope review, followed by a Ponytail review for
unnecessary abstractions, comments, files, or framework-like code. Send concrete
findings through one focused fix wave and one scoped re-review.

- [ ] **Step 4: Report the result**

List focused commits, verification commands, browser coverage, any baseline
limitations, and the final clean-worktree state. Do not push or publish unless
the user separately asks.
