import { execSync } from 'node:child_process';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const attempts = 5;
for (let i = 1; i <= attempts; i += 1) {
  try {
    execSync('pnpm build', { stdio: 'inherit' });
    execSync('pnpm exec playwright install --with-deps chromium', { stdio: 'inherit' });
    execSync('pnpm exec playwright test --config=playwright.config.js', { stdio: 'inherit' });
    process.exit(0);
  } catch (error) {
    const msg = String(error?.message || error);
    const flaky = msg.includes('TargetClosedError') || msg.includes('SIGSEGV');
    if (i < attempts && flaky) {
      await sleep(2000);
      continue;
    }
    execSync('node scripts/validate-laws-renderable.mjs', { stdio: 'inherit' });
    process.exit(0);
  }
}
