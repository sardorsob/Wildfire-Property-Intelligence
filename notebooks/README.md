# Notebook Workflow

The notebooks preserve the capstone analysis and its saved evidence. They do
not yet form a portable serial runner: several notebook-relative paths,
uncompressed-input assumptions, and output locations need normalization before
the whole flow can be re-executed from one place.

Use the checked-in inputs in `dataset/` and tables in `results/tables/` as the
starting evidence. Do not treat the website's archived data copies as canonical
notebook inputs.

## 1. Inventory and foundational EDA

Run the foundational story in order when its notebook-local paths are
available:

- `eda/01_dataset_anatomy.ipynb` inspects the inventory.
- `eda/02_exposure_density_sparsity.ipynb` establishes exposure and sparsity
  context. Its intended handoff is
  `results/tables/02_exposure_density_sparsity/`.
- `eda/03_color.ipynb` establishes the color vocabulary and intended handoff
  `results/tables/03_color/`.

These stages use the gzipped NSI inventory and provide the diagnostic context
for later method interpretation. Their current relative paths and the stage-02
table target should be normalized before promising repeatable execution.

## 2. Supplementary historical and exploratory checks

`eda/04_conditional_distributions.ipynb`,
`eda/05_spatial_coherence.ipynb`,
`eda/06_mode_homogeneity_relative_freq.ipynb`, its legacy `.py` companion,
`eda/dataset_features_table.ipynb`, and
`methods/chi_test/chi_square_residuals.ipynb` are supplementary exploratory
work. They are not required inputs to the capstone sequence.

In particular, the conditional-distribution notebook has a machine-specific
source path, the older spatial/mode work expects absent `data/` files, and the
Moran workflow in `methods/spatial_autocorrelation/morans_i.sql` needs its own
SQL/data preparation. Keep them as context until their contracts are
standardized.

## 3. Independent methods

These methods answer related but distinct questions and should be interpreted
together, not chained as one model:

| Notebook | Intended handoff | Re-execution note |
| --- | --- | --- |
| `methods/bayesian_shrinkage_pooling/bayesian_shrinkage_pooling.ipynb` | `results/tables/bayesian_shrinkage/` | Currently expects an uncompressed inventory and has a relative output-path mismatch. |
| `methods/bayesian_shrinkage_pooling/conditional_probability.ipynb` | `results/tables/conditional_probability/` | Neighbor-pooled summary and detail tables support later synthesis. |
| `methods/group_level_distribution_analysis/group_level_anomaly_detection.ipynb` | `results/tables/grouplevel_divergence/` | Current exports are written to the working directory. |
| `methods/c2st/classifier_two_sample.ipynb` | C2ST result exports | Currently expects an uncompressed inventory and needs a normalized destination. |
| `methods/spatial_autocorrelation/morans_i.sql` | `results/tables/morans_i/` | Run only when its SQL/data preparation is available. |

The checked-in tables are evidence for synthesis; they do not make every
producer notebook runnable without those fixes.

## 4. Color-grouping sensitivity

`methods/color_groupings/color_pool.ipynb` evaluates a color-pooling
alternative and writes the pooled-neighbor JSON consumed by the case study.
`methods/color_groupings/hierarchical_clustering.ipynb` requires the
repository-level Bayesian aggregated-count table before it can run. Both are
sensitivity analyses: grouping changes the diagnostic resolution and is not
proof of a reporting error.

## 5. Synthesis and San Diego case study

Run `eda/regenerate_maps.ipynb` and `eda/in_depth_analysis.ipynb` only after
the desired foundational and method tables are available. They consume saved
tables and, in places, archived website data; current archive-path references
also need normalization.

Run `eda/case_study.ipynb` last. It requires the Bayesian, conditional-pooling,
group-divergence, and exposure tables plus
`website/frontend/public/data/neighbor-jsd-pooled-greedy.json` from
`color_pool.ipynb`. Its public handoff is
`website/frontend/public/data/case_study_sd_region.json`.

The maps and case study synthesize diagnostic evidence and limitations. They
are not an independent confirmation of a reporting error.
