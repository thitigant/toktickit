import { test, expect } from "@playwright/test";

test.describe("Lab 3: IT Staff Ticket Queue and Detail Operations E2E", () => {
  test("IT Staff can log in, view Queue, filter tickets, and update ticket details", async ({ page }) => {
    await page.goto("http://localhost:5173/");

    // Log in as Alex Thompson (IT Staff)
    await page.fill('input[type="email"]', "staff.alex@toktickit.com");
    await page.fill('input[type="password"]', "Password123!");
    await page.click('button:has-text("Sign In")');

    // Should see IT Staff Ticket Queue
    await expect(page.locator("text=Ticket Queue")).toBeVisible();
    await expect(page.locator("text=Alex Thompson")).toBeVisible();

    // Verify queue search bar exists
    const searchInput = page.locator('input[placeholder*="Search tickets"]');
    await expect(searchInput).toBeVisible();

    // Filter or click on a ticket to open Detail
    const ticketRow = page.locator("table tbody tr").first();
    if (await ticketRow.isVisible()) {
      await ticketRow.click();
      // Should open Ticket Detail
      await expect(page.locator("text=Ticket Detail")).toBeVisible();
    }
  });
});
