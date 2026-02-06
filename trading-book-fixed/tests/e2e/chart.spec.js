import { test, expect } from '@playwright/test';

test('validate all laws draws overlays', async ({ page }) => {
  await page.goto('#/chart');
  await page.getByRole('button', { name: 'Validate all laws' }).click();
  await page.waitForTimeout(12000);
  const fails = page.locator('.law-conditions li', { hasText: '❌' });
  await expect(fails).toHaveCount(0);
});
