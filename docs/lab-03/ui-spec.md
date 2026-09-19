# Lab 3 UI Specification — Zen Green Design Extensions

## 1. Overview & Visual Design Language
Lab 3 extends the **Zen Green** design language established in Lab 2 across all new screens and user roles. 

### Color System Tokens
- **Primary Accent**: Emerald / Forest Green (`#059669`, `#047857`)
- **Background Layer**: Light Gray (`#f8fafc`, `#f1f5f9`)
- **Card Container**: Pure White (`#ffffff`) with subtle shadow (`0 1px 3px rgba(0,0,0,0.1)`)
- **Badges**:
  - `REQUESTER`: Soft Emerald (`#dcfce7`, text `#15803d`)
  - `IT_STAFF`: Soft Blue (`#dbeafe`, text `#1e40af`)
  - `ADMINISTRATOR`: Soft Purple (`#f3e8ff`, text `#6b21a8`)
  - `ACTIVE`: Light Green pill
  - `INACTIVE`: Soft Red pill (`#fee2e2`, text `#b91c1c`)

## 2. Screen Specifications

### 2.1 Login Screen (`LoginScreen.tsx`)
- Minimalist centered card on dark forest gradient background.
- Clean input fields with inline error notifications for invalid credentials or inactive accounts.
- Password visibility toggle icon.

### 2.2 Mandatory Password Change Screen (`ChangePasswordScreen.tsx`)
- Triggered automatically when user logs in with `mustChangePassword: true`.
- Real-time password requirement checklist:
  - At least 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number and 1 special character (`!@#$%^&*`)
- Blocks access to application shell until password is updated.

### 2.3 IT Staff Ticket Queue (`StaffTicketQueue.tsx`)
- Desktop table view with status badges, IT priority indicators, ticket ownership, and category tags.
- Quick filter toolbar: Search box, Status dropdown, Category dropdown, Priority dropdown.
- Pagination controls at table footer.
- Responsive mobile card list format for small viewports.

### 2.4 IT Staff Ticket Detail View (`StaffTicketQueue.tsx` / `RequesterTicketDetail.tsx`)
- Dual-column header for Ticket Info and Action Toolbar.
- **Editable Operational Fields**:
  - Assignee selector (Claim ticket or assign to active IT Staff/Admin).
  - IT Priority selector (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - Status transition dropdown enforcing permitted state workflow.
- **Comments & Notes Tabbed Section**:
  - **Public Comments Tab**: Visible to all roles with distinct green author badges.
  - **Internal Notes Tab**: Yellow-tinted background card visible ONLY to IT Staff and Administrators.

### 2.5 Administrator User Management (`UserManagement.tsx`)
- Responsive table displaying Name, Email, Role, Status, and Action buttons.
- Search bar and Role filter (`ALL`, `REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`).
- Modals for **Create User**, **Edit User**, and **Reset Password**.
- Toast error/success notifications for safety rules (e.g. self-deactivation warning).
