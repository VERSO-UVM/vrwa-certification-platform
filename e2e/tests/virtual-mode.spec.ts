import { test, expect } from '@playwright/test';

test.describe('Virtual View Mode', () => {
  test('admin can access trainee view with virtual header', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[id="email"]', 'founders@gmail.com');
    await page.fill('input[id="password"]', 'america123');
    await page.click('button[type="submit"]');
    
    // Select profile
    await page.waitForURL(/.*profile-selection/);
    await page.getByText('Alexander Hamilton').click();
    await page.waitForURL(/.*admin/);

    // Go to trainee view
    await page.goto('/trainee');
    await expect(page).toHaveURL(/.*trainee/);
    
    // Check for virtual header
    const virtualHeader = page.locator('div.bg-yellow-100:has-text("You are an admin, but this is the user view")');
    await expect(virtualHeader).toBeVisible();
    
    // Check return link
    const returnLink = virtualHeader.locator('a:has-text("click here to return")');
    await expect(returnLink).toHaveAttribute('href', '/admin');
    await returnLink.click();
    await expect(page).toHaveURL(/.*admin/);
  });

  test('admin can access instructor view with virtual header', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[id="email"]', 'founders@gmail.com');
    await page.fill('input[id="password"]', 'america123');
    await page.click('button[type="submit"]');
    
    // Select profile
    await page.waitForURL(/.*profile-selection/);
    await page.getByText('Alexander Hamilton').click();
    await page.waitForURL(/.*admin/);

    // Go to instructor view
    await page.goto('/instructor');
    await expect(page).toHaveURL(/.*instructor/);
    
    // Check for virtual header
    const virtualHeader = page.locator('div.bg-yellow-100:has-text("You are an admin, but this is the instructor view")');
    await expect(virtualHeader).toBeVisible();
  });

  test('instructor can access trainee view with virtual header', async ({ page }) => {
    // Login as instructor
    await page.goto('/login');
    await page.fill('input[id="email"]', 'example2@gmail.com');
    await page.fill('input[id="password"]', 'password2');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(profile-selection|instructor)/);
    if (page.url().includes('profile-selection')) {
      await page.waitForTimeout(1000);
      const btn = page.getByRole('button', { name: /The Instructor|John Doe|Alexander Hamilton/ }).first();
      if (await btn.isVisible() && await btn.isEnabled()) {
        await btn.click();
      }
      await page.waitForURL(/.*instructor/);
    }
    await expect(page).toHaveURL(/.*instructor/);

    // Go to trainee view
    await page.goto('/trainee');
    await expect(page).toHaveURL(/.*trainee/);
    
    // Check for virtual header
    const virtualHeader = page.locator('div.bg-yellow-100:has-text("You are an instructor, but this is the user view")');
    await expect(virtualHeader).toBeVisible();
    
    // Check return link
    const returnLink = virtualHeader.locator('a:has-text("click here to return")');
    await expect(returnLink).toHaveAttribute('href', '/instructor');
  });

  test('trainee cannot access admin view (redirects)', async ({ page }) => {
    // Login as trainee
    await page.goto('/login');
    await page.fill('input[id="email"]', 'example1@gmail.com');
    await page.fill('input[id="password"]', 'password1');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(profile-selection|trainee|login)/);
    if (page.url().includes('profile-selection')) {
      await page.waitForTimeout(1000);
      const btn = page.getByRole('button', { name: /John Doe|The Instructor|Alexander Hamilton/ }).first();
      if (await btn.isVisible() && await btn.isEnabled()) {
        await btn.click();
      }
      await page.waitForURL(/.*(trainee|login)/);
    }

    // Attempt to go to admin
    await page.goto('/admin');
    // Should redirect back to trainee or login if session expired
    await expect(page).toHaveURL(/.*(trainee|login)/);
  });
});
