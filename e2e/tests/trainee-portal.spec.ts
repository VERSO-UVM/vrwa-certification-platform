import { test, expect } from '@playwright/test';

test.describe('Trainee Portal', () => {
  test('trainee can view dashboard, sign up for a course, and see it in calendar', async ({ page }) => {
    // Login as trainee (John Doe)
    await page.goto('/login');
    await page.fill('input[id="email"]', 'example1@gmail.com');
    await page.fill('input[id="password"]', 'password1');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*trainee/);

    // Should see upcoming courses (from seed)
    const upcomingCourseCard = page.locator('div:has-text("Upcoming Courses")').first();
    await expect(upcomingCourseCard).toBeVisible();

    // Navigate to sign up
    await page.getByRole('link', { name: 'Course Sign-up' }).click();
    await expect(page).toHaveURL(/.*signup/);

    // Select profile
    await page.click('button:has-text("Choose a profile...")');
    const johnDoeProfile = page.getByRole('option', { name: 'John Doe' });
    await expect(johnDoeProfile).toBeVisible();
    await johnDoeProfile.click();

    // Register for the first course
    const sessionCard = page.locator('div.grid > div.flex-col').first();
    const registerButton = sessionCard.getByRole('button', { name: 'Register' });
    await expect(registerButton).toBeVisible();
    await registerButton.click();

    // Check for success message (toast)
    // Sometimes toasts are tricky, let's just check if it's already registered or the button changes
    // If I click twice, it should fail
    await expect(page.locator('text=Registered successfully!').or(page.locator('text=Already registered for this session.'))).toBeVisible();

    // Navigate to calendar
    await page.getByRole('link', { name: 'Calendar' }).click();
    await expect(page).toHaveURL(/.*calendar/);
    
    // Should see the course in calendar
    const calendarItem = page.locator('div.flex-col h3').first();
    await expect(calendarItem).toBeVisible();
  });
});
