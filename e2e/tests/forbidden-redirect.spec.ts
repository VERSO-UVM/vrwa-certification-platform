import { expect, test } from "@playwright/test";

test.describe("Forbidden Redirect", () => {
  test("forbidden page is accessible and shows expected copy", async ({ page }) => {
    await page.goto("/forbidden");
    await expect(page).toHaveURL(/.*forbidden/);
    await expect(page.getByText("Access Denied")).toBeVisible();
    await expect(page.getByRole("link", { name: "Return Home" })).toBeVisible();
  });
});
