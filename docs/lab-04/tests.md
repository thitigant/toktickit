# Lab 4 Test Plan and Traceability Matrix — Sprint 4

## 1. Automated Test Files Summary

| Suite / Area | Planned Test File Location | Target Area | Status |
|---|---|---|:---:|
| Actions Taken API | `server/tests/lab-04/actions-taken.api.test.ts` | Create, Read, Update, Validation, Performer, Roles | Planned |
| Ticket Workflow API | `server/tests/lab-04/ticket-workflow.api.test.ts` | State transitions, Resolution Gate, Stale Conflict | Planned |
| Requester Dashboard API | `server/tests/lab-04/requester-dashboard.api.test.ts` | Own metric counts, Recent tickets, User data isolation | Planned |
| IT Staff Dashboard API | `server/tests/lab-04/staff-dashboard.api.test.ts` | Operational metrics, Unassigned, Staff queues | Planned |
| Staff Dashboard UI Component | `client/tests/lab-04/StaffDashboard.test.tsx` | Metric cards render, Drill-down links, Empty state | Planned |
| Requester Dashboard UI Component | `client/tests/lab-04/RequesterDashboard.test.tsx` | Own metrics render, Quick actions, Drill-down | Planned |
| Actions Taken UI Component | `client/tests/lab-04/ActionsTaken.test.tsx` | List render, Create/Edit form, Follow-up validation | Planned |
| Ticket Workflow UI Component | `client/tests/lab-04/TicketWorkflow.test.tsx` | Permitted transitions, Conflict feedback banner | Planned |
| Actions Taken E2E Flow | `e2e/lab-04/actions-taken-flow.spec.ts` | End-to-end staff action logging and Requester view | Planned |
| Ticket Resolution E2E Flow | `e2e/lab-04/ticket-resolution.spec.ts` | Advisory resolve -> Staff formal resolution -> Closure | Planned |
| Role Dashboards E2E Flow | `e2e/lab-04/dashboards.spec.ts` | Drill-down navigation from dashboard to queues | Planned |
| Regression Suites | `server/tests/lab-02/*.test.ts`, `server/tests/lab-03/*.test.ts` | Full regression coverage for Labs 1, 2, and 3 | Planned |

---

## 2. Requirement Traceability Matrix (AC / Test ID)

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
|---|---|---|---|---|---|:---:|
| API-01 | API | AC-01 (FR-01) | Create valid Action Taken by IT Staff | Action Taken created, linked to ticket, `performedById` set to caller | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| API-02 | API | AC-02 (FR-02) | Requester attempt to create Action Taken | Forbidden with HTTP 403 | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| API-03 | API | AC-03 (FR-03) | Requester view Actions Taken for owned ticket | Returns list of Actions Taken for own ticket | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| API-04 | API | AC-03 (FR-03) | Requester view Actions Taken for other user's ticket | Forbidden with HTTP 403 | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| API-05 | API | AC-04 (FR-04) | Follow-up required = true without follow-up note | Rejected with HTTP 400 Bad Request | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| API-06 | API | AC-01 (FR-02) | Update existing Action Taken by IT Staff | Updates description/result/follow-up successfully | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| API-07 | API | AC-05 (FR-06) | Valid status transition by IT Staff | Ticket status changes according to matrix | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| API-08 | API | AC-06 (FR-06) | Invalid status transition (e.g. NEW -> RESOLVED) | Rejected with HTTP 400 Bad Request | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| API-09 | API | AC-07 (FR-08) | Stale update detection with conflicting timestamp | Rejected with HTTP 409 Conflict | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| API-10 | API | AC-08 (FR-09) | Requester dashboard endpoint data isolation | Returns only requester's metrics & recent tickets | `server/tests/lab-04/requester-dashboard.api.test.ts` | Planned |
| API-11 | API | AC-09 (FR-10) | IT Staff dashboard operational metric calculations | Returns accurate counts (New, Open, In Progress, Assigned) | `server/tests/lab-04/staff-dashboard.api.test.ts` | Planned |
| API-12 | API | AC-10 (FR-10) | Requester access to IT Staff dashboard endpoint | Forbidden with HTTP 403 | `server/tests/lab-04/staff-dashboard.api.test.ts` | Planned |
| UI-01 | UI | AC-11 (FR-11) | IT Staff Dashboard render and drill-down clicks | Cards display correct counts, clicking navigates to queue | `client/tests/lab-04/StaffDashboard.test.tsx` | Planned |
| UI-02 | UI | AC-11 (FR-09) | Requester Dashboard render and quick actions | Cards display requester counts, quick actions work | `client/tests/lab-04/RequesterDashboard.test.tsx` | Planned |
| UI-03 | UI | AC-01 (FR-01) | Actions Taken form input and validation | Dynamic note requirement when follow-up checked | `client/tests/lab-04/ActionsTaken.test.tsx` | Planned |
| UI-04 | UI | AC-05 (FR-06) | Status dropdown options match permitted matrix | Only valid transitions enabled in dropdown | `client/tests/lab-04/TicketWorkflow.test.tsx` | Planned |
| E2E-01 | E2E | AC-01, AC-03 | Full Action Taken workflow from creation to display | Staff logs action, Requester views action read-only | `e2e/lab-04/actions-taken-flow.spec.ts` | Planned |
| E2E-02 | E2E | AC-05, AC-07 | End-to-end resolution gate and conflict handling | Advisory resolution, staff resolution, stale collision | `e2e/lab-04/ticket-resolution.spec.ts` | Planned |
| E2E-03 | E2E | AC-11 (FR-11) | Dashboard metric drill-downs to queue views | User clicks metric card and verifies filtered view | `e2e/lab-04/dashboards.spec.ts` | Planned |
| REG-01 | Reg | FR-13 | Lab 2 Requester Ticket & Attachment regression | All Lab 2 tests pass without regressions | `server/tests/lab-02/*.test.ts` | Planned |
| REG-02 | Reg | FR-13 | Lab 3 Authentication, RBAC & Queue regression | All Lab 3 tests pass without regressions | `server/tests/lab-03/*.test.ts` | Planned |
