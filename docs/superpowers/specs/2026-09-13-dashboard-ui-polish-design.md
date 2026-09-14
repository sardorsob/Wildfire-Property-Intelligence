# Dashboard UI Polish Design

## Goal

Make the existing dashboard easier to navigate and read without changing its analysis, data, conclusions, or visual identity.

## Scope

- Group the sidebar into the project’s existing analytical flow: story, exploration and stabilization, divergence detection, and validation.
- Keep Conditional Pooling’s KL and L1 views together and replace the metric dropdown with a visible two-option control.
- Keep county-level statistics as choropleths and pairwise statistics as edge maps.
- On Conditional Pooling only, show a restrained adjacency overlay after a county is selected so the pooled neighborhood is visible without turning the page into a network view.
- Give dashboard methods stable paths so refresh, back, forward, bookmarks, and shared links preserve the selected page.
- Close the off-canvas sidebar after mobile navigation.
- Keep detail layouts matched to their content. Existing bottom sheets remain bottom sheets; on small screens they open as compact summary strips rather than covering the map immediately.
- Correct the reversed Moran’s I legend labels, replace hard-coded white Neighbor Divergence surfaces with theme-aware surfaces, and remove the duplicated standalone KL explanation from Home.

## Navigation

The sidebar uses these groups and labels while keeping the existing pages:

1. **Story** — Overview, Guided Case Study
2. **Explore & Stabilize** — Color Distribution, Empirical Bayes Shrinkage, Conditional Pooling
3. **Detect Divergence** — Neighbor Pairs (JSD), Statewide Baseline (JSD)
4. **Validate** — Classifier Test (C2ST), Spatial Clustering (Moran’s I)

Dashboard paths use the existing page identifiers (`/conditional-probability`, `/empirical-bayes`, and so on), with `/` remaining Overview and `/viz` remaining the Guided Case Study. Unknown dashboard paths fall back to Overview. Navigation uses the History API so the current page survives refresh and participates in browser back and forward navigation.

## Map Semantics

- Filled counties answer “what is happening here?” and remain the primary mark for Conditional Pooling, Empirical Bayes, Statewide Baseline, and Moran’s I.
- Edges answer “how different are these two places?” and remain the primary mark for Neighbor Divergence and C2ST.
- Conditional Pooling adds only the selected county’s immediate adjacency lines. Unselected county fills soften slightly while the selected county remains prominent. Closing the detail clears the overlay.
- Statewide Baseline does not gain neighbor edges because its reference is California, not adjacent counties.

The existing color scales, values, classifications, basemap, and legends remain unchanged except for the corrected Moran’s I text labels.

## Content and Interaction Boundaries

- Preserve all numerical results, formulas, citations, project claims, downloads, and the `/viz` story.
- Preserve every analytical implementation and every public data file.
- Do not merge method components or introduce a new tabbed workspace.
- Do not add dependencies or generated UI components.
- Keep comments sparse and human: only explain a non-obvious constraint.

## Verification

- Unit-test path/page conversion and selected-neighbor filtering with Node’s existing test runner.
- Run the full frontend test, lint, and production build commands after each relevant slice.
- Visually check every dashboard route at desktop width, then check navigation, controls, and detail behavior at mobile width.
- Confirm `/viz` still loads and remains visually intact.
- Audit map legends, missing-data appearance, selection hierarchy, and three selected adjacency lines against the source GeoJSON.
