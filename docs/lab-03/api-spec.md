# Lab 3: REST API Contract Specification

## Base URL
`/api`

## Authentication & Authorization Architecture
- **Session/Token Mechanism**: HTTP-only Secure Cookie or Bearer JWT token (`toktickit_auth`).
- **Roles**: `REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`.
- **Status Codes**:
  - `200 OK` / `201 Created` / `204 No Content`
  - `400 Bad Request`: Validation failure or business rule violation.
  - `401 Unauthorized`: Missing, expired, or invalid session token.
  - `403 Forbidden`: Authenticated user lacks the required role or ownership.
  - `404 Not Found`: Target resource does not exist (or safe masking for unauthorized access).
  - `409 Conflict`: Unique constraint violation (e.g. email already in use).

---

## 1. Authentication Endpoints

### 1.1 Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "user@toktickit.com",
    "password": "InitialPassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "usr-123456",
      "name": "Sarah Connor",
      "email": "user@toktickit.com",
      "role": "IT_STAFF",
      "isActive": true,
      "mustChangePassword": true
    },
    "token": "jwt-or-session-token"
  }
  ```
- **Errors**:
  - `400 Bad Request`: Validation error (empty email/password).
  - `401 Unauthorized`: Invalid email or password, or account is inactive (`isActive: false`).

### 1.2 Get Current Authenticated User
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated users
- **Response (200 OK)**:
  ```json
  {
    "id": "usr-123456",
    "name": "Sarah Connor",
    "email": "user@toktickit.com",
    "role": "IT_STAFF",
    "isActive": true,
    "mustChangePassword": false
  }
  ```

### 1.3 Mandatory / Profile Password Change
- **Endpoint**: `POST /api/auth/change-password`
- **Access**: Authenticated users (including those with `mustChangePassword: true`)
- **Request Body**:
  ```json
  {
    "currentPassword": "InitialPassword123!",
    "newPassword": "NewSecurePassword456!",
    "confirmPassword": "NewSecurePassword456!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Password updated successfully",
    "mustChangePassword": false
  }
  ```
- **Errors**:
  - `400 Bad Request`: Password mismatch, does not meet complexity rules, or identical to current password.
  - `401 Unauthorized`: Current password incorrect.

### 1.4 Logout
- **Endpoint**: `POST /api/auth/logout`
- **Access**: Authenticated users
- **Response (200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

## 2. IT Staff & Shared Ticket Endpoints

### 2.1 Ticket Queue (Search, Filter, Sort, Pagination)
- **Endpoint**: `GET /api/tickets/queue`
- **Access**: `IT_STAFF`, `ADMINISTRATOR`
- **Query Parameters**:
  - `search`: string (matches ticket number or summary, case-insensitive)
  - `status`: string (enum `New`, `Open`, `In Progress`, `Waiting for Requester`, `Resolved`, `Closed`, `Reopened`, `Cancelled`)
  - `itPriority`: string (`Low`, `Medium`, `High`, `Critical`)
  - `assignedTo`: string (`all`, `unassigned`, `me`, or specific user ID)
  - `sortBy`: string (`createdAt`, `updatedAt`, `itPriority`, `status` - default `createdAt`)
  - `sortOrder`: string (`asc`, `desc` - default `desc`)
  - `page`: integer (default `1`)
  - `limit`: integer (default `10`)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "tkt-1001",
        "ticketNumber": "TKT-2026-0001",
        "summary": "Cannot connect to VPN",
        "category": "Network",
        "requestedPriority": "High",
        "itPriority": "High",
        "status": "In Progress",
        "createdAt": "2026-09-17T08:00:00.000Z",
        "updatedAt": "2026-09-17T09:30:00.000Z",
        "requester": {
          "id": "usr-101",
          "name": "Jennifer Anderson",
          "email": "jennifer@toktickit.com"
        },
        "owner": {
          "id": "usr-201",
          "name": "Michael Brown",
          "email": "michael@toktickit.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 48,
      "totalPages": 5
    }
  }
  ```

### 2.2 Ticket Operational Detail (Staff / Admin view)
- **Endpoint**: `GET /api/tickets/:id`
- **Access**:
  - `REQUESTER`: Only if ticket was created by current user.
  - `IT_STAFF`, `ADMINISTRATOR`: Permitted for all tickets.
- **Response (200 OK)**: Ticket object with Category, Related System, Owner, Comments, Attachments, and (if Staff/Admin) Internal Notes.

### 2.3 Ticket Assignment / Claim
- **Endpoint**: `PATCH /api/tickets/:id/assign`
- **Access**: `IT_STAFF`, `ADMINISTRATOR`
- **Request Body**:
  ```json
  {
    "ownerId": "usr-201" // or null to unassign
  }
  ```
- **Response (200 OK)**: Updated ticket details with new owner.

### 2.4 Update IT Priority & Status
- **Endpoint**: `PATCH /api/tickets/:id/status`
- **Access**: `IT_STAFF`, `ADMINISTRATOR`
- **Request Body**:
  ```json
  {
    "status": "In Progress",
    "itPriority": "High"
  }
  ```
- **Response (200 OK)**: Updated ticket details.
- **Errors**:
  - `400 Bad Request`: Disallowed status transition (violates BR-07 transition matrix).

### 2.5 Requester Problem Appears Resolved Action
- **Endpoint**: `POST /api/tickets/:id/resolve-indication`
- **Access**: `REQUESTER` (own tickets only)
- **Request Body**:
  ```json
  {
    "note": "The issue seems fixed now, thank you!"
  }
  ```
- **Response (200 OK)**: Appends a public resolution comment without changing status to Resolved/Closed.

---

## 3. Comments and Notes Endpoints

### 3.1 Public Comments
- **Get Comments**: `GET /api/tickets/:id/comments`
  - Access: Requester (own ticket), IT Staff, Administrator
- **Create Comment**: `POST /api/tickets/:id/comments`
  - Access: Requester (own ticket), IT Staff, Administrator
  - Request Body:
    ```json
    {
      "content": "Thank you for the update. Here is more information..."
    }
    ```
  - Response (201 Created): Comment with `author`, `createdAt`, `content`.

### 3.2 Internal Notes
- **Get Internal Notes**: `GET /api/tickets/:id/notes`
  - Access: `IT_STAFF`, `ADMINISTRATOR` (strictly forbidden for `REQUESTER` with 403)
- **Create Internal Note**: `POST /api/tickets/:id/notes`
  - Access: `IT_STAFF`, `ADMINISTRATOR`
  - Request Body:
    ```json
    {
      "content": "Escalated to third-party vendor. Ticket reference #99482."
    }
    ```
  - Response (201 Created): Note object.

---

## 4. Administrator User Management Endpoints

### 4.1 List Users
- **Endpoint**: `GET /api/admin/users`
- **Access**: `ADMINISTRATOR`
- **Query Parameters**:
  - `search`: string (matches name or email)
  - `role`: string (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`, `all`)
- **Response (200 OK)**: Array of users (without password hashes).

### 4.2 Create User
- **Endpoint**: `POST /api/admin/users`
- **Access**: `ADMINISTRATOR`
- **Request Body**:
  ```json
  {
    "name": "Alex Thompson",
    "email": "alex.thompson@toktickit.com",
    "role": "IT_STAFF",
    "isActive": true,
    "initialPassword": "TempPassword123!"
  }
  ```
- **Response (201 Created)**: Created user object with `mustChangePassword: true`.
- **Errors**:
  - `400 Bad Request`: Invalid email, weak password, or invalid role.
  - `409 Conflict`: Email already exists.

### 4.3 Update User & Role
- **Endpoint**: `PATCH /api/admin/users/:id`
- **Access**: `ADMINISTRATOR`
- **Request Body**:
  ```json
  {
    "name": "Alex Thompson",
    "email": "alex.thompson@toktickit.com",
    "role": "IT_STAFF",
    "isActive": false
  }
  ```
- **Response (200 OK)**: Updated user object.
- **Errors**:
  - `400 Bad Request`: Administrator attempting to deactivate own account (BR-11) or deactivating/changing role of the last active Administrator (BR-12).

### 4.4 Set / Reset Initial Password
- **Endpoint**: `POST /api/admin/users/:id/reset-password`
- **Access**: `ADMINISTRATOR`
- **Request Body**:
  ```json
  {
    "newInitialPassword": "NewTempPassword123!"
  }
  ```
- **Response (200 OK)**: Success message, setting `mustChangePassword: true`.
