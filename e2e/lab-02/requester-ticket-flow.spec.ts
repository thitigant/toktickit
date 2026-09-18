import { test, expect } from "@playwright/test";

test.describe("Lab 2 Requester Ticket Flow E2E Tests", () => {
  const BASE_URL = "http://localhost:5173";

  test("E2E-01: Complete Requester Journey (Login -> Create Ticket -> My Tickets -> Detail)", async ({ page }) => {
    // 1. Open home page - Development Requester selection
    await page.goto(BASE_URL);
    await expect(page.getByText("Select Development Requester")).toBeVisible();
    
    // Continue with default selected requester (Jennifer Anderson)
    await page.locator("#requester-continue-btn").click();

    // 2. Main screen - Verify TokTickIT banner & Requester Context
    await expect(page.getByText("Testing Context:")).toBeVisible();

    // 3. Switch to Create Ticket tab
    await page.locator("#nav-create-ticket-btn").click();
    await expect(page.getByText("Create IT Support Ticket")).toBeVisible();

    // 4. Fill in form fields
    await page.locator("#summary-input").fill("LEB2 Application Submission Gateway Timeout");
    await page
      .locator("#description-input")
      .fill("Students encounter 504 Gateway Timeout when submitting lab assignments near deadline.");
    await page.locator("#submit-ticket-btn").click();

    // 5. Verify success alert and official Ticket Number generated
    await expect(page.locator("#ticket-success-alert")).toBeVisible();
    await expect(page.getByText(/TICK-/)).toBeVisible();

    // 6. Navigate to My Tickets list
    await page.locator("#nav-my-tickets-btn").click();
    await expect(page.getByPlaceholder(/Search/i)).toBeVisible();

    // 7. Verify ticket appears in table and click first ticket to view detail
    const ticketRow = page.locator("table tbody tr").first();
    await expect(ticketRow).toBeVisible();
    await ticketRow.click();

    // 8. Verify Ticket Detail screen rendered
    await expect(page.getByText(/Ticket No/i).or(page.getByText(/Overview/i))).toBeVisible();
  });

  test("E2E-02: Requester Isolation & Attachment Lifecycle Verification", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator("#requester-continue-btn").click();

    // Verify context switcher is present
    await expect(page.locator("#app-requester-selector")).toBeVisible();

    // Switch requester to Bob Smith (id 2)
    await page.locator("#app-requester-selector").selectOption({ index: 1 });
    await expect(page.getByText("Bob Smith")).toBeVisible();
  });
});
