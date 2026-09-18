# Lab 3: TokTickIT Users, Roles, IT Staff Ticketing, and Admin Screens - Specification

## 1. Sprint Goal
Deliver secure authentication with role-based access control (Requester, IT Staff, Administrator), replace the temporary Development Requester selector, introduce the IT Staff Ticket Queue with lifecycle management (claim/reassign, IT priority, status workflow, public comments, internal notes), and provide minimalist Administrator user management with critical safety protections, while ensuring complete backward compatibility and data preservation from Lab 2.

## 2. Stakeholder Request Summary
The temporary requester selector used during development must be retired in favor of real authentication with email and password. Users with an initial password must change it upon first login before accessing normal app screens. 
Requesters must continue to create and view their own tickets seamlessly. IT Staff need a shared Ticket Queue and detailed operational view to triage, prioritize, assign, and update tickets, communicating via public comments or private internal notes. Requesters can indicate that issues appear resolved, but only IT Staff can formally resolve or close tickets.
Administrators require a clean, minimal user management screen to create/edit users, assign roles, activate/deactivate accounts, and set initial passwords, guarded by strict safety constraints (cannot deactivate self or last admin). All server APIs must strictly enforce authorization checks.

## 3. Scope

### In Scope
- Real authentication (email + bcrypt-hashed password) with session/cookie or JWT auth tokens.
- Mandatory password change on first login / initial password reset.
- Three defined roles: `Requester`, `IT Staff`, `Administrator`.
- Server-side role-based authorization and ownership checks on all endpoints.
- Removal of Development Requester selector; existing tickets/attachments migrated and linked to authenticated user identity.
- IT Staff Ticket Queue with search, status/priority filters, sorting, and pagination.
- Ticket lifecycle operations: claim, reassign, set IT Priority, update status according to permitted state transition matrix.
- Public Comments (visible to Requester, IT Staff, Admin) and Internal Notes (visible only to IT Staff and Admin).
- Minimalist Admin User Management: list users, search/filter, create user, edit basic details/role/activation state, set initial password.
- Safety rules preventing self-deactivation and removal/deactivation of the last active Administrator.
- Backward compatibility with Lab 2 data (Categories, Related Systems, Tickets, Attachments).
- Full Zen Green design language compliance and responsive views (Desktop, Tablet, Mobile).

### Explicitly Excluded
- Email delivery/invitations, password reset via email, multi-factor authentication (MFA), OAuth/social login, SSO.
- Self-registration / sign-up (users are created by Administrator only).
- Actions Taken by IT Staff (deferred to Lab 4).
- SLA calculations, automated escalation rules, email notifications.
- Department/organization hierarchies, user profile images, profile editing beyond admin controls.
- Deletion of users, bulk operations, user import/export, account audit history.
- Multiple roles per single user account.

## 4. Functional Requirements (FR)

- **FR-01 (Authentication)**: The system shall allow active users to log in using a valid email address and password.
- **FR-02 (Mandatory Password Change)**: When a user with `mustChangePassword = true` logs in, the system shall redirect them to change their password and block access to any other application feature until a new valid password is saved.
- **FR-03 (Session Management & Logout)**: The system shall provide secure logout that invalidates the authenticated session/token and prevents subsequent access without logging in again.
- **FR-04 (Role-Based Navigation)**: The UI navigation and views shall reflect only the authorized areas for the authenticated user's role:
  - Requester: My Tickets, Create Ticket, Ticket Detail (own tickets).
  - IT Staff: Ticket Queue, Ticket Detail (all tickets), Comments, Internal Notes.
  - Administrator: User Management, User Create/Edit.
- **FR-05 (Requester Continuity)**: Requesters shall create and manage tickets associated with their authenticated account without the development requester selector.
- **FR-06 (IT Staff Ticket Queue)**: IT Staff shall view tickets in a queue with search (ticket number, summary), filters (status, priority, assigned owner), sorting (created date, priority, status), and pagination.
- **FR-07 (Ticket Ownership & Assignment)**: IT Staff or Administrator shall be able to claim an unassigned ticket or assign/reassign a ticket to any active IT Staff or Administrator.
- **FR-08 (IT Priority & Status Transitions)**: IT Staff and Administrator shall be able to update IT Priority and transition ticket status according to the valid status transition matrix.
- **FR-09 (Public Comments)**: Requesters (for their own tickets), IT Staff, and Administrators can append public comments to a ticket.
- **FR-10 (Internal Notes)**: IT Staff and Administrators can append private operational internal notes to a ticket. Requesters are strictly forbidden from viewing or adding internal notes.
- **FR-11 (Requester Problem Resolution)**: A Requester viewing their own open ticket can mark "Problem Appears Resolved", adding a public comment/event, but formal resolution remains an IT Staff responsibility.
- **FR-12 (Administrator User Management)**: Administrators shall view all users, search by name/email, filter by role, create new accounts with an initial password, edit user details/role/active state, and set a new temporary initial password.
- **FR-13 (Administrator Safety Rules)**: The system shall prevent an Administrator from deactivating their own account or deactivating/reassigning the role of the last active Administrator.

## 5. Business Rules (BR)

- **BR-01**: Only an active user (`isActive = true`) with valid credentials may authenticate. Inactive users receive a generic safe rejection message ("Invalid email or password" or "Account is deactivated").
- **BR-02**: A user marked as requiring a password change (`mustChangePassword = true`) cannot access normal application endpoints or views until a valid new password (different from current, meeting complexity rules) is saved.
- **BR-03**: The authenticated user identity (session/token subject), never a client-supplied `requesterId`, determines ownership for all Requester ticket and attachment operations.
- **BR-04**: Public Comments are visible to the ticket's Requester, IT Staff, and Administrators. Internal Notes are strictly visible only to IT Staff and Administrators.
- **BR-05**: A Requester may indicate that the problem appears resolved, but cannot formally change the ticket status to `Resolved` or `Closed`.
- **BR-06**: Only IT Staff or Administrator can set `IT Priority`, claim ownership, or reassign ticket ownership.
- **BR-07**: Ticket Status Transition Rules:
  - Allowed transitions for IT Staff/Admin:
    - `New` -> `Open`, `In Progress`, `Cancelled`
    - `Open` -> `In Progress`, `Waiting for Requester`, `Resolved`, `Cancelled`
    - `In Progress` -> `Waiting for Requester`, `Resolved`, `Cancelled`
    - `Waiting for Requester` -> `In Progress`, `Resolved`, `Cancelled`
    - `Resolved` -> `Closed`, `Reopened`
    - `Closed` -> `Reopened`
    - `Reopened` -> `In Progress`, `Resolved`, `Cancelled`
    - `Cancelled` -> (Terminal state or `Reopened` by Admin)
- **BR-08**: Requested Priority is immutable after ticket creation. IT Priority defaults to Requested Priority upon creation and can subsequently be updated only by IT Staff or Administrator.
- **BR-09**: Passwords must be at least 8 characters, containing uppercase, lowercase, and at least one number or special character. Passwords must be hashed using bcrypt (salt rounds >= 10).
- **BR-10**: Email addresses must be unique across all users (case-insensitive).
- **BR-11**: An Administrator cannot deactivate their own user account.
- **BR-12**: An Administrator cannot deactivate or change the role of the last remaining active Administrator in the system.
- **BR-13**: User deletion is prohibited; user deactivation (`isActive = false`) is used instead to preserve audit and ticket historical integrity.
- **BR-14**: Comments and Notes are strictly append-only (no editing or deleting allowed). Whitespace-only content is rejected. Maximum content length is 2,000 characters.

## 6. Acceptance Criteria (AC)

- **AC-01**: Given an active user with valid credentials, when the user logs in, then authenticated access is granted, returning the user identity and permitted role.
- **AC-02**: Given an inactive user, when login is attempted, then authentication is rejected with an appropriate error and no session is created.
- **AC-03**: Given a user with `mustChangePassword = true`, when login succeeds, then access to regular screens is blocked and only the Change Password screen is accessible until a new valid password is set.
- **AC-04**: Given an authenticated user, when logout is performed, then the session/token is cleared, and direct access to protected routes redirects to the login screen.
- **AC-05**: Given an authenticated Requester, when accessing ticket APIs, then the backend strictly scopes data to the authenticated user's ID, ignoring any client-injected requester identifiers.
- **AC-06**: Given an authenticated Requester, when attempting to fetch or post an Internal Note on any ticket, then the backend rejects the request with HTTP 403 Forbidden without leaking note content.
- **AC-07**: Given an IT Staff user, when viewing the Ticket Queue, then they can search, filter by status/priority, sort by date/priority, and paginate through all tickets.
- **AC-08**: Given an IT Staff or Administrator, when viewing Ticket Detail, then they can claim the ticket (assign to self), reassign to another active staff member, and update IT Priority.
- **AC-09**: Given an IT Staff user, when updating ticket status, then valid transitions succeed and invalid transitions return HTTP 400 with descriptive validation errors.
- **AC-10**: Given a Requester on their own ticket, when clicking "Problem Appears Resolved", then a public comment is recorded indicating resolution request without directly setting status to Closed.
- **AC-11**: Given an Administrator, when creating a new user with name, unique email, single role, and initial password, then the user is saved with `mustChangePassword = true`.
- **AC-12**: Given an Administrator, when attempting to deactivate their own account or the sole active Administrator account, then the request is rejected with a clear safety rule error.

## 7. Definition of Done (DoD) for Lab 3
- [ ] Database schema migrated with User model, password hash, role enum, ticket ownership, comments, and notes.
- [ ] Lab 2 ticket/attachment data preserved and migrated to user accounts without loss.
- [ ] Idempotent seed script with >= 4 active Requesters, 1 inactive Requester, >= 3 active IT Staff, 1 inactive IT Staff, and 1 active Administrator.
- [ ] All REST API endpoints implemented and secured according to `docs/lab-03/api-spec.md`.
- [ ] Server API tests passing 100% in `server/tests/lab-03/`.
- [ ] Client UI components and unit/integration tests passing in `client/`.
- [ ] End-to-end Playwright tests passing 100% in `e2e/lab-03/`.
- [ ] Zen Green design system consistently applied across all screens.
- [ ] All artifacts, documentation, and screenshots gathered for the final 9-part PDF submission.
