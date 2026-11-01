import { test, expect } from "@playwright/test";

test.describe("Lab 4 Sprint 4: Actions Taken Work Tracking E2E", () => {
  test("IT Staff can view ticket actions, add a new action with follow-up validation, and edit", async ({ page }) => {
    await page.goto("http://localhost:5173/");

    // 1. Log in as IT Staff (Alex Thompson)
    await page.fill('input[type="email"]', "staff.alex@toktickit.com");
    await page.fill('input[type="password"]', "Password123!");
    await page.click('button:has-text("Sign In")');

    // 2. Navigate to Ticket Queue or open first ticket
    await page.click('#nav-queue');
    await expect(page.locator("table")).toBeVisible();

    const firstTicket = page.locator("table tbody tr").first();
    await expect(firstTicket).toBeVisible();
    await firstTicket.click();

    // 3. Switch to Actions Taken tab
    const actionsTab = page.locator("#tab-actions-taken");
    await expect(actionsTab).toBeVisible();
    await actionsTab.click();

    // 4. Verify Add Action button is available for IT Staff
    const addBtn = page.locator("#add-action-btn");
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // 5. Test validation: check Follow-up Required without entering Follow-up Note
    await page.fill("#action-description-input", "Replaced worn-out network cable on user workstation");
    await page.fill("#action-result-input", "Network packet loss dropped to zero");
    await page.check("#follow-up-checkbox");

    await page.click("#save-action-btn");
    await expect(page.locator("text=Follow-up note is required when follow-up is checked")).toBeVisible();

    // 6. Enter Follow-up Note and save
    await page.fill("#follow-up-note-input", "Verify link speed again tomorrow morning");
    await page.click("#save-action-btn");

    // 7. Verify action appears in the list
    await expect(page.locator("text=Replaced worn-out network cable on user workstation")).toBeVisible();
    await expect(page.locator("text=Required")).toBeVisible();
  });
});

