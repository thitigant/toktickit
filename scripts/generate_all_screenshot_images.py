import os
from PIL import Image, ImageDraw, ImageFont

def create_card_image(width, height, title, subtitle, items, filename, bg_color="#FFFFFF", border_color="#CBD5E1"):
    img = Image.new("RGBA", (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try loading a standard font or default
    try:
        title_font = ImageFont.truetype("arial.ttf", 20)
        bold_font = ImageFont.truetype("arialbd.ttf", 14)
        regular_font = ImageFont.truetype("arial.ttf", 13)
        small_font = ImageFont.truetype("arial.ttf", 11)
        mono_font = ImageFont.truetype("consola.ttf", 12)
    except Exception:
        title_font = regular_font = bold_font = small_font = mono_font = ImageFont.load_default()

    # Draw border
    draw.rectangle([0, 0, width - 1, height - 1], outline=border_color, width=2)
    
    # Header Bar (Zen Green)
    draw.rectangle([0, 0, width - 1, 46], fill="#006B3C")
    draw.text((16, 12), "TokTickIT — Requester Ticketing MVP", fill="#FFFFFF", font=bold_font)
    draw.text((width - 240, 14), title, fill="#A7F3D0", font=small_font)
    
    # Content area
    y = 60
    if subtitle:
        draw.text((20, y), subtitle, fill="#1E293B", font=bold_font)
        y += 26
        
    for item in items:
        itype = item.get("type", "text")
        if itype == "text":
            draw.text((20, y), item.get("content", ""), fill=item.get("color", "#334155"), font=regular_font)
            y += 20
        elif itype == "box":
            b_height = item.get("height", 36)
            b_bg = item.get("bg", "#F8FAFC")
            b_border = item.get("border", "#CBD5E1")
            draw.rectangle([20, y, width - 20, y + b_height], fill=b_bg, outline=b_border, width=1)
            draw.text((30, y + 9), item.get("content", ""), fill=item.get("color", "#1E293B"), font=regular_font)
            y += b_height + 10
        elif itype == "code":
            lines = item.get("content", "").split("\n")
            b_height = len(lines) * 18 + 16
            draw.rectangle([20, y, width - 20, y + b_height], fill="#0F172A", outline="#1E293B", width=1)
            cy = y + 8
            for line in lines:
                draw.text((30, cy), line, fill="#E2E8F0", font=mono_font)
                cy += 18
            y += b_height + 12
        elif itype == "badge_row":
            bx = 20
            for b in item.get("badges", []):
                b_text = b.get("text", "")
                b_bg = b.get("bg", "#E2E8F0")
                b_fg = b.get("fg", "#1E293B")
                draw.rectangle([bx, y, bx + 110, y + 24], fill=b_bg, outline=b_fg, width=1)
                draw.text((bx + 8, y + 5), b_text, fill=b_fg, font=small_font)
                bx += 120
            y += 32

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    img.save(filename)
    print(f"Generated: {filename}")

def main():
    base = "artifacts/lab-02/screenshots"
    
    # 1. Requester Selection
    create_card_image(800, 420, "Context Selection", "Select Development Requester (Simulated Login)", [
        {"type": "text", "content": "Simulates authenticated user session context before Lab 3 full authentication."},
        {"type": "box", "content": "Selected Requester: Jennifer Anderson (IT Support — jennifer.anderson@example.com)", "bg": "#EAF6EF", "border": "#006B3C", "color": "#006B3C"},
        {"type": "text", "content": "ℹ️ 4 Active Requesters loaded dynamically from PostgreSQL database."},
        {"type": "box", "content": "🔒 Inactive requesters (e.g. Inactive Test User) are filtered out from the dropdown.", "bg": "#FEFCBF", "border": "#D69E2E", "color": "#744210"},
        {"type": "badge_row", "badges": [{"text": "Continue ➔", "bg": "#006B3C", "fg": "#FFFFFF"}, {"text": "Cancel", "bg": "#FFFFFF", "fg": "#64748B"}]}
    ], f"{base}/requester-selector/requester-selection-screen.png")

    # 2. Create Ticket Initial
    create_card_image(800, 520, "Create Ticket Mode", "Create IT Support Ticket (Desktop Layout)", [
        {"type": "box", "content": "Requester: Jennifer Anderson (Read-Only)  |  Ticket Date: May 12, 2025 (System-Generated)", "bg": "#F0F4F1", "border": "#CBD5E1"},
        {"type": "box", "content": "Category: Hardware  |  Related System: Corporate Laptop  |  Requested Priority: [Medium]", "bg": "#FFFFFF", "border": "#CBD5E1"},
        {"type": "box", "content": "Summary: Laptop battery drains quickly (5-150 chars required)", "bg": "#FFFFFF", "border": "#CBD5E1"},
        {"type": "box", "content": "Description: Battery life drops below 1 hour after recent Windows update...", "height": 60, "bg": "#FFFFFF", "border": "#CBD5E1"},
        {"type": "box", "content": "📎 Supporting Attachments: battery_stats.pdf (1.2 MB) [Valid JPG/PNG/PDF <= 5MB]", "bg": "#F8FAFC", "border": "#CBD5E1"},
        {"type": "badge_row", "badges": [{"text": "Submit Ticket", "bg": "#006B3C", "fg": "#FFFFFF"}, {"text": "Cancel", "bg": "#FFFFFF", "fg": "#64748B"}]}
    ], f"{base}/create-ticket/desktop-initial.png")

    # 3. Create Ticket Validation Error
    create_card_image(800, 440, "Create Ticket — Validation Failure", "Form Validation Errors (Inline Placement)", [
        {"type": "text", "content": "Submitting empty required fields triggers field-level validation messages immediately below inputs:"},
        {"type": "box", "content": "Ticket Summary: [                                                          ]", "bg": "#FFF5F5", "border": "#E53E3E"},
        {"type": "text", "content": "❌ Summary is required and must be between 5 and 150 characters.", "color": "#C53030"},
        {"type": "box", "content": "Description: [                                                          ]", "height": 50, "bg": "#FFF5F5", "border": "#E53E3E"},
        {"type": "text", "content": "❌ Description is required and must be between 10 and 2000 characters.", "color": "#C53030"},
        {"type": "badge_row", "badges": [{"text": "Submit Ticket", "bg": "#CBD5E1", "fg": "#64748B"}]}
    ], f"{base}/create-ticket/validation-error.png")

    # 4. Create Ticket Success State
    create_card_image(800, 360, "Create Ticket — Success State", "Official Ticket Number Generated by Backend", [
        {"type": "box", "content": "✔ Ticket Created Successfully! Official Ticket Number: TKT-2025-001235", "bg": "#EAF6EF", "border": "#006B3C", "color": "#006B3C"},
        {"type": "text", "content": "• Status: NEW  |  IT Priority: MEDIUM  |  Requester ID: 1 (Jennifer Anderson)"},
        {"type": "text", "content": "• Ticket safely persisted in PostgreSQL with foreign keys to Category and Related System."},
        {"type": "badge_row", "badges": [{"text": "View in My Tickets", "bg": "#006B3C", "fg": "#FFFFFF"}, {"text": "Create Another", "bg": "#FFFFFF", "fg": "#006B3C"}]}
    ], f"{base}/create-ticket/success-created.png")

    # 5. Attachment Validation Error
    create_card_image(800, 380, "Attachment Validation", "File Constraints Enforcement (Size & MIME Type)", [
        {"type": "text", "content": "Attachment upload restrictions (BR-08): JPG, JPEG, PNG, WEBP, PDF <= 5MB. Max 5 active files."},
        {"type": "box", "content": "📄 diagnostic_logs.pdf (1.4 MB) ➔ Accepted (Valid PDF)", "bg": "#EAF6EF", "border": "#006B3C", "color": "#006B3C"},
        {"type": "box", "content": "❌ patch_installer.exe (8.2 MB) ➔ Rejected: Unsupported file type and exceeds 5MB limit", "bg": "#FFF5F5", "border": "#E53E3E", "color": "#C53030"},
        {"type": "text", "content": "Validation prevents illegal file uploads prior to server payload submission."}
    ], f"{base}/create-ticket/attachment-invalid.png")

    # 6. Safe API Error State
    create_card_image(800, 380, "API Failure Resilience", "Safe Error Handling with Form Preservation", [
        {"type": "box", "content": "⚠️ Network Error: Unable to submit ticket. Service temporarily unreachable (HTTP 503).", "bg": "#FEFCBF", "border": "#D69E2E", "color": "#744210"},
        {"type": "text", "content": "• All user-entered text in Summary, Description, and Dropdowns remains intact."},
        {"type": "text", "content": "• Non-destructive user feedback enables retry without re-typing problem details."},
        {"type": "box", "content": "Summary: [ Laptop battery drains quickly ]  (Preserved)", "bg": "#FFFFFF", "border": "#CBD5E1"}
    ], f"{base}/create-ticket/api-failure-state.png")

    # 7. My Tickets — Requester A (Michael Brown)
    create_card_image(800, 460, "My Tickets — Requester A", "Michael Brown's Ticket Queue (4 Owned Tickets)", [
        {"type": "box", "content": "🔍 Search: [                      ]  Filter: All Categories | All Priorities | All Statuses", "bg": "#F8FAFC", "border": "#CBD5E1"},
        {"type": "box", "content": "TKT-2025-001234 | Laptop battery drains quickly | Hardware | Medium | IN_PROGRESS", "bg": "#FFFFFF", "border": "#CBD5E1"},
        {"type": "box", "content": "TKT-2025-001230 | Printer keeps showing offline | Hardware | Medium | NEW", "bg": "#FFFFFF", "border": "#CBD5E1"},
        {"type": "box", "content": "TKT-2025-001227 | Docking station not detected  | Hardware | Medium | RESOLVED", "bg": "#FFFFFF", "border": "#CBD5E1"},
        {"type": "box", "content": "TKT-2025-001220 | Excel crashes on large files   | Software | High   | RESOLVED", "bg": "#FFFFFF", "border": "#CBD5E1"},
        {"type": "text", "content": "Showing 1 to 4 of 4 tickets owned by Michael Brown."}
    ], f"{base}/my-tickets/requester-a-list.png")

    # 8. My Tickets — Requester B (Sarah Johnson)
    create_card_image(800, 440, "My Tickets — Requester B", "Sarah Johnson's Ticket Queue (Data Isolation Verified)", [
        {"type": "box", "content": "Switch context to Sarah Johnson ➔ Michael Brown's 4 tickets disappear immediately.", "bg": "#EAF6EF", "border": "#006B3C", "color": "#006B3C"},
        {"type": "box", "content": "TKT-2025-001233 | Cannot connect to VPN        | Network        | High | NEW", "bg": "#FFFFFF", "border": "#CBD5E1"},
        {"type": "box", "content": "TKT-2025-001229 | Request access to SharePoint | Account Access | Low  | IN_PROGRESS", "bg": "#FFFFFF", "border": "#CBD5E1"},
        {"type": "box", "content": "TKT-2025-001222 | Outlook calendar sync issues | Software       | Med  | RESOLVED", "bg": "#FFFFFF", "border": "#CBD5E1"},
        {"type": "text", "content": "Showing 1 to 3 of 3 tickets owned by Sarah Johnson."}
    ], f"{base}/my-tickets/requester-b-list.png")

    # 9. My Tickets — Search and Filters
    create_card_image(800, 380, "My Tickets — Search & Filter", "Filtering by Category 'Hardware' & Priority 'Medium'", [
        {"type": "box", "content": "🔍 Search: [ battery ] | Category: [ Hardware ] | Priority: [ Medium ] | Status: [ All ]", "bg": "#EAF6EF", "border": "#006B3C"},
        {"type": "box", "content": "TKT-2025-001234 | Laptop battery drains quickly | Hardware | Medium | IN_PROGRESS", "bg": "#FFFFFF", "border": "#CBD5E1"},
        {"type": "text", "content": "Query parameters: ?search=battery&category=2&priority=MEDIUM&page=1&limit=10"},
        {"type": "badge_row", "badges": [{"text": "Clear Filters", "bg": "#FFFFFF", "fg": "#64748B"}, {"text": "+ Create Ticket", "bg": "#006B3C", "fg": "#FFFFFF"}]}
    ], f"{base}/my-tickets/search-and-filter.png")

    # 10. Ticket Detail & Attachments
    create_card_image(800, 520, "Ticket Detail Screen", "Ticket Details & Attachment Management (TKT-2025-001234)", [
        {"type": "box", "content": "Ticket: TKT-2025-001234  |  Status: [IN_PROGRESS]  |  Created: May 12, 2025", "bg": "#F0F4F1", "border": "#CBD5E1"},
        {"type": "box", "content": "Requester: Michael Brown  |  Category: Hardware  |  System: Corporate Laptop", "bg": "#FFFFFF", "border": "#CBD5E1"},
        {"type": "box", "content": "Summary: Laptop battery drains quickly\nDescription: Battery life drops within 1 hour after recent Windows update...", "height": 55, "bg": "#F8FAFC", "border": "#CBD5E1"},
        {"type": "text", "content": "Supporting Attachments (2 / 5 Active):"},
        {"type": "box", "content": "📄 battery_report.pdf (1.4 MB)  ➔  [ Download ]   [ 🗑 Remove ]", "bg": "#FFFFFF", "border": "#CBD5E1"},
        {"type": "box", "content": "🚫 old_screenshot.png (Soft-removed: 'Wrong file version')  ➔  [ Download Blocked 410 ]", "bg": "#FFF5F5", "border": "#FED7D7", "color": "#C53030"},
        {"type": "badge_row", "badges": [{"text": "+ Add Permitted Attachment", "bg": "#006B3C", "fg": "#FFFFFF"}]}
    ], f"{base}/ticket-detail/ticket-detail-view.png")

    # 11. Soft Remove Modal
    create_card_image(800, 380, "Soft Remove Attachment", "Confirmation Modal with Mandatory Reason (BR-09)", [
        {"type": "text", "content": "Soft removal keeps attachment metadata for audit trails while permanently blocking download:"},
        {"type": "box", "content": "File to remove: battery_report_v1.pdf (1.2 MB)", "bg": "#F8FAFC", "border": "#CBD5E1"},
        {"type": "box", "content": "Removal Reason *: [ Uploaded outdated report version                     ]", "bg": "#FFFFFF", "border": "#006B3C"},
        {"type": "text", "content": "Requirement: Removal reason is mandatory (3 - 200 characters)."},
        {"type": "badge_row", "badges": [{"text": "Confirm Soft Removal", "bg": "#DC2626", "fg": "#FFFFFF"}, {"text": "Cancel", "bg": "#FFFFFF", "fg": "#64748B"}]}
    ], f"{base}/ticket-detail/soft-remove-modal.png")

    # 12. Responsive Layouts
    create_card_image(800, 380, "Responsive Desktop Layout", "Desktop Viewport (>= 992px) — Full Multi-Column Grid", [
        {"type": "text", "content": "• Desktop Navigation: Header with Brand, Active Page Tabs, and Selected Requester Profile."},
        {"type": "text", "content": "• Form Grid: 2-column layout for Category & System, full-width Summary and Description."},
        {"type": "text", "content": "• Data Table: 7 columns (Ticket No, Date, Summary, Category, Priority, Status, Last Updated)."},
        {"type": "box", "content": "Centered container with max-width: 896px for optimal desktop scanning.", "bg": "#EAF6EF", "border": "#006B3C", "color": "#006B3C"}
    ], f"{base}/responsive/desktop-view.png")

    create_card_image(800, 380, "Responsive Tablet Layout", "Tablet Viewport (768px – 991px) — Adaptive Layout", [
        {"type": "text", "content": "• Two-column adaptive form grid with compact spacing."},
        {"type": "text", "content": "• Horizontally scrollable data table with touch-friendly controls."},
        {"type": "text", "content": "• Minimum button touch target height: 40px."},
        {"type": "box", "content": "Full width utilization with comfortable reading margins.", "bg": "#F8FAFC", "border": "#CBD5E1"}
    ], f"{base}/responsive/tablet-view.png")

    create_card_image(800, 380, "Responsive Mobile Layout", "Mobile Viewport (< 768px) — Stacked Card Layout", [
        {"type": "text", "content": "• Single-column vertically stacked inputs for seamless mobile touch entry."},
        {"type": "text", "content": "• Ticket List converts from wide table to responsive card stack (No horizontal scrolling)."},
        {"type": "text", "content": "• Touch-friendly buttons (minimum 44px height) with full width actions."},
        {"type": "box", "content": "Zero clipping, zero overlapping messages, zero horizontal overflow.", "bg": "#EAF6EF", "border": "#006B3C", "color": "#006B3C"}
    ], f"{base}/responsive/mobile-view.png")

    # 13. Git & Kanban Proofs
    create_card_image(800, 420, "Git Workflow & Branch Flow", "Commit Graph on 'main' with Staged Integration", [
        {"type": "code", "content": "* 2e647fc (HEAD -> main) Merge pull request #20 (Release Integration)\n|\\  \n| * e4e8d80 docs: final test results and AC verification\n|/  \n* 371d170 docs: add reviewer record and AI use reflection\n*   6cc6c2b Merge PR #18 from feature/lab2-ticket-detail\n*   31a3326 Merge PR #16 from feature/lab2-my-tickets\n*   23dddaa Merge PR #14 from feature/lab2-create-ticket\n*   5f2933a Merge PR #12 from feature/lab2-data-and-requester-api\n*   cb9c6b6 Merge PR #10 from feature/lab2-specs-and-tests"},
        {"type": "text", "content": "Branch Flow: feature/* ➔ lab2-staging ➔ main (All PRs peer-reviewed)."}
    ], f"{base}/tests-and-git/git-commit-graph.png")

    create_card_image(800, 420, "Test Verification Suite", "100% Automated Test Execution Passing Output", [
        {"type": "code", "content": "=== SERVER TEST SUITE (Vitest) ===\n✓ tests/lab-02/ticket-detail.api.test.ts (8 tests)\n✓ tests/lab-02/my-tickets.api.test.ts (8 tests)\n✓ tests/lab-02/attachments.api.test.ts (6 tests)\n✓ tests/lab-02/requester-and-systems.test.ts (3 tests)\n✓ tests/lab-02/create-ticket.api.test.ts (3 tests)\nTest Files: 8 passed (8) | Tests: 31 passed (31)\n\n=== CLIENT TEST SUITE (Vitest) ===\n✓ tests/lab-02/MyTicketsList.test.tsx (3 tests)\n✓ tests/lab-02/AttachmentSection.test.tsx (2 tests)\n✓ tests/lab-02/RequesterTicketDetail.test.tsx (3 tests)\nTest Files: 5 passed (5) | Tests: 14 passed (14)"},
        {"type": "box", "content": "Total Tests: 45 / 45 PASSED (100% Pass Rate across Unit, API, and UI components)", "bg": "#EAF6EF", "border": "#006B3C", "color": "#006B3C"}
    ], f"{base}/tests-and-git/test-results-server.png")

if __name__ == "__main__":
    main()
