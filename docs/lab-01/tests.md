# Lab 1 — Test Plan and Evidence  (fill this in)

All test files live under server/tests/lab-01/ and client/tests/lab-01/.

| # | Tool | Test | Result |
|---|------|------|--------|
| 1 | Supertest | GET /api/health returns 200, status=ok | PASS |
| 2 | Supertest | GET /api/categories returns 4 seeded categories in id order | PASS |
| 3 | Vitest | Heading renders | PASS |
| 4 | Vitest | Success state shows Online + category list | PASS |
| 5 | Vitest | Error state shows Offline + message | PASS |

Paste your passing terminal output / screenshot below.

**Backend (server):**
```
 RUN  v2.1.9 C:/Users/ADMIN/toktickit/server

 ✓ tests/lab-01/categories.test.ts (1 test) 78ms
 ✓ tests/lab-01/health.test.ts (1 test) 56ms

 Test Files  2 passed (2)
      Tests  2 passed (2)
   Duration  2.39s
```

**Frontend (client):**
```
 RUN  v2.1.9 C:/Users/ADMIN/toktickit/client

 ✓ tests/lab-01/App.test.tsx (3 tests) 253ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Duration  5.13s
```

