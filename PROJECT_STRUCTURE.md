# Project Structure

```text
Wildfire-Property-Intelligence/
├── dataset/                         # NSI inventory and county-neighbor inputs
├── notebooks/
│   ├── README.md                     # Workflow, handoffs, and caveats
│   ├── eda/                          # Foundational, exploratory, and synthesis notebooks
│   └── methods/
│       ├── bayesian_shrinkage_pooling/
│       ├── c2st/
│       ├── chi_test/
│       ├── color_groupings/
│       ├── group_level_distribution_analysis/
│       └── spatial_autocorrelation/
├── results/
│   └── tables/                       # Checked-in analysis tables
├── figures/
│   ├── eda/                          # Saved EDA and synthesis figures
│   └── method_comparison/            # Saved comparison figures
├── report/                           # Capstone paper, poster, and LaTex source
├── scripts/
│   └── build_merge_tree.py           # Builds website color-grouping data
├── website/
│   ├── frontend/                     # Static React + Vite app
│   └── _archive/backend/             # Archived export backend and source copies
├── requirements.txt
├── README.md
└── PROJECT_STRUCTURE.md
```

The repository does not currently provide a normalized serial notebook runner.
Read [notebooks/README.md](notebooks/README.md) before re-executing analysis
notebooks, and [website/README.md](website/README.md) for the separate static
site workflow.
