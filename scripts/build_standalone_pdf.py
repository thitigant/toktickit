import os
import base64
import subprocess
import time

def img_to_b64(rel_path):
    full_path = os.path.abspath(rel_path)
    if os.path.exists(full_path):
        with open(full_path, "rb") as f:
            return "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")
    return ""

def build_pdf():
    # Load base64 images
    img_git = img_to_b64("artifacts/lab-02/screenshots/tests-and-git/git-commit-graph.png")
    img_tests = img_to_b64("artifacts/lab-02/screenshots/tests-and-git/test-results-server.png")
    img_req_sel = img_to_b64("artifacts/lab-02/screenshots/requester-selector/requester-selection-screen.png")
    img_create_init = img_to_b64("artifacts/lab-02/screenshots/create-ticket/desktop-initial.png")
    img_create_val = img_to_b64("artifacts/lab-02/screenshots/create-ticket/validation-error.png")
    img_create_succ = img_to_b64("artifacts/lab-02/screenshots/create-ticket/success-created.png")
    img_create_att = img_to_b64("artifacts/lab-02/screenshots/create-ticket/attachment-invalid.png")
    img_create_api = img_to_b64("artifacts/lab-02/screenshots/create-ticket/api-failure-state.png")
    img_my_req_a = img_to_b64("artifacts/lab-02/screenshots/my-tickets/requester-a-list.png")
    img_my_req_b = img_to_b64("artifacts/lab-02/screenshots/my-tickets/requester-b-list.png")
    img_my_search = img_to_b64("artifacts/lab-02/screenshots/my-tickets/search-and-filter.png")
    img_detail = img_to_b64("artifacts/lab-02/screenshots/ticket-detail/ticket-detail-view.png")
    img_soft_rem = img_to_b64("artifacts/lab-02/screenshots/ticket-detail/soft-remove-modal.png")
    img_resp_desk = img_to_b64("artifacts/lab-02/screenshots/responsive/desktop-view.png")
    img_resp_tab = img_to_b64("artifacts/lab-02/screenshots/responsive/tablet-view.png")
    img_resp_mob = img_to_b64("artifacts/lab-02/screenshots/responsive/mobile-view.png")

    html_content = f"""<!DOCTYPE html>
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
    font-size: 12px;
  }}

  .page-container {{
    max-width: 820px;
    margin: 0 auto;
    background: #FFFFFF;
  }}

  .header-banner {{
    background: #006B3C;
    color: white;
    padding: 18px 24px;
    border-bottom: 3px solid var(--secondary);
    border-radius: 4px;
    margin-bottom: 20px;
  }}

  .header-banner h1 {{
    font-size: 19px;
    font-weight: 800;
    margin-bottom: 4px;
  }}

  .header-banner .subtitle {{
    font-size: 13px;
    opacity: 0.95;
  }}

  .meta-grid {{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    margin-top: 12px;
    background: rgba(255,255,255,0.15);
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 11.5px;
  }}

  .meta-grid div strong {{ color: #A7F3D0; }}

  .part-section {{
    margin-bottom: 24px;
    page-break-inside: avoid;
  }}

  .page-break {{
    page-break-before: always;
  }}

  .part-title {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 15px;
    font-weight: 700;
    color: var(--primary);
    border-bottom: 2px solid var(--primary);
    padding-bottom: 4px;
    margin-bottom: 10px;
  }}

  .score-badge {{
    font-size: 10.5px;
    background: var(--pale-green);
    color: var(--primary);
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 8px;
    border: 1px solid rgba(0,107,60,0.25);
  }}

  h3 {{
    font-size: 12.5px;
    font-weight: 700;
    color: #1E293B;
    margin: 10px 0 4px 0;
  }}

  p {{ margin-bottom: 6px; color: #334155; }}

  ul, ol {{
    margin-left: 16px;
    margin-bottom: 8px;
  }}

  li {{ margin-bottom: 3px; }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 12px 0;
    font-size: 11px;
  }}

  th, td {{
    padding: 5px 7px;
    border: 1px solid var(--border-light);
    text-align: left;
    vertical-align: top;
  }}

  th {{
    background: #F8FAFC;
    color: #0F172A;
    font-weight: 600;
  }}

  tr:nth-child(even) td {{ background: #FAFAFA; }}

  .inline-code {{
    background: #F1F5F9;
    color: #0F172A;
    font-family: Consolas, monospace;
    font-size: 10.5px;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid #E2E8F0;
  }}

  .badge {{
    display: inline-block;
    padding: 1px 6px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 600;
  }}

  .badge-new {{ background: #EBF8FF; color: #2B6CB0; }}
  .badge-inprogress {{ background: #EAF6EF; color: #0B7A46; }}
  .badge-resolved {{ background: #EDF2F7; color: #4A5568; }}
  .badge-high {{ background: #FFF5F5; color: #C53030; }}
  .badge-medium {{ background: #FEFCBF; color: #744210; }}

  .screenshot-img {{
    width: 100%;
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 6px 0 10px 0;
    border: 1px solid #CBD5E1;
    display: block;
  }}

  .callout {{
    padding: 6px 10px;
    border-radius: 4px;
    margin: 6px 0;
    font-size: 11px;
  }}

  .callout-info {{ background: #EBF8FF; border-left: 3px solid #3182CE; color: #2B6CB0; }}
  .callout-success {{ background: #EAF6EF; border-left: 3px solid var(--primary); color: #0B7A46; }}

  .kanban-board {{
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
    margin: 8px 0;
  }}

  .kanban-col {{
    background: #F1F5F9;
    border-radius: 4px;
    padding: 5px;
    font-size: 10px;
  }}

  .kanban-col-header {{
    font-weight: 700;
    color: #475569;
    margin-bottom: 3px;
    text-align: center;
    border-bottom: 1px solid #CBD5E1;
    padding-bottom: 2px;
  }}

  .kanban-card {{
    background: white;
    border: 1px solid #CBD5E1;
    border-radius: 2px;
    padding: 4px;
    margin-bottom: 4px;
    font-size: 9.5px;
  }}

  @media print {{
    body {{ background: white; font-size: 11px; }}
    .page-container {{ width: 100%; max-width: 100%; }}
  }}
</style>
</head>
<body>

<div class="page-container">
  <!-- Header Banner -->
  <div class="header-banner">
    <h1>CPE 334 Introduction to Software Engineering in the Age of AI Agents</h1>
    <div class="subtitle">Lab 2 Engineering Report — TokTickIT Requester Ticketing MVP with UI Foundation</div>
    <div class="meta-grid">
      <div><strong>Student:</strong> Thitigant Surayothin (67070505214) — GitHub: @thitigant</div>
      <div><strong>Peer Reviewer:</strong> Aran edlek (67070505230) — GitHub: @aranedlek</div>
      <div><strong>Repository:</strong> github.com/thitigant/toktickit</div>
      <div><strong>Score:</strong> ______ / 60 Points</div>
    </div>
  </div>

  <!-- Answer Part 1 -->
  <div class="part-section" id="part1">
    <div class="part-title">
      <span>Answer Part 1: Git Use with Engineering Workflow</span>
      <span class="score-badge">10 Points</span>
    </div>

    <h3>1.1 Branch Architecture & Git Flow</h3>
    <p>The project strictly followed the disciplined branching strategy: feature branches for each GitHub Issue were branched from and merged into <span class="inline-code">lab2-staging</span> via reviewed Pull Requests before a final release PR was merged into <span class="inline-code">main</span>.</p>
    
    <div class="callout callout-info">
      <strong>Branch Flow:</strong> <span class="inline-code">feature/lab2-*</span> ➔ Pull Request (Peer Review) ➔ <span class="inline-code">lab2-staging</span> ➔ Release PR #20 ➔ <span class="inline-code">main</span>
    </div>

    <h3>1.2 Git Commit History Graph (from main)</h3>
    <img src="{img_git}" alt="Git Commit Graph" class="screenshot-img" />

    <h3>1.3 GitHub Project Kanban Board (All Issues in Done)</h3>
    <div class="kanban-board">
      <div class="kanban-col"><div class="kanban-col-header">Backlog (0)</div></div>
      <div class="kanban-col"><div class="kanban-col-header">Specified (0)</div></div>
      <div class="kanban-col"><div class="kanban-col-header">Started (0)</div></div>
      <div class="kanban-col"><div class="kanban-col-header">PR Review (0)</div></div>
      <div class="kanban-col"><div class="kanban-col-header">Fixing (0)</div></div>
      <div class="kanban-col" style="background:#EAF6EF;">
        <div class="kanban-col-header" style="color:#006B3C;">Done (6)</div>
        <div class="kanban-card"><strong>#10</strong> Specs & Tests</div>
        <div class="kanban-card"><strong>#12</strong> Requester Context</div>
        <div class="kanban-card"><strong>#14</strong> Create Ticket</div>
        <div class="kanban-card"><strong>#16</strong> My Tickets List</div>
        <div class="kanban-card"><strong>#18</strong> Ticket Detail</div>
        <div class="kanban-card"><strong>#20</strong> E2E & Release</div>
      </div>
    </div>

    <h3>1.4 GitHub Issues Summary & Sprint Deliverables</h3>
    <table>
      <thead>
        <tr>
          <th>Issue #</th>
          <th>Feature / Task</th>
          <th>Branch / PR</th>
          <th>Deliverables & Changes</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>#10</strong></td>
          <td>Sprint Specs & Test Plan</td>
          <td>PR #10 (merged)</td>
          <td>Authored specification.md, tests.md, ui-spec.md, and api-spec.md before implementation.</td>
          <td><span class="badge badge-inprogress">DONE</span></td>
        </tr>
        <tr>
          <td><strong>#12</strong></td>
          <td>Data Models & Requester API</td>
          <td>PR #12 (merged)</td>
          <td>Prisma schema for RequesterUser, Ticket, Attachment; idempotent seed (8 users, 43 tickets); GET /api/requesters/active.</td>
          <td><span class="badge badge-inprogress">DONE</span></td>
        </tr>
        <tr>
          <td><strong>#14</strong></td>
          <td>Create Ticket Screen & API</td>
          <td>PR #14 (merged)</td>
          <td>Zen Green form layout, POST /api/tickets, Ticket Number generator (TKT-YYYY-XXXXXX), field validations.</td>
          <td><span class="badge badge-inprogress">DONE</span></td>
        </tr>
        <tr>
          <td><strong>#16</strong></td>
          <td>My Tickets List & Filters</td>
          <td>PR #16 (merged)</td>
          <td>GET /api/tickets with search, filters (category/priority/status), pagination, requester isolation, desktop/mobile views.</td>
          <td><span class="badge badge-inprogress">DONE</span></td>
        </tr>
        <tr>
          <td><strong>#18</strong></td>
          <td>Ticket Detail & Attachments</td>
          <td>PR #18 (merged)</td>
          <td>Read-only detail view, attachment upload, download stream, soft-removal modal with mandatory reason, download blocking.</td>
          <td><span class="badge badge-inprogress">DONE</span></td>
        </tr>
        <tr>
          <td><strong>#20</strong></td>
          <td>E2E Tests & Release Integration</td>
          <td>PR #20 (merged)</td>
          <td>Automated E2E specs, 45 total tests passing (31 server + 14 client), reviewer.md, ai-use.md, release to main.</td>
          <td><span class="badge badge-inprogress">DONE</span></td>
        </tr>
      </tbody>
    </table>

    <h3>1.5 Rendered reviewer.md (Peer Review Record)</h3>
    <table>
      <thead>
        <tr>
          <th>PR #</th>
          <th>Branch</th>
          <th>Reviewer (@aranedlek) Verdict & Comments</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>#10</strong></td><td>feature/lab2-specs-and-tests</td><td>Approved — "เรียบร้อยตามสเปกครับ"</td></tr>
        <tr><td><strong>#12</strong></td><td>feature/lab2-data-and-requester-api</td><td>Approved — "Data models และ Seed data สมบูรณ์ครับ"</td></tr>
        <tr><td><strong>#14</strong></td><td>feature/lab2-create-ticket</td><td>Approved — "ระบบสร้าง Ticket ทำงานได้ถูกต้อง"</td></tr>
        <tr><td><strong>#16</strong></td><td>feature/lab2-my-tickets</td><td>Approved — "My Tickets filtering และ responsive UI สวยงามมาก"</td></tr>
        <tr><td><strong>#18</strong></td><td>feature/lab2-ticket-detail</td><td>Approved — "Ticket Detail และ Attachment Soft-remove ทำงานได้ตามข้อกำหนดครับ"</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Answer Part 2 -->
  <div class="part-section page-break" id="part2">
    <div class="part-title">
      <span>Answer Part 2: Spec DD (Spec-Driven Development)</span>
      <span class="score-badge">5 Points</span>
    </div>

    <p><strong>Specification Document Link:</strong> <span class="inline-code">docs/lab-02/specification.md</span></p>
    <div class="callout callout-success">
      <strong>Spec DD Evidence:</strong> Commit <span class="inline-code">d11ee5d</span> and PR #10 established the complete specification before any implementation PRs were merged.
    </div>

    <h3>2.1 Functional Requirements (FR) Summary</h3>
    <ul>
      <li><strong>FR-01..03:</strong> Development Requester session context, backend unique Ticket Number generation, ticket creation with Category, System, Priority, Summary, Description, and Attachments.</li>
      <li><strong>FR-04..05:</strong> Dual-layer validation (frontend/backend); attachments limited to JPG/PNG/PDF &le; 5MB (max 5 active files).</li>
      <li><strong>FR-06..08:</strong> My Tickets list scoped to active Requester, multi-criteria filtering, search, sorting, and pagination.</li>
      <li><strong>FR-09..11:</strong> Read-only Ticket Detail view, attachment upload, soft-removal with mandatory reason and blocked download.</li>
      <li><strong>FR-12:</strong> Strict cross-requester ownership protection returning HTTP 403/404 on unauthorized access attempts.</li>
    </ul>

    <h3>2.2 Business Rules (BR) & Acceptance Criteria (AC)</h3>
    <ul>
      <li><strong>BR-01..05:</strong> Backend format <span class="inline-code">TKT-YYYY-XXXXXX</span>, initial status <span class="inline-code">NEW</span>, default priority <span class="inline-code">MEDIUM</span>, Summary 5-150 chars, Description 10-2000 chars.</li>
      <li><strong>BR-07..10:</strong> Max 5 active attachments, soft removal sets <span class="inline-code">isRemoved: true</span>, strict requester boundary via <span class="inline-code">x-requester-id</span>.</li>
      <li><strong>AC-01..06:</strong> Complete Given-When-Then criteria covering creation, redirect, isolation, validation, limits, and soft removal.</li>
    </ul>
  </div>

  <!-- Answer Part 3 -->
  <div class="part-section page-break" id="part3">
    <div class="part-title">
      <span>Answer Part 3: Test DD and Traceability</span>
      <span class="score-badge">10 Points</span>
    </div>

    <p><strong>Test Plan Document Link:</strong> <span class="inline-code">docs/lab-02/tests.md</span></p>

    <h3>3.1 Planned Tests Table & Traceability</h3>
    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Type</th>
          <th>AC / Rule</th>
          <th>What It Tests</th>
          <th>Expected Result</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>UNIT-01</strong></td><td>Unit</td><td>BR-01</td><td>Ticket number generator</td><td>Matches format TKT-\d{{4}}-\d{{6}}</td><td><span class="badge badge-inprogress">PASS</span></td></tr>
        <tr><td><strong>UNIT-02</strong></td><td>Unit</td><td>BR-08</td><td>Attachment file validator</td><td>Rejects &gt;5MB or .exe; accepts .pdf/.png</td><td><span class="badge badge-inprogress">PASS</span></td></tr>
        <tr><td><strong>API-01</strong></td><td>API</td><td>AC-01</td><td>Create valid ticket endpoint</td><td>Status 201; returns saved ticket</td><td><span class="badge badge-inprogress">PASS</span></td></tr>
        <tr><td><strong>API-02</strong></td><td>API</td><td>FR-04</td><td>Create ticket validation errors</td><td>Status 400 with field-specific errors</td><td><span class="badge badge-inprogress">PASS</span></td></tr>
        <tr><td><strong>API-03</strong></td><td>API</td><td>AC-03</td><td>Requester ownership isolation</td><td>Status 403/404 on cross-requester access</td><td><span class="badge badge-inprogress">PASS</span></td></tr>
        <tr><td><strong>API-04</strong></td><td>API</td><td>FR-07</td><td>Search, filter & pagination</td><td>Returns filtered/paginated ticket list</td><td><span class="badge badge-inprogress">PASS</span></td></tr>
        <tr><td><strong>API-05</strong></td><td>API</td><td>AC-05</td><td>Max 5 attachments limit</td><td>Status 400 when exceeding 5 files</td><td><span class="badge badge-inprogress">PASS</span></td></tr>
        <tr><td><strong>API-06</strong></td><td>API</td><td>AC-06</td><td>Soft removal of attachment</td><td>Status 200; download blocked (410)</td><td><span class="badge badge-inprogress">PASS</span></td></tr>
        <tr><td><strong>UI-01..04</strong></td><td>UI</td><td>AC-02</td><td>Requester selector, validation, badges</td><td>Components render and behave as specified</td><td><span class="badge badge-inprogress">PASS</span></td></tr>
        <tr><td><strong>E2E-01..02</strong></td><td>E2E</td><td>AC-01..06</td><td>Full user journey & soft removal</td><td>All end-to-end flows pass cleanly</td><td><span class="badge badge-inprogress">PASS</span></td></tr>
      </tbody>
    </table>

    <h3>3.2 Test Results (100% Pass Rate: 31 Server + 14 Client Tests)</h3>
    <img src="{img_tests}" alt="Test Results" class="screenshot-img" />
  </div>

  <!-- Answer Part 4 -->
  <div class="part-section page-break" id="part4">
    <div class="part-title">
      <span>Answer Part 4: AI Use with Reflection</span>
      <span class="score-badge">5 Points</span>
    </div>

    <p><strong>Document Link:</strong> <span class="inline-code">docs/lab-02/ai-use.md</span> | <strong>AI Agent:</strong> Antigravity AI Agent (Powered by Gemini)</p>

    <h3>4.1 Key Prompts & Engineering Outcomes</h3>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Prompt (Summarized)</th>
          <th>Engineering Action & Result</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1</td><td>Draft Sprint 2 Engineering Contracts (spec, tests, ui-spec, api-spec)</td><td>Reviewed all business rules and ACs before committing to docs/lab-02.</td></tr>
        <tr><td>2</td><td>Implement Prisma models and idempotent seed script</td><td>Ran migration & seed script populating 8 users, 4 categories, and 43 tickets.</td></tr>
        <tr><td>3</td><td>Build Create Ticket API and responsive form UI</td><td>Verified inline validation and Vitest API test suite.</td></tr>
        <tr><td>4</td><td>Implement GET /api/tickets with filters and pagination</td><td>Tested SQL query filtering and requester data isolation.</td></tr>
        <tr><td>5</td><td>Create MyTicketsList component with desktop/mobile views</td><td>Verified responsive layout on desktop (&ge;768px) and mobile (&lt;768px).</td></tr>
        <tr><td>6</td><td>Build Ticket Detail view and attachment soft removal</td><td>Tested soft removal confirmation modal and blocked download handling.</td></tr>
        <tr><td>7</td><td>Run complete test suites across server and client</td><td>Executed all 45 automated unit/API/UI test cases achieving 100% pass rate.</td></tr>
        <tr><td>8</td><td>Guide Git Branch flow (feature/* ➔ lab2-staging ➔ main)</td><td>Prepared PR descriptions and verified peer review records in reviewer.md.</td></tr>
      </tbody>
    </table>

    <h3>4.2 My Reflection</h3>
    <p>Applying Spec-Driven Development (SDD) beforehand allowed the AI assistant to implement the full-stack requirements cleanly without ambiguities. Human oversight was critical in verifying requester boundary enforcement (<span class="inline-code">x-requester-id</span> header checks) across all endpoints to ensure data isolation.</p>
  </div>

  <!-- Answer Part 5 & 6 -->
  <div class="part-section page-break" id="part56">
    <div class="part-title">
      <span>Answer Part 5 & 6: Development Requester Selector & Create Ticket Mode</span>
      <span class="score-badge">10 Points</span>
    </div>

    <h3>5.1 Development Requester Context Selector Screen (Part 5)</h3>
    <img src="{img_req_sel}" alt="Requester Selector" class="screenshot-img" />

    <h3>6.1 Create Ticket: Initial Form State (Part 6)</h3>
    <img src="{img_create_init}" alt="Create Ticket Initial" class="screenshot-img" />

    <h3>6.2 Create Ticket: Inline Validation Failure State</h3>
    <img src="{img_create_val}" alt="Validation Error" class="screenshot-img" />

    <h3>6.3 Create Ticket: Success State with Backend Ticket Number</h3>
    <img src="{img_create_succ}" alt="Success Created" class="screenshot-img" />

    <h3>6.4 Create Ticket: Attachment Validation & Safe API Error State</h3>
    <img src="{img_create_att}" alt="Attachment Validation" class="screenshot-img" />
    <img src="{img_create_api}" alt="API Error Resilience" class="screenshot-img" />
  </div>

  <!-- Answer Part 7 -->
  <div class="part-section page-break" id="part7">
    <div class="part-title">
      <span>Answer Part 7: Working My Tickets Screen</span>
      <span class="score-badge">10 Points</span>
    </div>

    <h3>7.1 Requester Isolation (Requester A vs Requester B)</h3>
    <p>Switching development requesters immediately switches ticket queues, strictly preventing one requester from viewing another requester's tickets:</p>
    <img src="{img_my_req_a}" alt="Requester A Tickets" class="screenshot-img" />
    <img src="{img_my_req_b}" alt="Requester B Tickets" class="screenshot-img" />

    <h3>7.2 Search and Multi-Criteria Filter Controls</h3>
    <img src="{img_my_search}" alt="Search and Filter" class="screenshot-img" />
  </div>

  <!-- Answer Part 8 -->
  <div class="part-section page-break" id="part8">
    <div class="part-title">
      <span>Answer Part 8: Working Ticket Screen: View Mode and Attachments</span>
      <span class="score-badge">5 Points</span>
    </div>

    <h3>8.1 Owned Ticket Detail Screen (Read-Only Mode)</h3>
    <img src="{img_detail}" alt="Ticket Detail Screen" class="screenshot-img" />

    <h3>8.2 Soft Removal Modal with Mandatory Reason (BR-09)</h3>
    <img src="{img_soft_rem}" alt="Soft Remove Modal" class="screenshot-img" />
    <div class="callout callout-info">
      <strong>Security & Download Blocking:</strong> Soft-removed attachments permanently retain metadata for auditing while returning <strong>HTTP 410 Gone / 404 Not Found</strong> on download requests. Cross-requester direct access returns <strong>HTTP 403 Forbidden</strong>.
    </div>
  </div>

  <!-- Answer Part 9 -->
  <div class="part-section page-break" id="part9">
    <div class="part-title">
      <span>Answer Part 9: Zen Green UI and Responsive Evidence</span>
      <span class="score-badge">5 Points</span>
    </div>

    <p><strong>UI Specification Document Link:</strong> <span class="inline-code">docs/lab-02/ui-spec.md</span></p>

    <h3>9.1 Zen Green Color Tokens Reference</h3>
    <table>
      <thead>
        <tr><th>Token Name</th><th>Hex Code</th><th>Application Context</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Primary Green</strong></td><td><span class="inline-code">#006B3C</span></td><td>App Header, Primary CTA Buttons, Strong Emphasis</td></tr>
        <tr><td><strong>Secondary Green</strong></td><td><span class="inline-code">#0B7A46</span></td><td>Active Navigation Tabs, Focus Borders, Hover States</td></tr>
        <tr><td><strong>Pale Green</strong></td><td><span class="inline-code">#EAF6EF</span></td><td>Selected Row Highlights, Success Badges & Banners</td></tr>
        <tr><td><strong>Page Background</strong></td><td><span class="inline-code">#F5F7F6</span></td><td>Quiet Neutral Background across all screens</td></tr>
        <tr><td><strong>Surface / Card</strong></td><td><span class="inline-code">#FFFFFF</span></td><td>Form cards and tables with 1px border (#E2E8F0)</td></tr>
        <tr><td><strong>Text Charcoal</strong></td><td><span class="inline-code">#1A202C</span></td><td>Dark Charcoal text for high-contrast comfortable reading</td></tr>
      </tbody>
    </table>

    <h3>9.2 Responsive Viewports Verification (Desktop, Tablet, Mobile)</h3>
    <img src="{img_resp_desk}" alt="Desktop View" class="screenshot-img" />
    <img src="{img_resp_tab}" alt="Tablet View" class="screenshot-img" />
    <img src="{img_resp_mob}" alt="Mobile View" class="screenshot-img" />

    <h3>9.3 UI & Visual Inspection Checklist</h3>
    <ul>
      <li>✔ <strong>Color Tokens:</strong> Exact Zen Green palette verified across all screens.</li>
      <li>✔ <strong>Field States:</strong> Editable inputs use white background; system-generated fields use soft gray-green shading (#F0F4F1).</li>
      <li>✔ <strong>Validation Placement:</strong> Inline error messages appear directly below invalid controls.</li>
      <li>✔ <strong>No Horizontal Overflow:</strong> Clean wrapping and responsive cards on mobile viewports.</li>
    </ul>
  </div>

  <!-- Footer -->
  <div style="border-top: 1px solid #CBD5E1; padding-top: 10px; margin-top: 20px; display:flex; justify-content:space-between; font-size: 10.5px; color: #64748B;">
    <div>TokTickIT — Lab 2 Sprint Engineering Report</div>
    <div>KMUTT CPE 334 — Semester 1/2026</div>
  </div>
</div>

</body>
</html>"""

    with open("report-lab-02.html", "w", encoding="utf-8") as f:
        f.write(html_content)
    print("Updated standalone report-lab-02.html successfully!")

    # Now print to PDF with Chrome headless (super fast because all images are inline base64!)
    chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    html_abs = os.path.abspath("report-lab-02.html")
    pdf_abs = os.path.abspath("Lab_02_Report.pdf")
    pdf_docs_abs = os.path.abspath("docs/lab-02/Lab_02_Report.pdf")

    cmd = [
        chrome_exe,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_abs}",
        f"file:///{html_abs.replace('\\', '/')}"
    ]
    subprocess.run(cmd, check=True)
    
    # Copy to docs/lab-02/
    with open(pdf_abs, "rb") as src, open(pdf_docs_abs, "wb") as dst:
        dst.write(src.read())

    print(f"Generated standalone fast-loading PDF: {pdf_abs} ({os.path.getsize(pdf_abs):,} bytes)")

if __name__ == "__main__":
    build_pdf()
