import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function loginAsTrainee(page: Page) {
  await page.goto("/login");
  await page.fill('input[id="email"]', "example1@gmail.com");
  await page.fill('input[id="password"]', "password1");
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*(profile-selection|trainee)/);
  if (page.url().includes("profile-selection")) {
    await page.getByRole("button", { name: /John Doe/i }).click();
  }
}

test.describe("Trainee Certificates", () => {
  test("trainee can open certificates list and view page", async ({ page }) => {
    await loginAsTrainee(page);
    await page.goto("/trainee/certificates");

    await expect(page.getByText("My Certificates")).toBeVisible();
    const viewButtons = page.getByRole("link", { name: "View Certificate" });
    if ((await viewButtons.count()) > 0) {
      await viewButtons.first().click();
      await expect(page).toHaveURL(/\/trainee\/certificates\/view/);
      await expect(page.getByRole("link", { name: "Back to Certificates" })).toBeVisible();
    } else {
      await expect(
        page.getByText("Your certificates will appear here once you complete courses."),
      ).toBeVisible();
    }
  });

  test("calendar view certificate link routes to certificate viewer", async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await page.goto("/trainee/calendar");

    await page.getByRole("tab", { name: "Past" }).click();
    const links = page.getByRole("link", { name: "View Certificate" });
    if ((await links.count()) > 0) {
      await links.first().click();
      await expect(page).toHaveURL(/\/trainee\/certificates\/view/);
    }
  });
});
