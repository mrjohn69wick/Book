# Book

## Live site

- Book #1 (Fixed): https://mrjohn69wick.github.io/Book/
- Book #2 (Production): https://mrjohn69wick.github.io/Book/trading-book-PRODUCTION-READY/

## Local development

```bash
cd trading-book-fixed
pnpm install --frozen-lockfile
pnpm run dev
```

## Deployment

The site is built from `trading-book-fixed/` and deployed to GitHub Pages via the
`.github/workflows/static.yml` workflow on pushes to `main` (or manual runs).

Book #1 is the Vite build output from `trading-book-fixed/`.
Book #2 is already static content served from `trading-book-PRODUCTION-READY/` and is copied into the Pages artifact.

## Notes

- MT5 WebTerminal and TradingView widgets require an active internet connection.
- The chart sample data is bundled locally in `public/sample-data.csv`.
