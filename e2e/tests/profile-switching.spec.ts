import { test, expect } from '@playwright/test';

test('admin should be prompted to select profile and then redirect to admin dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[id="email"]', 'founders@gmail.com');
  await page.fill('input[id="password"]', 'america123');
  await page.click('button[type="submit"]');

  // Should be on profile selection page
  await page.waitForURL(/.*profile-selection/);
  await expect(page.getByText('Select Profile')).toBeVisible();

  // Select "Alexander Hamilton"
  await page.getByText('Alexander Hamilton').click();

  // Should now redirect to admin dashboard
  await page.waitForURL(/.*admin/);
  await expect(page.getByRole('heading', { name: 'VRWA Training' })).toBeVisible();

  // Sidebar should show active profile
  await expect(page.getByText('Active Profile')).toBeVisible();
  await expect(page.getByText('Alexander Hamilton')).toBeVisible();
});

test('trainee with single profile should auto-select and redirect to trainee dashboard', async ({ page }) => {
  // example1@gmail.com has only one profile "John Doe"
  await page.goto('/login');
  await page.fill('input[id="email"]', 'example1@gmail.com');
  await page.fill('input[id="password"]', 'password1');
  await page.click('button[type="submit"]');

  // Should auto-select and land on trainee dashboard
  // Note: it might briefly show profile-selection or go straight if auto-select is fast
  await page.waitForURL(/.*trainee/, { timeout: 10000 });
  await expect(page.getByRole('heading', { name: 'Operator Portal' })).toBeVisible();

  // Sidebar should show active profile
  await expect(page.getByText('Active Profile')).toBeVisible();
  await expect(page.getByText('John Doe')).toBeVisible();
});

test('can switch profile from sidebar', async ({ page }) => {
  // Login as admin
  await page.goto('/login');
  await page.fill('input[id="email"]', 'founders@gmail.com');
  await page.fill('input[id="password"]', 'america123');
  await page.click('button[type="submit"]');

  await page.waitForURL(/.*profile-selection/);
  await page.getByText('Alexander Hamilton').click();
  await page.waitForURL(/.*admin/);

  // Click switch profile button in sidebar
  await page.getByTitle('Switch Profile').click();
  await page.waitForURL(/.*profile-selection/);

  // Select "Thomas Jefferson"
  await page.getByText('Thomas Jefferson').click();
  await page.waitForURL(/.*admin/);

  // Sidebar should show "Thomas Jefferson"
  await expect(page.getByText('Thomas Jefferson')).toBeVisible();
});
