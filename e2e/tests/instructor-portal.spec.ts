import { test, expect } from '@playwright/test';

test.describe('Instructor Portal', () => {
  test('instructor can see assigned courses and view attendance sheet', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    // Login as instructor
    await page.goto('/login');
    await page.fill('input[id="email"]', 'example2@gmail.com');
    await page.fill('input[id="password"]', 'password2');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(profile-selection|instructor)/);
    if (page.url().includes("profile-selection")) {
      await page.waitForTimeout(1000);
      const btn = page.getByRole("button", { name: /The Instructor|John Doe|Alexander Hamilton/ }).first();
      if (await btn.isVisible() && (await btn.isEnabled())) await btn.click();
      await page.waitForURL(/.*instructor/);
    }
    await expect(page).toHaveURL(/.*instructor/);

    // Should see at least one course card (from seed)
    const courseCard = page.locator('div.grid > div.flex-col').first();
    await expect(courseCard).toBeVisible();

    // Button group actions should render inside the card
    const printButton = courseCard.getByRole('link', { name: 'Print' });
    await expect(printButton).toBeVisible();
    await expect(courseCard.getByRole('link', { name: 'Attendance' })).toBeVisible();
    await printButton.click();

    // Should be on attendance page
    await expect(page).toHaveURL(/.*attendance/);
    await expect(page.getByText(/Earned Hours|Course Attendance Sheet/)).toBeVisible();
    
    // Check roster table
    const table = page.locator('table');
    await expect(table).toBeVisible();
    // At least some rows should exist (headers + profiles)
    const rows = table.locator('tr');
    expect(await rows.count()).toBeGreaterThan(1);
  });
});
