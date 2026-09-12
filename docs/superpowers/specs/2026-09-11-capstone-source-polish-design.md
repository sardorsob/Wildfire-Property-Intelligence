# Capstone Source Polish Design

## Goal

Make the completed capstone easier to read and continue without changing its
analysis, results, story, or website behavior.

## Scope

- Clean the source and narrative flow of all checked-in Jupyter notebooks.
- Clean the active Python utilities in `scripts/` and `notebooks/eda/`.
- Document the actual notebook sequence and repository structure.
- Keep Serena's small, project-specific memory map for future maintenance.

The React frontend and `website/_archive/backend/` are deferred to the later
website phase. The archived backend can regenerate frontend JSON, so changing
it safely requires a separate output-comparison pass.

## Preserved contracts

- Do not change formulas, thresholds, filters, grouping rules, model settings,
  paths written by export cells, output schemas, reported conclusions, or the
  capstone narrative.
- Do not execute notebooks or regenerate tables, figures, reports, or frontend
  data.
- Keep substantive saved tables and figures. Remove saved error tracebacks,
  empty cells, and obvious debug-only output.
- Do not add dependencies, a shared notebook framework, or speculative helper
  layers.
- Use short comments that explain purpose or a non-obvious constraint. Remove
  commented-out debugging and comments that merely narrate the next line.

## Notebook shape

Each notebook should read top to bottom with a single title and compact
sections for purpose, setup, inputs, analysis, results, and handoff where those
sections apply. Preserve the existing analytical order unless moving a setup
import or an explanatory Markdown cell clearly improves the reading flow.

The documented progression is:

1. inventory and diagnostic EDA;
2. supplementary distribution and spatial checks;
3. complementary detection methods;
4. color-grouping sensitivity;
5. maps, synthesis, and the San Diego case study.

Color grouping approaches are alternatives, not mandatory sequential stages.
Consumer notebooks must state their inputs and outputs without claiming that
the full repository is currently a one-command pipeline.

## Python shape

Keep `scripts/build_merge_tree.py` intentionally small and preserve its merge
order and JSON contract. Treat
`notebooks/eda/06_mode_homogeneity_relative_freq.py` as the canonical legacy
CLI. Remove the byte-for-byte duplicate
`notebooks/eda/07_data_measurement_generation.py`; outside
`docs/superpowers`, it has no active source or workflow references, and the
archive branch preserves it.

## Verification and commits

Notebook verification is static: validate notebook structure, parse ordinary
Python cells where possible, confirm retained non-error outputs did not change,
and confirm no saved error output remains. Python verification uses AST parsing
and an in-memory merge-tree contract check. Each batch receives an independent
scope/quality review before the next batch and is committed without co-author
trailers.
