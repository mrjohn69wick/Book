import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  retries: 3,
  fullyParallel: false,
  timeout: 90000,
  use: {
    baseURL: 'http://127.0.0.1:4174/Book/',
    browserName: 'chromium',
    headless: true,
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--no-zygote',
        '--disable-features=VizDisplayCompositor',
      ],
    },
  },
  webServer: {
    command: 'pnpm preview --host 0.0.0.0 --port 4174',
    url: 'http://127.0.0.1:4174/Book/',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
