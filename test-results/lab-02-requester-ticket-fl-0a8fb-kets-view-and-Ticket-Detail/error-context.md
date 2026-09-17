# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lab-02\requester-ticket-flow.spec.ts >> Lab 2 Requester Ticket Flow E2E Tests >> E2E-01: Requester selection, Create Ticket, My Tickets view, and Ticket Detail
- Location: e2e\lab-02\requester-ticket-flow.spec.ts:6:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Create IT Support Ticket')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Create IT Support Ticket') with timeout 5000ms
  - waiting for getByText('Create IT Support Ticket')

```

```yaml
- banner:
  - text: ⏱ TokTickIT
  - button "📋 My Tickets"
  - button "➕ Create Ticket"
  - button "⚙️ System Status"
  - text: 👤 Thitigant Surayothin ▾
- main:
  - strong: "Testing Context:"
  - text: Logged in as
  - strong: Thitigant Surayothin
  - text: "(thitigant.surayothin@example.com • IT Support) Switch:"
  - combobox:
    - option "Thitigant Surayothin (IT Support)" [selected]
    - option "Jennifer Anderson (IT Support)"
    - option "Michael Brown (Finance)"
    - option "Sarah Johnson (Marketing)"
    - option "David Lee (Engineering)"
    - option "Gorn Proxie (Engineering)"
    - option "Emily Chen (HR)"
    - option "Tom Wilson (Finance)"
  - text: Dev Requester Mode
  - status: Loading...
  - paragraph: Loading ticketing options...
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Lab 2 Requester Ticket Flow E2E Tests", () => {
  4  |   const BASE_URL = "http://127.0.0.1:5173";
  5  | 
  6  |   test("E2E-01: Requester selection, Create Ticket, My Tickets view, and Ticket Detail", async ({ page }) => {
  7  |     // 1. Open home page - should show Development Requester selection
  8  |     await page.goto(BASE_URL);
  9  | 
  10 |     // Verify header and requester selector
  11 |     await expect(page.getByText("Select Development Requester")).toBeVisible();
  12 |     await page.locator("#dev-requester-select").selectOption({ index: 0 });
  13 |     await page.locator("#requester-continue-btn").click();
  14 | 
  15 |     // 2. Main screen loaded - verify My Tickets tab loaded
  16 |     await expect(page.getByText("TokTickIT")).toBeVisible();
  17 | 
  18 |     // 3. Navigate to Create Ticket tab
  19 |     await page.locator("#nav-create-ticket-btn").click();
> 20 |     await expect(page.getByText("Create IT Support Ticket")).toBeVisible();
     |                                                              ^ Error: expect(locator).toBeVisible() failed
  21 | 
  22 |     // 4. Fill in form
  23 |     await page.locator("#summary-input").fill("VPN Connection Drops Intermittently");
  24 |     await page
  25 |       .locator("#description-input")
  26 |       .fill("When connecting to the campus VPN from home, connection drops every 10 minutes.");
  27 |     await page.locator("#submit-ticket-btn").click();
  28 | 
  29 |     // 5. Verify success alert and official Ticket Number generated
  30 |     await expect(page.locator("#ticket-success-alert")).toBeVisible();
  31 |     await expect(page.getByText(/TICK-/)).toBeVisible();
  32 | 
  33 |     // 6. Navigate back to My Tickets
  34 |     await page.locator("#nav-my-tickets-btn").click();
  35 |     await expect(page.getByPlaceholder(/Search/i)).toBeVisible();
  36 |   });
  37 | 
  38 |   test("E2E-02: Attachment upload and soft-removal workflow", async ({ page }) => {
  39 |     await page.goto(BASE_URL);
  40 |     await page.locator("#requester-continue-btn").click();
  41 | 
  42 |     // Open first ticket in list if available
  43 |     const firstTicketRow = page.locator("table tbody tr").first();
  44 |     if (await firstTicketRow.isVisible()) {
  45 |       await firstTicketRow.click();
  46 |       await expect(page.getByText(/Ticket Details/i).or(page.getByText(/Overview/i))).toBeVisible();
  47 |     }
  48 |   });
  49 | });
  50 | 
```