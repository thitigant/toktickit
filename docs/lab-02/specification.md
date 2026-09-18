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
- **AC-01**: Given valid Ticket data, when the Requester submits the form, then one Ticket is saved and the official Ticket Number (format `TICK-YYYYMMDD-XXXX`) is returned.
- **AC-02**: Given no Development Requester is selected, when attempting to navigate to ticket screens, then the user is redirected to the Development Requester Selection screen.
- **AC-03**: Given Requester A is selected, when requesting a Ticket or ticket list belonging to Requester B, then HTTP 403/404 is returned and no cross-requester data is exposed.
- **AC-04**: Given an attachment with unsupported MIME type or exceeding 5MB, when uploaded, then validation fails with clear field-level error messages.
- **AC-05**: Given a ticket with 5 active attachments, when attempting to upload a 6th attachment, then the upload is rejected with a maximum attachment limit message.
- **AC-06**: Given an active attachment owned by the selected Requester, when soft-removed with a valid reason, then `removedAt` is recorded, active count decrements, and subsequent download requests return HTTP 404/410.
- **AC-07**: Given missing required fields (Summary < 5 chars, Description < 10 chars, missing Category), when submitted, then submission is blocked with inline validation feedback.
- **AC-08**: Given an active Requester with existing tickets, when navigating to My Tickets, then only tickets owned by the active Requester are displayed in the list.
- **AC-09**: Given keyword search input in My Tickets, when entered, then tickets are filtered dynamically by Ticket Number or Summary in a case-insensitive manner.
- **AC-10**: Given Category, Priority, or Status filter dropdowns in My Tickets, when selected, then the ticket list updates immediately to show matching records.
- **AC-11**: Given more tickets than the page limit (e.g. > 10 tickets), when navigating between pages, then pagination controls navigate correctly with accurate total counts.
- **AC-12**: Given a valid owned ticket ID, when opened, then the Ticket Detail screen renders all metadata (Number, Date, Requester, Category, System, Priorities, Status, Description) in read-only mode.
- **AC-13**: Given the Ticket Detail screen, when a permitted attachment is uploaded, then it appears in the active attachments list immediately.
- **AC-14**: Given an active attachment on Ticket Detail, when "Remove" is clicked, then a two-step confirmation modal prompts for a mandatory removal reason.
- **AC-15**: Given a soft-removed attachment, when viewing Ticket Detail, then it is displayed with a removed marker and download access is disabled.
- **AC-16**: Given Desktop (≥ 992px), Tablet (768–991px), or Mobile (< 768px) viewports, then the UI adapts responsively with no horizontal overflow or clipped controls.
- **AC-17**: Given a simulated backend outage or network error, when submitting forms or fetching data, then user-entered form values are preserved and a safe error banner is displayed.
- **AC-18**: Given the complete project repository, all code, engineering contracts (`docs/lab-02/`), test suites, and documentation are committed on `main` branch.

## 10. Definition of Done

### 10.1. Part 1: Product Completion
- [x] **Scope Delivered**: All 4 core workflows (Requester Selection, Create Ticket, My Tickets, Requester Ticket Detail & Attachment lifecycle) fully implemented.
- [x] **Acceptance Criteria**: All 18 Acceptance Criteria (AC-01 through AC-18) verified and traceable to automated tests.
- [x] **Automated Test Suite**: 100% test pass rate across Unit tests, Server API integration tests (31 tests), and Client Component/UI tests (14 tests). No tests skipped or disabled.
- [x] **Relational Persistence**: Prisma schema defined with Requester, Category, RelatedSystem, Ticket, and Attachment models with foreign keys, unique constraints, and soft-removal support.
- [x] **Idempotent Seed**: Database seed script runs cleanly multiple times without duplicate records, seeding 4 active requesters, 1 inactive requester, 4 categories, and 7 related systems.
- [x] **Security & Ownership**: Cross-requester data access strictly prevented at the API level (returns 403 Forbidden / 404 Not Found).
- [x] **Validation & Error Handling**: Both client-side and server-side input validation enforced. Safe error states preserve form inputs upon failure.
- [x] **Zen Green UI**: Strict adherence to Zen Green theme tokens, typography, component rules, and responsive layout across Desktop (1200px), Tablet (768px), and Mobile (375px).

### 10.2. Part 2: Course Delivery & Engineering Process
- [x] **Engineering Contracts**: All 4 contract documents (`specification.md`, `tests.md`, `ui-spec.md`, `api-spec.md`) prepared and maintained in `docs/lab-02/`.
- [x] **Git & Branching Workflow**: Clean feature branch flow used for each issue, merged via peer-reviewed Pull Requests into `lab2-staging` and fast-forwarded to `main`.
- [x] **Kanban Board Traceability**: All sprint GitHub Issues created, tracked, and moved to Done.
- [x] **Reviewer & AI Reflection**: `reviewer.md` and `ai-use.md` completed with transparent record of AI agent prompts, human oversight, and reviewer sign-off.
- [x] **Single PDF Evidence**: Complete, high-resolution PDF report generated adhering to required labsheet structure (Answer Part 1 through Answer Part 9).

## 11. Assumptions and Decisions
- `x-requester-id` HTTP header is used to simulate authentication context for API requests in Lab 2.
- Soft removal is permanent in Lab 2 (no restore action for Requesters).
- Ticket numbers use sequential daily formatting `TICK-YYYYMMDD-XXXX` to guarantee global uniqueness.

