# Lab 4 AI Use & Reflection — TokTickIT Sprint 4

## LLM Models Used
- **Specification & Coding Agent**: Google Antigravity AI Agentic Assistant.

---

## Key Selected Prompts (8 Prompts)

1. **Prompt 1 (Handout Analysis & Sprint 4 Roadmap):**
   > "ช่วยอ่านไฟล์แลป 4 และอธิบายหน่อยว่าแลปนี้ต้องทำอะไรบ้าง"
   - *Outcome*: Analyzed the Lab 4 handout thoroughly, summarizing the core product increment (Actions Taken, Authoritative Ticket Workflow, Role Dashboards, and Final Regression) and the 9-part grading rubric (60 points).

2. **Prompt 2 (Git Branch Flow & Staging Setup):**
   > "ขั้นตอนแรกต้องทำอะไร และช่วยทำขั้นตอนที่ 1 ให้เลยได้ไหม"
   - *Outcome*: Established the `lab4-staging` integration branch from `main`, decomposed Sprint 4 into 6 GitHub Issues (#37–#42), and created the initial feature branch `feature/lab4-specs`.

3. **Prompt 3 (Spec DD — Engineering Contract Generation):**
   > "สร้างเอกสารสเปก docs/lab-04/ ได้แก่ specification.md, api-spec.md, ui-spec.md, tests.md, reviewer.md, ai-use.md ให้ครบถ้วนตามข้อกำหนด Lab 4"
   - *Outcome*: Authored the complete Sprint 4 engineering contract including Functional Requirements (`FR-01` to `FR-13`), Business Rules (`BR-01` to `BR-10`), Status Transition Matrix, Database Schema Justifications, and Acceptance Criteria (`AC-01` to `AC-12`).

4. **Prompt 4 (Database Schema, Seed Data & Actions Taken REST API — Issue #38):**
   > "เริ่มทำ issue 2 ต่อได้เลย (ActionTaken model, migration, seed, and REST API)"
   - *Outcome*: Added the `ActionTaken` model to Prisma with foreign keys and composite indexes, created idempotent Sprint 4 seed data covering tickets with 0, 1, and multiple actions, and implemented `GET/POST/PATCH /api/tickets/:id/actions-taken` with `actions-taken.api.test.ts`.

5. **Prompt 5 (Actions Taken UI Panel — Issue #39):**
   > "เพื่อนรีวิวและ merge issue 2 ให้เรียบร้อยแล้ว ต่อไปเริ่มทำ issue 3 ต่อได้เลย"
   - *Outcome*: Built `ActionsTakenPanel.tsx` integrated into `TicketDetail.tsx` supporting read-only Requester view, IT Staff/Admin create & edit forms, conditional `followUpNote` validation, and `ActionsTaken.test.tsx`.

6. **Prompt 6 (Authoritative Ticket Workflow, Resolution Gate & Concurrency — Issue #40):**
   > "เพื่อนรีวิวและ merge issue 3 ให้เรียบร้อยแล้ว ต่อไปทำ issue 4 ได้เลย"
   - *Outcome*: Implemented `PATCH /api/tickets/:id/status` enforcing the Permitted Status Transition Matrix and Resolution Gate (`RESOLVED`/`CLOSED` restricted to IT Staff/Admin), added `POST /api/tickets/:id/resolve-advisory` for Requesters, and enforced optimistic concurrency via `expectedUpdatedAt` returning `409 Conflict`, verified by `ticket-workflow.api.test.ts` and `TicketWorkflow.test.tsx`.

7. **Prompt 7 (Role-Appropriate Operational Dashboards — Issue #41):**
   > "เพื่อนรีวิวกับ merge issue 4 ให้แล้ว ต่อไปเริ่มทำ pull request issue 5 ได้เลยใช่ไหม"
   - *Outcome*: Implemented `GET /api/dashboards/requester` and `GET /api/dashboards/staff`, built `RequesterDashboard.tsx` and `StaffDashboard.tsx` with 1-click drill-down navigation into filtered ticket queues, and verified with API and UI test suites.

8. **Prompt 8 (Final Hardening, E2E Suites & Regression Verification — Issue #42):**
   > "เพื่อนรีวิวกับ merge issue 5 ให้แล้ว ต่อไปเริ่มทำ pull request issue 6 issue สุดท้ายได้เลยใช่ไหม"
   - *Outcome*: Created Playwright E2E test suites (`actions-taken-flow.spec.ts`, `ticket-resolution.spec.ts`, `dashboards.spec.ts`), hardened test data setup so all 16 server test files (93 tests) and 11 client test files (30 tests) pass sequentially, and updated `README.md` and `docs/lab-04/` documentation.

---

## My Reflection

Applying an AI Agent across Sprint 4 (Lab 4) demonstrated how Spec-Driven Development (Spec DD) and Test-Driven Development (TDD) keep a complex multi-sprint full-stack application coherent:
- **Specification-Agent Value**: Defining the Permitted Status Transition Matrix, Resolution Gate rules, optimistic concurrency contract (`409 Conflict`), and dashboard aggregation queries in `docs/lab-04/` before writing code prevented ambiguity between frontend and backend implementations.
- **Coding-Agent & TDD Rigor**: Mapping every Acceptance Criterion (`AC-01` through `AC-12`) to automated Vitest API tests, React Testing Library component tests, and Playwright E2E tests allowed us to catch subtle issues early (such as sequential database state isolation in integration tests) while guaranteeing zero regressions across Labs 1, 2, and 3.
- **Design & Architectural Consistency**: Reusing the Zen Green design tokens and existing authentication/RBAC middlewares enabled the new `ActionsTakenPanel`, `RequesterDashboard`, and `StaffDashboard` views to integrate seamlessly into the TokTickIT service desk.
