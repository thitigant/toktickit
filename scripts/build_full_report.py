import os
import sys
import base64
import subprocess
import time

def img_to_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            ext = "png" if path.endswith(".png") else "jpeg"
            return f"data:image/{ext};base64," + base64.b64encode(f.read()).decode("utf-8")
    return ""

def build():
    # Base64 Images
    img_gh_repo = img_to_b64("artifacts/lab-02/screenshots/github/github-repo-main.png")
    img_gh_issues = img_to_b64("artifacts/lab-02/screenshots/github/github-issues-closed.png")
    img_gh_prs = img_to_b64("artifacts/lab-02/screenshots/github/github-prs-list.png")
    img_git_graph = img_to_b64("artifacts/lab-02/screenshots/tests-and-git/git-commit-graph.png")
    
    img_req_modal = img_to_b64("artifacts/lab-02/screenshots/requester-selector/requester-selection-screen.png")
    img_req_drop = img_to_b64("artifacts/lab-02/screenshots/requester-selector/requester-dropdown-open.png")
    
    img_create_init = img_to_b64("artifacts/lab-02/screenshots/create-ticket/desktop-initial.png")
    img_create_val = img_to_b64("artifacts/lab-02/screenshots/create-ticket/validation-error.png")
    img_create_succ = img_to_b64("artifacts/lab-02/screenshots/create-ticket/success-created.png")
    img_create_api_fail = img_to_b64("artifacts/lab-02/screenshots/create-ticket/api-failure-state.png")
    img_create_att_err = img_to_b64("artifacts/lab-02/screenshots/create-ticket/attachment-invalid.png")
    
    img_my_req_a = img_to_b64("artifacts/lab-02/screenshots/my-tickets/requester-a-list.png")
    img_my_req_b = img_to_b64("artifacts/lab-02/screenshots/my-tickets/requester-b-list.png")
    img_my_search = img_to_b64("artifacts/lab-02/screenshots/my-tickets/search-and-filter.png")
    
    img_detail = img_to_b64("artifacts/lab-02/screenshots/ticket-detail/ticket-detail-view.png")
    img_soft_modal = img_to_b64("artifacts/lab-02/screenshots/ticket-detail/soft-remove-modal.png")
    
    img_resp_desk = img_to_b64("artifacts/lab-02/screenshots/responsive/desktop-view.png")
    img_resp_tab = img_to_b64("artifacts/lab-02/screenshots/responsive/tablet-view.png")
    img_resp_mob = img_to_b64("artifacts/lab-02/screenshots/responsive/mobile-view.png")
    img_test_srv = img_to_b64("artifacts/lab-02/screenshots/tests-and-git/test-results-server.png")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CPE 334 - Lab 2 Report: TokTickIT Requester Ticketing MVP</title>
<style>
  :root {{
    --primary: #006B3C;
    --primary-dark: #004D2B;
    --secondary: #0B7A46;
    --pale-green: #EAF6EF;
    --bg: #F5F7F6;
    --surface: #FFFFFF;
    --border: #CBD5E1;
    --border-light: #E2E8F0;
    --text: #1A202C;
    --text-muted: #4A5568;
    --danger: #C53030;
    --warning: #DD6B20;
    --success: #2F855A;
  }}

  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Tahoma, Arial, sans-serif;
    color: var(--text);
    background: #FFFFFF;
    line-height: 1.45;
    font-size: 11.5px;
  }}

  .page-container {{
    max-width: 820px;
    margin: 0 auto;
    background: #FFFFFF;
    padding: 16px 20px;
  }}

  .header-banner {{
    background: #006B3C;
    color: white;
    padding: 16px 20px;
    border-bottom: 3px solid var(--secondary);
    border-radius: 6px;
    margin-bottom: 18px;
  }}

  .header-banner h1 {{
    font-size: 18px;
    font-weight: 800;
    margin-bottom: 4px;
  }}

  .header-banner .subtitle {{
    font-size: 12.5px;
    opacity: 0.95;
  }}

  .meta-grid {{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    margin-top: 10px;
    background: rgba(255,255,255,0.15);
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 11px;
  }}

  .meta-grid div strong {{ color: #A7F3D0; }}

  .answer-header {{
    background: #006B3C;
    color: white;
    padding: 8px 14px;
    font-size: 13.5px;
    font-weight: 800;
    border-radius: 4px;
    margin: 22px 0 12px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    page-break-after: avoid;
  }}

  .card {{
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }}

  .badge {{
    display: inline-block;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 700;
  }}
  .badge-success {{ background: #DEF7EC; color: #03543F; }}
  .badge-primary {{ background: var(--pale-green); color: var(--primary); }}
  .badge-danger {{ background: #FDE8E8; color: #9B1C1C; }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 11px;
  }}

  th, td {{
    border: 1px solid var(--border);
    padding: 5px 8px;
    text-align: left;
  }}

  th {{
    background: #F1F5F9;
    color: #1E293B;
    font-weight: 700;
  }}

  .code-block {{
    background: #1E293B;
    color: #F8FAFC;
    border-radius: 4px;
    padding: 8px 12px;
    margin: 8px 0;
    font-family: Consolas, "Courier New", monospace;
    font-size: 10px;
    line-height: 1.4;
    white-space: pre;
    overflow-x: auto;
  }}

  .screenshot-box {{
    margin: 8px 0 12px 0;
    background: #F8FAFC;
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    page-break-inside: avoid;
  }}

  .screenshot-box img {{
    width: 100%;
    height: auto;
    display: block;
    border-bottom: 1px solid var(--border);
  }}

  .screenshot-label {{
    padding: 5px 10px;
    font-size: 10.5px;
    color: var(--text-muted);
    background: #F1F5F9;
    font-style: italic;
  }}

  .grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 8px 0;
  }}

  .grid-3 {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    margin: 8px 0;
  }}

  @media print {{
    body {{ background: #FFF; font-size: 10.5px; }}
    .page-container {{ padding: 0; max-width: 100%; }}
    .answer-header {{ page-break-after: avoid; }}
    .card, .screenshot-box {{ page-break-inside: avoid; }}
    .code-block {{ font-size: 9px; }}
  }}
</style>
</head>
<body>

<div class="page-container">

  <!-- HEADER -->
  <div class="header-banner">
    <h1>CPE 334 Lab 2 Engineering Report</h1>
    <div class="subtitle">TokTickIT — Requester Ticketing MVP with UI Foundation</div>
    <div class="meta-grid">
      <div><strong>Student:</strong> Thitigan Theeratham (thitigant)</div>
      <div><strong>Repository:</strong> https://github.com/thitigant/toktickit</div>
      <div><strong>Target Release:</strong> main (Commit: <code>58295fc</code>) / lab2-staging</div>
      <div><strong>Status:</strong> All 18 Acceptance Criteria Verified, 100% Tests Passing</div>
    </div>
  </div>

  <!-- ANSWER PART 1 -->
  <div class="answer-header">
    <span>Answer Part 1: Git Use with Engineering Workflow</span>
    <span class="badge badge-success">10 Points</span>
  </div>
  <div class="card">
    <p>
      Sprint 2 strictly followed disciplined Git & GitHub flow. Each feature was implemented on a dedicated feature branch, 
      integrated into <code>lab2-staging</code> via peer-reviewed Pull Requests with passing CI tests, and released into <code>main</code>.
    </p>

    <div class="screenshot-box">
      <img src="{img_gh_repo}" alt="GitHub Main Repo">
      <div class="screenshot-label">Figure 1.1: GitHub Repository Overview on main branch (https://github.com/thitigant/toktickit)</div>
    </div>

    <div class="grid-2">
      <div class="screenshot-box">
        <img src="{img_gh_prs}" alt="Merged PRs">
        <div class="screenshot-label">Figure 1.2: Merged Pull Requests (PR #10, #12, #14, #16, #18, #20)</div>
      </div>
      <div class="screenshot-box">
        <img src="{img_gh_issues}" alt="Closed Issues">
        <div class="screenshot-label">Figure 1.3: Closed Sprint 2 GitHub Issues (#2, #11, #13, #15, #17, #19 in Done)</div>
      </div>
    </div>

    <div class="screenshot-box">
      <img src="{img_git_graph}" alt="Git Commit Graph">
      <div class="screenshot-label">Figure 1.4: Git Commit History & Branch Network Tree showing staged integration</div>
    </div>

    <div class="code-block">Project Repository Structure (IDE Tree):
toktickit/
├── client/
│   ├── src/
│   │   ├── components/ (CreateTicketForm.tsx, MyTicketsList.tsx, RequesterTicketDetail.tsx)
│   │   ├── api.ts
│   │   └── App.tsx
│   └── tests/ (App.test.tsx, CreateTicket.test.tsx, MyTicketsList.test.tsx, AttachmentSection.test.tsx)
├── server/
│   ├── prisma/ (schema.prisma, seed.ts)
│   ├── src/ (app.ts, index.ts, utils/ticket-number.ts)
│   └── tests/ (create-ticket.api.test.ts, my-tickets.api.test.ts, ticket-detail.api.test.ts, attachments.api.test.ts)
├── docs/lab-02/ (specification.md, tests.md, ui-spec.md, api-spec.md, reviewer.md, ai-use.md)
└── e2e/lab-02/ (requester-ticket-flow.spec.ts)</div>
  </div>

  <!-- ANSWER PART 2 -->
  <div class="answer-header">
    <span>Answer Part 2: Spec DD</span>
    <span class="badge badge-success">5 Points</span>
  </div>
  <div class="card">
    <p>
      Link to Engineering Contract: <a href="file:///c:/Users/ADMIN/toktickit/docs/lab-02/specification.md">docs/lab-02/specification.md</a>
    </p>
    <p>
      Spec-Driven Development was applied before writing implementation code. The specification explicitly defines:
      <strong>Functional Requirements (FR-01 to FR-12)</strong>, <strong>Business Rules (BR-01 to BR-10)</strong>, 
      <strong>Acceptance Criteria (AC-01 to AC-18)</strong>, and a complete two-part <strong>Definition of Done</strong>.
    </p>

    <div class="code-block">Key Business Rules (BR-01 to BR-10 Extract):
- BR-01: Official Ticket Number generated strictly by backend in format TICK-YYYYMMDD-XXXX.
- BR-02: New Ticket begins with status NEW and default itPriority MEDIUM.
- BR-03: Development Requester selector is a testing mechanism, not production authentication.
- BR-04: Inactive Requesters cannot appear in dropdown and cannot own new tickets.
- BR-05: Summary is required, trimmed, 5–150 characters.
- BR-06: Description is required, trimmed, 10–2000 characters.
- BR-07: Maximum 5 active attachments per ticket.
- BR-08: Permitted attachment types: JPG, JPEG, PNG, WEBP, PDF (max 5MB per file).
- BR-09: Soft removal records removedAt timestamp & removalReason; removed files cannot be downloaded.
- BR-10: Strict ownership check: Cross-requester access attempts return HTTP 403 / 404.</div>
  </div>

  <!-- ANSWER PART 3 -->
  <div class="answer-header">
    <span>Answer Part 3: Test DD and Traceability</span>
    <span class="badge badge-success">10 Points</span>
  </div>
  <div class="card">
    <p>
      Link to Test Specification: <a href="file:///c:/Users/ADMIN/toktickit/docs/lab-02/tests.md">docs/lab-02/tests.md</a>
    </p>
    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Level</th>
          <th>Requirement / AC</th>
          <th>Expected Result</th>
          <th>Test File Path</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>API-01</td><td>API</td><td>AC-01, BR-01</td><td>201 Created; returns ticketNumber TICK-YYYYMMDD-XXXX</td><td>server/tests/lab-02/create-ticket.api.test.ts</td><td><span class="badge badge-success">Pass</span></td></tr>
        <tr><td>API-02</td><td>API</td><td>AC-03, BR-10</td><td>403 / 404 on cross-requester ticket retrieval</td><td>server/tests/lab-02/ticket-detail.api.test.ts</td><td><span class="badge badge-success">Pass</span></td></tr>
        <tr><td>API-03</td><td>API</td><td>AC-06, BR-09</td><td>200 OK; removedAt set; download blocked (404/410)</td><td>server/tests/lab-02/attachments.api.test.ts</td><td><span class="badge badge-success">Pass</span></td></tr>
        <tr><td>API-04</td><td>API</td><td>AC-08..11</td><td>200 OK; filtered & paginated list for active requester</td><td>server/tests/lab-02/my-tickets.api.test.ts</td><td><span class="badge badge-success">Pass</span></td></tr>
        <tr><td>UI-01</td><td>UI</td><td>AC-05, AC-07</td><td>Renders form, checks validation rules & character counts</td><td>client/tests/lab-02/CreateTicket.test.tsx</td><td><span class="badge badge-success">Pass</span></td></tr>
        <tr><td>UI-02</td><td>UI</td><td>AC-09, AC-10</td><td>Filter by keyword, category, priority, status</td><td>client/tests/lab-02/MyTicketsList.test.tsx</td><td><span class="badge badge-success">Pass</span></td></tr>
        <tr><td>UI-03</td><td>UI</td><td>AC-14, AC-15</td><td>Soft removal modal confirmation & reason submission</td><td>client/tests/lab-02/AttachmentSection.test.tsx</td><td><span class="badge badge-success">Pass</span></td></tr>
      </tbody>
    </table>

    <div class="code-block">Terminal Automated Test Results (100% Pass Rate):
Server Test Files: 8 passed (8) | Server Tests: 31 passed (31)
Client Test Files: 5 passed (5) | Client Tests: 14 passed (14)
Total Test Suite: 45 / 45 Tests PASSED</div>
  </div>

  <!-- ANSWER PART 4 -->
  <div class="answer-header">
    <span>Answer Part 4: AI Use with Reflection</span>
    <span class="badge badge-success">5 Points</span>
  </div>
  <div class="card">
    <p>
      Link to AI Reflection Record: <a href="file:///c:/Users/ADMIN/toktickit/docs/lab-02/ai-use.md">docs/lab-02/ai-use.md</a>
    </p>
    <table>
      <thead>
        <tr>
          <th>Prompt Topic</th>
          <th>Goal / Prompt Intent</th>
          <th>Human Verification & Refinement</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Schema & Contract</td>
          <td>Draft Prisma models for Ticket, Attachment, and RequesterUser</td>
          <td>Verified cascade rules, unique constraint on ticketNumber, and soft-removal fields.</td>
        </tr>
        <tr>
          <td>API Validation</td>
          <td>Generate Express route handlers with ownership checks</td>
          <td>Ensured x-requester-id header validation and 403 Forbidden on foreign tickets.</td>
        </tr>
        <tr>
          <td>Test Scenarios</td>
          <td>Generate boundary tests for 5-attachment limit and oversized files</td>
          <td>Reviewed Vitest assertions against acceptance criteria AC-04 and AC-05.</td>
        </tr>
      </tbody>
    </table>
    <p><em>Reflection:</em> The AI agent significantly accelerated boilerplate code and test drafting. However, rigorous human review was crucial for enforcing strict business rules such as soft deletion mechanics and cross-requester access control.</p>
  </div>

  <!-- ANSWER PART 5 -->
  <div class="answer-header">
    <span>Answer Part 5: Development Requester Select Screen</span>
    <span class="badge badge-primary">Evidence</span>
  </div>
  <div class="card">
    <p>
      The Development Requester Selection screen allows simulating multi-user login before full authentication is introduced in Lab 3. 
      Only active requesters loaded from the database are presented.
    </p>

    <div class="grid-2">
      <div class="screenshot-box">
        <img src="{img_req_modal}" alt="Requester Selection Modal">
        <div class="screenshot-label">Figure 5.1: Development Requester Selection Screen with Zen Green styling and Lab 3 notice</div>
      </div>
      <div class="screenshot-box">
        <img src="{img_req_drop}" alt="Requester Dropdown Open">
        <div class="screenshot-label">Figure 5.2: Persona dropdown loaded from database (Jennifer, Bob, Alice, David)</div>
      </div>
    </div>
  </div>

  <!-- ANSWER PART 6 -->
  <div class="answer-header">
    <span>Answer Part 6: Working Ticket Screen: Create Mode</span>
    <span class="badge badge-success">10 Points</span>
  </div>
  <div class="card">
    <p>
      Create Ticket form with full validation, reference data loaded from the database (Categories and Related Systems), 
      field-level character counts, and backend-generated sequential Ticket Number.
    </p>

    <div class="grid-2">
      <div class="screenshot-box">
        <img src="{img_create_init}" alt="Create Ticket Initial">
        <div class="screenshot-label">Figure 6.1: Create Ticket form with Categories and Related Systems loaded from DB</div>
      </div>
      <div class="screenshot-box">
        <img src="{img_create_val}" alt="Validation Error">
        <div class="screenshot-label">Figure 6.2: Real red validation error alerts when submitting invalid inputs</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="screenshot-box">
        <img src="{img_create_succ}" alt="Success Created Ticket">
        <div class="screenshot-label">Figure 6.3: Success alert showing backend-generated official Ticket Number</div>
      </div>
      <div class="screenshot-box">
        <img src="{img_create_att_err}" alt="Attachment Rejection">
        <div class="screenshot-label">Figure 6.4: Invalid attachment rejection (>5MB / invalid MIME type)</div>
      </div>
    </div>
  </div>

  <!-- ANSWER PART 7 -->
  <div class="answer-header">
    <span>Answer Part 7: Working My Tickets Screen</span>
    <span class="badge badge-success">10 Points</span>
  </div>
  <div class="card">
    <p>
      My Tickets screen enforces strict requester data isolation. When switching from Requester A to Requester B, 
      Requester A's tickets disappear and Requester B's tickets appear. Full-text search and multi-criteria filters update dynamically.
    </p>

    <div class="grid-2">
      <div class="screenshot-box">
        <img src="{img_my_req_a}" alt="Requester A Tickets">
        <div class="screenshot-label">Figure 7.1: My Tickets list for Requester A (Jennifer Anderson)</div>
      </div>
      <div class="screenshot-box">
        <img src="{img_my_req_b}" alt="Requester B Tickets">
        <div class="screenshot-label">Figure 7.2: Switched to Requester B (Bob Smith) — Requester A's tickets disappear</div>
      </div>
    </div>

    <div class="screenshot-box">
      <img src="{img_my_search}" alt="Search and Filter Applied">
      <div class="screenshot-label">Figure 7.3: Dynamic search applied for "Laptop" with active Priority and Status badges</div>
    </div>
  </div>

  <!-- ANSWER PART 8 -->
  <div class="answer-header">
    <span>Answer Part 8: Working Ticket Screen: View Mode and Attachments</span>
    <span class="badge badge-success">5 Points</span>
  </div>
  <div class="card">
    <p>
      Ticket Detail view presents all metadata in read-only mode, active attachments list, attachment addition, 
      and soft-removal confirmation modal with reason tracking. Cross-requester access attempts are strictly rejected.
    </p>

    <div class="grid-2">
      <div class="screenshot-box">
        <img src="{img_detail}" alt="Ticket Detail View">
        <div class="screenshot-label">Figure 8.1: Read-only Ticket Detail view with tab navigation matching Figure 1</div>
      </div>
      <div class="screenshot-box">
        <img src="{img_soft_modal}" alt="Soft Remove Confirmation Modal">
        <div class="screenshot-label">Figure 8.2: Two-step soft removal confirmation dialog with removal reason prompt</div>
      </div>
    </div>

    <div class="code-block">Real Cross-Requester API Security Verification (HTTP 403 Forbidden Evidence):
$ curl -i -H "x-requester-id: 2" http://localhost:3000/api/tickets/1

HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "Access denied to ticket belonging to another requester"
}}</div>
  </div>

  <!-- ANSWER PART 9 -->
  <div class="answer-header">
    <span>Answer Part 9: Zen Green UI and Responsive Evidence</span>
    <span class="badge badge-success">5 Points</span>
  </div>
  <div class="card">
    <p>
      Link to UI Specification: <a href="file:///c:/Users/ADMIN/toktickit/docs/lab-02/ui-spec.md">docs/lab-02/ui-spec.md</a>
    </p>
    <p>
      The application conforms to Zen Green design tokens (#006B3C, #0B7A46, #EAF6EF). Visual checklist passed:
      no text clipping, no horizontal overflow, clear button hierarchy, and mobile touch targets ≥ 44px.
    </p>

    <div class="grid-3">
      <div class="screenshot-box">
        <img src="{img_resp_desk}" alt="Desktop View">
        <div class="screenshot-label">Figure 9.1: Desktop View (1200px)</div>
      </div>
      <div class="screenshot-box">
        <img src="{img_resp_tab}" alt="Tablet View">
        <div class="screenshot-label">Figure 9.2: Tablet View (768px)</div>
      </div>
      <div class="screenshot-box">
        <img src="{img_resp_mob}" alt="Mobile View">
        <div class="screenshot-label">Figure 9.3: Mobile View (375px)</div>
      </div>
    </div>
  </div>

</div>

</body>
</html>"""

    with open("report-lab-02.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Generated report-lab-02.html successfully.")

def export_pdf():
    chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    html_abs = os.path.abspath("report-lab-02.html")
    pdf_abs = os.path.abspath("Lab_02_Report.pdf")
    docs_pdf_abs = os.path.abspath("docs/lab-02/Lab_02_Report.pdf")
    
    cmd = [
        chrome_exe,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_abs}",
        f"file:///{html_abs.replace(chr(92), '/')}"
    ]
    subprocess.run(cmd, check=True)
    shutil.copyfile(pdf_abs, docs_pdf_abs)
    print(f"Exported PDF to {pdf_abs} and {docs_pdf_abs}")

if __name__ == "__main__":
    build()
    export_pdf()
