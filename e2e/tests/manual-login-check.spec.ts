import { test, expect } from '@playwright/test';

test('manual login and profile selection', async ({ page }) => {
  // Go to login page
  await page.goto('http://localhost:5173/login');
  
  // Fill in login credentials
  await page.fill('input[id="email"]', 'founders@gmail.com');
  await page.fill('input[id="password"]', 'america123');
  
  // Click login
  await page.click('button[type="submit"]');
  
  // Capture snapshot after login attempt
  await page.screenshot({ path: 'login-attempt.png' });
  
  // Wait for redirect to /profile-selection or / depending on profiles
  // Based on the code, it should go to / and then /profile-selection if no active profile
  await page.waitForURL(/.*(profile-selection|admin|instructor|trainee).*/);
  
  const currentUrl = page.url();
  console.log('URL after login:', currentUrl);
  await page.screenshot({ path: 'after-login.png' });
  
  if (currentUrl.includes('profile-selection')) {
    console.log('Reached profile selection page');
    
    // Wait for profiles to load
    await page.waitForSelector('button:has-text("Member")');
    await page.screenshot({ path: 'profile-selection.png' });
    
    // Select the first profile
    const profileButton = page.locator('button:has-text("Member")').first();
    await profileButton.click();
    
    // Wait for redirect after profile selection
    await page.waitForURL(/.*(admin|instructor|trainee).*/);
    console.log('URL after profile selection:', page.url());
    await page.screenshot({ path: 'after-profile-selection.png' });
  } else {
    console.log('Automatically redirected (maybe only one profile or already selected)');
  }
  
  // Final check to see if we are logged in and have a role-based view
  await expect(page.url()).toMatch(/.*(admin|instructor|trainee).*/);
});
