import { test, expect } from '@playwright/test';

test('should login successfully as admin', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[id="email"]', 'founders@gmail.com');
  await page.fill('input[id="password"]', 'america123');
  await page.click('button[type="submit"]');

  try {
    await page.waitForURL(/.*(profile-selection|admin)/, { timeout: 10000 });
    if (page.url().includes("profile-selection")) {
      await page.getByRole("button", { name: "Alexander Hamilton" }).click();
      await page.waitForURL(/.*admin/, { timeout: 10000 });
    }
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  } catch (e) {
    const errorText = await page.textContent('.text-red-500');
    if (errorText) {
      console.log('Login failed with error:', errorText);
    }
    throw e;
  }
  await expect(page).toHaveURL(/.*admin/);
  await expect(page.getByRole('heading', { name: 'VRWA Training' })).toBeVisible();
});

test('should login successfully as instructor', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[id="email"]', 'example2@gmail.com');
  await page.fill('input[id="password"]', 'password2');
  await page.click('button[type="submit"]');

  // Instructor only has one profile, it should auto-select
    await page.waitForURL(/.*(profile-selection|instructor|trainee)/, { timeout: 15000 });
    if (page.url().includes("profile-selection")) {
      await page.waitForTimeout(1000);
      if (page.url().includes("profile-selection")) {
        const btn = page.getByRole("button", { name: /The Instructor|John Doe|Alexander Hamilton/ }).first();
        await btn.waitFor({ state: "visible" });
        if (await btn.isEnabled()) {
          await btn.click();
        }
      }
  }
  await page.waitForURL(/.*(instructor|$)/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Instructor', exact: true })).toBeVisible({ timeout: 15000 });
});

test('should login successfully as trainee', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  await page.goto('/login');
  await page.fill('input[id="email"]', 'example1@gmail.com');
  await page.fill('input[id="password"]', 'password1');
  await page.click('button[type="submit"]');

  // Trainee only has one profile, it should auto-select
  try {
    await page.waitForURL(/.*(profile-selection|trainee)/, { timeout: 10000 });
    if (page.url().includes("profile-selection")) {
      await page.waitForTimeout(1000);
      if (page.url().includes("profile-selection")) {
        const btn = page.getByRole("button", { name: /John Doe|The Instructor|Alexander Hamilton/ }).first();
        await btn.waitFor({ state: "visible" });
        if (await btn.isEnabled()) {
          await btn.click();
        }
      }
    }
    await page.waitForURL(/.*trainee/, { timeout: 10000 });
  } catch (e) {
    const errorText = await page.textContent('.text-red-500');
    if (errorText) {
      console.log('Login failed with error:', errorText);
    }
    throw e;
  }
  await expect(page).toHaveURL(/.*trainee/);
  await expect(page.getByRole('heading', { name: /Operator Portal/ }).first()).toBeVisible();
});
