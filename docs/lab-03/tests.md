# Lab 3 Test Plan and Traceability Matrix

## 1. Automated Test Files Summary

| Suite / Area | Test File Location | Target Area | Status |
|---|---|---|---|
| Authentication API | `server/tests/lab-03/auth.api.test.ts` | Login, Password Change, Token Auth | PASS |
| IT Staff Queue API | `server/tests/lab-03/staff-queue.api.test.ts` | Queue listing, search, filtering, pagination | PASS |
| Ticket Operations API | `server/tests/lab-03/tickets-operations.api.test.ts` | Assign, Priority, Status, Comments, Notes | PASS |
| Admin User Mgmt API | `server/tests/lab-03/admin-user-management.api.test.ts` | User List, Create, Edit, Safety rules, Reset Pass | PASS |
| Lab 2 Regression Tests | `server/tests/lab-02/*.test.ts` | My Tickets, Create Ticket, Attachments, Detail | PASS |

## 2. Requirement Traceability Matrix (AC / Test ID)

| Test ID | Type | Requirement / AC | Description | File Path | Result |
|---|---|---|---|---|---|
| API-01 | Integration | AC-01 (FR-01) | Valid credentials return token and user object | `server/tests/lab-03/auth.api.test.ts` | PASS |
| API-02 | Integration | AC-01 (BR-01) | Inactive account login rejected (HTTP 401) | `server/tests/lab-03/auth.api.test.ts` | PASS |
| API-03 | Integration | AC-02 (FR-02) | Enforce password change when `mustChangePassword: true` | `server/tests/lab-03/auth.api.test.ts` | PASS |
| API-04 | Integration | AC-03 (FR-05) | Requesters forbidden from accessing staff queue (HTTP 403) | `server/tests/lab-03/staff-queue.api.test.ts` | PASS |
| API-05 | Integration | AC-03 (FR-05) | IT Staff access queue with pagination & search | `server/tests/lab-03/staff-queue.api.test.ts` | PASS |
| API-06 | Integration | AC-04 (FR-06) | IT Staff claim unassigned ticket or reassign | `server/tests/lab-03/tickets-operations.api.test.ts` | PASS |
| API-07 | Integration | AC-04 (FR-07/08) | IT Priority and permitted status transitions | `server/tests/lab-03/tickets-operations.api.test.ts` | PASS |
| API-08 | Integration | AC-05 (FR-09/10) | Public Comments visible to all, Internal Notes restricted | `server/tests/lab-03/tickets-operations.api.test.ts` | PASS |
| API-09 | Integration | AC-06 (FR-12) | Admin list users with search and role filter | `server/tests/lab-03/admin-user-management.api.test.ts` | PASS |
| API-10 | Integration | AC-06 (FR-12) | Admin create user with password complexity check | `server/tests/lab-03/admin-user-management.api.test.ts` | PASS |
| API-11 | Integration | AC-06 (BR-08) | Admin self-deactivation prevented (HTTP 400) | `server/tests/lab-03/admin-user-management.api.test.ts` | PASS |
| API-12 | Integration | AC-06 (BR-09) | Last active admin demotion/deactivation blocked | `server/tests/lab-03/admin-user-management.api.test.ts` | PASS |
| API-13 | Integration | AC-07 (FR-13) | Admin reset password sets `mustChangePassword: true` | `server/tests/lab-03/admin-user-management.api.test.ts` | PASS |
