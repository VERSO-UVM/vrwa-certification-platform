import { expect, test } from "@playwright/test";

test.describe("Trainee Calendar Past", () => {
  test("trainee can view past tab", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', "example1@gmail.com");
    await page.fill('input[id="password"]', "password1");
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(profile-selection|trainee)/);
    if (page.url().includes("profile-selection")) {
      await page.waitForTimeout(1000);
      const btn = page.getByRole("button", { name: /John Doe|The Instructor|Alexander Hamilton/ }).first();
      if (await btn.isVisible() && (await btn.isEnabled())) await btn.click();
      await page.waitForURL(/.*trainee/);
    }
    await expect(page).toHaveURL(/.*trainee/);

    await page.getByRole("link", { name: "Calendar" }).click();
    await expect(page).toHaveURL(/.*calendar/);
    await page.getByRole("tab", { name: "Past" }).click();
    await expect(page.getByText(/No past sessions found|View Certificate/)).toBeVisible();
  });
});

