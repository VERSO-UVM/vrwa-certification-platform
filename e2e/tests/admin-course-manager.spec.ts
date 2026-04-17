import { expect, test } from "@playwright/test";

test.describe("Admin Course Manager", () => {
  test("admin can open course manager and edit entries", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', "founders@gmail.com");
    await page.fill('input[id="password"]', "america123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(profile-selection|admin)/);
    if (page.url().includes("profile-selection")) {
      await page.getByRole("button", { name: "Alexander Hamilton" }).click();
      await page.waitForURL(/.*admin/);
    }

    await page.locator('a[href="/admin/course-manager"]').first().click();
    await expect(page).toHaveURL(/.*course-manager/);
    await expect(page.getByText("Course Manager")).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).first().click();
    await expect(page.getByText(/Edit Course Event|Edit Course/)).toBeVisible();
  });
});

