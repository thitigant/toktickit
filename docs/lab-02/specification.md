# Lab 2 Sprint Engineering Specification

## 1. Sprint Goal
Deliver a responsive, user-facing IT support ticketing experience for Requesters (end users) under a temporary Development Requester testing context (simulated login). Requesters can create tickets with validated inputs and permitted attachments, view and manage their own tickets (search, filter, sort, paginate), inspect ticket details, add new permitted attachments, and soft-remove their own attachments while strictly preventing cross-requester data access.

## 2. Stakeholder Request Interpretation
The IT department needs a self-service ticketing web application for end users. Key features include describing an issue, picking category/system/priority, attaching supporting evidence (JPG/PNG/WEBP/PDF <= 5MB, max 5 active attachments per ticket), receiving a unique backend-generated Ticket Number, viewing tickets in "My Tickets", filtering/sorting/searching tickets, and inspecting/managing ticket attachments on the Ticket Detail screen. Authentication is simulated via a Development Requester selector screen for Lab 2. All screens must adhere strictly to the Zen Green design system.

## 3. Scope

### Included
- Development Requester Selection ("Login simulation" context selector)
- Requester-facing Navigation Shell (header, active identity badge, switch requester action)
- Create Ticket workflow with full frontend & backend validation and attachment upload
- Ticket Number auto-generation (e.g. `TKT-2025-XXXXXX`)
- My Tickets workflow (paginated list, search by ticket number/summary, filter by Category/Priority/Status, sorting)
- Requester Ticket Detail screen (read-only ticket view, active attachments list, upload new attachment, soft-remove attachment with reason)
- Backend ownership enforcement (Requester A cannot view or manage Requester B's tickets or attachments)
- Zen Green UI styling & responsive layouts (Desktop, Tablet, Mobile)

### Excluded
- Real authentication/security (passwords, JWT, sessions, role-based authorization)
- IT Staff workflow (dashboard, claiming tickets, reassigning, changing status/priority)
- Collaboration features (Public Comments, Internal Notes, Actions Taken)
- Ticket lifecycle status changes after creation (beyond initial `NEW` status)
- Admin functions (user/role management)

## 4. Functional Requirements
- **FR-01**: The system shall allow selecting an active Development Requester to set the session context.
- **FR-02**: The system shall generate a unique, read-only official Ticket Number upon successful ticket creation.
- **FR-03**: The system shall allow Requesters to create an IT ticket by specifying Category, Related System, Requested Priority, Summary, Description, and optional initial Attachments.
- **FR-04**: The system shall validate all Create Ticket fields on both frontend and backend before persisting data.
- **FR-05**: The system shall restrict attachments to JPG, JPEG, PNG, WEBP, and PDF file types with a maximum size of 5 MB per file and a limit of 5 active attachments per ticket.
- **FR-06**: The system shall provide a "My Tickets" list showing only tickets owned by the currently selected Requester.
- **FR-07**: The system shall support searching tickets by Ticket Number or Summary, filtering by Category, Requested Priority, IT Priority, and Status, and sorting by date or status.
- **FR-08**: The system shall support pagination for the ticket list.
- **FR-09**: The system shall display detailed read-only ticket information on the Ticket Detail screen.
- **FR-10**: The system shall allow the ticket owner to upload additional permitted attachments from the Ticket Detail screen up to the limit of 5 active attachments.
- **FR-11**: The system shall allow the ticket owner to soft-remove their permitted attachment by providing a removal reason. Removed attachments shall remain in metadata but be blocked from download/preview.
- **FR-12**: The system shall reject any request to view or modify tickets or attachments belonging to a different Requester with an appropriate error (e.g. 403 Forbidden / 404 Not Found).

## 5. Business Rules
- **BR-01**: Official Ticket Number is generated strictly by the backend using format `TKT-YYYY-XXXXXX` and must be unique.
- **BR-02**: A newly created ticket begins with `currentStatus` set to `NEW` and default `itPriority` set to `MEDIUM`.
- **BR-03**: Lab 2 uses a Development Requester selector for testing context; it is not secure authentication.
- **BR-04**: Inactive Requesters must not appear in the Development Requester selection dropdown and cannot own new tickets.
- **BR-05**: Ticket Summary must be required, trimmed, between 5 and 150 characters.
- **BR-06**: Ticket Description must be required, trimmed, between 10 and 2000 characters.
- **BR-07**: A Ticket can have at most 5 active (non-removed) attachments at any given time.
- **BR-08**: Allowed file types for attachments are image/jpeg, image/jpg, image/png, image/webp, and application/pdf. Maximum allowed size per file is 5MB (5,242,880 bytes).
- **BR-09**: Soft removal sets `isRemoved = true`, records `removedAt` timestamp and `removalReason` (required, 3-200 chars). Removed files cannot be downloaded or previewed.
- **BR-10**: Strict Ownership Check: API endpoints for tickets and attachments must verify `requesterId` against the active session context. Access attempts to other users' tickets must return HTTP 403 or 404.

## 6. UI Specification Summary
- **Color Palette (Zen Green)**:
  - Primary Green: `#006B3C` (Header, Primary Buttons)
  - Secondary Green: `#0B7A46` (Active Tabs, Focus Borders, Hover States)
  - Pale Green: `#EAF6EF` (Selected Rows, Success Badges/Banners)
  - Page Background: `#F5F7F6`
  - Surface/Cards: `#FFFFFF` with subtle border `#E2E8F0`
  - Text: `#1A202C` (Dark Charcoal Green)
- **Screens**:
  1. *Requester Selector Screen*: Centered card with Requester dropdown, informative alert, Continue button.
  2. *Create Ticket Screen*: Two-column/stacked form, clear field labels, red asterisk for required fields, file drop zone with validation feedback, Submit button with loading spinner.
  3. *My Tickets Screen*: Search bar, filter dropdowns (Category, Priority, Status), data table (Desktop) / cards (Mobile), pagination controls.
  4. *Ticket Detail Screen*: Read-only ticket summary header, badge indicators, attachments list section with upload button and soft-remove modal dialog.

## 7. Data Changes
- **Prisma Schema Additions**:
  - `RequesterUser`: `id`, `name`, `email`, `department`, `isActive`, `createdAt`
  - `Category`: `id`, `name`, `code`, `isActive`
  - `RelatedSystem`: `id`, `name`, `code`, `isActive`
  - `Ticket`: `id`, `ticketNumber` (unique), `requesterId`, `categoryId`, `relatedSystemId`, `requestedPriority`, `itPriority`, `currentStatus`, `summary`, `description`, `createdAt`, `updatedAt`
  - `Attachment`: `id`, `ticketId`, `fileName`, `fileSize`, `mimeType`, `filePath`, `isRemoved`, `removedAt`, `removalReason`, `createdAt`
- **Seed Data Requirements**:
  - 4 Ticket Categories: `Account and Access`, `Hardware`, `Software`, `Network`
  - 7 Related Systems: `Email`, `Campus Wi-Fi`, `VPN`, `LEB2 App`, `Grade Submission App`, `Printer`, `Corporate Laptop`
  - 4 Active Requesters: e.g. Jennifer Anderson, Michael Brown, Sarah Johnson, David Lee
  - 1 Inactive Requester: e.g. Inactive Test User

## 8. API Contract Summary
- `GET /api/requesters/active` - Fetch active requesters list
- `GET /api/categories` - Fetch active categories
- `GET /api/related-systems` - Fetch active related systems
- `POST /api/tickets` - Create new ticket (headers: `x-requester-id`)
- `GET /api/tickets` - List owner's tickets with query parameters (`requesterId`, `search`, `category`, `priority`, `status`, `page`, `limit`, `sortBy`, `sortOrder`)
- `GET /api/tickets/:id` - Get owned ticket detail by ID (headers: `x-requester-id`)
- `POST /api/tickets/:id/attachments` - Upload attachment to ticket
- `GET /api/attachments/:id/download` - Download active attachment
- `DELETE /api/attachments/:id` - Soft-remove attachment with reason body

## 9. Acceptance Criteria
- **AC-01**: Given a valid ticket creation request with a valid `requesterId`, when submitted, then a new Ticket is saved with status `NEW` and a unique `ticketNumber` (format `TKT-YYYY-XXXXXX`) is returned.
- **AC-02**: Given no Development Requester is selected, when opening any ticket screen, then the user is redirected to the Requester Selection screen.
- **AC-03**: Given Requester A is selected, when requesting ticket list or ticket details belonging to Requester B, then HTTP 403/404 is returned and no data is exposed.
- **AC-04**: Given an attachment larger than 5MB or invalid file type (e.g. `.exe`), when uploading, then validation fails with clear error message.
- **AC-05**: Given a ticket with 5 active attachments, when attempting to upload a 6th attachment, then the request is rejected with error message.
- **AC-06**: Given an active attachment owned by the selected Requester, when soft-removed with a valid reason, then `isRemoved` becomes true and subsequent download requests return HTTP 410 Gone / 404 Not Found.

## 10. Definition of Done
- All 4 Lab 2 documents (`specification.md`, `tests.md`, `ui-spec.md`, `api-spec.md`) complete and committed.
- Prisma schema migrated and seeded idempotently.
- Full implementation of Requester Selector, Create Ticket, My Tickets, Ticket Detail, and Attachments.
- All automated unit, API, UI, responsive, and E2E tests pass cleanly.
- Visual inspection checklist verified across Desktop, Tablet, and Mobile viewports.
- All PRs reviewed and merged into `lab2-staging`, and final Release PR opened for `main`.

## 11. Assumptions and Decisions
- `x-requester-id` HTTP header is used to simulate authentication context for API requests in Lab 2.
- Soft removal is permanent in Lab 2 (no restore action for Requesters).
- Ticket numbers reset sequence per year or use standard random hex/digit generation to ensure uniqueness across environments.
