# Lab 2 Zen Green Theme & UI Specification

## 1. Design System & Theme Specification

### 1.1 Color Tokens
The TokTickIT interface adheres strictly to the **Zen Green** color palette:

| Token / Role | Hex Code | Usage / Context |
| :--- | :--- | :--- |
| **Primary Green** | `#006B3C` | Application header, primary CTA buttons (`+ Create Ticket`, `Continue`), strong emphasis |
| **Secondary Green** | `#0B7A46` | Active navigation tabs, focus borders, interactive links, hover states |
| **Pale Green** | `#EAF6EF` | Selected dropdown items, success notification banners, quiet section highlights |
| **Page Background** | `#F5F7F6` | Quiet off-white background across all application screens |
| **Surface / Card** | `#FFFFFF` | Form cards, table containers, modal dialogs with 1px border `#E2E8F0` |
| **Text Primary** | `#1A202C` | High contrast dark charcoal-green text for optimal readability |
| **Text Muted** | `#4A5568` | Secondary labels, timestamps, metadata text |
| **Editable Field** | `#FFFFFF` | White background with 1px neutral border `#CBD5E0` |
| **Read-Only Field** | `#F0F4F1` | Soft gray-green shading clearly distinguishing non-editable inputs |
| **Error Token** | `#C53030` | Dark red border `#FC8181`, text, and validation messages below fields |
| **Warning Token** | `#DD6B20` | Amber callouts/badges for pending states |
| **Success Token** | `#2F855A` | Green confirmation text & badges |

---

## 2. Component Guidelines & Form Behavior

1. **Field Labels & Asterisks**:
   - Labels are positioned above input controls in font-weight 600.
   - Required fields display a red asterisk (`*` in `#E53E3E`). The asterisk supplements, but does not replace, inline validation error text.

2. **Inputs & Controls**:
   - Single-line inputs (`<input>`, `<select>`) have a consistent height of `40px` and border-radius `6px`.
   - Multiline Description (`<textarea>`) has a minimum height of `120px` and is vertically resizable only.

3. **Button Hierarchy & States**:
   - **Primary Button**: Background `#006B3C`, text white, hover `#0B7A46`.
   - **Secondary Button**: White background, 1px border `#CBD5E0`, text `#2D3748`, hover `#F7FAFC`.
   - **Destructive Button**: Background `#E53E3E`, text white, hover `#C53030`.
   - **Busy/Loading State**: Displays an inline spinning indicator, opacity `0.7`, `pointer-events: none`, disabled state.

4. **Badges (Priority & Status)**:
   - `NEW`: Background `#EBF8FF`, text `#2B6CB0` (Soft Blue)
   - `IN_PROGRESS`: Background `#EAF6EF`, text `#0B7A46` (Zen Green)
   - `RESOLVED`: Background `#EDF2F7`, text `#4A5568` (Muted Gray)
   - `HIGH / URGENT Priority`: Background `#FFF5F5`, text `#C53030` (Soft Red)
   - `MEDIUM Priority`: Background `#FEFCBF`, text `#744210` (Soft Amber)
   - `LOW Priority`: Background `#F0FFF4`, text `#22543D` (Soft Mint)

---

## 3. Screen Layout Specifications

### 3.1 Development Requester Selection Screen
- Centered modal/card layout (`max-width: 520px`) on quiet background `#F5F7F6`.
- Includes TokTickIT branding, title "Select Development Requester", dropdown listing active requesters, an informational alert ("Testing context only for Lab 2"), and a primary `Continue` button.

### 3.2 Create Ticket Screen Layout
- Desktop: Form width `max-width: 896px`.
- Top Section: System-generated info (Requester Name, Date) in soft read-only boxes.
- Middle Section: Category & Related System grouped in two columns (`grid-template-columns: 1fr 1fr`). Requested Priority selector.
- Main Fields: Summary (full width) and Description (`min-height: 120px`).
- Bottom Section: Attachment Upload Zone (drag & drop or click to select) listing selected files with size/type indicators. Submit & Cancel actions at bottom right.

### 3.3 My Tickets Screen Layout
- Top Action Bar: Search input (left), Filter dropdowns (Category, Priority, Status), Clear Filters button, and `+ Create Ticket` primary CTA (right).
- Desktop View: Data table with columns: `Ticket No.`, `Created Date`, `Summary`, `Category`, `Requested Priority`, `IT Priority`, `Status`, `Last Updated`.
- Mobile View (<768px): Responsive card stack where each card displays Ticket No., Status Badge, Summary, Category, and Date.
- Pagination: Bottom bar with page info ("Showing 1 to 10 of 42 tickets"), Previous/Next controls, and page numbers.

### 3.4 Ticket Detail Screen Layout
- Read-only summary header displaying Ticket No., Requester, Status Badge, Requested Priority, IT Priority, Category, and System.
- Attachments Section: Lists active attachments with Download action. Upload new attachment button (if < 5 active). Soft-remove button per file opening a modal for removal reason.

---

## 4. Responsive Breakpoints

| Viewport | Range | Layout Behavior |
| :--- | :--- | :--- |
| **Desktop** | `>= 992px` | Multi-column form layout, full data table view, centered max-width content |
| **Tablet** | `768px - 991px` | Two-column grid form, scrollable data table, touch-friendly targets |
| **Mobile** | `< 768px` | Single-column stacked fields, card-based ticket list, full-width buttons |

---

## 5. Visual Inspection Screenshots Matrix

| Screen | Viewport | Expected Artifact File Path |
| :--- | :--- | :--- |
| **Create Ticket (Initial)** | Desktop | `artifacts/lab-02/screenshots/create-ticket/desktop-initial.png` |
| **Create Ticket (Validation Error)** | Desktop | `artifacts/lab-02/screenshots/create-ticket/desktop-validation.png` |
| **Create Ticket (Mobile)** | Mobile | `artifacts/lab-02/screenshots/create-ticket/mobile-view.png` |
| **My Tickets (Table)** | Desktop | `artifacts/lab-02/screenshots/my-tickets/desktop-table.png` |
| **My Tickets (Mobile Cards)** | Mobile | `artifacts/lab-02/screenshots/my-tickets/mobile-cards.png` |
| **Ticket Detail & Attachments** | Desktop | `artifacts/lab-02/screenshots/ticket-detail/desktop-detail.png` |
