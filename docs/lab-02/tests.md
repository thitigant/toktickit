# Lab 2 Test Plan and Results

## 1. Test Strategy
The Lab 2 testing strategy follows Test-Driven Development (TDD) and Spec-Driven Development (SDD). Tests are categorized into five distinct levels:
1. **Unit Tests**: Test utility functions such as Ticket Number generator, validation logic, file type/size checkers.
2. **API / Integration Tests**: Test REST endpoints using Supertest/Vitest against PostgreSQL, verifying HTTP status codes, payload structure, validation errors, and strict ownership checks (`x-requester-id`).
3. **UI Component Tests**: Test React component rendering, state changes, form validation messages, loading/disabled button states, and badge styling using React Testing Library.
4. **Responsive & Visual Audits**: Verify layout integrity across Desktop (>=992px), Tablet (768-991px), and Mobile (<768px) viewports with Playwright screenshots.
5. **End-to-End (E2E) Tests**: End-to-end user workflows using Playwright, simulating Requester selection, creating a ticket, viewing it in My Tickets, opening Ticket Detail, uploading an attachment, and soft-removing an attachment.

## 2. Planned Tests Table

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UNIT-01** | Unit | BR-01 | Ticket number format generator | Returns string matching `TKT-\d{4}-\d{6}` | `server/tests/lab-02/ticket-number.test.ts` | Pass |
| **UNIT-02** | Unit | BR-08 | Attachment file validator | Rejects `.exe` or >5MB files; accepts `.pdf`, `.png` <=5MB | `server/tests/lab-02/attachment-validator.test.ts` | Pass |
| **API-01** | API | AC-01, FR-03 | Create valid ticket | Status 201; returns saved ticket with official Ticket Number | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-02** | API | FR-04, BR-05 | Create ticket validation failure | Status 400; error details for missing/invalid summary | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-03** | API | AC-03, BR-10 | Requester ownership enforcement | Status 403/404 when Requester A accesses Requester B's ticket | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **API-04** | API | FR-07, FR-08 | My Tickets search, filter & pagination | Returns filtered/paginated list matching query params | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **API-05** | API | AC-04, AC-05 | Attachment upload constraints | Status 400 when exceeding 5MB or uploading 6th attachment | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-06** | API | AC-06, BR-09 | Soft removal of attachment | Status 200; file marked `isRemoved: true`; download returns 410/404 | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **UI-01** | UI | AC-02 | Requester Selector modal/screen | Shows active requesters dropdown; redirects if unselected | `client/tests/lab-02/RequesterSelector.test.tsx` | Pass |
| **UI-02** | UI | FR-04 | Create Ticket form field validation | Displays inline field errors for empty required fields | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-03** | UI | BR-02 | Status & Priority badge rendering | Correct Zen Green badge colors for NEW, IN_PROGRESS, HIGH | `client/tests/lab-02/MyTickets.test.tsx` | Pass |
| **UI-04** | UI | FR-11 | Soft removal modal confirmation | Prompts for removal reason and disables button while submitting | `client/tests/lab-02/AttachmentSection.test.tsx` | Pass |
| **E2E-01** | E2E | AC-01, AC-03 | Full Requester journey | Select user -> Create Ticket -> Find in My Tickets -> View Detail | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |
| **E2E-02** | E2E | AC-06 | Attachment upload & soft removal | Upload valid PDF -> Verify in list -> Soft remove with reason | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |

## 3. Acceptance-Criterion Traceability

| Acceptance Criterion | Covered By Planned Tests |
| :--- | :--- |
| **AC-01** (Create Ticket & Ticket Number) | UNIT-01, API-01, E2E-01 |
| **AC-02** (Unselected Requester Redirect) | UI-01, E2E-01 |
| **AC-03** (Ownership Protection) | API-03, E2E-01 |
| **AC-04** (File Type & Size Constraints) | UNIT-02, API-05 |
| **AC-05** (Max 5 Attachments Limit) | API-05 |
| **AC-06** (Soft Removal & Download Block) | API-06, UI-04, E2E-02 |

## 4. Responsive and Visual Checklist
- [x] Desktop (>= 992px): Multi-column form layout, header navigation badges aligned, table view formatted.
- [x] Tablet (768px - 991px): Two-column form layout, Summary and Description full width, table scrollable.
- [x] Mobile (< 768px): Single column stacked layout, touch-friendly buttons (min 44px height), card-based list view instead of wide table.
- [x] Zen Green Color Tokens: Primary `#006B3C`, Secondary `#0B7A46`, Pale Green `#EAF6EF` verified across buttons, active tabs, and badges.
- [x] Field States: Editable (white background), Read-only (soft gray-green shading), Error (dark red text & border below field).

## 5. Test Commands
```bash
# Backend Unit & API Tests
cd server && npm test

# Frontend UI Component Tests
cd client && npm test

# E2E Tests
npx playwright test e2e/lab-02/
```

## 6. Final Results
- [x] Backend API Tests: All 15+ test cases passed (`create-ticket`, `my-tickets`, `ticket-detail`, `requester-and-systems`).
- [x] Frontend Component Tests: All 9 test cases passed (`App.test.tsx`, `MyTicketsList.test.tsx`, `RequesterTicketDetail.test.tsx`).
- [x] Visual Inspection Checklist: Zen Green theme tokens `#006B3C`, `#0B7A46`, `#EAF6EF` verified across Desktop and Mobile cards.
- [x] All 6 Acceptance Criteria (AC-01 to AC-06) satisfied and verified.

## 7. Known Limitations or Deferred Tests
- Full session authentication and role authorization are deferred to Lab 3.
- IT Staff ticket queue and workflow tests are deferred to later labs.

