# Book

## Live site

Visit the book at: https://mrjohn69wick.github.io/Book/

## Local development

```bash
cd trading-book-fixed
pnpm install --frozen-lockfile
pnpm run dev
```

## Deployment

The site is built from `trading-book-fixed/` and deployed to GitHub Pages via the
`.github/workflows/static.yml` workflow on pushes to `main` (or manual runs).

## Notes

- MT5 WebTerminal and TradingView widgets require an active internet connection.
- The chart sample data is bundled locally in `public/sample-data.csv`.
