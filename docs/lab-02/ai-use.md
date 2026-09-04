# Lab 2 — AI Use and Reflection

**LLM/agent used:** Antigravity AI Agent (Powered by Gemini)

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | Asked agent to draft the Sprint 2 Engineering Contracts (spec, tests, ui-spec, api-spec) | Reviewed all business rules, ACs, and API shapes before committing to `docs/lab-02/` |
| 2 | Asked agent to implement Prisma models (`RequesterUser`, `Ticket`, `Attachment`) and idempotent seed script | Ran `prisma db seed` and verified test requesters and categories were populated |
| 3 | Asked agent to build the Create Ticket API endpoint and responsive Form UI with field-level validations | Verified form behavior, error messages, and verified Vitest API suite passed |
| 4 | Asked agent to implement `GET /api/tickets` with search, category/priority/status filters, pagination, and ownership scoping | Verified SQL query filtering, pagination metadata, and cross-requester access blocking |
| 5 | Asked agent to create `MyTicketsList` component with Desktop table and Mobile cards responsive layouts | Inspected component layout across desktop (≥768px) and mobile (<768px) viewports |
| 6 | Asked agent to build Requester Ticket Detail view and Attachment lifecycle (upload, download stream, and soft removal modal) | Tested soft removal modal confirmation with mandatory reason tracking and download blocking on soft-deleted files |
| 7 | Asked agent to verify all unit, API, and component test suites across client and server packages | Ran `npm test` in both client and server packages to ensure 100% test pass rate |
| 8 | Asked agent to help guide the Git Branch flow (`feature/*` -> `lab2-staging` -> `main`) and prepare PR titles & descriptions | Used the generated PR descriptions and followed the staging workflow for all sprint issues |

## Reflection
Working with an AI coding agent during Sprint 2 significantly accelerated full-stack development, especially when transitioning between backend Prisma API logic and responsive React UI components. Applying Spec-Driven Development (SDD) beforehand provided a clear contract that allowed the AI agent to generate clean code and matching TDD unit/API tests with minimal ambiguity. The most critical aspect requiring human oversight was ensuring strict requester ownership scoping (`x-requester-id` checks) across all endpoints to prevent unintended data leakage between requesters.
