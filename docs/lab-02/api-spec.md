# Lab 2 REST API Specification

## 1. Overview
This document specifies the REST API endpoints for Sprint 2 (Lab 2). All endpoints enforce strict requester context via the `x-requester-id` HTTP header (simulating session authentication) and ensure ownership boundaries.

---

## 2. API Endpoints Reference

### 2.1 Reference Data Endpoints

#### `GET /api/requesters/active`
- **Purpose**: Retrieve active Development Requesters for the selector screen.
- **Headers**: None required
- **Response 200 OK**:
  ```json
  [
    { "id": 1, "name": "Jennifer Anderson", "email": "jennifer.anderson@example.com", "department": "IT Support" },
    { "id": 2, "name": "Michael Brown", "email": "michael.brown@example.com", "department": "Finance" }
  ]
  ```

#### `GET /api/categories`
- **Purpose**: Retrieve active ticket categories.
- **Response 200 OK**:
  ```json
  [
    { "id": 1, "name": "Account and Access", "code": "ACCOUNT_ACCESS" },
    { "id": 2, "name": "Hardware", "code": "HARDWARE" },
    { "id": 3, "name": "Software", "code": "SOFTWARE" },
    { "id": 4, "name": "Network", "code": "NETWORK" }
  ]
  ```

#### `GET /api/related-systems`
- **Purpose**: Retrieve active related systems.
- **Response 200 OK**:
  ```json
  [
    { "id": 1, "name": "Email", "code": "EMAIL" },
    { "id": 2, "name": "Campus Wi-Fi", "code": "WIFI" },
    { "id": 3, "name": "VPN", "code": "VPN" }
  ]
  ```

---

### 2.2 Ticket Management Endpoints

#### `POST /api/tickets`
- **Purpose**: Create a new IT support ticket.
- **Headers**: `x-requester-id: <number>` (Required)
- **Request Body**:
  ```json
  {
    "categoryId": 2,
    "relatedSystemId": 1,
    "requestedPriority": "MEDIUM",
    "summary": "Laptop battery drains quickly",
    "description": "My laptop battery is draining much faster than usual after last week's Windows update."
  }
  ```
- **Response 201 Created**:
  ```json
  {
    "id": 101,
    "ticketNumber": "TKT-2025-001234",
    "requesterId": 1,
    "categoryId": 2,
    "relatedSystemId": 1,
    "requestedPriority": "MEDIUM",
    "itPriority": "MEDIUM",
    "currentStatus": "NEW",
    "summary": "Laptop battery drains quickly",
    "description": "My laptop battery is draining much faster than usual after last week's Windows update.",
    "createdAt": "2025-05-12T09:14:00.000Z",
    "updatedAt": "2025-05-12T09:14:00.000Z"
  }
  ```
- **Response 400 Bad Request**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": ["summary must be between 5 and 150 characters"]
  }
  ```

#### `GET /api/tickets`
- **Purpose**: Retrieve paginated list of tickets owned by the current Requester.
- **Headers**: `x-requester-id: <number>` (Required)
- **Query Parameters**:
  - `search` (optional): search string in ticketNumber or summary
  - `category` (optional): categoryId filter
  - `priority` (optional): requestedPriority filter (`LOW` | `MEDIUM` | `HIGH` | `URGENT`)
  - `status` (optional): currentStatus filter (`NEW` | `IN_PROGRESS` | `RESOLVED` | `CLOSED`)
  - `page` (optional, default: 1): page number
  - `limit` (optional, default: 10, max: 50): page size
  - `sortBy` (optional, default: `createdAt`): `createdAt` | `ticketNumber` | `requestedPriority` | `currentStatus`
  - `sortOrder` (optional, default: `desc`): `asc` | `desc`
- **Response 200 OK**:
  ```json
  {
    "data": [
      {
        "id": 101,
        "ticketNumber": "TKT-2025-001234",
        "createdAt": "2025-05-12T09:14:00.000Z",
        "summary": "Laptop battery drains quickly",
        "category": { "id": 2, "name": "Hardware" },
        "relatedSystem": { "id": 1, "name": "Corporate Laptop" },
        "requestedPriority": "MEDIUM",
        "itPriority": "MEDIUM",
        "currentStatus": "NEW",
        "updatedAt": "2025-05-12T10:30:00.000Z"
      }
    ],
    "pagination": {
      "totalItems": 42,
      "currentPage": 1,
      "totalPages": 5,
      "pageSize": 10
    }
  }
  ```

#### `GET /api/tickets/:id`
- **Purpose**: Retrieve ticket details owned by the active Requester.
- **Headers**: `x-requester-id: <number>` (Required)
- **Response 200 OK**: Complete ticket details object including active attachments array.
- **Response 403 Forbidden / 404 Not Found**:
  ```json
  {
    "statusCode": 403,
    "error": "Forbidden",
    "message": "Access denied to ticket belonging to another requester"
  }
  ```

---

### 2.3 Attachment Endpoints

#### `POST /api/tickets/:id/attachments`
- **Purpose**: Upload supporting attachment to a ticket owned by the active Requester.
- **Headers**: `x-requester-id: <number>`, `Content-Type: multipart/form-data`
- **Body**: Form data with field `file`
- **Response 201 Created**:
  ```json
  {
    "id": 15,
    "ticketId": 101,
    "fileName": "screen_error.png",
    "fileSize": 1048576,
    "mimeType": "image/png",
    "isRemoved": false,
    "createdAt": "2025-05-12T09:15:00.000Z"
  }
  ```

#### `GET /api/attachments/:id/download`
- **Purpose**: Download an active attachment file.
- **Headers**: `x-requester-id: <number>`
- **Response 200 OK**: File binary stream
- **Response 410 Gone / 404 Not Found**: Returned if the attachment was soft-removed.

#### `DELETE /api/attachments/:id`
- **Purpose**: Soft-remove an attachment with mandatory reason.
- **Headers**: `x-requester-id: <number>`
- **Request Body**:
  ```json
  { "removalReason": "Uploaded incorrect file version" }
  ```
- **Response 200 OK**:
  ```json
  {
    "id": 15,
    "isRemoved": true,
    "removedAt": "2025-05-12T10:00:00.000Z",
    "removalReason": "Uploaded incorrect file version"
  }
  ```
