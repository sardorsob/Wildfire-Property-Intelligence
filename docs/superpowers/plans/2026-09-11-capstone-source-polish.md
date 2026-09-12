# Capstone Source Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the capstone's Python and notebook source cleaner, connected, and easier to read without recomputing or changing the work.

**Architecture:** Keep notebooks self-contained and preserve their analytical cells and saved evidence. Apply small editorial changes in reviewable batches, then make the repository documentation describe the real handoffs rather than an imagined single pipeline.

**Tech Stack:** Python 3.10+, Jupyter notebook JSON/nbformat, pandas, NumPy, SciPy, Markdown, Git

**Spec:** `docs/superpowers/specs/2026-09-11-capstone-source-polish-design.md`

## Global Constraints

- Preserve formulas, thresholds, filters, grouping rules, model settings, export paths and schemas, conclusions, and narrative meaning.
- Do not execute notebooks or regenerate tables, figures, reports, or frontend JSON.
- Preserve substantive saved outputs; remove only saved errors and obvious debug-only output.
- Do not modify `website/frontend/` or `website/_archive/backend/` in this phase.
- Add no dependency, framework, shared notebook abstraction, or speculative configuration.
- Comments explain purpose or non-obvious constraints in short, natural language; remove line-by-line narration and commented-out debugging.
- Every commit message and body must omit `Co-authored-by` and all other co-author trailers.

---

### Task 1: Active Python utilities

**Files:**
- Modify: `scripts/build_merge_tree.py`
- Modify: `notebooks/eda/06_mode_homogeneity_relative_freq.py`
- Delete: `notebooks/eda/07_data_measurement_generation.py`

**Interfaces:**
- Consumes: the existing `MERGE_LIST`, EDA CSV columns, and legacy CLI flags.
- Produces: the same D3 merge-tree object and the same three legacy CSV modes.

- [ ] **Step 1: Record characterization checks**

Run AST parsing on all three files and an in-memory assertion that the merge
tree has the seven existing roots and the same 32 leaves. Record the command
and output in the task report.

- [ ] **Step 2: Apply the smallest readability cleanup**

Normalize imports, whitespace, names, and short purpose comments without
changing calculations. Preserve the merge list, root order, rounding, JSON
shape, CLI flags, pandas operations, 0.8 threshold, and CSV index behavior.
Delete the byte-identical unreferenced `07` script.

- [ ] **Step 3: Verify behavior contracts**

Run the same AST and merge-tree checks. Confirm there is no active source or
workflow reference to the deleted filename outside `docs/superpowers`. Do not
run the merge-tree writer.

- [ ] **Step 4: Commit**

Commit only this task as `refactor: simplify active Python utilities` with no
commit trailers.

### Task 2: Foundational EDA notebooks

**Files:**
- Modify: `notebooks/eda/01_dataset_anatomy.ipynb`
- Modify: `notebooks/eda/02_exposure_density_sparsity.ipynb`
- Modify: `notebooks/eda/03_color.ipynb`
- Modify: `notebooks/eda/04_conditional_distributions.ipynb`
- Modify: `notebooks/eda/05_spatial_coherence.ipynb`
- Modify: `notebooks/eda/06_mode_homogeneity_relative_freq.ipynb`
- Modify: `notebooks/eda/dataset_features_table.ipynb`

**Interfaces:**
- Consumes: the existing dataset paths and saved exploratory results.
- Produces: a readable EDA progression with unchanged calculations and retained evidence.

- [ ] **Step 1: Capture output fingerprints**

Record hashes of every retained non-error output from the base revision. Do
not include empty cells or saved error outputs in the retained-output set.

- [ ] **Step 2: Clean notebook sources**

Use notebook-aware tooling. Remove empty cells, add one clear title where
missing, normalize section hierarchy, group setup imports when safe, convert
accidental prose code to Markdown, and add brief handoff notes. Keep `05` as a
clearly labeled exploratory predecessor to the maintained `06` notebook.

- [ ] **Step 3: Validate without execution**

Validate nbformat, ensure no error output remains, and compare retained-output
hashes to the base revision. Parse ordinary Python cells with AST while
skipping notebook magics and shell commands.

- [ ] **Step 4: Commit**

Commit only this task as `refactor: clarify foundational EDA notebooks` with
no commit trailers.

### Task 3: Synthesis EDA notebooks

**Files:**
- Modify: `notebooks/eda/case_study.ipynb`
- Modify: `notebooks/eda/in_depth_analysis.ipynb`
- Modify: `notebooks/eda/regenerate_maps.ipynb`

**Interfaces:**
- Consumes: existing checked-in tables and frontend data.
- Produces: the same saved synthesis, maps, report text, and case-study JSON contract.

- [ ] **Step 1: Capture retained-output fingerprints**

Record the same base-revision hashes used for the foundational EDA batch.

- [ ] **Step 2: Clarify consumer flow**

Remove empty cells, consolidate headings and setup, and add compact input,
output, and downstream handoff notes. Keep every fallback path, figure name,
JSON key, threshold, sample, and conclusion unchanged.

- [ ] **Step 3: Validate without execution**

Validate nbformat, compare retained-output hashes, check ordinary Python syntax,
and confirm the source still names the same output files and JSON keys.

- [ ] **Step 4: Commit**

Commit only this task as `refactor: clarify synthesis notebooks` with no
commit trailers.

### Task 4: Statistical method notebooks

**Files:**
- Modify: `notebooks/methods/bayesian_shrinkage_pooling/bayesian_shrinkage_pooling.ipynb`
- Modify: `notebooks/methods/bayesian_shrinkage_pooling/conditional_probability.ipynb`
- Modify: `notebooks/methods/c2st/classifier_two_sample.ipynb`
- Modify: `notebooks/methods/chi_test/chi_square_residuals.ipynb`

**Interfaces:**
- Consumes: existing dataset and adjacency inputs.
- Produces: the same Bayesian, pooling, C2ST, and chi-square calculations and exports.

- [ ] **Step 1: Capture retained-output fingerprints**

Record base-revision hashes for all retained non-error outputs.

- [ ] **Step 2: Normalize the methods narrative**

Use one title, sentence-case sections, a compact setup, and a short output or
interpretation handoff. Remove empty cells and commented debugging. Preserve
all formulas, alpha values, folds, features, tolerances, and schemas.

- [ ] **Step 3: Validate without execution**

Run nbformat validation, retained-output comparison, and ordinary-cell AST
parsing. Confirm the important constants still occur with their original values.

- [ ] **Step 4: Commit**

Commit only this task as `refactor: sharpen statistical method notebooks` with
no commit trailers.

### Task 5: Grouping and divergence notebooks

**Files:**
- Modify: `notebooks/methods/color_groupings/color_pool.ipynb`
- Modify: `notebooks/methods/color_groupings/hierarchical_clustering.ipynb`
- Modify: `notebooks/methods/group_level_distribution_analysis/group_level_anomaly_detection.ipynb`

**Interfaces:**
- Consumes: existing aggregated counts and county context.
- Produces: the same grouping alternatives, divergence evidence, and export schemas.

- [ ] **Step 1: Capture retained-output fingerprints**

Record base-revision hashes, excluding the saved syntax error from the retained set.

- [ ] **Step 2: Clean the grouping narratives**

Remove empty cells and the invalid prose cell in `color_pool`. Convert setup
instructions and future-work requests to Markdown. Add compact sections for
inputs, scoring, alternatives, exports, and optional follow-up. Preserve merge
logic, grouping values, thresholds, linkage methods, and metrics.

- [ ] **Step 3: Validate without execution**

Run nbformat validation, retained-output comparison, and ordinary-cell AST
parsing. Confirm no saved error remains and every original export filename is
still present.

- [ ] **Step 4: Commit**

Commit only this task as `refactor: sharpen grouping method notebooks` with no
commit trailers.

### Task 6: Workflow documentation and agent memory

**Files:**
- Create: `notebooks/README.md`
- Modify: `README.md`
- Modify: `PROJECT_STRUCTURE.md`
- Modify: `website/README.md`
- Add: `.serena/.gitignore`
- Add: `.serena/project.yml`
- Add: `.serena/memories/*.md`

**Interfaces:**
- Consumes: the finalized notebook organization and real checked-in paths.
- Produces: an accurate reader and future-agent entry point.

- [ ] **Step 1: Document the actual progression**

Describe inventory EDA, supplementary checks, independent methods, color
grouping sensitivity, and final synthesis. State inputs, outputs, and known
execution caveats without inventing a one-command pipeline.

- [ ] **Step 2: Correct stale repository structure**

Remove nonexistent root `src`, `notebooks/frameworks`, `results/scores`, and
plural `figures/method_comparisons` references. Do not claim missing
`results.md` is checked in.

- [ ] **Step 3: Validate references**

Check documented paths with `rg --files`, run `serena memories check`, and run
`git diff --check`.

- [ ] **Step 4: Commit**

Commit only this task as `docs: connect the analysis workflow` with no commit
trailers.

### Task 7: Final preservation review

**Files:**
- Review only: all files changed since `archive/pre-polish-2026-09-11`

**Interfaces:**
- Consumes: Tasks 1-6.
- Produces: evidence that the source polish stayed within the approved capstone boundary.

- [ ] **Step 1: Run full static validation**

Validate all notebooks, ordinary Python syntax, retained outputs, documentation
paths, Serena references, whitespace, commit trailers, and clean worktree state.

- [ ] **Step 2: Run independent reviews**

Run a correctness/scope review and a Ponytail over-engineering review over the
full branch diff. Fix only concrete in-scope findings, then re-run their checks.

- [ ] **Step 3: Report the branch state**

Confirm the archive branch SHA, list commits on `main`, and disclose that no
notebook was executed and no generated analytical artifact was refreshed.
