# TokTickIT — IT Service Desk Portal (Lab 3)

TokTickIT is an IT service desk web application built with React, TypeScript, Express, Prisma, PostgreSQL, and Zen Green design system.

## What's New in Lab 3

- 🔐 **JWT Authentication** — Email/Password login with bcrypt hashing and mandatory first-login password change
- 🎭 **Role-Based Authorization (RBAC)** — Requester, IT Staff, and Administrator roles with full access control
- 🎫 **IT Staff Ticket Queue** — Searchable, filterable, paginated ticket queue with Claim/Assign, IT Priority, and Status Transition workflow
- 💬 **Public Comments & Internal Notes** — Role-restricted communication on each ticket
- 🛡️ **Admin User Management** — Create, edit, reset passwords with Safety Rules (no self-deactivation, last-admin protection)

---

## Repository Structure

```
toktickit/
├── client/                      # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/          # Lab 2: CreateTicketForm, MyTicketsList, RequesterTicketDetail
│   │   │                        # Lab 3: LoginScreen, ChangePasswordScreen,
│   │   │                        #         StaffTicketQueue, UserManagement
│   │   ├── api.ts               # REST API client (with JWT Bearer Token support)
│   │   └── App.tsx              # App Shell with Role-Based Navigation
│   └── tests/
│       ├── lab-02/              # MyTicketsList, CreateTicket, AttachmentSection tests
│       └── lab-03/              # StaffTicketQueue UI component tests
├── server/                      # Express + TypeScript + Prisma backend
│   ├── prisma/                  # Schema, migrations, seed script
│   │   └── seed.ts              # Seeds 10 users (Requester/IT Staff/Admin) + sample tickets
│   ├── src/                     # Express app routes & controllers
│   │   ├── middleware/          # JWT auth middleware, Role authorization guard
│   │   └── routes/              # auth, staff, tickets, admin routes
│   └── tests/
│       ├── lab-02/              # API & unit tests (tickets, my-tickets, attachments)
│       └── lab-03/              # auth, staff-queue, tickets-operations, admin-user-management
├── docs/
│   ├── lab-02/                  # Lab 2 engineering contracts
│   └── lab-03/                  # specification.md, api-spec.md, ui-spec.md,
│                                #  tests.md, reviewer.md, ai-use.md
├── e2e/
│   ├── lab-02/                  # requester-ticket-flow.spec.ts
│   └── lab-03/                  # staff-ticket-flow.spec.ts
├── .gitignore
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Docker (for PostgreSQL) or PostgreSQL server running locally

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
   *(Update `DATABASE_URL` and `JWT_SECRET` in `.env` as needed)*

4. Run Prisma database migrations & seed:
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

| Role | Email | Password | หมายเหตุ |
|---|---|---|---|
| **Administrator** | `admin@toktickit.com` | `Password123!` | Active |
| **IT Staff** | `staff.alex@toktickit.com` | `Password123!` | Active |
| **IT Staff** | `staff.bob@toktickit.com` | `Password123!` | Active |
| **Requester** | `requester.jennifer@toktickit.com` | `Password123!` | Active |
| **Requester** | `requester.michael@toktickit.com` | `Password123!` | Active |
| **Requester** | `requester.sarah@toktickit.com` | `Password123!` | Active |
| **Requester** | `requester.david@toktickit.com` | `InitialPassword123!` | ⚠️ ต้องเปลี่ยน Password แรกเข้า |

---

## Running Automated Tests

- **Backend API & Unit Tests (Vitest + Supertest):**
  ```bash
  cd server && npm test
  ```
- **Frontend Component Tests (Vitest + React Testing Library):**
  ```bash
  cd client && npm test
  ```
- **E2E Tests — Lab 2 (Playwright):**
  ```bash
  npx playwright test e2e/lab-02/
  ```
- **E2E Tests — Lab 3 (Playwright):**
  ```bash
  npx playwright test e2e/lab-03/
  ```