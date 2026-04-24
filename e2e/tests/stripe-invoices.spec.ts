import { test, expect } from "@playwright/test";

async function loginTrainee(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[id="email"]', "example1@gmail.com");
  await page.fill('input[id="password"]', "password1");
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*(profile-selection|trainee)/, { timeout: 15000 });
  if (page.url().includes("profile-selection")) {
    const btn = page.getByRole("button", { name: /John Doe/ }).first();
    await btn.waitFor({ state: "visible" });
    await btn.click();
    await page.waitForURL(/.*trainee/, { timeout: 15000 });
  }
}

async function loginAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[id="email"]', "founders@gmail.com");
  await page.fill('input[id="password"]', "america123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*(profile-selection|admin)/, { timeout: 15000 });
  if (page.url().includes("profile-selection")) {
    await page.getByRole("button", { name: "Alexander Hamilton" }).click();
    await page.waitForURL(/.*admin/, { timeout: 15000 });
  }
  await page.waitForURL(/.*admin/, { timeout: 15000 });
}

test("trainee invoices page shows heading", async ({ page }) => {
  await loginTrainee(page);
  await page.goto("/trainee/invoices");
  await expect(
    page.getByRole("heading", { name: "My Invoices" }),
  ).toBeVisible();
});

test("admin invoices page shows heading and filters", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/invoices");
  await expect(
    page.getByRole("heading", { name: "Invoice management" }),
  ).toBeVisible();
  await expect(page.getByText("Year", { exact: true })).toBeVisible();
  await expect(page.getByText("Month", { exact: true })).toBeVisible();
  await expect(page.getByText("Status", { exact: true })).toBeVisible();
});
