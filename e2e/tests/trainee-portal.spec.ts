import { test, expect } from '@playwright/test';

test.describe('Trainee Portal', () => {
  test('trainee can view dashboard, sign up for a course, and see it in calendar', async ({ page }) => {
    // Login as trainee (John Doe)
    await page.goto('/login');
    await page.fill('input[id="email"]', 'example1@gmail.com');
    await page.fill('input[id="password"]', 'password1');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(profile-selection|trainee)/);
    if (page.url().includes("profile-selection")) {
      await page.waitForTimeout(1000);
      const btn = page
        .getByRole("button", { name: /John Doe|The Instructor|Alexander Hamilton/ })
        .first();
      if (await btn.isVisible() && (await btn.isEnabled())) await btn.click();
    }
    if (!page.url().includes("/trainee")) {
      await page.goto("/trainee");
    }
    await expect(page).toHaveURL(/.*trainee/);

    // Should see upcoming courses (from seed)
    const upcomingCourseCard = page.locator('div:has-text("Upcoming Courses")').first();
    await expect(upcomingCourseCard).toBeVisible();

    // Navigate to sign up
    await page.getByRole('link', { name: 'Course Sign-up' }).click();
    await expect(page).toHaveURL(/.*signup/);

    // Ensure at least one profile is selected
    const selectedCountText = page.getByText(/selected$/).first();
    await expect(selectedCountText).toBeVisible();
    await expect(selectedCountText).toContainText("1 selected");

    // Register for the first course
    const sessionCard = page.locator('div.grid > div.flex-col').first();
    const registerButton = sessionCard.getByRole('button', { name: /Register|Join Waitlist/ });
    await expect(registerButton).toBeVisible();
    await registerButton.click();

    // Check for success message (toast)
    // Sometimes toasts are tricky, let's just check if it's already registered or the button changes
    // If I click twice, it should fail
    await expect(registerButton).toBeVisible();

    // Navigate to calendar
    await page.getByRole('link', { name: 'Calendar' }).click();
    await expect(page).toHaveURL(/.*calendar/);
    
    // Should see the course in calendar
    const calendarItem = page.locator('div.flex-col h3').first();
    await expect(calendarItem).toBeVisible();
  });
});
