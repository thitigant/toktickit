# Lab 3: Test DD Plan & Acceptance Criteria Traceability

## 1. Traceability Matrix (Acceptance Criteria to Test Cases)

| Acceptance Criterion | Test ID | Test Type | What It Tests | Expected Result | Automated Test File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AC-01** (Valid login) | API-01 | API | Active user with valid credentials | 200 OK, auth token returned, user role identified | `server/tests/lab-03/auth.api.test.ts` |
| **AC-01** (Login UI) | UI-01 | UI | Login form submission with valid inputs | Form submits, busy state shown, navigates to home | `client/src/tests/lab-03/Login.test.tsx` |
| **AC-02** (Inactive account) | API-02 | API | Inactive account login attempt | 401 Unauthorized, generic error message | `server/tests/lab-03/auth.api.test.ts` |
| **AC-03** (Mandatory pwd change) | API-03 | API | User with `mustChangePassword` tries general API | Blocked or flag indicated | `server/tests/lab-03/auth.api.test.ts` |
| **AC-03** (Change pwd flow) | E2E-01 | E2E | Initial login -> mandatory redirect -> pwd changed | User enters app only after valid password set | `e2e/lab-03/authentication.spec.ts` |
| **AC-04** (Logout) | API-04 | API | Logout endpoint clears session token | 200 OK, token invalidated | `server/tests/lab-03/auth.api.test.ts` |
| **AC-04** (Logout navigation) | E2E-02 | E2E | Click logout button | Session cleared, redirected to `/login` | `e2e/lab-03/authentication.spec.ts` |
| **AC-05** (Requester ownership) | API-05 | API | Requester queries tickets with fake `requesterId` | Backend ignores param, scopes strictly to JWT user | `server/tests/lab-03/authorization.api.test.ts` |
| **AC-06** (Internal Notes privacy)| API-06 | API | Requester requests `/api/tickets/:id/notes` | 403 Forbidden, no note content leaked | `server/tests/lab-03/comments-notes.api.test.ts` |
| **AC-07** (IT Staff Queue query) | API-07 | API | Queue retrieval with search, filter, sort, page | 200 OK, correct filtered tickets & pagination meta | `server/tests/lab-03/staff-queue.api.test.ts` |
| **AC-07** (Queue UI rendering) | UI-02 | UI | Staff Ticket Queue table & filters rendering | Badges, columns, sorting actions render properly | `client/src/tests/lab-03/StaffTicketQueue.test.tsx` |
| **AC-08** (Claim & Reassign) | API-08 | API | Claim ticket and reassign to another staff | 200 OK, `ownerId` updated correctly | `server/tests/lab-03/staff-ticket-detail.api.test.ts` |
| **AC-08** (IT Priority update) | API-09 | API | IT Staff updates IT Priority | 200 OK, `itPriority` changed | `server/tests/lab-03/staff-ticket-detail.api.test.ts` |
| **AC-09** (Status transitions) | API-10 | API | Permitted and forbidden status transitions | Permitted updates succeed; invalid return 400 | `server/tests/lab-03/staff-ticket-detail.api.test.ts` |
| **AC-10** (Resolution indication)| API-11 | API | Requester indicates problem resolved | Appends public comment, status not directly closed | `server/tests/lab-03/comments-notes.api.test.ts` |
| **AC-11** (Admin create user) | API-12 | API | Administrator creates user with initial pwd | 201 Created, `mustChangePassword: true` | `server/tests/lab-03/users-admin.api.test.ts` |
| **AC-11** (Admin UI management)| UI-03 | UI | Admin User Management table and create modal | Validation errors on duplicate email, correct form | `client/src/tests/lab-03/UserManagement.test.tsx` |
| **AC-12** (Self-deactivation safe)| API-13 | API | Admin attempts to deactivate self | 400 Bad Request (BR-11 violation error) | `server/tests/lab-03/users-admin.api.test.ts` |
| **AC-12** (Last Admin safe) | API-14 | API | Admin attempts to deactivate sole active admin | 400 Bad Request (BR-12 violation error) | `server/tests/lab-03/users-admin.api.test.ts` |
| **Full Flow** (Staff workflow) | E2E-03 | E2E | Staff logs in, claims ticket, updates status/note | End-to-end operational flow succeeds | `e2e/lab-03/staff-ticket-flow.spec.ts` |
| **Full Flow** (Admin workflow) | E2E-04 | E2E | Admin logs in, creates staff, verifies safety | End-to-end admin management flow succeeds | `e2e/lab-03/user-administration.spec.ts` |

---

## 2. Planned Test Execution Commands
- **Backend Tests**: `cd server && npm test`
- **Frontend Tests**: `cd client && npm test`
- **End-to-End Tests**: `npx playwright test`
