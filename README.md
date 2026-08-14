# TokTickIT - Full-Stack Hello World Starter (Lab 1)

TokTickIT is an IT service desk application built with React, TypeScript, Express, Prisma, and PostgreSQL.

## Repository Structure

```
toktickit/
├── client/          # React + TypeScript + Vite frontend
├── server/          # Express + TypeScript + Prisma backend
├── docs/            # Documentation & lab evidence
│   └── lab-01/
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
- **Backend Tests (Supertest):**
  ```bash
  cd server && npm test
  ```
- **Frontend Tests (Vitest + React Testing Library):**
  ```bash
  cd client && npm test
  ```
