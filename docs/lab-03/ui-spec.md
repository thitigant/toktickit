# Lab 3: UI Specification & Zen Green Design Extensions

## 1. Design System Foundation (Zen Green Continuity)
Lab 3 preserves and extends the design language established in Lab 2:
- **Primary Brand Color**: Forest / Emerald Green (`#065f46`, `#047857`, `#10b981`)
- **Neutral Grays**: Slate tones (`#f8fafc` background, `#e2e8f0` border, `#1e293b` text)
- **Role & Status Badges**:
  - **Roles**:
    - `Requester`: Blue-gray badge (`#e0f2fe`, text `#0369a1`)
    - `IT Staff`: Green badge (`#dcfce7`, text `#15803d`)
    - `Administrator`: Purple badge (`#f3e8ff`, text `#7e22ce`)
  - **Statuses**:
    - `New`: Blue (`#e0f2fe`)
    - `Open`: Amber/Yellow (`#fef3c7`)
    - `In Progress`: Emerald/Green (`#d1fae5`)
    - `Waiting for Requester`: Orange (`#ffedd5`)
    - `Resolved`: Teal (`#ccfbf1`)
    - `Closed`: Slate (`#f1f5f9`)
    - `Reopened`: Rose (`#ffe4e6`)
    - `Cancelled`: Zinc (`#f4f4f5`)

---

## 2. Screens & Component Breakdown

### 2.1 Login Screen (`/login`)
- **Components**:
  - Clean centered card with TokTickIT logo and title "Sign in to your account".
  - Email input field with regex email validation.
  - Password input field with toggle visibility (eye icon).
  - Submit button with busy loading spinner state.
  - Error alert for invalid credentials or inactive account.
- **States**: Default, Submitting, Error feedback.

### 2.2 Mandatory First-Login Password Change Screen (`/change-password`)
- **Components**:
  - Centered card "Change Your Password" explaining requirement for initial passwords.
  - Current Password input.
  - New Password input with live password strength checklist:
    - Minimum 8 characters
    - Uppercase and lowercase letters
    - Numbers and special characters
  - Confirm New Password input with match validation.
  - "Continue to App" CTA button.

### 2.3 Application Shell & Navigation Header
- **Top Navigation Bar**:
  - Logo / App Title (`TokTickIT`)
  - Role-specific Navigation links:
    - `Requester`: "My Tickets", "Create Ticket"
    - `IT Staff`: "Ticket Queue", "Create Ticket"
    - `Administrator`: "User Management"
  - Right-side Profile Dropdown:
    - User avatar initial, Full Name, and Role badge.
    - Dropdown menu options: "Change Password", "Sign Out".

### 2.4 IT Staff Ticket Queue Screen (`/queue`)
- **Header**: Search bar (ticket number/summary) and filter toggle button.
- **Filter Controls Drawer / Bar**:
  - Status filter dropdown (multi or single selection).
  - Priority filter dropdown (Low, Medium, High, Critical).
  - Assignment filter: "All Tickets", "Assigned to Me", "Unassigned".
- **Tickets Table (Desktop)**:
  - Columns: Ticket No, Created Date, Summary, Category, Req Priority, IT Priority, Status, Owner, Action.
  - Sortable headers (Date, Priority, Status).
- **Responsive Card View (Mobile / Tablet)**:
  - Collapses tabular data into responsive cards showing badge chips and summary, tapping opens detail.
- **Pagination Control**: Page size selector, current page range, Next/Previous buttons.
- **Empty / No Results State**: Meaningful icon and message when search yields no tickets.

### 2.5 IT Staff Ticket Detail Screen (`/tickets/:id`)
- **Header Section**: Back button ("<- Back to Queue"), Ticket No, Category, Related System.
- **Status & Ownership Panel**:
  - Ticket Owner selector (dropdown of active IT Staff/Admin, plus "Claim" button if unassigned).
  - IT Priority selector (editable dropdown for IT Staff).
  - Status transition dropdown (only displays transitions permitted by BR-07 from the current status).
- **Ticket Content**:
  - Read-only Summary, Description, Requested Priority, Created Date, Requester info.
- **Tabs / Sections**:
  - **Public Comments Tab**: List of past comments with author, role badge, timestamp. Add Comment form with character count.
  - **Internal Notes Tab** (Hidden completely from Requesters): Styled distinctly with a warm amber/yellow background or lock icon to signify private internal visibility.
  - **Attachments Tab**: List of uploaded files from Lab 2.
- **Requester Resolution Banner**: If Requester flagged "Problem Appears Resolved", shows banner notice to IT Staff to verify and resolve.

### 2.6 Administrator User Management Screen (`/admin/users`)
- **Header**: "User Management", Search input, Role filter dropdown, "+ Create User" button.
- **Users Table**:
  - Columns: Full Name, Email, Role badge, Status (Active/Inactive toggle or badge), Actions (Edit).
- **Create / Edit User Modal / Drawer**:
  - Full Name input (required).
  - Email Address input (required, validated, unique).
  - Role selection (single select: Requester, IT Staff, Administrator).
  - Active toggle (Yes / No switch).
  - Initial Password input (with option to set a new initial password that requires change upon login).
  - Deactivate User button (disabled with tooltip if editing self or last admin).
  - Save User and Cancel buttons.

---

## 3. Responsive & Accessibility Matrix
- **Desktop (>= 1024px)**: Full multi-column tables, side drawer or modal editors, rich tooltips.
- **Tablet (768px - 1023px)**: Compact table padding, horizontal scroll safety, touch-friendly dropdowns.
- **Mobile (< 768px)**: Stacked form groups, card-based list layout for ticket queue and user list, sticky bottom actions.
- **Accessibility**: Keyboard navigable (`Tab` order), `aria-labels` on icon buttons, high-contrast text on colored badges.
