# TokTickIT — IT Service Desk Portal (Lab 4 Sprint 4)

TokTickIT is an IT service desk web application built with React, TypeScript, Express, Prisma, PostgreSQL, and the Zen Green design system.

## What's New in Lab 4 (Sprint 4)

- 📋 **Actions Taken Work Tracking** — Parent-child work activity logs under Tickets with Performer auto-attribution, Result capture, and dynamic Follow-up requirement validation.
- 🚦 **Authoritative Ticket Lifecycle & Resolution Gate** — Strict Permitted Status Transition Matrix across 8 statuses, IT Staff resolution gate enforcement, and Requester advisory confirmation endpoint.
- ⚡ **Optimistic Concurrency & Conflict Protection** — Stale update detection via `expectedUpdatedAt` preventing race condition overwrites (HTTP 409 Conflict).
- 📊 **Role-Appropriate Operational Dashboards** — Authoritative real-time aggregation metrics for Requesters (isolated personal view) and IT Staff/Administrators with 1-click drill-down filtering to ticket lists.
- 🛡️ **Product Hardening & Zero-Regression** — Comprehensive test suites across all 4 labs with 100% passing status and complete accessibility compliance under the Zen Green design language.

---

## Repository Structure

```
toktickit/
├── client/                      # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/          # ActionsTaken, RequesterDashboard, StaffDashboard,
│   │   │                        # MyTicketsList, RequesterTicketDetail, StaffTicketQueue,
│   │   │                        # CreateTicketForm, LoginScreen, UserManagement
│   │   ├── api.ts               # REST API client (JWT Bearer Token, actions-taken, dashboards)
│   │   └── App.tsx              # App Shell with Role-Based Navigation & Dashboard Views
│   └── tests/
│       ├── lab-01/              # App foundation tests
│       ├── lab-02/              # MyTicketsList, CreateTicket, AttachmentSection tests
│       ├── lab-03/              # StaffTicketQueue UI component tests
│       └── lab-04/              # ActionsTaken, TicketWorkflow, RequesterDashboard, StaffDashboard
├── server/                      # Express + TypeScript + Prisma backend
│   ├── prisma/                  # Schema, migrations, seed script
│   │   ├── schema.prisma        # Models: Ticket, User, ActionTaken, Attachment, Comment, etc.
│   │   └── seed.ts              # Idempotent seed script populating users, tickets & actions
│   ├── src/                     # Express app routes, middleware & auth
│   └── tests/
│       ├── lab-01/              # Health & categories API tests
│       ├── lab-02/              # Ticket creation, detail, my-tickets, attachments
│       ├── lab-03/              # Auth, staff queue, ticket operations, user management
│       └── lab-04/              # actions-taken, ticket-workflow, requester/staff dashboards
├── docs/
│   ├── lab-01/                  # Lab 1 engineering documents
│   ├── lab-02/                  # Lab 2 engineering documents
│   ├── lab-03/                  # Lab 3 engineering documents
│   └── lab-04/                  # specification.md, api-spec.md, ui-spec.md, tests.md, reviewer.md
├── e2e/
│   ├── lab-02/                  # requester-ticket-flow.spec.ts
│   ├── lab-03/                  # staff-ticket-flow.spec.ts, authentication.spec.ts, user-administration.spec.ts
│   └── lab-04/                  # actions-taken-flow.spec.ts, ticket-resolution.spec.ts, dashboards.spec.ts
├── .gitignore
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Docker (for PostgreSQL) or PostgreSQL server running locally at `127.0.0.1:5432`

### 1. Server Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
   *(Ensure `DATABASE_URL` contains `connection_limit=20&pool_timeout=30` and `JWT_SECRET` is set)*

4. Run Prisma database migrations & idempotent seed:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. Start the backend dev server:
   ```bash
   npm run dev
   ```
   Backend API runs at `http://localhost:3000`.

### 2. Client Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend dev server:
   ```bash
   npm run dev
   ```
   Frontend runs at `http://localhost:5173`.

---

## Default Login Credentials (After Seed)

| Role | Email | Password | Status / Note |
|---|---|---|---|
| **Administrator** | `admin@toktickit.com` | `Password123!` | Active (Access to System Accounts & Staff Queue) |
| **IT Staff** | `staff.alex@toktickit.com` | `Password123!` | Active (Assigned Owner in Seed Data) |
| **IT Staff** | `staff.bob@toktickit.com` | `Password123!` | Active |
| **Requester** | `requester.jennifer@toktickit.com` | `Password123!` | Active (Owns sample tickets) |
| **Requester** | `requester.michael@toktickit.com` | `Password123!` | Active |
| **Requester** | `requester.sarah@toktickit.com` | `Password123!` | Active |
| **Requester** | `requester.david@toktickit.com` | `InitialPassword123!` | ⚠️ Forces password change on first login |

---

## Running Automated Tests

- **Backend API & Unit Tests (Vitest + Supertest):**
  ```bash
  cd server && npx vitest run --fileParallelism=false
  ```
- **Frontend Component Tests (Vitest + React Testing Library):**
  ```bash
  cd client && npm test
  ```
- **E2E Tests — All Labs (Playwright):**
  ```bash
  npx playwright test e2e/lab-04/
  ```
