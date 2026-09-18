import { test, expect } from "@playwright/test";

test.describe("Lab 3: Authentication & Password Change E2E Flow", () => {
  test("should authenticate active user with valid credentials and display authenticated shell", async ({ page }) => {
    await page.goto("http://localhost:5173/");

    // Check login form visible
    await expect(page.locator("text=Sign in to your account")).toBeVisible();

    // Fill credentials
    await page.fill('input[type="email"]', "requester.jennifer@toktickit.com");
    await page.fill('input[type="password"]', "Password123!");
    await page.click('button:has-text("Sign In")');

    // Should navigate into My Tickets shell
    await expect(page.locator("text=My Tickets")).toBeVisible();
    await expect(page.locator("text=Jennifer Anderson")).toBeVisible();
  });

  test("should show error message for invalid password", async ({ page }) => {
    await page.goto("http://localhost:5173/");

    await page.fill('input[type="email"]', "requester.jennifer@toktickit.com");
    await page.fill('input[type="password"]', "WrongPassword!");
    await page.click('button:has-text("Sign In")');

    await expect(page.locator("text=Invalid email or password")).toBeVisible();
  });

  test("should force mandatory password change for users with mustChangePassword flag", async ({ page }) => {
    await page.goto("http://localhost:5173/");

    // Login with Clara (mustChangePassword = true)
    await page.fill('input[type="email"]', "staff.clara@toktickit.com");
    await page.fill('input[type="password"]', "InitialPassword123!");
    await page.click('button:has-text("Sign In")');

    // Should see Change Password screen
    await expect(page.locator("text=Change Your Password")).toBeVisible();
    await expect(page.locator("text=You must change your password to continue")).toBeVisible();
  });
});
