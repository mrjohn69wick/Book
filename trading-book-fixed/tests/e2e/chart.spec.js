import { test, expect } from '@playwright/test';

test('validate all laws smoke flow renders report list', async ({ page }) => {
  await page.goto('#/chart');
  await page.getByTestId('validate-all-laws').click();
  const list = page.getByTestId('law-validation-results');
  await expect(list).toBeVisible({ timeout: 30000 });
  await page.waitForTimeout(12000);
  const items = list.locator('li');
  await expect(items).toHaveCount(48);
  await expect(items.first()).toContainText('LAW_');
});
