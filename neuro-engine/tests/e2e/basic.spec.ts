import { test, expect } from '@playwright/test';

test('homepage displays prompt section', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Neurodivergent Creativity Engine' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Prompt blueprints' })).toBeVisible();
});
