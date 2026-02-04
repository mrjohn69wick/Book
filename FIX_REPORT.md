# FIX REPORT

## Access to Actions logs
- Attempted to read the latest GitHub Actions run via the GitHub API, but the network tunnel returned `403` and blocked access from this environment, so the logs could not be fetched directly.

## Root cause(s) and fix
- **Workflow ran at repo root with npm and the wrong artifact path**, which fails because the app is under `trading-book-fixed/` and uses `pnpm-lock.yaml` (no root `dist/`).  
  - **Responsible file**: `.github/workflows/static.yml` (build job steps).  
  - **Fix**: Set `defaults.run.working-directory` to `trading-book-fixed`, enable Corepack and run `pnpm install --frozen-lockfile` + `pnpm run build`, and upload `trading-book-fixed/dist` as the Pages artifact.

- **Node version mismatch for Vite**, risking build failures on older Node versions.  
  - **Responsible file**: `.github/workflows/static.yml` (setup-node step).  
  - **Fix**: Use Node `22.x` as required for modern Vite engines.

- **pnpm not found during setup-node caching**, because pnpm was referenced for caching before Corepack installed it.  
  - **Responsible file**: `.github/workflows/static.yml` (setup-node caching config).  
  - **Fix**: Install pnpm via Corepack first, then resolve the store path and use `actions/cache@v4` with a lockfile-based key.

## Pages URL
- https://mrjohn69wick.github.io/Book/
