# Lab 4 REST API Specification — TokTickIT Sprint 4

All endpoints require authentication via Bearer JWT token in the `Authorization` header (`Authorization: Bearer <token>`) unless stated otherwise.

---

## 1. Actions Taken Endpoints

### 1.1. `GET /api/tickets/:id/actions-taken`
- **Description:** Retrieve all Actions Taken for a specific ticket, sorted chronologically (`actionDateTime ASC` or `DESC`).
- **Authorization:**
  - `REQUESTER`: Permitted **only** if `ticket.requesterId == authenticatedUser.id`. Otherwise returns `403 Forbidden`.
  - `IT_STAFF`, `ADMINISTRATOR`: Permitted for all tickets.
- **Path Parameters:**
  - `id` (integer, required): Ticket ID.
- **Response `200 OK`:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "ticketId": 10,
        "actionDateTime": "2026-10-29T14:30:00.000Z",
        "actionDescription": "Replaced RAM module on user laptop",
        "result": "Laptop booted successfully and ran diagnostic memory tests without errors",
        "performedById": 2,
        "performedBy": {
          "id": 2,
          "name": "Alex Thompson",
          "email": "staff.alex@toktickit.com"
        },
        "followUpRequired": true,
        "followUpNote": "Check with user in 24 hours to confirm no further blue screens occur",
        "attachmentNotes": "diagnostic_log.txt stored on staff share drive",
        "createdAt": "2026-10-29T14:35:00.000Z",
        "updatedAt": "2026-10-29T14:35:00.000Z"
      }
    ]
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: Requester accessing another user's ticket.
  - `404 Not Found`: Ticket not found.

---

### 1.2. `POST /api/tickets/:id/actions-taken`
- **Description:** Create a new Action Taken line item under a ticket.
- **Authorization:**
  - `REQUESTER`: `403 Forbidden`.
  - `IT_STAFF`, `ADMINISTRATOR`: Permitted.
- **Path Parameters:**
  - `id` (integer, required): Ticket ID.
- **Request Body:**
  ```json
  {
    "actionDateTime": "2026-10-29T14:30:00.000Z",
    "actionDescription": "Diagnosed wireless network driver corruption",
    "result": "Reinstalled Intel Wi-Fi driver v22.100. Connection restored.",
    "followUpRequired": false,
    "followUpNote": null,
    "attachmentNotes": "speedtest_results.png"
  }
  ```
- **Validation Rules:**
  - `actionDescription`: string, required, minimum 5 characters.
  - `result`: string, required, minimum 3 characters.
  - `actionDateTime`: ISO date string, optional (defaults to server `now()`).
  - `followUpRequired`: boolean, required.
  - `followUpNote`: string, required if `followUpRequired` is `true`; optional/ignored if `false`.
  - `performedById`: Set automatically by server from authenticated JWT user.
- **Response `201 Created`:**
  ```json
  {
    "message": "Action Taken recorded successfully",
    "data": {
      "id": 2,
      "ticketId": 10,
      "actionDateTime": "2026-10-29T14:30:00.000Z",
      "actionDescription": "Diagnosed wireless network driver corruption",
      "result": "Reinstalled Intel Wi-Fi driver v22.100. Connection restored.",
      "performedById": 2,
      "performedBy": {
        "id": 2,
        "name": "Alex Thompson",
        "email": "staff.alex@toktickit.com"
      },
      "followUpRequired": false,
      "followUpNote": null,
      "attachmentNotes": "speedtest_results.png",
      "createdAt": "2026-10-29T14:31:00.000Z",
      "updatedAt": "2026-10-29T14:31:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Validation failure (e.g. `followUpRequired` is true but `followUpNote` is empty).
  - `401 Unauthorized`: Not logged in.
  - `403 Forbidden`: Authenticated user is a Requester.
  - `404 Not Found`: Ticket does not exist.

---

### 1.3. `PATCH /api/tickets/:id/actions-taken/:actionId`
- **Description:** Update an existing Action Taken record.
- **Authorization:** `IT_STAFF`, `ADMINISTRATOR`.
- **Request Body (partial update supported):**
  ```json
  {
    "actionDescription": "Updated action description",
    "result": "Completed verification",
    "followUpRequired": true,
    "followUpNote": "Scheduled follow-up on Friday morning",
    "attachmentNotes": "updated_notes.txt"
  }
  ```
- **Response `200 OK`:** Returns updated Action Taken object.
- **Error Responses:**
  - `400 Bad Request`: Invalid validation / inconsistent follow-up note.
  - `403 Forbidden`: Role not authorized.
  - `404 Not Found`: Ticket or Action Taken record not found.

---

## 2. Dashboard Endpoints

### 2.1. `GET /api/dashboards/requester`
- **Description:** Retrieve operational metrics and recent tickets for the authenticated Requester.
- **Authorization:** `REQUESTER`, `IT_STAFF`, `ADMINISTRATOR` (returns data scoped to the caller's requester identity).
- **Response `200 OK`:**
  ```json
  {
    "metrics": {
      "totalOpenTickets": 3,
      "inProgressTickets": 2,
      "waitingForRequesterTickets": 1,
      "resolvedTickets": 5,
      "closedTickets": 12
    },
    "recentTickets": [
      {
        "id": 15,
        "ticketNumber": "TKT-2026-000015",
        "title": "VPN disconnects randomly",
        "status": "RESOLVED",
        "priority": "MEDIUM",
        "categoryName": "Network",
        "updatedAt": "2026-10-29T11:45:00.000Z",
        "createdAt": "2026-10-28T09:00:00.000Z"
      }
    ]
  }
  ```
- **Calculation Rules:**
  - `totalOpenTickets`: Count of tickets where `requesterId = user.id` AND `status IN ('NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'REOPENED')`.
  - `inProgressTickets`: Count where `status = 'IN_PROGRESS'`.
  - `waitingForRequesterTickets`: Count where `status = 'WAITING_FOR_REQUESTER'`.
  - `resolvedTickets`: Count where `status = 'RESOLVED'`.
  - `closedTickets`: Count where `status = 'CLOSED'`.
  - `recentTickets`: Up to 5 most recently updated tickets owned by user (`ORDER BY updatedAt DESC LIMIT 5`).

---

### 2.2. `GET /api/dashboards/staff`
- **Description:** Retrieve authoritative service-desk operational metrics, summary cards, and urgent/recent tickets for IT Staff and Administrators.
- **Authorization:** `IT_STAFF`, `ADMINISTRATOR`. (`REQUESTER` gets `403 Forbidden`).
- **Response `200 OK`:**
  ```json
  {
    "metrics": {
      "newCount": 14,
      "openCount": 23,
      "inProgressCount": 18,
      "waitingForRequesterCount": 7,
      "myAssignedCount": 16,
      "unassignedCount": 10,
      "highPriorityCount": 5,
      "criticalPriorityCount": 2
    },
    "recentTickets": [
      {
        "id": 34,
        "ticketNumber": "TKT-2026-000034",
        "title": "Laptop battery drains quickly",
        "status": "IN_PROGRESS",
        "itPriority": "HIGH",
        "categoryName": "Hardware",
        "requesterName": "Jennifer Lopez",
        "assignedStaffName": "Alex Thompson",
        "updatedAt": "2026-10-29T14:15:00.000Z"
      }
    ],
    "userSummary": {
      "totalUsers": 12,
      "activeStaff": 4,
      "activeRequesters": 7
    }
  }
  ```
- **Calculation Rules:**
  - `newCount`, `openCount`, `inProgressCount`, `waitingForRequesterCount`: Counts of all system tickets matching each status.
  - `myAssignedCount`: Count where `assignedStaffId = authenticatedUser.id` and status not closed/cancelled.
  - `unassignedCount`: Count where `assignedStaffId IS NULL` and status not closed/cancelled.
  - `recentTickets`: 5 most recently updated tickets across the system.
  - `userSummary`: Included when requested by an Administrator.

---

## 3. Ticket Status & Workflow Transition

### 3.1. `PATCH /api/tickets/:id/status`
- **Description:** Formally transition ticket status according to the Permitted Status Transition Matrix with optimistic concurrency protection.
- **Authorization:** `IT_STAFF`, `ADMINISTRATOR`.
- **Request Body:**
  ```json
  {
    "status": "IN_PROGRESS",
    "expectedUpdatedAt": "2026-10-29T12:00:00.000Z"
  }
  ```
- **Business Rule Enforcement:**
  - Must follow the transition matrix (`NEW` -> `OPEN`, `IN_PROGRESS`, `CANCELLED`; `OPEN` -> `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `CANCELLED`; etc.).
  - Requesters attempting to set `RESOLVED` directly get `403 Forbidden`.
  - If `expectedUpdatedAt` does not match the database `updatedAt` (within 1-second drift), the server responds with `409 Conflict`.
- **Response `200 OK`:**
  ```json
  {
    "message": "Ticket status updated successfully",
    "ticket": {
      "id": 10,
      "status": "IN_PROGRESS",
      "updatedAt": "2026-10-29T14:35:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Disallowed transition or missing required fields.
  - `403 Forbidden`: Role not authorized.
  - `409 Conflict`: Stale update detected (ticket was modified by another session).

---

### 3.2. `POST /api/tickets/:id/resolve-advisory`
- **Description:** Allows a Requester to submit advisory confirmation that an issue appears resolved.
- **Authorization:** `REQUESTER` (own tickets), `IT_STAFF`, `ADMINISTRATOR`.
- **Request Body:**
  ```json
  {
    "note": "Everything is working now, thank you!"
  }
  ```
- **Behavior:**
  - Does **NOT** change `Ticket.status` to `RESOLVED`.
  - Appends an advisory confirmation or public comment to the ticket history for IT Staff review.
- **Response `200 OK`:**
  ```json
  {
    "message": "Resolution feedback recorded for IT review"
  }
  ```
