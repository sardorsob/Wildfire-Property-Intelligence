# Notebook core

- Read `notebooks/README.md` before running or editing notebooks. It defines the staged story and current path/output caveats.
- Foundational EDA is inventory -> exposure/sparsity -> color; supplementary distribution, spatial/mode, and chi-square checks are not prerequisites.
- Bayesian shrinkage, conditional pooling, group divergence, C2ST, and Moran work are independent signals. Color-pooling and hierarchical grouping are sensitivity alternatives.
- `regenerate_maps.ipynb` and `in_depth_analysis.ipynb` consume stage evidence; `case_study.ipynb` is last and consumes the pooled-neighbor JSON from `color_pool.ipynb`.
- Preserve saved outputs, analytical definitions, and public JSON schemas. Do not execute or regenerate artifacts during editorial work.
