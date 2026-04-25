import { expect, test } from "@playwright/test";

test.describe("Phase 5.5 signup profile", () => {
  test("signup shows step 2 and profile fields after account step", async ({
    page,
  }) => {
    const suffix = Date.now();
    const email = `e2e.phase55.${suffix}@example.com`;

    await page.goto("/signup");
    await page.fill('input[id="name"]', "E2E Phase55 User");
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', "TestPassword123!");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Step 2 of 2")).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/First name/i)).toBeVisible();
    await expect(page.getByLabel(/Street address/i)).toBeVisible();
  });
});
