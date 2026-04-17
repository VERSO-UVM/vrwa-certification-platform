import { expect, test } from "@playwright/test";

test.describe("Instructor Attendance", () => {
  test("instructor can manage attendance and open print view", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', "example2@gmail.com");
    await page.fill('input[id="password"]', "password2");
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(profile-selection|instructor)/);
    if (page.url().includes("profile-selection")) {
      await page.waitForTimeout(1000);
      const btn = page
        .getByRole("button", { name: /The Instructor|John Doe|Alexander Hamilton/ })
        .first();
      if (await btn.isVisible() && (await btn.isEnabled())) await btn.click();
      await page.waitForURL(/.*instructor/);
    }
    await expect(page).toHaveURL(/.*instructor/);

    await page.getByRole("link", { name: "Manage Attendance" }).first().click();
    await expect(page).toHaveURL(/attendance/);

    await expect(page.getByText("Earned Hours")).toBeVisible();
    const presentButton = page
      .getByRole("button", { name: /Absent|Present/ })
      .first();
    await presentButton.click();

    await page.getByRole("button", { name: "Print Attendance Sheet" }).click();
    await expect(page).toHaveURL(/view=print/);
    await expect(page.getByRole("heading", { name: "Course Attendance Sheet" })).toBeVisible();
  });
});

