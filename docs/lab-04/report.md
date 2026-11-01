# Lab 4 Report — TokTickIT Sprint 4

**Author:** Thitigant Surayothin — 67070505214 — @thitigant
**Peer reviewer:** Aran edlek — 67070505230 — @aranedlek
**Repository:** https://github.com/thitigant/toktickit

---

## Answer Part 1 — Git Use with Engineering Workflow (10)
- Integration branch: `lab4-staging`, branched from `main`.
- Feature branches, each merged by PR after peer review:

| Issue | PR | Branch |
|---|---|---|
| #37 Specs | #37 | `feature/lab4-specs` |
| #38 Actions Taken foundation | #43 | `feature/actions-taken-foundation` |
| #39 Actions Taken UI | #44 | `feature/actions-taken-ui` |
| #40 Ticket workflow | #45 | `feature/ticket-workflow-resolution` |
| #41 Dashboards | #46 | `feature/operational-dashboards` |
| #42 Final hardening | #47 | `feature/final-hardening-regression` |

- Final step: PR `lab4-staging` → `main`.
- Evidence to attach: `git log --graph --oneline` screenshot, Kanban board with all issues Done, [reviewer.md](reviewer.md), README, `.gitignore`.

> 📷 Screenshot: commit graph / Kanban board

## Answer Part 2 — Spec DD (5)
Engineering contract in `docs/lab-04/`: `specification.md` (FR-01–FR-13, BR-01–BR-10, status transition matrix, AC-01–AC-12), `api-spec.md`, `ui-spec.md`. Written and merged first in PR #37, before any implementation.

## Answer Part 3 — Test DD and Traceability (10)
See [tests.md](tests.md) for the full AC → test traceability matrix.

| Suite | Result |
|---|---|
| Server (Vitest, sequential) | 16 files, 93 tests passed |
| Client (Vitest + RTL) | 11 files, 30 tests passed |
| Playwright E2E | `e2e/lab-04/actions-taken-flow`, `ticket-resolution`, `dashboards` specs |

> 📷 Screenshot: green terminal output on `main`

## Answer Part 4 — AI Use with Reflection (5)
See [ai-use.md](ai-use.md): 8 prompts with outcomes, plus reflection.

## Answer Part 5 — IT Staff Dashboard UI (5)
`GET /api/dashboards/staff`: New (unassigned), Open, In Progress, Waiting for Requester, My Assigned. Cards drill down in one click to the filtered Staff Queue.

> 📷 `artifacts/lab-04/screenshots/staff-dashboard/` — desktop/tablet/mobile, drill-down, DB count comparison

## Answer Part 6 — Actions Taken UI (10)
`GET/POST/PATCH /api/tickets/:id/actions-taken`: IT Staff/Admin create and edit; Requester is read-only on own tickets (403 on others'). `performedBy` is stamped from the JWT. Follow-up note is required when follow-up is checked.

> 📷 `artifacts/lab-04/screenshots/actions-taken/` — list, create, edit, validation error, requester view

## Answer Part 7 — Ticket Workflow (5)
- `PATCH /api/tickets/:id/status` enforces the transition matrix.
- Resolution gate: only IT Staff/Admin set `RESOLVED`/`CLOSED`.
- Requester "Problem Appears Resolved" calls `POST /api/tickets/:id/resolve-advisory` and does not auto-close.
- Stale updates return `409 Conflict`, shown as an alert in the UI.

> 📷 Screenshots: status change, advisory button, conflict alert

## Answer Part 8 — Requester Dashboard and Final Regression UI (5)
`GET /api/dashboards/requester`: Open / In Progress / Resolved / Closed cards, recent tickets, quick create, drill-down to My Tickets. Lab 1–3 features (login, queue, comments, notes, attachments, user admin) pass regression.

> 📷 `artifacts/lab-04/screenshots/requester-dashboard/` plus Lab 2–3 feature screenshots

## Answer Part 9 — Zen Green UI, Responsive, Accessibility, Polish (5)
Per [ui-spec.md](ui-spec.md): Zen Green design tokens, semantic HTML landmarks, visible keyboard focus outlines, responsive desktop/tablet/mobile layouts.

> 📷 Responsive screenshots and checklist
