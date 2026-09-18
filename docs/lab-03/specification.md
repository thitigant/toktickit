# Lab 3 Specification — TokTickIT Sprint 3 Engineering Specification

## 1. Sprint Goal
Deliver secure authentication, role-based authorization (Requester, IT Staff, Administrator), operational IT Staff ticket management workflows (Ticket Queue, Claim/Assign, IT Priority, Status Transitions, Public Comments, Internal Notes), and a minimalist Administrator User Management interface.

## 2. Stakeholder Request
Replace the temporary Development Requester selector with secure email/password authentication and mandatory password change on first login. IT Staff require a dedicated Ticket Queue and Ticket Detail interface to claim, reassign, prioritize, write internal operational notes, post public comments, and transition ticket statuses. Administrators require a minimalist User Management screen to view users, create accounts, assign a single role, edit basic profile information, toggle active state, and reset initial passwords.

## 3. Scope
### Included
- User model migration from Development Requester to authenticated Users with roles (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`).
- JWT-based authentication (`POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/change-password`).
- Mandatory first-login password change for users created with initial passwords.
- IT Staff Ticket Queue (`GET /api/staff/tickets`) with search, role/status/priority filtering, pagination, and sorting.
- IT Staff Ticket operations (`PATCH /api/tickets/:id/assign`, `PATCH /api/tickets/:id/priority`, `PATCH /api/tickets/:id/status`).
- Public Comments (`POST /api/tickets/:id/comments`, `GET /api/tickets/:id/comments`) and role-restricted Internal Notes (`POST /api/tickets/:id/internal-notes`, `GET /api/tickets/:id/internal-notes`).
- Administrator User Management (`GET /api/admin/users`, `POST /api/admin/users`, `PATCH /api/admin/users/:id`, `POST /api/admin/users/:id/reset-password`).
- Safety rules preventing self-deactivation and preventing deactivation/demotion of the last active Administrator.
- Zen Green UI extension for Login, Password Change, IT Queue, IT Ticket Detail, and User Management screens.

### Excluded
- Social login, SSO, MFA, email delivery of passwords or reset links.
- Self-registration.
- User hard-deletion or bulk user import/export.
- SLA calculations, automated escalation rules.
- Multiple roles per user.

## 4. Functional Requirements (FR)
- **FR-01**: The system must authenticate users via email and password, returning JWT bearer tokens for authorized sessions.
- **FR-02**: The system must enforce mandatory password change on first login for accounts flagged with `mustChangePassword: true`.
- **FR-03**: The system must restrict screen navigation and API endpoints based on user roles (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`).
- **FR-04**: Requesters must only view and manage tickets and attachments owned by their authenticated identity.
- **FR-05**: IT Staff must be able to view all tickets in a dedicated queue with search, filter, and pagination capabilities.
- **FR-06**: IT Staff and Administrators must be able to claim unassigned tickets or reassign tickets to active IT Staff or Administrators.
- **FR-07**: IT Staff and Administrators must be able to update the IT Priority of a ticket.
- **FR-08**: IT Staff and Administrators must be able to update ticket status according to permitted state transition matrix rules.
- **FR-09**: Requesters, IT Staff, and Administrators must be able to view and post Public Comments on tickets.
- **FR-10**: Only IT Staff and Administrators must be able to view and post private Internal Notes on tickets.
- **FR-11**: Requesters must be able to indicate that a reported issue appears resolved, without directly forcing formal `RESOLVED` status.
- **FR-12**: Administrators must be able to list, search, and filter all system users, create new user accounts, and update user details (name, email, role, active status).
- **FR-13**: Administrators must be able to reset user passwords with temporary credentials that enforce mandatory password change on next login.

## 5. Mandatory Business Rules (BR)
- **BR-01**: Only active users (`isActive = true`) with valid credentials may authenticate.
- **BR-02**: Users flagged with `mustChangePassword = true` cannot access main application views until a valid new password meeting complexity rules is saved.
- **BR-03**: Authenticated user identity (JWT), not client-supplied parameters, determines ownership for all Requester ticket/attachment operations.
- **BR-04**: Public Comments are visible to Requester, IT Staff, and Administrator. Internal Notes are strictly visible to IT Staff and Administrator only.
- **BR-05**: Requesters may indicate resolution ("Problem Appears Resolved"), but only IT Staff or Administrators can formally set ticket status to `RESOLVED` or `CLOSED`.
- **BR-06**: Password complexity requires: minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (`!@#$%^&*`).
- **BR-07**: Duplicate email addresses are rejected across all user creation and update endpoints.
- **BR-08**: An Administrator cannot deactivate their own currently authenticated account.
- **BR-09**: The system must prevent demoting or deactivating the last active Administrator.
- **BR-10**: Status transitions must adhere to valid workflow paths (`NEW` -> `OPEN` / `IN_PROGRESS` / `CANCELLED`, `OPEN` -> `IN_PROGRESS` / `WAITING_FOR_REQUESTER`, `IN_PROGRESS` -> `RESOLVED` / `WAITING_FOR_REQUESTER`, `RESOLVED` -> `CLOSED` / `REOPENED`).

## 6. Authorization Matrix
| Operation / Endpoint | Requester | IT Staff | Administrator |
|---|---|---|---|
| `POST /api/auth/login` | Permitted | Permitted | Permitted |
| `GET /api/tickets` (My Tickets) | Own Only | All | All |
| `GET /api/staff/tickets` (Queue) | Forbidden | Permitted | Permitted |
| `PATCH /api/tickets/:id/assign` | Forbidden | Permitted | Permitted |
| `PATCH /api/tickets/:id/priority` | Forbidden | Permitted | Permitted |
| `PATCH /api/tickets/:id/status` | Forbidden | Permitted | Permitted |
| `POST /api/tickets/:id/comments` | Own Tickets | Permitted | Permitted |
| `POST /api/tickets/:id/internal-notes` | Forbidden | Permitted | Permitted |
| `GET /api/admin/users` | Forbidden | Forbidden | Permitted |
| `POST /api/admin/users` | Forbidden | Forbidden | Permitted |
| `PATCH /api/admin/users/:id` | Forbidden | Forbidden | Permitted |
| `POST /api/admin/users/:id/reset-password` | Forbidden | Forbidden | Permitted |

## 7. Product Definition of Done (DoD)
1. Backend JWT authentication & authorization middleware active for all endpoints.
2. Development Requester selector completely removed from client shell.
3. Seed script updated with active/inactive accounts across all 3 roles, ticket queue sample data, comments, and internal notes.
4. Client UI implements Zen Green design for Login, Change Password, Staff Queue, Staff Detail, and User Management.
5. All automated unit and API integration test suites passing.
6. Documentation complete in `docs/lab-03/` (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`).
