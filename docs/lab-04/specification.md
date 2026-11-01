# Lab 4 Specification — TokTickIT Sprint 4 Engineering Specification

## 1. Sprint Goal
Complete the core TokTickIT service-desk workflow by implementing parent-child **Actions Taken** work tracking under Tickets, enforcing authoritative **Ticket Status Transitions** and Resolution Rules, delivering role-appropriate **Operational Dashboards** for Requesters and IT Staff, and performing comprehensive **Final Regression and Product Hardening** under the Zen Green design system.

---

## 2. Stakeholder Request
"The service desk can now receive Tickets and IT Staff can communicate with Requesters, but we still need a reliable way to plan and track the actual work. Add Actions Taken under each Ticket. Each action should contain Action Date/Time, Action Description, Result, Performed by (auto), Follow-Up Required?, Follow-up Note (required when follow-up is needed), Attachment Notes (what file to look for images etc.).

The primary Ticket Owner remains responsible for coordinating the Ticket as a whole. Requesters may continue to indicate that the problem appears resolved, but IT Staff must review the work and formally update the Ticket.

Add useful dashboards for Requesters and IT Staff, but keep them concise and connected to the detailed screens. Finally, polish and harden the complete application so that all earlier features continue to work consistently under the Zen Green design language."

---

## 3. Scope

### Included
- **Actions Taken Model & Workflow:**
  - One-to-many relationship: 1 Ticket can have multiple Actions Taken entries.
  - Recording Action Date/Time, Action Description, Result, Performed by (auto-populated with authenticated user), Follow-Up Required (boolean), Follow-up Note (required if Follow-Up is true), Attachment Notes.
  - IT Staff and Administrators can create and edit Actions Taken.
  - Ticket Owner coordinates the ticket, but any active IT Staff or Administrator may log or update Actions Taken.
  - Requesters can view Actions Taken on their owned tickets (read-only).
- **Ticket Status & Resolution Gate:**
  - Strict status transitions matrix across `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`.
  - Backend authoritative enforcement of resolution rules (Requester resolution indication is advisory and does not auto-set `RESOLVED`).
  - Optimistic concurrency and stale-update detection (`updatedAt` check / conflict detection) to prevent overwrite collisions.
- **Role-Appropriate Dashboards:**
  - **Requester Dashboard:** Authoritative counts for Open Tickets, Tickets Waiting for Requester, Recently Resolved Tickets, and Recent Tickets list; Quick Actions with deep links / drill-downs.
  - **IT Staff Dashboard:** Authoritative metrics (New, Open, In Progress, Waiting for Requester, My Assigned), Urgent/Recent Tickets, Drill-down links with query filters to the Ticket Queue.
  - **Administrator Dashboard:** Reuses IT Staff operational metrics with concise user-account summary counters.
  - Drill-down navigation, empty states, and loading states.
- **Final Hardening & Full Regression:**
  - Full preservation of authentication, roles, Requester ticket creation, attachments, public comments, internal notes, and admin user management.
  - Zen Green UI polish, accessibility (ARIA, focus outlines, semantic markup), responsive layout (mobile, tablet, desktop).

### Explicitly Excluded
- Automatic SLA clocks, breach notifications, and on-call escalation engines.
- External messaging (Email, SMS, LINE, Push notifications).
- Inventory consumption, spare-parts billing, time-sheet cost accounting.
- Multi-level signature / approval hierarchies.
- Custom report builders and BI data warehouses.
- Multi-tenant cloud SaaS segregation.

---

## 4. Functional Requirements (FR)

- **FR-01 (Actions Taken Management):** IT Staff and Administrators must be able to create new Actions Taken under any accessible Ticket, capturing Date/Time, Description, Result, Performed by (auto-set to authenticated user), Follow-Up flag, Follow-up Note, and Attachment Notes.
- **FR-02 (Actions Taken Editing):** IT Staff and Administrators must be able to update existing Actions Taken entries. Requesters must be forbidden from creating or updating Actions Taken.
- **FR-03 (Actions Taken Visibility):** Requesters must be able to view all Actions Taken on tickets they own. IT Staff and Administrators can view Actions Taken on all accessible tickets.
- **FR-04 (Follow-up Validation):** If `followUpRequired` is `true`, `followUpNote` must not be empty. If `followUpRequired` is `false`, `followUpNote` is optional or cleared.
- **FR-05 (Inactive Assignee & Staff Protection):** Actions Taken cannot be assigned to or recorded on behalf of inactive users.
- **FR-06 (Ticket Status Lifecycle Enforcement):** Ticket status updates must adhere strictly to the Permitted Status Transition Matrix. Disallowed transitions must return HTTP 400 Bad Request.
- **FR-07 (Authoritative Resolution Gate):** A ticket can only be transitioned to `RESOLVED` or `CLOSED` by an IT Staff or Administrator. Requester "problem appears resolved" feedback remains advisory.
- **FR-08 (Concurrency & Stale Update Protection):** Status and ticket modifications must verify the latest record timestamp/version to reject stale updates with HTTP 409 Conflict.
- **FR-09 (Requester Dashboard API & UI):** The backend must provide a summary endpoint returning authoritative metric counts and recent tickets belonging strictly to the authenticated Requester.
- **FR-10 (IT Staff Dashboard API & UI):** The backend must provide an operational metrics endpoint returning unassigned tickets, tickets owned by current user, tickets by status/priority, and recent tickets.
- **FR-11 (Dashboard Drill-Down Navigation):** Metric cards on dashboards must allow one-click navigation to filtered ticket lists (e.g., clicking "My Assigned" navigates to queue filtered by current user).
- **FR-12 (Zen Green Consistency & Accessibility):** All screens (Dashboards, Actions Taken, Ticket Workflow) must conform to Zen Green theme tokens, support keyboard navigation, visible focus indicators, and responsive views across mobile, tablet, and desktop.
- **FR-13 (Regression Preservation):** All Lab 1, Lab 2, and Lab 3 endpoints, components, and permissions must continue to pass tests without regression.

---

## 5. Mandatory Business Rules (BR)

- **BR-01 (Entity Integrity):** An Action Taken belongs to exactly one Ticket (One-to-Many relationship). Deleting or archiving a ticket cascades or preserves related action logs according to database constraints.
- **BR-02 (Ownership Independence):** A Ticket has one primary Ticket Owner (IT Staff) who coordinates the ticket, but any active IT Staff or Administrator can record an Action Taken on that ticket.
- **BR-03 (Automatic Performer Tracking):** The `performedById` of an Action Taken is automatically set by the server from the authenticated JWT session; client-supplied overrides are rejected or ignored.
- **BR-04 (Follow-up Rule):** Whenever `followUpRequired` is `true`, `followUpNote` is mandatory (non-empty string). If `followUpRequired` is `false`, the note is optional.
- **BR-05 (Requester Read-Only Access):** Requesters are restricted to viewing Actions Taken on their own tickets. All write/edit operations by Requesters on Actions Taken must return HTTP 403 Forbidden.
- **BR-06 (Authoritative Resolution):** Only IT Staff and Administrators can formally transition a ticket to `RESOLVED` or `CLOSED`. Requester confirmation of issue resolution is recorded as advisory feedback and does not bypass IT Staff verification.
- **BR-07 (Stale Update Conflict):** Updates to Ticket status or core properties must include the last known `updatedAt` or version. If the ticket has been modified concurrently by another user, the server must reject the update with HTTP 409 Conflict.
- **BR-08 (Dashboard Data Isolation):** The Requester Dashboard query must filter exclusively by `requesterId = authenticatedUserId`. Requesters can never view aggregate metrics or tickets of other users.
- **BR-09 (Authoritative Server Calculations):** All dashboard metrics and card counters must be computed server-side directly from PostgreSQL database queries, never calculated client-side from partial lists.
- **BR-10 (Idempotent Seed):** Test and demonstration seed scripts must execute idempotently without producing duplicate primary keys, inconsistent enum values, or orphaned records.

---

## 6. Authorization Matrix

| Feature / Endpoint | Requester | IT Staff | Administrator |
|---|:---:|:---:|:---:|
| `GET /api/tickets/:id/actions-taken` | Own Tickets Only | All Tickets | All Tickets |
| `POST /api/tickets/:id/actions-taken` | Forbidden (403) | Permitted | Permitted |
| `PATCH /api/tickets/:id/actions-taken/:actionId` | Forbidden (403) | Permitted | Permitted |
| `GET /api/dashboards/requester` | Permitted (Own Only) | Permitted | Permitted |
| `GET /api/dashboards/staff` | Forbidden (403) | Permitted | Permitted |
| `PATCH /api/tickets/:id/status` (Workflow) | Forbidden (403)* | Permitted | Permitted |
| `POST /api/tickets/:id/resolve-advisory` | Permitted (Own Only) | Permitted | Permitted |

*\*Requesters can submit advisory feedback ("Problem Appears Resolved") via a dedicated advisory endpoint, but cannot set status to `RESOLVED` or `CLOSED`.*

---

## 7. Ticket Status Transition Matrix

| Current Status | Permitted Next Statuses | Authorized Roles | Notes |
|---|---|---|---|
| `NEW` | `OPEN`, `IN_PROGRESS`, `CANCELLED` | IT Staff, Admin | When ticket is claimed or reviewed |
| `OPEN` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `CANCELLED` | IT Staff, Admin | Work has begun or waiting on input |
| `IN_PROGRESS` | `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | IT Staff, Admin | Formal resolution requires IT review |
| `WAITING_FOR_REQUESTER` | `IN_PROGRESS`, `RESOLVED`, `CANCELLED` | IT Staff, Admin | Resumed after Requester response |
| `RESOLVED` | `CLOSED`, `REOPENED` | IT Staff, Admin | Verified fixed or closed after grace period |
| `REOPENED` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `CANCELLED` | IT Staff, Admin | Issue recurred |
| `CLOSED` | None (Terminal state) | IT Staff, Admin | Terminal state; cannot transition |
| `CANCELLED` | None (Terminal state) | IT Staff, Admin | Terminal state; cannot transition |

---

## 8. Database Changes & Migration Decisions

### 8.1. New Model: `ActionTaken`
```prisma
model ActionTaken {
  id               Int       @id @default(autoincrement())
  ticketId         Int
  ticket           Ticket    @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  actionDateTime   DateTime  @default(now())
  actionDescription String
  result           String
  performedById    Int
  performedBy      User      @relation("ActionPerformer", fields: [performedById], references: [id])
  followUpRequired Boolean   @default(false)
  followUpNote     String?
  attachmentNotes  String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@index([ticketId])
  @@index([performedById])
  @@index([actionDateTime])
}
```

### 8.2. Justification for Database Design Decisions (Handout Sec 5.1 Requirement)
1. **Decision 1 — Foreign Key Relation with Indexing on `ticketId` and `performedById`:**
   * *Justification*: In service desk operations, tickets can accrue dozens of action entries. Indexing `ticketId` ensures sub-millisecond retrieval of child action logs when viewing Ticket Details. Indexing `performedById` enables fast dashboard queries to compute IT Staff metrics such as "Actions performed by me today".
2. **Decision 2 — Cascade Deletion vs Retention & `performedById` Relationship:**
   * *Justification*: If a ticket is pruned during cleanup in test environments, cascading deletion ensures zero orphaned action records (`onDelete: Cascade`). Furthermore, separating the Ticket Owner (in `Ticket.assignedStaffId`) from `ActionTaken.performedById` satisfies BR-02, allowing multiple IT specialists to record separate interventions while maintaining single-point coordination.

---

## 9. Acceptance Criteria (AC)

- **AC-01:** Given an authenticated IT Staff/Admin, when submitting valid Action Taken data to a ticket, then an `ActionTaken` record is created, linked to the ticket, and `performedById` matches the authenticated user.
- **AC-02:** Given an authenticated Requester, when attempting to create or update an Action Taken, then the API returns HTTP 403 Forbidden.
- **AC-03:** Given an authenticated Requester, when requesting Actions Taken for their owned ticket, then all associated Action Taken records are returned in chronological order.
- **AC-04:** Given an Action Taken payload with `followUpRequired = true` but an empty `followUpNote`, then the API rejects the request with HTTP 400 Bad Request.
- **AC-05:** Given an authenticated IT Staff, when updating a ticket status according to the Permitted Status Transition Matrix, the status update succeeds and `updatedAt` is refreshed.
- **AC-06:** Given a ticket status update request that violates the Permitted Status Transition Matrix, the server rejects it with HTTP 400 Bad Request.
- **AC-07:** Given a ticket status update request containing an outdated `updatedAt` timestamp (stale update), the server returns HTTP 409 Conflict.
- **AC-08:** Given an authenticated Requester calling `GET /api/dashboards/requester`, the server returns only metrics and recent tickets belonging to that Requester.
- **AC-09:** Given an authenticated IT Staff calling `GET /api/dashboards/staff`, the server returns accurate operational metrics (unassigned, owned by user, by status/priority) and recent tickets.
- **AC-10:** Given an authenticated Requester calling `GET /api/dashboards/staff`, the server rejects the request with HTTP 403 Forbidden.
- **AC-11:** Given the IT Staff and Requester Dashboards, clicking on any metric card navigates to the corresponding filtered view in the Ticket Queue / My Tickets list.
- **AC-12:** All screens conform to Zen Green theme design tokens, support keyboard navigation with visible focus rings, and adapt cleanly across mobile, tablet, and desktop viewports.

---

## 10. Product Definition of Done (DoD)

1. Database migration applied with `ActionTaken` model and proper indexes.
2. Idempotent seed script populated with tickets containing zero, one, and multiple Actions Taken, plus diverse statuses and priorities.
3. REST APIs implemented for Actions Taken, Ticket Workflow transitions, and Role Dashboards with full validation, authorization, and error handling.
4. Unit, API integration, UI component, and Playwright E2E test suites created and passing 100%.
5. Regression test suites for Lab 1, 2, and 3 continue to pass without breaks.
6. Zen Green UI implemented for Dashboards, Actions Taken list/form, and status controls with responsive layouts and accessibility verification.
7. Documentation completed in `docs/lab-04/` (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`).
