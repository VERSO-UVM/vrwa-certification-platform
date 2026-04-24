import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.fill('input[id="email"]', "founders@gmail.com");
  await page.fill('input[id="password"]', "america123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*(profile-selection|admin)/);
  if (page.url().includes("profile-selection")) {
    const profileButton = page.getByRole("button", {
      name: /Alexander Hamilton/i,
    });
    if (await profileButton.isVisible()) {
      await expect(profileButton).toBeEnabled({ timeout: 10000 });
      await profileButton.click();
    }
    await page.waitForURL(/.*(admin|$)/);
  }
}

test.describe("Admin Certifications", () => {
  test("admin can access certifications page and form fields", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/certifications");

    await expect(
      page.getByRole("heading", { name: "Certifications" }),
    ).toBeVisible();
    await expect(page.getByText("Course Session")).toBeVisible();
    await expect(page.getByText("Email Subject")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send Certificates" })).toBeVisible();
  });

  test("admin can update recipients hash state", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/certifications");

    const courseSelect = page.getByRole("combobox").first();
    await courseSelect.click();
    const options = page.getByRole("option");
    if ((await options.count()) > 0) {
      await options.first().click();
      const checkboxes = page.getByRole("checkbox");
      if ((await checkboxes.count()) > 0) {
        await checkboxes.first().click();
        await page.getByRole("button", { name: "Add Selected" }).click();
        await expect(page).toHaveURL(/#/);
      }
    }
  });
});
