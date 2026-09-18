# Lab 3 REST API Specification

## Authentication & Session Endpoints

### 1. `POST /api/auth/login`
- **Description**: Authenticates user credentials and issues JWT token.
- **Request Body**:
  ```json
  {
    "email": "staff.alex@toktickit.com",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "name": "Alex Thompson",
      "email": "staff.alex@toktickit.com",
      "role": "IT_STAFF",
      "isActive": true,
      "mustChangePassword": false
    }
  }
  ```
- **Response `401 Unauthorized`**: Inactive account or invalid credentials.

### 2. `POST /api/auth/change-password`
- **Description**: Updates user password (required on first login or requested by user).
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "currentPassword": "InitialPassword123!",
    "newPassword": "NewSecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Password changed successfully"
  }
  ```

---

## IT Staff Ticket Queue & Workflow Endpoints

### 3. `GET /api/staff/tickets`
- **Description**: Paginated list of tickets for IT Staff Queue with search and filters.
- **Headers**: `Authorization: Bearer <token>` (Role: `IT_STAFF`, `ADMINISTRATOR`)
- **Query Parameters**: `search`, `status`, `categoryCode`, `priority`, `page`, `limit`, `sortBy`, `sortOrder`
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "ticketNumber": "TKT-2026-00001",
        "summary": "Laptop battery issue",
        "status": "OPEN",
        "requestedPriority": "MEDIUM",
        "itPriority": "HIGH",
        "owner": { "id": 2, "name": "Alex Thompson" }
      }
    ],
    "pagination": { "totalItems": 15, "currentPage": 1, "totalPages": 2, "pageSize": 10 }
  }
  ```

### 4. `PATCH /api/tickets/:id/assign`
- **Description**: Claim or reassign ticket ownership.
- **Request Body**: `{ "ownerId": 2 }` (or `null` to unassign)
- **Response `200 OK`**: Updated ticket object.

### 5. `PATCH /api/tickets/:id/priority`
- **Description**: Update IT Priority.
- **Request Body**: `{ "itPriority": "HIGH" }`
- **Response `200 OK`**: Updated ticket object.

### 6. `PATCH /api/tickets/:id/status`
- **Description**: Transition ticket status according to business workflow rules.
- **Request Body**: `{ "status": "IN_PROGRESS" }`
- **Response `200 OK`**: Updated ticket object.

---

## Comments & Internal Notes Endpoints

### 7. `POST /api/tickets/:id/comments`
- **Description**: Post a Public Comment visible to Requester, IT Staff, and Admin.
- **Request Body**: `{ "content": "We have ordered a replacement part." }`
- **Response `201 Created`**: Created comment object.

### 8. `POST /api/tickets/:id/internal-notes`
- **Description**: Post a private Internal Note (IT Staff & Admin only).
- **Request Body**: `{ "content": "Diagnostic code: ERR-820." }`
- **Response `201 Created`**: Created note object.

---

## Administrator User Management Endpoints

### 9. `GET /api/admin/users`
- **Description**: List all users with search, role/status filtering, and pagination.
- **Query Parameters**: `search`, `role`, `isActive`, `page`, `limit`
- **Response `200 OK`**: Paginated users object.

### 10. `POST /api/admin/users`
- **Description**: Create new user account.
- **Request Body**:
  ```json
  {
    "name": "New User",
    "email": "new.user@toktickit.com",
    "role": "REQUESTER",
    "department": "Finance",
    "initialPassword": "Password123!"
  }
  ```
- **Response `201 Created`**: Created user object.

### 11. `PATCH /api/admin/users/:id`
- **Description**: Update user profile, role, or active status.
- **Request Body**: `{ "name": "Updated Name", "isActive": false }`
- **Response `200 OK`**: Updated user object.

### 12. `POST /api/admin/users/:id/reset-password`
- **Description**: Reset user password to a temporary password (`mustChangePassword = true`).
- **Request Body**: `{ "newPassword": "TempPassword123!" }`
- **Response `200 OK`**: `{ "message": "Password reset successfully..." }`
