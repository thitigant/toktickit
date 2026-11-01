import { test, expect } from "@playwright/test";

test.describe("Lab 4 Sprint 4: Role-Appropriate Operational Dashboards E2E", () => {
  test("Requester dashboard displays personal ticket counts and drill-down navigation", async ({ page }) => {
    await page.goto("http://localhost:5173/");

    // Log in as Requester
    await page.fill('input[type="email"]', "requester.jennifer@toktickit.com");
    await page.fill('input[type="password"]', "Password123!");
    await page.click('button:has-text("Sign In")');

    // Should load Requester Dashboard by default
    await expect(page.locator("text=Requester Service Desk Dashboard")).toBeVisible();
    await expect(page.locator("#metric-open-tickets")).toBeVisible();
    await expect(page.locator("#metric-in-progress")).toBeVisible();

    // 1-Click drill-down on In Progress card
    await page.click("#metric-in-progress");
    await expect(page.locator("text=My Submitted Tickets")).toBeVisible();

    // Sign out
    await page.click("#profile-dropdown-btn");
    await page.click('button:has-text("Sign Out")');
  });

  test("IT Staff dashboard displays operational metrics, drill-down, and urgent tickets", async ({ page }) => {
    await page.goto("http://localhost:5173/");

    // Log in as IT Staff
    await page.fill('input[type="email"]', "staff.alex@toktickit.com");
    await page.fill('input[type="password"]', "Password123!");
    await page.click('button:has-text("Sign In")');

    // Should load Staff Dashboard
    await expect(page.locator("text=IT Staff Service Desk Operations")).toBeVisible();
    await expect(page.locator("#metric-card-new")).toBeVisible();
    await expect(page.locator("#metric-card-open")).toBeVisible();
    await expect(page.locator("#metric-card-my-assigned")).toBeVisible();

    // 1-Click drill-down on My Assigned card
    await page.click("#metric-card-my-assigned");
    await expect(page.locator("text=IT Staff Ticket Queue")).toBeVisible();
  });
});

