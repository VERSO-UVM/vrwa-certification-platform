import { expect, test } from "@playwright/test";

test.describe("Trainee Multi Profile Signup", () => {
  test("trainee can select multiple profiles for registration", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', "founders@gmail.com");
    await page.fill('input[id="password"]', "america123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(profile-selection|trainee)/);

    if (page.url().includes("profile-selection")) {
      await page.getByRole("button", { name: "Alexander Hamilton" }).click();
      await page.waitForURL(/.*admin/);
    }

    await page.goto("/trainee/signup");
    await expect(page).toHaveURL(/.*trainee\/signup/);

    await expect(page.getByText("1 selected")).toBeVisible();

    await page.getByText("Thomas Jefferson").click();
    await expect(page.getByText("2 selected")).toBeVisible();

    const firstSessionCard = page.locator("div.grid > div.flex-col").first();
    const registerButton = firstSessionCard.getByRole("button", {
      name: /Register|Join Waitlist/,
    });
    await expect(registerButton).toBeVisible();
    await registerButton.click();
    await page.waitForURL(/\/trainee\/signup\/confirmation/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Registration" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pay later" })).toBeVisible();
  });
});
