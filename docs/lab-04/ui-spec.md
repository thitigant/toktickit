# Lab 4 UI Specification — Zen Green Design & Interaction Specification

## 1. Design Language: Zen Green Tokens

Lab 4 maintains and completes the **Zen Green** design language:

| Token | CSS Variable / Hex | Usage |
|---|---|---|
| Primary Green | `--zen-primary: #0f5132;` | Primary buttons, active navbar links, table headers |
| Accent Green | `--zen-accent: #198754;` | Action badges, confirmed statuses, metric highlights |
| Soft Green Bg | `--zen-bg-soft: #f4fbf7;` | Dashboard card backgrounds, highlight rows |
| Alert Green Bg | `--zen-bg-alert: #d1e7dd;` | Success banners, resolved badge background |
| Surface Light | `--zen-surface: #ffffff;` | Cards, modals, containers |
| Neutral Dark | `--zen-text-dark: #212529;` | Main body text, headings |
| Neutral Muted | `--zen-text-muted: #6c757d;` | Secondary labels, dates, placeholder texts |
| Border Color | `--zen-border: #dee2e6;` | Dividers, card borders, table borders |
| Focus Ring | `--zen-focus: #19875466;` | 3px semi-transparent outline on keyboard focus |

### Status Badges Style Guide
- `NEW`: Sky Blue (`bg: #cff4fc; text: #055160; border: #b6effb;`)
- `OPEN`: Deep Blue (`bg: #cfe2ff; text: #084298; border: #b6d4fe;`)
- `IN_PROGRESS`: Amber Yellow (`bg: #fff3cd; text: #664d03; border: #ffecb5;`)
- `WAITING_FOR_REQUESTER`: Purple / Violet (`bg: #e2d9f3; text: #432874; border: #d2c4ec;`)
- `RESOLVED`: Zen Green (`bg: #d1e7dd; text: #0f5132; border: #badbcc;`)
- `CLOSED`: Neutral Gray (`bg: #e9ecef; text: #495057; border: #ced4da;`)
- `REOPENED`: Orange (`bg: #ffe5d0; text: #843200; border: #fed1aa;`)
- `CANCELLED`: Dark Charcoal (`bg: #d3d3d4; text: #1b1e21; border: #bcbebf;`)

---

## 2. Navigation Shell Updates

The top navigation header automatically displays role-appropriate links based on the authenticated session:

- **Requester Nav:**
  - Logo (`TokTickIT`)
  - `Dashboard` (active route / default landing)
  - `My Tickets`
  - `Create Ticket`
  - User Profile dropdown (Name, Role badge, Logout)

- **IT Staff Nav:**
  - Logo (`TokTickIT`)
  - `Dashboard` (active route / default landing)
  - `Ticket Queue`
  - `Create Ticket`
  - User Profile dropdown (Name, Role badge, Logout)

- **Administrator Nav:**
  - Logo (`TokTickIT`)
  - `Dashboard` (active route / default landing)
  - `Ticket Queue`
  - `User Management`
  - `Create Ticket`
  - User Profile dropdown (Name, Role badge, Logout)

---

## 3. IT Staff Dashboard UI (`/dashboard`)

### 3.1. Header & Welcome Area
- Displays "Welcome back, {User Name}!" with subtitle "Here's what's happening with your queue today."
- Right-aligned **Refresh** button with sync icon for on-demand metrics reloading.

### 3.2. Operational Metric Cards Grid
Displays 5 core operational counters in an accessible responsive grid:
1. **New**: Total unhandled incoming tickets (`status = NEW`)
2. **Open**: Total acknowledged tickets (`status = OPEN`)
3. **In Progress**: Active work in progress (`status = IN_PROGRESS`)
4. **Waiting for Requester**: Tickets pending user feedback (`status = WAITING_FOR_REQUESTER`)
5. **My Assigned**: Tickets assigned specifically to the logged-in staff member (`assignedStaffId = currentUserId`)

Each card features:
- Clear bold title label.
- Large numeric value (32px font).
- Clickable drill-down linking directly to `/staff/queue` pre-filtered by the clicked metric (e.g. clicking "My Assigned" navigates to `/staff/queue?assignedTo=me`).

### 3.3. Main Content Split View
- **Left Column (Recent Tickets):**
  - Table or list of 5 most recently active tickets.
  - Columns: Ticket ID (badge), Title, Status badge, Updated timestamp.
  - One-click row click navigates to Ticket Detail.
  - "View all" link navigates to full Queue.
- **Right Column (Quick Actions & Shortcuts):**
  - Card with quick action buttons:
    - `+ Create Ticket`
    - `🔍 Search Tickets`
    - `📋 My Queue`
  - Administrator extension: displays concise User Account breakdown (Total Users, Active Staff, Active Requesters).

---

## 4. Requester Dashboard UI (`/dashboard`)

### 4.1. Welcome & Metric Cards Grid
- Header: "Welcome, {User Name}!" with subtitle "Here's the latest on your requests."
- 4 Requester-specific metric cards:
  1. **My Open Tickets**: Total unresolved tickets owned by user.
  2. **In Progress**: Tickets currently being actively worked on by IT.
  3. **Resolved**: Tickets marked resolved and awaiting closure.
  4. **Closed**: Successfully archived past tickets.
- Each card has a "View all" drill-down button navigating to `My Tickets` filtered by status.

### 4.2. Recent Tickets & Quick Actions
- Recent tickets owned by this requester showing Ticket Number, Subject, Status badge, and Updated date.
- Quick action button to immediately open **Create Ticket** form or **View My Tickets**.

---

## 5. Actions Taken on Ticket Detail UI

### 5.1. Location & Layout
- Placed on the Ticket Detail screen as a dedicated tab or prominent card section below Ticket Details and above Comments.
- Section Header: **Actions Taken** with badge indicating total action count (e.g., `Actions Taken (3)`).
- For IT Staff / Admin: Includes primary `+ Add Action Taken` button.

### 5.2. Actions Taken List View
- Renders as an accessible, responsive data table or card list.
- **Displayed Columns:**
  1. **Date / Time**: Formatted local timestamp (e.g. `Oct 29, 2026 2:30 PM`).
  2. **Description**: Text summary of the intervention.
  3. **Result**: Outcome of the action taken.
  4. **Performed By**: Staff member name (auto-populated).
  5. **Follow-Up**:
     - If `false`: Subtle gray badge `None`.
     - If `true`: Amber warning badge `Required` + text of `followUpNote`.
  6. **Attachments / Notes**: Reference note for related files or screenshots.
  7. **Actions (Staff/Admin only)**: `Edit` button to trigger inline or modal edit mode.

### 5.3. Create / Edit Action Taken Form
- Fields:
  - **Action Date/Time**: Pre-filled with current date/time (editable via datetime picker).
  - **Action Description**: Required textarea, placeholder: "Describe what work was performed...".
  - **Result**: Required textarea, placeholder: "Describe the outcome or diagnostic result...".
  - **Follow-Up Required**: Checkbox toggle ("Requires follow-up check").
  - **Follow-Up Note**: Text input; dynamically displays validation requirement if "Follow-Up Required" is checked.
  - **Attachment Notes**: Optional text input, placeholder: "e.g., log file on server share or screenshot name".
- Actions:
  - `Cancel` button (clears form / closes modal).
  - `Save Action Taken` primary green button (disables during submission to prevent double-submit).

### 5.4. Role-Based Visibility
- **Requester**: Views the Actions Taken list in full detail (Read-Only). No `Add` or `Edit` buttons are visible.
- **IT Staff & Administrator**: Full view, create, and edit privileges.

---

## 6. Ticket Workflow & Status Transition Controls

### 6.1. Controls on Ticket Detail
- IT Staff and Administrators see an updated **Status Transition Selector** or Action Dropdown.
- Only permitted transitions based on current status (as defined in `specification.md`) are selectable.
- When an invalid transition is attempted or another user has modified the ticket concurrently, a clean Zen Green error banner or toast surfaces: *"Ticket has been updated by another user. Please refresh and try again."* (HTTP 409 Conflict handling).

### 6.2. Requester Advisory Feedback
- Requesters on their own active tickets see a helpful advisory prompt:
  *"Is your issue resolved? Let our IT team know."*
- Clicking **Problem Appears Resolved** sends an advisory note for IT review without auto-closing the ticket.

---

## 7. Responsive & Accessibility Design Rules

### 7.1. Responsive Breakpoints
- **Desktop (>= 1024px):** Multi-column dashboard grid (5 columns for Staff, 4 for Requester), 2-column detail view, full data tables.
- **Tablet (768px - 1023px):** 2-to-3 column dashboard card grid, responsive scrolling tables with preserved headers.
- **Mobile (< 768px):** Single-column stacked cards, card-based list layout for Actions Taken, full-width buttons, zero horizontal page overflow.

### 7.2. Accessibility Checklist
- All inputs possess explicit `<label>` elements with corresponding `htmlFor` / `id`.
- Color contrast ratio >= 4.5:1 for all text against backgrounds.
- Focus outlines (`outline: 2px solid #198754; outline-offset: 2px;`) visible on keyboard tab navigation.
- Status badges use text and distinct shapes/borders, not color alone, to indicate state.
