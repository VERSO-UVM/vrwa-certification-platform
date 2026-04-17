import { expect, test } from "@playwright/test";

test.describe("Admin User Manager", () => {
  test("admin can open users page and edit role", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', "founders@gmail.com");
    await page.fill('input[id="password"]', "america123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(profile-selection|admin)/);
    if (page.url().includes("profile-selection")) {
      await page.getByRole("button", { name: "Alexander Hamilton" }).click();
      await page.waitForURL(/.*admin/);
    }

    await page.getByRole("link", { name: "Users" }).click();
    await expect(page).toHaveURL(/.*admin\/users/);
    await expect(page.getByText("User Management")).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).first().click();
    await expect(page.getByText("Update Role")).toBeVisible();
  });
});

