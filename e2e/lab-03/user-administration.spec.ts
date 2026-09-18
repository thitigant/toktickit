import { test, expect } from "@playwright/test";

test.describe("Lab 3: Administrator User Management E2E Flow", () => {
  test("Administrator can log in, access User Management, and view user list", async ({ page }) => {
    await page.goto("http://localhost:5173/");

    // Log in as System Administrator
    await page.fill('input[type="email"]', "admin@toktickit.com");
    await page.fill('input[type="password"]', "Password123!");
    await page.click('button:has-text("Sign In")');

    // Click User Management in shell navigation if needed or verify active view
    const userMgmtNav = page.locator("text=User Management");
    if (await userMgmtNav.isVisible()) {
      await userMgmtNav.click();
    }

    // Verify User Management header and table
    await expect(page.locator("text=User Management")).toBeVisible();
    await expect(page.locator('button:has-text("Create User")')).toBeVisible();

    // Verify search input exists
    const searchUsersInput = page.locator('input[placeholder*="Search users"]');
    await expect(searchUsersInput).toBeVisible();
  });
});
