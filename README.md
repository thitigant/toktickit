# TokTickIT — Requester Ticketing MVP with UI Foundation (Lab 2)

TokTickIT is an IT service desk web application built with React, TypeScript, Express, Prisma, PostgreSQL, and Zen Green design system.

## Repository Structure

```
toktickit/
├── client/                      # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/          # CreateTicketForm, MyTicketsList, RequesterTicketDetail
│   │   ├── api.ts               # REST API client
│   │   └── App.tsx              # App Shell & Requester Context Selector
│   └── tests/
│       ├── lab-01/
│       └── lab-02/              # MyTicketsList, RequesterTicketDetail, CreateTicket, AttachmentSection tests
├── server/                      # Express + TypeScript + Prisma backend
│   ├── prisma/                  # Schema, migrations, seed script
│   ├── src/                     # Express app routes & controllers
│   └── tests/
│       ├── lab-01/
│       └── lab-02/              # API & unit tests (tickets, my-tickets, ticket-detail, attachments)
├── docs/                        # Engineering contract & lab specifications
│   ├── lab-01/
│   └── lab-02/                  # specification.md, tests.md, ui-spec.md, api-spec.md, reviewer.md, ai-use.md
├── e2e/
│   └── lab-02/                  # requester-ticket-flow.spec.ts
├── artifacts/
│   └── lab-02/screenshots/      # create-ticket, my-tickets, ticket-detail screenshots
├── .gitignore
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL database server running locally

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
   *(Update `DATABASE_URL` in `.env` if your PostgreSQL setup requires different credentials)*

4. Run Prisma database migrations & seed:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
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

### 3. Running Automated Tests
- **Backend API & Unit Tests (Vitest + Supertest):**
  ```bash
  cd server && npm test
  ```
- **Frontend Component Tests (Vitest + React Testing Library):**
  ```bash
  cd client && npm test
  ```
- **End-to-End Tests (Playwright):**
  ```bash
  npx playwright test e2e/lab-02/
  ```