# Dashboard UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish dashboard navigation, map context, and responsive presentation while preserving the project’s analysis and story.

**Architecture:** Keep the existing page components and MapLibre implementations. Add one small pure navigation model and one pure neighbor-edge filter, then wire those helpers into the current Router, sidebar, and Conditional Pooling component; presentation fixes remain local to their existing components.

**Tech Stack:** React 19, TypeScript, Vite 7, Tailwind CSS 4, MapLibre GL, Node test runner

**Spec:** `docs/superpowers/specs/2026-09-13-dashboard-ui-polish-design.md`

## Global Constraints

- Preserve all analytical methods, formulas, numerical results, citations, data files, downloads, and the `/viz` story.
- Preserve the current color scales, values, classifications, basemap, and legends except for the corrected Moran’s I text labels.
- Keep county-level metrics as choropleths and pairwise metrics as edge maps.
- Add no dependencies and do not edit `src/components/ui/**` generated source.
- Keep comments sparse, direct, and human.
- Commit each completed task without any co-author trailer.

---

### Task 1: Grouped Navigation and Stable Method Paths

**Files:**
- Create: `website/frontend/src/lib/dashboardNavigation.ts`
- Create: `website/frontend/src/lib/dashboardNavigation.test.ts`
- Modify: `website/frontend/src/Router.tsx`
- Modify: `website/frontend/src/components/app-sidebar.tsx`
- Modify: `website/frontend/src/components/nav-main.tsx`
- Modify: `website/frontend/src/HomePage.tsx`

**Interfaces:**
- Produces: `Page`, `pageFromPathname(pathname: string): Page`, and `pagePath(page: Page): string`.
- Consumes: existing `onPageChange(page)` component callbacks and the existing sidebar primitives.

- [ ] **Step 1: Write the failing navigation model tests**

```ts
test('pageFromPathname resolves dashboard routes and falls back to home', () => {
  assert.equal(pageFromPathname('/conditional-probability'), 'conditional-probability')
  assert.equal(pageFromPathname('/unknown'), 'home')
})

test('pagePath keeps home at the root and uses page ids elsewhere', () => {
  assert.equal(pagePath('home'), '/')
  assert.equal(pagePath('morans-i'), '/morans-i')
})
```

- [ ] **Step 2: Run the focused test and verify it fails because the module is missing**

Run: `cd website/frontend && node --test src/lib/dashboardNavigation.test.ts`

- [ ] **Step 3: Add the minimal navigation model**

Define the current page identifiers once, derive `Page`, resolve known pathname segments, and return `/` for Home or `/${page}` for every method.

- [ ] **Step 4: Wire paths, popstate, and history updates into Router**

Initialize from `window.location.pathname`, preserve the PDF hash behavior, push a path when a dashboard method is selected, and update page state on `popstate`.

- [ ] **Step 5: Group and relabel the existing sidebar items**

Render the four approved group labels and order. Keep `/viz` a normal link. For dashboard items, render an `href` plus the existing in-app callback, prevent a full reload, and call `setOpenMobile(false)` after selection.

- [ ] **Step 6: Make Home method links use the same stable paths**

Render method titles as anchors and prevent the full reload only when the dashboard callback is available.

- [ ] **Step 7: Verify and commit**

Run: `cd website/frontend && npm test && npm run lint && npm run build`

Commit: `feat: clarify dashboard navigation`

### Task 2: Conditional Pooling Context

**Files:**
- Create: `website/frontend/src/lib/neighborEdges.ts`
- Create: `website/frontend/src/lib/neighborEdges.test.ts`
- Modify: `website/frontend/src/ConditionalProbability.tsx`

**Interfaces:**
- Produces: `selectNeighborEdges(edges: GeoJSON.FeatureCollection, fips: string | null): GeoJSON.FeatureCollection`.
- Consumes: `neighbor-divergence-map.json` edge features with `fips_a` and `fips_b` properties.

- [ ] **Step 1: Write the failing edge-selection tests**

```ts
test('selectNeighborEdges keeps only edges touching the selected county', () => {
  assert.deepEqual(selectNeighborEdges(edges, '06001').features, [edges.features[0]])
})

test('selectNeighborEdges returns an empty collection without a selection', () => {
  assert.deepEqual(selectNeighborEdges(edges, null), { type: 'FeatureCollection', features: [] })
})
```

- [ ] **Step 2: Run the focused test and verify it fails because the module is missing**

Run: `cd website/frontend && node --test src/lib/neighborEdges.test.ts`

- [ ] **Step 3: Add the minimal pure edge filter**

Return a new FeatureCollection containing features whose `fips_a` or `fips_b` equals the selected FIPS.

- [ ] **Step 4: Load and render the selected adjacency overlay**

Fetch the existing neighbor map JSON with the current Conditional Pooling data. Add one initially empty GeoJSON source and one restrained line layer. On county selection, update that source with immediate neighbors and soften other county fills; clear both effects when the detail closes or filters change.

- [ ] **Step 5: Replace the metric dropdown with an accessible two-button control**

Keep the same `kl_div` and `l1_distance` state values. Use a compact labeled group with `aria-pressed`, visible active styling, and no new component or dependency.

- [ ] **Step 6: Make the detail heading metric-aware**

Keep both KL and L1 values in the summary, but title contribution-specific content accurately for the active metric without changing calculations.

- [ ] **Step 7: Verify and commit**

Run: `cd website/frontend && npm test && npm run lint && npm run build`

Commit: `feat: clarify conditional pooling context`

### Task 3: Responsive and Theme Presentation Fixes

**Files:**
- Create: `website/frontend/src/lib/presentationInvariants.test.ts`
- Modify: `website/frontend/src/ConditionalProbability.tsx`
- Modify: `website/frontend/src/EmpiricalBayesPooling.tsx`
- Modify: `website/frontend/src/NeighborDivergence.tsx`
- Modify: `website/frontend/src/neighbor-divergence/ComparisonPanel.tsx`
- Modify: `website/frontend/src/C2STMap.tsx`
- Modify: `website/frontend/src/MoransIMap.tsx`
- Modify: `website/frontend/src/HomePage.tsx`

**Interfaces:**
- Consumes: existing detail-panel state and theme tokens.
- Produces: no new shared interfaces.

- [ ] **Step 1: Add a small source-level regression test for presentation invariants**

Create no component harness. Read the relevant source files and assert that the Moran legend contains `<span>Dispersion</span><span>Clustering</span>`, and that the Neighbor comparison root contains `bottom-0 left-0 right-0 bg-card` rather than `bottom-0 left-0 right-0 bg-white`.

- [ ] **Step 2: Run the focused test and verify the old source fails it**

Run: `cd website/frontend && node --test src/lib/presentationInvariants.test.ts`

- [ ] **Step 3: Correct theme and legend defects**

Reverse the two Moran legend words so negative is Dispersion and positive is Clustering. Replace hard-coded white Neighbor comparison, split-stat, and key-hint surfaces with existing theme tokens while preserving their sizes and positions.

- [ ] **Step 4: Preserve map visibility on small screens**

When a county or pair is selected, expand the existing bottom sheet on desktop and leave it collapsed on viewports below 640px. Do not change desktop panel heights or the Group Divergence right rail.

- [ ] **Step 5: Remove only the duplicated Home KL block**

Keep the nested Conditional Pooling KL explanation, formula, and citation. Remove the repeated standalone KL section; mention that the method view offers KL and L1 in the nested section without changing the project’s claims.

- [ ] **Step 6: Run all automated gates**

Run: `cd website/frontend && npm test && npm run lint && npm run build`

- [ ] **Step 7: Run browser QA**

Check `/`, `/viz`, and every method path at desktop width. Check sidebar auto-close, metric toggle, selected-neighbor overlay, and collapsed detail summaries at mobile width. Audit map legends and compare three selected adjacency features with `neighbor-divergence-map.json`.

- [ ] **Step 8: Commit**

Commit: `fix: polish dashboard presentation`
