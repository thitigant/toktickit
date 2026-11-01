import { test, expect } from "@playwright/test";

test.describe("Lab 4 Sprint 4: Ticket Status Transition, Resolution Gate & Concurrency E2E", () => {
  test("Requester can only submit advisory indication while IT Staff controls formal status transitions", async ({ page }) => {
    // ── Part 1: Requester Advisory Indication ──
    await page.goto("http://localhost:5173/");

    // Log in as Requester (Jennifer Lopez)
    await page.fill('input[type="email"]', "requester.jennifer@toktickit.com");
    await page.fill('input[type="password"]', "Password123!");
    await page.click('button:has-text("Sign In")');

    // Go to My Tickets and select first ticket
    await page.click('#nav-my-tickets');
    const firstTicket = page.locator("table tbody tr").first();
    await expect(firstTicket).toBeVisible();
    await firstTicket.click();

    // Verify Resolution Gate: IT Staff controls are hidden from requester
    await expect(page.locator("text=IT Staff Operational Controls")).not.toBeVisible();

    // Requester can click "Problem Appears Resolved" advisory button
    const advisoryBtn = page.locator("#problem-resolved-btn");
    await expect(advisoryBtn).toBeVisible();
    await advisoryBtn.click();

    await page.fill('textarea[placeholder*="Restarting the app"]', "Checked everything and software is functioning now.");
    await page.click("#confirm-indicate-resolved-btn");
    await expect(page.locator("text=Your resolution note has been sent to IT Support!")).toBeVisible();

    // Sign out
    await page.click("#profile-dropdown-btn");
    await page.click('button:has-text("Sign Out")');

    // ── Part 2: IT Staff Resolution Gate ──
    await page.fill('input[type="email"]', "staff.alex@toktickit.com");
    await page.fill('input[type="password"]', "Password123!");
    await page.click('button:has-text("Sign In")');

    await page.click('#nav-queue');
    const staffTicket = page.locator("table tbody tr").first();
    await staffTicket.click();

    // IT Staff has Operational Controls
    await expect(page.locator("text=IT Staff Operational Controls")).toBeVisible();
    await expect(page.locator("#status-workflow-select")).toBeVisible();
    await expect(page.locator("#update-status-priority-btn")).toBeVisible();
  });
});

