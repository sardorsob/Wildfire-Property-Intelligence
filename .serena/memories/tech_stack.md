# Tech stack

- Analysis: Python 3.10+, Jupyter/IPython, pandas, NumPy, SciPy, Matplotlib, GeoPandas, h3, Shapely; root pins are lower bounds in `requirements.txt`.
- Active site: React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4; npm lockfile is authoritative.
- Site visualization: MapLibre GL, D3, Recharts, KaTeX, react-scrollama; theme via next-themes; Radix/shadcn-style primitives.
- Archived export/backend: Python + FastAPI/Polars tooling in `website/_archive/backend/`; it generates static site JSON and is not the deployed runtime.
- Static hosting: Vercel config under `website/frontend/vercel.json`; root `index.html` redirects/links into the frontend deployment context.