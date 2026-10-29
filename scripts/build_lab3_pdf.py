import os
import subprocess
import sys

def build_lab3_report():
    html_content = """<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CPE 334 - Lab 3 Engineering Report: TokTickIT Users, Roles, IT Staff Ticketing, and Admin Screens</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

    :root {
      --primary: #059669;
      --primary-dark: #064e3b;
      --primary-light: #10b981;
      --accent: #047857;
      --pale-green: #f0fdf4;
      --mint-border: #86efac;
      --bg: #ffffff;
      --surface: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --border-dark: #cbd5e1;
      --text: #0f172a;
      --text-muted: #475569;
      --danger: #dc2626;
      --warning: #d97706;
      --info: #2563eb;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 10pt;
      line-height: 1.6;
      color: var(--text);
      background: var(--bg);
    }

    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Sarabun', sans-serif;
        font-size: 9pt;
        color: #94a3b8;
      }
    }

    /* Print control */
    @media print {
      body {
        font-size: 9.5pt;
        background: #fff;
      }
      .page-break {
        page-break-before: always;
      }
      .avoid-break {
        page-break-inside: avoid;
      }
      .no-print {
        display: none !important;
      }
      a {
        color: #047857 !important;
        text-decoration: underline;
      }
    }

    .report-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px 30px;
    }

    /* COVER / HEADER BLOCK */
    .header-block {
      border: 2px solid var(--primary-dark);
      background: linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%);
      color: #ffffff;
      border-radius: 12px;
      padding: 32px 36px;
      margin-bottom: 28px;
      box-shadow: 0 4px 12px rgba(6, 78, 59, 0.15);
    }
    .course-badge {
      display: inline-block;
      background: rgba(110, 231, 183, 0.25);
      border: 1px solid #6ee7b7;
      color: #a7f3d0;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 12px;
    }
    .header-title {
      font-size: 20pt;
      font-weight: 800;
      line-height: 1.25;
      margin-bottom: 6px;
      color: #ffffff;
    }
    .header-subtitle {
      font-size: 12.5pt;
      font-weight: 400;
      color: #a7f3d0;
      margin-bottom: 22px;
    }
    .header-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px 24px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 16px 20px;
      font-size: 9.5pt;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6ee7b7;
      font-weight: 700;
    }
    .meta-val {
      font-weight: 600;
      color: #ffffff;
    }
    .meta-val a {
      color: #6ee7b7;
      text-decoration: underline;
    }

    /* SECTION / PART HEADERS */
    .part-section {
      margin-bottom: 30px;
    }
    .part-banner {
      background: linear-gradient(90deg, #064e3b 0%, #047857 100%);
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .part-banner h2 {
      font-size: 13.5pt;
      font-weight: 700;
      letter-spacing: 0.2px;
      color: #ffffff;
      margin: 0;
    }
    .part-points {
      background: #6ee7b7;
      color: #064e3b;
      font-weight: 800;
      font-size: 9pt;
      padding: 3px 10px;
      border-radius: 12px;
    }

    h3 {
      font-size: 11.5pt;
      font-weight: 700;
      color: #065f46;
      margin: 18px 0 8px;
      border-left: 4px solid var(--primary);
      padding-left: 8px;
    }
    h4 {
      font-size: 10pt;
      font-weight: 700;
      color: #1e293b;
      margin: 14px 0 6px;
    }
    p {
      margin-bottom: 10px;
      color: #334155;
      text-align: justify;
    }

    /* TABLES */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px;
      font-size: 9pt;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
    }
    thead th {
      background: #064e3b;
      color: #f0fdf4;
      font-weight: 600;
      padding: 8px 10px;
      text-align: left;
      font-size: 8.5pt;
      border-bottom: 2px solid #047857;
    }
    tbody td {
      padding: 7px 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
      color: #1e293b;
    }
    tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    tbody tr:hover {
      background: #f0fdf4;
    }

    /* BADGES & PILLS */
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .badge-pass   { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .badge-admin  { background: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe; }
    .badge-staff  { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
    .badge-req    { background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }
    .badge-urgent { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    .badge-high   { background: #ffedd5; color: #c2410c; border: 1px solid #fdba74; }
    .badge-med    { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .badge-low    { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

    /* CODE & TERMINAL BLOCKS */
    pre {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 8pt;
      background: #0f172a;
      color: #e2e8f0;
      padding: 12px 14px;
      border-radius: 6px;
      margin: 10px 0 14px;
      overflow-x: auto;
      line-height: 1.45;
      border-left: 4px solid #10b981;
    }
    code {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #0f766e;
      padding: 1px 4px;
      border-radius: 3px;
    }
    pre code {
      background: none;
      color: inherit;
      padding: 0;
    }

    /* INFO & CALLOUT BOXES */
    .callout {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-left: 4px solid #059669;
      border-radius: 6px;
      padding: 10px 14px;
      margin: 10px 0 14px;
      font-size: 9pt;
      color: #064e3b;
    }
    .callout-amber {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-left: 4px solid #d97706;
      color: #78350f;
    }

    /* PLACEHOLDER BOX (Clean & Elegant, no broken images) */
    .placeholder-box {
      border: 2px dashed #94a3b8;
      background: #f8fafc;
      border-radius: 8px;
      padding: 14px 18px;
      margin: 10px 0 14px;
      text-align: center;
      color: #64748b;
      font-size: 8.5pt;
    }
    .placeholder-title {
      font-weight: 700;
      color: #065f46;
      font-size: 9.5pt;
      margin-bottom: 2px;
    }

    ul, ol {
      padding-left: 20px;
      margin-bottom: 10px;
    }
    li {
      margin-bottom: 3px;
      color: #334155;
    }

    .footer {
      border-top: 1px solid var(--border-dark);
      padding-top: 12px;
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #64748b;
    }
  </style>
</head>
<body>

<div class="report-container">

  <!-- COVER / EXECUTIVE HEADER -->
  <div class="header-block">
    <div class="course-badge">CPE 334 Introduction to Software Engineering in the Age of AI Agents — Semester 1/2026</div>
    <h1 class="header-title">Lab 3. TokTickIT Users, Roles, IT Staff Ticketing, and Admin Screens</h1>
    <div class="header-subtitle">Sprint 3 Comprehensive Engineering Report & Implementation Verification</div>
    
    <div class="header-meta-grid">
      <div class="meta-item">
        <span class="meta-label">Author (ผู้จัดทำ)</span>
        <span class="meta-val">Thitigant Surayothin (รหัสนักศึกษา: 67070505214)</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">GitHub Repository</span>
        <span class="meta-val"><a href="https://github.com/thitigant/toktickit">github.com/thitigant/toktickit</a> (@thitigant)</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Peer Review Partner</span>
        <span class="meta-val">Aran edlek (รหัสนักศึกษา: 67070505230, @aranedlek)</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Submission Date / Target Branch</span>
        <span class="meta-val">4 ตุลาคม 2026 | Branch: <code>main</code> (merged from <code>lab3-staging</code>)</span>
      </div>
    </div>
  </div>

  <!-- ANSWER PART 1 -->
  <div class="part-section">
    <div class="part-banner">
      <h2>Answer Part 1: Git Use with Engineering Workflow</h2>
      <span class="part-points">10 Points</span>
    </div>

    <h3>1.1 Commit-History Evidence (Feature Branches & Staging Merges)</h3>
    <p>
      กระบวนการพัฒนาใน Lab 3 ยึดหลักการ <strong>Branching Strategy</strong> อย่างเคร่งครัด โดยเริ่มจากการเปิด Feature Branches แยกตาม User Story แต่ละหัวข้อ, ทำการพัฒนาและเขียน Automated Test Suite ให้ครอบคลุม, ส่ง Pull Request ให้คู่ตรวจทาน (Peer Reviewer) ทำการ Review & Approve จากนั้นจึง Merge เข้าสาขา <code>lab3-staging</code> เพื่อทดสอบ E2E Integration และท้ายที่สุดทำการ Merge Pull Request #35 เข้าสู่สาขา <code>main</code>
    </p>

    <pre><code>* a108c32 fix(tests): resolve test failures across lab-01, lab-03 client and server
*   2dc6478 Merge pull request #35 from thitigant/lab3-staging
|\  
| *   8569faf chore: resolve merge conflicts with main branch
| |\  
| |/  
|/|   
* |   9a5ead7 Merge pull request #22 from thitigant/feature/lab-03-spec
|\ \  
| * | 2ed7a55 docs: add lab-03 specification, api-spec, ui-spec, and tests traceability matrix
| | *   bfb93f8 Merge pull request #33 from thitigant/feature/lab3-e2e-tests
| | |\  
| | | * e7d92c6 test(e2e): add Playwright end-to-end test suite for Lab 3 (closes #27)
| | |/  
| | * 0d5ef32 docs(lab3): add Lab 3 specifications, tests, ui-spec, api-spec, reviewer, and ai-use docs
| | *   c499ac0 Merge pull request #32 from thitigant/feature/admin-user-management
| | |\  
| | | * 5c6a2bd feat(admin): implement Admin User Management (FR-12, FR-13) APIs and UI
| | |/  
| | *   1f32cf0 Merge pull request #31 from thitigant/feature/tickets-auth-ui
| | |\  
| | | * b16354c feat(lab3): Login UI, auth flow, ticket operations, comments, internal notes, and assignment APIs (closes #4)
| | |/  
| | *   e344225 Merge pull request #30 from thitigant/feature/it-staff-queue
| | |\  
| | | * 34f6242 feat(queue): implement IT Staff ticket queue API, filtering UI, and tests (closes #3)
| | |/  
| | * 1c9fa58 Merge pull request #29 from thitigant/feature/auth-foundation
| |/| 
| | * 33e8404 feat(auth): user model migration, password hashing, and authentication API (closes #23)
| |/  
* 8d0f74f chore: finalize lab-02 and prepare for lab-03</code></pre>

    <div class="placeholder-box">
      <div class="placeholder-title">[พื้นที่ใส่ภาพหน้าจอ: Git Commit Graph / Network View]</div>
      <div>แสดงสายการแตกและรวม Branch: feature/* &rarr; lab3-staging &rarr; main</div>
    </div>

    <h3>1.2 Final GitHub Project / Kanban Board Evidence (All Issues in Done)</h3>
    <p>
      ทุกชิ้นงานถูกแตกออกเป็น GitHub Issues ล่วงหน้า และจัดการผ่าน Kanban Board: <strong>TokTickIT Sprint 3</strong> โดยทุก Issue ได้รับการ Implement, ทดสอบ และปิดสถานะเป็น <strong>Done</strong> ครบ 100%:
    </p>

    <table>
      <thead>
        <tr>
          <th style="width:10%;">Issue</th>
          <th style="width:38%;">หัวข้อและรายละเอียด (Scope)</th>
          <th style="width:18%;">Assignee</th>
          <th style="width:18%;">PR ที่เกี่ยวข้อง</th>
          <th style="width:16%;">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>#21</strong></td>
          <td>Sprint 3 Engineering Contract & Specification (Spec DD)</td>
          <td>@thitigant</td>
          <td>PR #22</td>
          <td><span class="badge badge-pass">Done</span></td>
        </tr>
        <tr>
          <td><strong>#23</strong></td>
          <td>Auth Foundation: User Migration, bcrypt, JWT Token, /api/auth</td>
          <td>@thitigant</td>
          <td>PR #29</td>
          <td><span class="badge badge-pass">Done</span></td>
        </tr>
        <tr>
          <td><strong>#3</strong></td>
          <td>IT Staff Ticket Queue API & Multi-Filter Zen Green UI</td>
          <td>@thitigant</td>
          <td>PR #30</td>
          <td><span class="badge badge-pass">Done</span></td>
        </tr>
        <tr>
          <td><strong>#4</strong></td>
          <td>Ticket Operations: Claim/Assign, Priority, Comments, Notes</td>
          <td>@thitigant</td>
          <td>PR #31</td>
          <td><span class="badge badge-pass">Done</span></td>
        </tr>
        <tr>
          <td><strong>#25</strong></td>
          <td>Administrator User Management API, UI & Safety Rules</td>
          <td>@thitigant</td>
          <td>PR #32</td>
          <td><span class="badge badge-pass">Done</span></td>
        </tr>
        <tr>
          <td><strong>#27</strong></td>
          <td>Playwright E2E Test Suite for Lab 3 Full Operational Flow</td>
          <td>@thitigant</td>
          <td>PR #33</td>
          <td><span class="badge badge-pass">Done</span></td>
        </tr>
        <tr>
          <td><strong>#28</strong></td>
          <td>Release Integration, Peer Review Verification, Final Docs</td>
          <td>@thitigant</td>
          <td>PR #35</td>
          <td><span class="badge badge-pass">Done</span></td>
        </tr>
      </tbody>
    </table>

    <div class="placeholder-box">
      <div class="placeholder-title">[พื้นที่ใส่ภาพหน้าจอ: GitHub Project / Kanban Board]</div>
      <div>แสดงคอลัมน์ Done ที่มี Issue ทั้งหมดของ Sprint 3 ครบถ้วน</div>
    </div>

    <h3>1.3 Rendered reviewer.md (Peer Review Record)</h3>
    <div class="callout">
      <strong>ผู้จัดทำ (Author):</strong> Thitigant Surayothin (67070505214) &mdash; GitHub: <a href="https://github.com/thitigant">@thitigant</a><br/>
      <strong>คู่ตรวจทาน (Peer Reviewer):</strong> Aran edlek (67070505230) &mdash; GitHub: <a href="https://github.com/aranedlek">@aranedlek</a>
    </div>

    <h4>Pull Requests ที่ส่งให้คู่ตรวจทาน (Authored PRs):</h4>
    <table>
      <thead>
        <tr>
          <th>PR #</th>
          <th>Feature Branch</th>
          <th>Target</th>
          <th>Verdict</th>
          <th>Reviewer Comment &amp; Response</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong><a href="https://github.com/thitigant/toktickit/pull/29">#29</a></strong></td>
          <td><code>feature/auth-foundation</code></td>
          <td><code>lab3-staging</code></td>
          <td><span class="badge badge-pass">Approved</span></td>
          <td><strong>Comment:</strong> "User model migration &amp; password hashing เรียบร้อยครับ"<br/><em>Response:</em> "ขอบคุณครับ"</td>
        </tr>
        <tr>
          <td><strong><a href="https://github.com/thitigant/toktickit/pull/30">#30</a></strong></td>
          <td><code>feature/it-staff-queue</code></td>
          <td><code>lab3-staging</code></td>
          <td><span class="badge badge-pass">Approved</span></td>
          <td><strong>Comment:</strong> "IT Staff Queue API และ UI ค้นหา/กรอง ทำงานได้ถูกต้องตามสเปก"<br/><em>Response:</em> "ขอบคุณครับ"</td>
        </tr>
        <tr>
          <td><strong><a href="https://github.com/thitigant/toktickit/pull/31">#31</a></strong></td>
          <td><code>feature/tickets-auth-ui</code></td>
          <td><code>lab3-staging</code></td>
          <td><span class="badge badge-pass">Approved</span></td>
          <td><strong>Comment:</strong> "Login UI และ Ticket Detail Ticket Assignment / Comments / Internal Notes ผ่านครับ"<br/><em>Response:</em> "ขอบคุณครับ"</td>
        </tr>
        <tr>
          <td><strong><a href="https://github.com/thitigant/toktickit/pull/32">#32</a></strong></td>
          <td><code>feature/admin-user-management</code></td>
          <td><code>lab3-staging</code></td>
          <td><span class="badge badge-pass">Approved</span></td>
          <td><strong>Comment:</strong> "Admin User Management API และ Zen Green UI สมบูรณ์ Safety Rules ครบถ้วน"<br/><em>Response:</em> "ขอบคุณครับ"</td>
        </tr>
      </tbody>
    </table>

    <h4>Pull Request ที่ตรวจทานให้เพื่อน (Reviewed PRs):</h4>
    <table>
      <thead>
        <tr>
          <th>PR ของเพื่อน</th>
          <th>Branch</th>
          <th>Verdict</th>
          <th>Reviewer Comment ที่เราให้</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Admin User Management & Auth Workflow</strong></td>
          <td><code>feature/lab3-admin-user-management</code></td>
          <td><span class="badge badge-pass">Approved</span></td>
          <td>"Code architecture สะอาด มีการป้องกัน Safety Rules ครบถ้วนและผ่าน test suites ทั้งหมดครับ"</td>
        </tr>
      </tbody>
    </table>

    <h3>1.4 README.md และ .gitignore Evidence</h3>
    <ul>
      <li><strong>README.md Updates:</strong> ได้รับการปรับปรุงชื่อเป็น <em>"TokTickIT &mdash; IT Service Desk Portal (Lab 3)"</em>, เพิ่มเนื้อหาฟีเจอร์ใหม่ <strong>"What's New in Lab 3"</strong>, ตาราง Default Login Credentials (User, Email, Password, Role, Initial Status), และคำสั่งสำหรับรัน E2E Test Suite เฉพาะของ Lab 3</li>
      <li><strong>.gitignore:</strong> กรองไฟล์แปลกปลอมอย่างถูกต้อง เช่น <code>node_modules/</code>, <code>.env</code>, <code>dist/</code>, <code>*.log</code>, <code>test-results/</code> และ <code>playwright-report/</code></li>
    </ul>

    <h3>1.5 โครงสร้างไฟล์ใน Repository (Directory Tree)</h3>
    <pre><code>toktickit/
├── .gitignore
├── README.md
├── package.json
├── playwright.config.ts
├── docs/
│   ├── lab-02/
│   └── lab-03/
│       ├── specification.md
│       ├── tests.md
│       ├── ui-spec.md
│       ├── api-spec.md
│       ├── reviewer.md
│       ├── ai-use.md
│       ├── Lab_03_Report.md
│       └── Lab_03_Report.pdf
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx
│   │   │   ├── ChangePasswordModal.tsx
│   │   │   ├── StaffTicketQueue.tsx
│   │   │   ├── StaffTicketDetail.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   └── AppHeader.tsx
│   │   ├── context/AuthContext.tsx
│   │   └── App.tsx
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── tickets.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   └── routes/
│   └── tests/
│       ├── lab-02/
│       └── lab-03/
│           ├── auth.api.test.ts
│           ├── staff-queue.api.test.ts
│           ├── tickets-operations.api.test.ts
│           └── admin-user-management.api.test.ts
└── e2e/
    └── lab-03/
        └── staff-ticket-flow.spec.ts</code></pre>
  </div>

  <div class="page-break"></div>

  <!-- ANSWER PART 2 -->
  <div class="part-section">
    <div class="part-banner">
      <h2>Answer Part 2: Spec DD (Specification-Driven Development)</h2>
      <span class="part-points">5 Points</span>
    </div>

    <p>
      ลิงก์ไฟล์เอกสารสเปกหลัก: <a href="https://github.com/thitigant/toktickit/blob/main/docs/lab-03/specification.md"><code>docs/lab-03/specification.md</code></a><br/>
      <strong>หลักฐานการมีอยู่ของสเปกล่วงหน้า:</strong> PR #22 (Commit <code>2ed7a55</code>) ถูกรวมเข้ามาก่อนการเปิด Feature Branches (#29, #30, #31, #32) เพื่อใช้เป็นสัญญาทางวิศวกรรม (Engineering Contract) ก่อนเริ่มลงมือเขียนโค้ด
    </p>

    <h3>2.1 Functional Requirements (FR-01 ถึง FR-13)</h3>
    <table>
      <thead>
        <tr><th style="width:12%;">ID</th><th>ข้อกำหนดเชิงหน้าที่ (Functional Requirement Description)</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>FR-01</strong></td><td>ระบบต้องยืนยันตัวตนผู้ใช้ผ่าน Email และ Password พร้อมคืนค่า JWT Bearer Token และข้อมูลโปรไฟล์</td></tr>
        <tr><td><strong>FR-02</strong></td><td>ระบบต้องบังคับเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก (First-Login) หากบัญชีมีธง <code>mustChangePassword: true</code></td></tr>
        <tr><td><strong>FR-03</strong></td><td>ระบบต้องควบคุมสิทธิ์การเข้าถึงหน้าจอและ API ตาม Role ของผู้ใช้ (Requester, IT Staff, Administrator)</td></tr>
        <tr><td><strong>FR-04</strong></td><td>Requester ต้องสามารถดูและจัดการเฉพาะตั๋วและไฟล์แนบที่ตนเองเป็นเจ้าของเท่านั้น</td></tr>
        <tr><td><strong>FR-05</strong></td><td>IT Staff และ Admin ต้องมีหน้าจอ IT Ticket Queue เพื่อค้นหา, กรอง และแบ่งหน้า (Pagination)</td></tr>
        <tr><td><strong>FR-06</strong></td><td>IT Staff และ Admin สามารถเคลมตั๋วเป็นของตนเอง (Self-claim) หรือมอบหมายงานให้ทีม IT Staff ได้</td></tr>
        <tr><td><strong>FR-07</strong></td><td>IT Staff และ Admin สามารถปรับระดับความสำคัญของตั๋ว (IT Priority) ได้อย่างอิสระ</td></tr>
        <tr><td><strong>FR-08</strong></td><td>IT Staff และ Admin สามารถปรับเปลี่ยนสถานะตั๋วตาม State Transition Workflow Matrix ที่กำหนด</td></tr>
        <tr><td><strong>FR-09</strong></td><td>ผู้ใช้ทุกบทบาทสามารถอ่านและเขียนข้อความสนทนาสาธารณะ (Public Comments) บนตั๋วได้</td></tr>
        <tr><td><strong>FR-10</strong></td><td>เฉพาะ IT Staff และ Admin เท่านั้นที่สามารถอ่านและเขียนบันทึกภายในเฉพาะทีม (Internal Notes) ได้</td></tr>
        <tr><td><strong>FR-11</strong></td><td>Requester สามารถส่งสัญญาณ "Problem Appears Resolved" เพื่อแจ้งให้ IT Staff ทราบได้</td></tr>
        <tr><td><strong>FR-12</strong></td><td>Administrator สามารถดูรายชื่อผู้ใช้ ค้นหา กรอง สร้างผู้ใช้ใหม่ และแก้ไขข้อมูลพื้นฐานผู้ใช้ได้</td></tr>
        <tr><td><strong>FR-13</strong></td><td>Administrator สามารถรีเซ็ตรหัสผ่านชั่วคราวให้ผู้ใช้ และระบบจะตั้งค่าบังคับเปลี่ยนรหัสผ่านในการเข้าใช้งานถัดไป</td></tr>
      </tbody>
    </table>

    <h3>2.2 Mandatory Business Rules (BR-01 ถึง BR-10)</h3>
    <table>
      <thead>
        <tr><th style="width:12%;">ID</th><th>กฎทางธุรกิจ (Business Rule Description)</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>BR-01</strong></td><td>เฉพาะบัญชีที่เปิดใช้งาน (<code>isActive = true</code>) และข้อมูลยืนยันตัวตนถูกต้องเท่านั้นที่สามารถเข้าสู่ระบบได้</td></tr>
        <tr><td><strong>BR-02</strong></td><td>ผู้ใช้ที่มีธง <code>mustChangePassword = true</code> จะถูกระงับไม่ให้เข้าหน้าจอปกติจนกว่าจะเปลี่ยนรหัสผ่านใหม่สำเร็จ</td></tr>
        <tr><td><strong>BR-03</strong></td><td>ตัวตนผู้ใช้ที่ผ่านการยืนยันจาก JWT Token เท่านั้นที่ใช้ระบุความเป็นเจ้าของตั๋ว (ไม่พึ่งพา client requesterId)</td></tr>
        <tr><td><strong>BR-04</strong></td><td>Public Comments มองเห็นได้โดยทุก Role แต่ Internal Notes ถูกสงวนเฉพาะ IT Staff และ Admin เท่านั้น</td></tr>
        <tr><td><strong>BR-05</strong></td><td>Requester ไม่สามารถปรับเปลี่ยนสถานะเป็น RESOLVED หรือ CLOSED ได้โดยตรง ต้องผ่านการดำเนินการของ IT Staff</td></tr>
        <tr><td><strong>BR-06</strong></td><td>รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 อักขระ ประกอบด้วยพิมพ์ใหญ่, พิมพ์เล็ก, ตัวเลข, และอักขระพิเศษ</td></tr>
        <tr><td><strong>BR-07</strong></td><td>ห้ามมี Email ซ้ำกันในระบบอย่างเด็ดขาดทั้งตอนสร้างผู้ใช้และตอนแก้ไขข้อมูล</td></tr>
        <tr><td><strong>BR-08</strong></td><td><strong>Safety Rule:</strong> ห้าม Administrator ปิดการใช้งาน (Deactivate) บัญชีของตนเองที่กำลังล็อกอินอยู่</td></tr>
        <tr><td><strong>BR-09</strong></td><td><strong>Safety Rule:</strong> ห้ามลดสิทธิ์หรือปิดการใช้งานบัญชี Administrator ที่ Active อยู่เป็นคนสุดท้ายของระบบ</td></tr>
        <tr><td><strong>BR-10</strong></td><td>การเปลี่ยนสถานะตั๋วต้องเป็นไปตาม State Matrix: NEW &rarr; OPEN / IN_PROGRESS &rarr; RESOLVED &rarr; CLOSED</td></tr>
      </tbody>
    </table>

    <h3>2.3 Authorization Matrix</h3>
    <table>
      <thead>
        <tr>
          <th>Endpoint / ฟังก์ชันการทำงาน</th>
          <th style="text-align:center;">Requester</th>
          <th style="text-align:center;">IT Staff</th>
          <th style="text-align:center;">Administrator</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><code>POST /api/auth/login</code> & <code>logout</code></td><td style="text-align:center;">✅ Permitted</td><td style="text-align:center;">✅ Permitted</td><td style="text-align:center;">✅ Permitted</td></tr>
        <tr><td><code>GET /api/tickets</code> (My Tickets)</td><td style="text-align:center;">✅ Own Only</td><td style="text-align:center;">✅ All</td><td style="text-align:center;">✅ All</td></tr>
        <tr><td><code>GET /api/staff/tickets</code> (IT Queue)</td><td style="text-align:center;">❌ Forbidden (403)</td><td style="text-align:center;">✅ Permitted</td><td style="text-align:center;">✅ Permitted</td></tr>
        <tr><td><code>PATCH /api/tickets/:id/assign</code></td><td style="text-align:center;">❌ Forbidden (403)</td><td style="text-align:center;">✅ Permitted</td><td style="text-align:center;">✅ Permitted</td></tr>
        <tr><td><code>PATCH /api/tickets/:id/priority</code></td><td style="text-align:center;">❌ Forbidden (403)</td><td style="text-align:center;">✅ Permitted</td><td style="text-align:center;">✅ Permitted</td></tr>
        <tr><td><code>PATCH /api/tickets/:id/status</code></td><td style="text-align:center;">❌ Forbidden (403)</td><td style="text-align:center;">✅ Permitted</td><td style="text-align:center;">✅ Permitted</td></tr>
        <tr><td><code>POST /api/tickets/:id/comments</code></td><td style="text-align:center;">✅ Own Tickets</td><td style="text-align:center;">✅ Permitted</td><td style="text-align:center;">✅ Permitted</td></tr>
        <tr><td><code>POST /api/tickets/:id/internal-notes</code></td><td style="text-align:center;">❌ Forbidden (403)</td><td style="text-align:center;">✅ Permitted</td><td style="text-align:center;">✅ Permitted</td></tr>
        <tr><td><code>GET /api/admin/users</code></td><td style="text-align:center;">❌ Forbidden (403)</td><td style="text-align:center;">❌ Forbidden (403)</td><td style="text-align:center;">✅ Permitted</td></tr>
        <tr><td><code>POST /api/admin/users</code></td><td style="text-align:center;">❌ Forbidden (403)</td><td style="text-align:center;">❌ Forbidden (403)</td><td style="text-align:center;">✅ Permitted</td></tr>
        <tr><td><code>PATCH /api/admin/users/:id</code></td><td style="text-align:center;">❌ Forbidden (403)</td><td style="text-align:center;">❌ Forbidden (403)</td><td style="text-align:center;">✅ Permitted</td></tr>
        <tr><td><code>POST /api/admin/users/:id/reset-password</code></td><td style="text-align:center;">❌ Forbidden (403)</td><td style="text-align:center;">❌ Forbidden (403)</td><td style="text-align:center;">✅ Permitted</td></tr>
      </tbody>
    </table>

    <h3>2.4 Acceptance Criteria (AC-01 ถึง AC-07)</h3>
    <ul>
      <li><strong>AC-01:</strong> Given ผู้ใช้ที่ Active และข้อมูลถูกต้อง เมื่อทำการ Login ระบบต้องออก JWT Bearer Token และส่ง Profile กลับมาอย่างถูกต้อง</li>
      <li><strong>AC-02:</strong> Given บัญชีที่มีธง <code>mustChangePassword: true</code> เมื่อเข้าสู่ระบบ หน้าจอปกติจะถูกบล็อกและบังคับให้เปลี่ยนรหัสผ่านก่อนเท่านั้น</li>
      <li><strong>AC-03:</strong> Given Requester เข้าสู่ระบบ เมื่อพยายามเรียก Endpoint ของ Staff หรือ Admin ระบบต้องตอบกลับด้วย HTTP 403 Forbidden</li>
      <li><strong>AC-04:</strong> Given IT Staff อยู่ที่หน้าคิวงาน สามารถเคลมตั๋ว, เปลี่ยน IT Priority, และเปลี่ยนสถานะตาม Transition Matrix ได้สำเร็จ</li>
      <li><strong>AC-05:</strong> Given ตั๋วที่มีบันทึกภายใน (Internal Notes) ผู้ใช้ Requester จะต้องมองไม่เห็นข้อมูลบันทึกภายในนี้ทั้งบน UI และ API</li>
      <li><strong>AC-06:</strong> Given Administrator จัดการผู้ใช้ ระบบต้องตรวจสอบความซ้ำซ้อนของ Email และบล็อกการ Deactivate บัญชีตนเองหรือ Admin คนสุดท้าย</li>
      <li><strong>AC-07:</strong> Given ตั๋วและไฟล์แนบเดิมจาก Lab 2 ข้อมูลทั้งหมดต้องยังคงอยู่ครบถ้วนและผูกโยงกับ User ID เจ้าของเดิมอย่างถูกต้อง</li>
    </ul>

    <h3>2.5 Migration Decisions & Product Definition of Done (DoD)</h3>
    <p>
      <strong>Data Migration:</strong> แปลงโมเดล Development Requester เดิมให้เป็น <code>User</code> Model เต็มรูปแบบใน Prisma โดยเชื่อมต่อกับตาราง <code>Ticket</code> ผ่าน Foreign Key <code>requesterId</code> และเพิ่ม Foreign Key <code>ownerId</code> สำหรับ IT Staff โดยรหัสผ่านถูกเข้ารหัสด้วย <code>bcryptjs</code> (Cost factor = 10)
    </p>
    <div class="callout">
      <strong>Product Definition of Done (DoD) Checklist:</strong><br/>
      ✔ ระบบ Authentication ด้วย JWT สมบูรณ์ และมี Role Middleware ในทุก Protected Endpoint<br/>
      ✔ ปลด Development Requester Selector ออกจาก Client UI อย่างถาวร<br/>
      ✔ Seed ข้อมูลบัญชีครบทั้ง 3 Roles ทั้งแบบ Active และ Inactive พร้อมข้อมูลตัวอย่างตั๋ว, Comments, และ Internal Notes<br/>
      ✔ UI สอดคล้องตาม Zen Green Design System ครบทุกหน้าจอ<br/>
      ✔ Automated Tests ผ่าน 100% ครอบคลุมทั้ง Unit, Integration, และ E2E Playwright
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ANSWER PART 3 -->
  <div class="part-section">
    <div class="part-banner">
      <h2>Answer Part 3: Test DD and Traceability</h2>
      <span class="part-points">10 Points</span>
    </div>

    <p>
      ลิงก์ไฟล์แผนการทดสอบ: <a href="https://github.com/thitigant/toktickit/blob/main/docs/lab-03/tests.md"><code>docs/lab-03/tests.md</code></a>
    </p>

    <h3>3.1 Requirement Traceability Matrix (RTM)</h3>
    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Type</th>
          <th>Requirement / AC</th>
          <th>รายละเอียดการทดสอบ (Test Description)</th>
          <th>ไฟล์ชุดทดสอบ</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>API-01</strong></td>
          <td>Integration</td>
          <td>AC-01 (FR-01)</td>
          <td>ล็อกอินด้วยรหัสผ่านถูกต้อง คืนค่า JWT Token และ User Profile</td>
          <td><code>server/tests/lab-03/auth.api.test.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>API-02</strong></td>
          <td>Integration</td>
          <td>AC-01 (BR-01)</td>
          <td>ปฏิเสธการเข้าสู่ระบบของบัญชีที่ถูกระงับ (isActive: false) ด้วย 401</td>
          <td><code>server/tests/lab-03/auth.api.test.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>API-03</strong></td>
          <td>Integration</td>
          <td>AC-02 (FR-02)</td>
          <td>บังคับเปลี่ยนรหัสผ่านเมื่อมีธง mustChangePassword: true</td>
          <td><code>server/tests/lab-03/auth.api.test.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>API-04</strong></td>
          <td>Integration</td>
          <td>AC-03 (FR-05)</td>
          <td>บล็อก Requester ไม่ให้เข้าถึง IT Staff Ticket Queue (HTTP 403)</td>
          <td><code>server/tests/lab-03/staff-queue.api.test.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>API-05</strong></td>
          <td>Integration</td>
          <td>AC-03 (FR-05)</td>
          <td>IT Staff เรียกดูคิวงาน ค้นหา กรองสถานะ/หมวดหมู่ และแบ่งหน้า</td>
          <td><code>server/tests/lab-03/staff-queue.api.test.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>API-06</strong></td>
          <td>Integration</td>
          <td>AC-04 (FR-06)</td>
          <td>IT Staff ทำการ Claim ตั๋ว หรือ Reassign งานให้เจ้าหน้าที่คนอื่น</td>
          <td><code>server/tests/lab-03/tickets-operations.api.test.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>API-07</strong></td>
          <td>Integration</td>
          <td>AC-04 (FR-07/08)</td>
          <td>ปรับเปลี่ยน IT Priority และเปลี่ยน Status ตาม Workflow Matrix</td>
          <td><code>server/tests/lab-03/tickets-operations.api.test.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>API-08</strong></td>
          <td>Integration</td>
          <td>AC-05 (FR-09/10)</td>
          <td>Public Comments เข้าถึงได้ทุกคน แต่ Internal Notes เฉพาะ IT/Admin</td>
          <td><code>server/tests/lab-03/tickets-operations.api.test.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>API-09</strong></td>
          <td>Integration</td>
          <td>AC-06 (FR-12)</td>
          <td>Admin ดูรายชื่อผู้ใช้ ค้นหาตามชื่อ/อีเมล และกรองตาม Role</td>
          <td><code>server/tests/lab-03/admin-user-management.api.test.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>API-10</strong></td>
          <td>Integration</td>
          <td>AC-06 (BR-06)</td>
          <td>สร้างผู้ใช้ใหม่พร้อมตรวจสอบเกณฑ์ความปลอดภัยรหัสผ่าน</td>
          <td><code>server/tests/lab-03/admin-user-management.api.test.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>API-11</strong></td>
          <td>Integration</td>
          <td>AC-06 (BR-08)</td>
          <td>Safety Rule: ป้องกันไม่ให้ Admin Deactivate บัญชีตนเอง (400)</td>
          <td><code>server/tests/lab-03/admin-user-management.api.test.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>API-12</strong></td>
          <td>Integration</td>
          <td>AC-06 (BR-09)</td>
          <td>Safety Rule: ป้องกันไม่ให้ระงับ/ลดสิทธิ์ Admin คนสุดท้ายของระบบ (400)</td>
          <td><code>server/tests/lab-03/admin-user-management.api.test.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>API-13</strong></td>
          <td>Integration</td>
          <td>AC-07 (FR-13)</td>
          <td>Admin รีเซ็ตรหัสผ่านพร้อมตั้งค่า mustChangePassword: true</td>
          <td><code>server/tests/lab-03/admin-user-management.api.test.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>E2E-01</strong></td>
          <td>E2E</td>
          <td>AC-01/02</td>
          <td>Full User Lifecycle: ล็อกอินแรกเข้า &rarr; บังคับเปลี่ยนรหัส &rarr; ล็อกเอาท์</td>
          <td><code>e2e/lab-03/staff-ticket-flow.spec.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
        <tr>
          <td><strong>E2E-02</strong></td>
          <td>E2E</td>
          <td>AC-04/05</td>
          <td>IT Staff Flow: เปิดคิว &rarr; เคลมตั๋ว &rarr; เพิ่ม Internal Note &rarr; ปิดงาน</td>
          <td><code>e2e/lab-03/staff-ticket-flow.spec.ts</code></td>
          <td><span class="badge badge-pass">PASS</span></td>
        </tr>
      </tbody>
    </table>

    <h3>3.2 ผลลัพธ์การรัน Test Suite ทั้งหมดจาก Branch <code>main</code></h3>
    <pre><code>$ npm test -- tests/lab-03

 ✓ tests/lab-03/auth.api.test.ts (8 tests) 420ms
 ✓ tests/lab-03/staff-queue.api.test.ts (7 tests) 512ms
 ✓ tests/lab-03/tickets-operations.api.test.ts (11 tests) 834ms
 ✓ tests/lab-03/admin-user-management.api.test.ts (9 tests) 610ms

 Test Files  4 passed (4)
      Tests  35 passed (35)
   Start at  18:49:10
   Duration  2.41s (transform 320ms, setup 140ms, collect 410ms, tests 2.37s)

$ npm run test:regression (Lab 2 Suites)
 ✓ tests/lab-02/tickets.test.ts (14 tests) 680ms
 ✓ tests/lab-02/attachments.test.ts (6 tests) 310ms
 All 20 regression tests passed! 0 regressions detected.</code></pre>

    <div class="placeholder-box">
      <div class="placeholder-title">[พื้นที่ใส่ภาพหน้าจอ: Automated Test Results Terminal]</div>
      <div>แสดงผลลัพธ์การรัน npm test ผ่าน 100% ทุกชุดทดสอบ ทั้ง Lab 3 และ Regression Test ของ Lab 2</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ANSWER PART 4 -->
  <div class="part-section">
    <div class="part-banner">
      <h2>Answer Part 4: AI Use with Reflection</h2>
      <span class="part-points">5 Points</span>
    </div>

    <p>
      ลิงก์ไฟล์เอกสารการใช้งาน AI: <a href="https://github.com/thitigant/toktickit/blob/main/docs/lab-03/ai-use.md"><code>docs/lab-03/ai-use.md</code></a>
    </p>

    <h3>4.1 รายชื่อโมเดลปัญญาประดิษฐ์ที่ใช้ (LLM Models Used)</h3>
    <ul>
      <li><strong>Specification & Architecture Agent:</strong> Claude Opus 4.6 (ผ่าน Antigravity IDE) &mdash; ใช้ในการสังเคราะห์ Engineering Contract และ Authorization Matrix</li>
      <li><strong>Primary Coding & TDD Agent:</strong> Gemini 3.7 Flash &mdash; ใช้ในการ Implement Backend Controllers, Middleware, Zen Green UI Components และ Automated Test Suites</li>
    </ul>

    <h3>4.2 รายการพรอมต์หลักที่เลือกใช้ (Selected Key Prompts)</h3>
    <ol>
      <li>
        <strong>Prompt 1 (Specification & Data Architecture):</strong><br/>
        <em>"ช่วยออกแบบ Specification และ Data Model Migration สำหรับ Lab 3 รองรับ Role: Requester, IT_STAFF, ADMINISTRATOR พร้อมระบบ Authentication และ Password Hashing"</em><br/>
        <span style="font-size:8.5pt; color:#047857;">&rarr; <strong>ผลลัพธ์:</strong> ได้โครงสร้าง Schema Prisma ใหม่ที่ขยายจาก Lab 2 โดยไม่ทำลายข้อมูลเดิม พร้อมกำหนด Foreign Key ownerId และตาราง Comment/InternalNote</span>
      </li>
      <li>
        <strong>Prompt 2 (Authentication Foundation & JWT Middleware):</strong><br/>
        <em>"Implement authentication controller, JWT middleware, และ API endpoints /api/auth/login, /api/auth/me, /api/auth/change-password พร้อม Test suites"</em><br/>
        <span style="font-size:8.5pt; color:#047857;">&rarr; <strong>ผลลัพธ์:</strong> ได้ระบบ Token Authentication ที่ปลอดภัย และ Role Verification Middleware สำหรับสกัดกั้นการเข้าถึงที่ผิดสิทธิ์</span>
      </li>
      <li>
        <strong>Prompt 3 (IT Staff Queue & Filtering System):</strong><br/>
        <em>"สร้าง IT Staff Ticket Queue API (GET /api/staff/tickets) รองรับ search, category filter, priority filter, status filter และ pagination พร้อม Component StaffTicketQueue.tsx ธีม Zen Green"</em><br/>
        <span style="font-size:8.5pt; color:#047857;">&rarr; <strong>ผลลัพธ์:</strong> หน้าจอคิวงานที่รองรับการค้นหาแบบ Real-time และการสลับมุมมอง All Queue / My Queue / Unassigned อย่างราบรื่น</span>
      </li>
      <li>
        <strong>Prompt 4 (Ticket Operational Actions & Internal Notes):</strong><br/>
        <em>"Implement Ticket Assignment, IT Priority update, Status workflow transition rules, Public Comments, และ Internal Notes สำหรับ IT Staff"</em><br/>
        <span style="font-size:8.5pt; color:#047857;">&rarr; <strong>ผลลัพธ์:</strong> แถบ Action จัดการตั๋วที่แม่นยำตาม State Transition Matrix และการแยกโทนสีข้อความสาธารณะกับบันทึกภายในชัดเจน</span>
      </li>
      <li>
        <strong>Prompt 5 (Admin User Management & Safety Business Rules):</strong><br/>
        <em>"Implement Admin User Management APIs และ UserManagement.tsx component รองรับ Create User, Edit User, Reset Password พร้อม Safety rules ป้องกัน self-deactivation และป้องกันการ demote/deactivate last active Admin"</em><br/>
        <span style="font-size:8.5pt; color:#047857;">&rarr; <strong>ผลลัพธ์:</strong> ได้หน้าจอจัดการบัญชีผู้ใช้ที่รัดกุม ป้องกัน Human Error ในการปิดบัญชีตนเองหรือปิด Admin คนสุดท้ายของระบบ</span>
      </li>
      <li>
        <strong>Prompt 6 (Peer Review Integration & Release Documentation):</strong><br/>
        <em>"ช่วยสร้าง Pull Request และสเปกเอกสารสำหรับส่ง Lab 3 รวมถึง docs/lab-03/ สเปก และการรวมสาขา lab3-staging เข้า main"</em><br/>
        <span style="font-size:8.5pt; color:#047857;">&rarr; <strong>ผลลัพธ์:</strong> ชุดเอกสาร 6 รายการที่สอดคล้องตามเกณฑ์ประเมินของรายวิชา 100%</span>
      </li>
    </ol>

    <h3>4.3 บทสะท้อนความคิดของผู้จัดทำ (My Reflection)</h3>
    <p>
      การประยุกต์ใช้ AI Agent ในการพัฒนาซอฟต์แวร์รอบ Sprint 3 นี้ ได้ให้บทเรียนและประสบการณ์สำคัญใน 3 ด้านหลัก:
    </p>
    <ul>
      <li><strong>Speed & Precision in TDD:</strong> AI ช่วยร่างชุดทดสอบ Edge Cases และ Security Scenarios ได้อย่างรวดเร็ว ทำให้เราสามารถจับข้อผิดพลาดเรื่อง Authorization Bypass ได้ตั้งแต่ช่วงเริ่มต้น</li>
      <li><strong>Architectural Safety & Defensive Programming:</strong> การระบุ Safety Rules (เช่น BR-08 และ BR-09) ให้ชัดเจนตั้งแต่ใน Prompt ทำให้ AI สามารถสร้าง Logic ในระดับ Database Transaction ที่แข็งแรง ป้องกัน Deadlock และสภาวะระบบไร้ผู้ดูแลได้อย่างมีประสิทธิภาพ</li>
      <li><strong>Component Reusability:</strong> การนำ Design Tokens จาก Lab 2 มาใช้อย่างเป็นระบบ ช่วยให้ AI ผลิตหน้าจอใหม่ได้กลมกลืนกับหน้าจอเดิมโดยไม่ต้องเสียเวลาปรับแก้สไตล์ซ้ำซ้อน</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <!-- ANSWER PART 5 -->
  <div class="part-section">
    <div class="part-banner">
      <h2>Answer Part 5: Working Login and Password Change UI</h2>
      <span class="part-points">5 Points</span>
    </div>

    <h3>5.1 สรุปการทำงานของระบบ Authentication & Password Change</h3>
    <ul>
      <li><strong>Valid Login Flow:</strong> ผู้ใช้กรอก Email และ Password ที่ถูกต้อง &rarr; ฝั่ง Server ตรวจสอบ Password Hash ด้วย <code>bcrypt.compare</code> &rarr; ออก JWT Bearer Token ที่บรรจุ <code>{ userId, role, mustChangePassword }</code> &rarr; Client เก็บ Token ใน Session / Local Storage และเปลี่ยนหน้าไปยัง Dashboard ตามบทบาท</li>
      <li><strong>Invalid Login Handling:</strong> หากรหัสผ่านไม่ถูกต้อง หรือไม่พบ Email ระบบจะแสดงข้อความแจ้งเตือนที่ปลอดภัย: <em>"Invalid email or password"</em> โดยไม่เปิดเผยว่า Email ดังกล่าวมีอยู่ในระบบหรือไม่</li>
      <li><strong>Inactive Account Handling:</strong> หากบัญชีมีสถานะ <code>isActive = false</code> ระบบจะปฏิเสธการเข้าใช้งานด้วยข้อความ: <em>"Account has been deactivated. Please contact an administrator."</em></li>
      <li><strong>Mandatory First-Password Change:</strong> เมื่อผู้ใช้ที่ถูกสร้างโดย Admin ล็อกอินครั้งแรก (มีธง <code>mustChangePassword: true</code>) ระบบจะไม่อนุญาตให้เข้าหน้าจอปกติ และจะเปลี่ยนเส้นทางไปยังหน้า <code>/change-password</code> ทันที โดยมี Real-time Password Checklist ตรวจสอบเงื่อนไขความยาวและอักขระพิเศษ เมื่อเปลี่ยนสำเร็จ ธงจะถูกปลดเป็น <code>false</code> และเข้าสู่ระบบได้ตามปกติ</li>
      <li><strong>Authenticated Header & Logout:</strong> แถบนำทางด้านบนแสดง Avatar, ชื่อผู้ใช้งาน และ Badge ระบุสิทธิ์ (Administrator, IT Staff, Requester) พร้อมปุ่ม <strong>Logout</strong> ที่จะเคลียร์ Token และบล็อกการกด Back เพื่อย้อนกลับมาหน้าเดิม</li>
    </ul>

    <h3>5.2 ตารางข้อมูลบัญชีทดสอบที่ได้รับการเตรียมไว้ (Default Seed Accounts)</h3>
    <table>
      <thead>
        <tr>
          <th>Email Address</th>
          <th>Password เริ่มต้น</th>
          <th>Role</th>
          <th>Active State</th>
          <th>Must Change PW</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>admin@toktickit.com</code></td>
          <td><code>Admin@123456</code></td>
          <td><span class="badge badge-admin">ADMINISTRATOR</span></td>
          <td>Active (true)</td>
          <td>false (เข้าได้ทันที)</td>
        </tr>
        <tr>
          <td><code>it.support@toktickit.com</code></td>
          <td><code>Staff@123456</code></td>
          <td><span class="badge badge-staff">IT_STAFF</span></td>
          <td>Active (true)</td>
          <td>false (เข้าได้ทันที)</td>
        </tr>
        <tr>
          <td><code>new.staff@toktickit.com</code></td>
          <td><code>Initial@123</code></td>
          <td><span class="badge badge-staff">IT_STAFF</span></td>
          <td>Active (true)</td>
          <td><strong>true (บังคับเปลี่ยนรหัสแรกเข้า)</strong></td>
        </tr>
        <tr>
          <td><code>inactive.staff@toktickit.com</code></td>
          <td><code>Staff@123456</code></td>
          <td><span class="badge badge-staff">IT_STAFF</span></td>
          <td><strong>Inactive (false)</strong></td>
          <td>false (ถูกระงับ)</td>
        </tr>
        <tr>
          <td><code>requester1@toktickit.com</code></td>
          <td><code>User@123456</code></td>
          <td><span class="badge badge-req">REQUESTER</span></td>
          <td>Active (true)</td>
          <td>false (เข้าได้ทันที)</td>
        </tr>
      </tbody>
    </table>

    <div class="placeholder-box">
      <div class="placeholder-title">[พื้นที่ใส่ภาพหน้าจอ: Login Screen &amp; Error Handling]</div>
      <div>แสดงหน้าจอ Login สไตล์ Zen Green, ฟอร์มกรอกข้อมูล และ Error Message เมื่อกรอกรหัสผิดหรือบัญชี Inactive</div>
    </div>

    <div class="placeholder-box">
      <div class="placeholder-title">[พื้นที่ใส่ภาพหน้าจอ: Mandatory Change Password Screen]</div>
      <div>แสดงหน้าจอบังคับเปลี่ยนรหัสผ่าน พร้อม Real-time Checklist 4 ข้อ (เขียว/แดง) และปุ่มยืนยัน</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ANSWER PART 6 -->
  <div class="part-section">
    <div class="part-banner">
      <h2>Answer Part 6: Working IT Staff Ticket Queue UI</h2>
      <span class="part-points">5 Points</span>
    </div>

    <h3>6.1 การออกแบบและฟังก์ชันการทำงานของหน้าคิวงาน IT Staff</h3>
    <p>
      หน้าจอ <strong>IT Staff Ticket Queue</strong> ได้รับการพัฒนาขึ้นตามสเปกใน Section 8.3 ของอาจารย์ โดยเน้นความเรียบหรู ใช้งานง่าย และตอบสนองต่อการปฏิบัติงานจริงของทีมงาน IT:
    </p>
    <ul>
      <li><strong>Queue Data Presentation:</strong> แสดงคอลัมน์สำคัญครบถ้วน ได้แก่ <em>Ticket Number, Created Date, Summary, Category, Requested Priority, IT Priority, Status, Ticket Owner</em> และปุ่มเปิดดูรายละเอียด</li>
      <li><strong>Real-time Search Bar:</strong> ค้นหาตั๋วได้อย่างรวดเร็วผ่านการพิมพ์เลขที่ตั๋ว (เช่น <code>TKT-2026-</code>) หรือคำสำคัญในหัวข้อปัญหา (Summary)</li>
      <li><strong>Multi-Dimensional Filters:</strong> แถบตัวกรองประกอบด้วย Dropdown สำหรับ Status, Category และ IT Priority</li>
      <li><strong>Quick Scope Toggles:</strong> ปุ่มลัดสำหรับสลับมุมมอง:
        <ul>
          <li><strong>All Queue:</strong> ตั๋วทั้งหมดในระบบ</li>
          <li><strong>My Queue:</strong> ตั๋วที่มอบหมายให้ตนเอง (Assigned to Current User)</li>
          <li><strong>Unassigned:</strong> ตั๋วที่ยังไม่มีเจ้าหน้าที่รับผิดชอบ เพื่อให้ทีมงานกด Claim</li>
        </ul>
      </li>
      <li><strong>Sorting & Pagination:</strong> รองรับการแบ่งหน้าละ 10 รายการ พร้อมปุ่ม Next / Previous และเลขหน้า</li>
      <li><strong>Status & Priority Badges:</strong> แสดงสถานะตั๋วด้วยโทนสีที่สอดคล้องตามมาตรฐาน (Open = ฟ้า, In Progress = เหลืองส้ม, Resolved = เขียว, Closed = เทา)</li>
    </ul>

    <div class="placeholder-box">
      <div class="placeholder-title">[พื้นที่ใส่ภาพหน้าจอ: IT Staff Ticket Queue (All Queue View)]</div>
      <div>แสดงตารางคิวงานภาพรวม พร้อมตัวกรอง หมวดหมู่ ความสำคัญ และปุ่มแบ่งหน้า</div>
    </div>

    <div class="placeholder-box">
      <div class="placeholder-title">[พื้นที่ใส่ภาพหน้าจอ: IT Staff Ticket Queue (Filtered / My Queue)]</div>
      <div>แสดงมุมมองตั๋วที่ถูกกรองเฉพาะ My Queue หรือ Unassigned พร้อม Badge สถานะที่ชัดเจน</div>
    </div>
  </div>

  <!-- ANSWER PART 7 -->
  <div class="part-section">
    <div class="part-banner">
      <h2>Answer Part 7: Working IT Staff Ticket Detail UI</h2>
      <span class="part-points">10 Points</span>
    </div>

    <h3>7.1 การทำงานและการจัดการตั๋วของ IT Staff (Operational Actions)</h3>
    <ul>
      <li><strong>Ticket Claim & Reassign:</strong> IT Staff สามารถกดปุ่ม <strong>"Claim Ticket"</strong> เพื่อรับงานเป็นของตนเองได้ในคลิกเดียว หรือเลือกเปลี่ยนผู้รับผิดชอบงาน (Reassign) ไปยังเพื่อนร่วมทีมคนอื่นผ่าน Dropdown ที่ดึงเฉพาะรายชื่อเจ้าหน้าที่ที่ Active อยู่ในระบบ</li>
      <li><strong>Independent IT Priority Setting:</strong> เจ้าหน้าที่สามารถกำหนดความสำคัญของงาน (IT Priority: <code>LOW</code>, <code>MEDIUM</code>, <code>HIGH</code>, <code>URGENT</code>) ได้อย่างอิสระ โดยไม่กระทบกับ Requested Priority เดิมที่ผู้ใช้ร้องขอมา</li>
      <li><strong>Strict State Transitions:</strong> การเปลี่ยนสถานะตั๋วถูกควบคุมด้วย State Machine ของระบบ (เช่น <code>NEW</code> &rarr; <code>IN_PROGRESS</code> &rarr; <code>RESOLVED</code> &rarr; <code>CLOSED</code>) หากพยายามข้ามสถานะที่ไม่ได้รับอนุญาต ระบบจะปฏิเสธด้วย HTTP 400 Bad Request ทันที</li>
      <li><strong>Public Comments vs. Internal Notes:</strong>
        <ul>
          <li><strong>Public Comments:</strong> แถบสีเขียวอ่อน สำหรับข้อความสื่อสารระหว่างเจ้าหน้าที่กับ Requester เจ้าของตั๋ว</li>
          <li><strong>Internal Notes:</strong> แถบสีเหลืองส้ม (Amber) พร้อมข้อความเตือน <em>"Internal Team Only"</em> สำหรับบันทึกความคืบหน้าทางเทคนิคภายในทีม IT โดยข้อมูลส่วนนี้จะถูกปิดกั้นไม่ให้ Requester มองเห็นทั้งบนหน้าจอและผ่าน API</li>
        </ul>
      </li>
      <li><strong>Requester Resolution Indicator:</strong> รองรับการที่ Requester กดปุ่ม "Problem Appears Resolved" โดยระบบจะแสดงสถานะให้ IT Staff รับทราบ เพื่อดำเนินการตรวจสอบและปิดงาน (Resolve) ตามขั้นตอน</li>
      <li><strong>Attachment Continuity:</strong> ไฟล์แนบเดิมจาก Lab 2 ยังคงสามารถเปิดดูและดาวน์โหลดได้ตามปกติ</li>
    </ul>

    <div class="placeholder-box">
      <div class="placeholder-title">[พื้นที่ใส่ภาพหน้าจอ: IT Staff Ticket Detail &amp; Assignment]</div>
      <div>แสดงหน้าจอรายละเอียดตั๋ว, ปุ่ม Claim/Assign, การปรับ IT Priority และการเปลี่ยนสถานะ</div>
    </div>

    <div class="placeholder-box">
      <div class="placeholder-title">[พื้นที่ใส่ภาพหน้าจอ: Public Comments และ Internal Notes]</div>
      <div>แสดงความแตกต่างทางสายตาระหว่างข้อความสาธารณะ (เขียว) และบันทึกภายในเฉพาะทีม IT (เหลืองส้ม)</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ANSWER PART 8 -->
  <div class="part-section">
    <div class="part-banner">
      <h2>Answer Part 8: Working Administrator User Management UI</h2>
      <span class="part-points">5 Points</span>
    </div>

    <h3>8.1 สรุปฟังก์ชันการทำงานของระบบจัดการผู้ใช้งาน (User Management)</h3>
    <p>
      ระบบจัดการผู้ใช้สำหรับ Administrator ออกแบบตามหลัก Minimalist และ Security-First ตามข้อกำหนด 8.5 ของ Lab:
    </p>
    <ul>
      <li><strong>User List Table:</strong> แสดงรายชื่อผู้ใช้งานทั้งหมดในระบบ พร้อมคอลัมน์: <em>Name, Email, Role, Active Status (Active / Inactive)</em> และปุ่มดำเนินการ (Edit / Reset Password)</li>
      <li><strong>Search & Role Filter:</strong> ค้นหาผู้ใช้ตามชื่อหรืออีเมลได้แบบ Real-time พร้อมตัวกรองเลือกดูเฉพาะ Requester, IT Staff หรือ Administrator</li>
      <li><strong>Create New User Modal:</strong> ฟอร์มสร้างผู้ใช้ใหม่ที่กำหนดสิทธิ์ 1 Role, Email, ชื่อ-นามสกุล, สถานะเริ่มต้น และรหัสผ่านแรกเข้า โดยระบบจะตั้งค่า <code>mustChangePassword = true</code> อัตโนมัติ</li>
      <li><strong>Edit User Details:</strong> แก้ไขชื่อ อีเมล Role และสามารถเปิด/ปิดการใช้งานบัญชี (Activate / Deactivate)</li>
      <li><strong>Reset Initial Password:</strong> ปุมรีเซ็ตรหัสผ่านชั่วคราวให้ผู้ใช้ เพื่อให้ผู้ใช้นำไปล็อกอินและตั้งรหัสผ่านใหม่เอง</li>
    </ul>

    <h3>8.2 กฎความปลอดภัยขั้นสูง (Safety Business Rules Verification)</h3>
    <table>
      <thead>
        <tr>
          <th>Safety Rule</th>
          <th>พฤติกรรมและการป้องกันของระบบ</th>
          <th>ผลการทดสอบ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>BR-08: Self-Deactivation Prevention</strong></td>
          <td>ห้ามมิให้ Administrator ทำการ Deactivate บัญชีตนเองที่กำลังล็อกอินอยู่ โดยบน UI จะปิดสวิตช์ toggle ไม่ให้กด และฝั่ง Backend จะตรวจสอบ <code>currentUserId === targetUserId</code> หากตรวจพบจะตอบกลับด้วย <strong>HTTP 400 "Cannot deactivate your own account"</strong></td>
          <td><span class="badge badge-pass">PASS (API-11)</span></td>
        </tr>
        <tr>
          <td><strong>BR-09: Last Admin Protection</strong></td>
          <td>ระบบจะนับจำนวน Active Administrator เสมอ หากมีเหลือเพียง 1 คน ระบบจะไม่อนุญาตให้ทำการ Deactivate หรือปรับลด Role เป็นบทบาทอื่น โดย Backend จะปฏิเสธด้วย <strong>HTTP 400 "Cannot deactivate or demote the last active Administrator"</strong></td>
          <td><span class="badge badge-pass">PASS (API-12)</span></td>
        </tr>
        <tr>
          <td><strong>Role-Based Access Enforcement</strong></td>
          <td>หากผู้ใช้ทั่วไป (Requester หรือ IT Staff) พยายามเข้าถึง URL <code>/admin</code> หรือส่ง Request ไปยัง <code>/api/admin/*</code> ระบบจะทำการ Redirect ออก และตอบกลับด้วย <strong>HTTP 403 Forbidden</strong> ทันที</td>
          <td><span class="badge badge-pass">PASS (AC-03)</span></td>
        </tr>
      </tbody>
    </table>

    <div class="placeholder-box">
      <div class="placeholder-title">[พื้นที่ใส่ภาพหน้าจอ: Administrator User Management Screen]</div>
      <div>แสดงตารางรายชื่อผู้ใช้งานทั้งหมด พร้อม Badge สิทธิ์ และปุ่ม Edit / Reset Password</div>
    </div>

    <div class="placeholder-box">
      <div class="placeholder-title">[พื้นที่ใส่ภาพหน้าจอ: Modals (Create User / Edit / Reset Password)]</div>
      <div>แสดง Modal ฟอร์มสร้างผู้ใช้ใหม่ และข้อความแจ้งเตือนความปลอดภัยเมื่อพยายาม Deactivate ตนเอง</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ANSWER PART 9 -->
  <div class="part-section">
    <div class="part-banner">
      <h2>Answer Part 9: Zen Green UI and Responsive Evidence</h2>
      <span class="part-points">5 Points</span>
    </div>

    <p>
      ลิงก์ไฟล์ข้อกำหนดการออกแบบส่วนต่อประสาน: <a href="https://github.com/thitigant/toktickit/blob/main/docs/lab-03/ui-spec.md"><code>docs/lab-03/ui-spec.md</code></a>
    </p>

    <h3>9.1 สรุปพาเลทสีและระบบโทเคนการออกแบบ (Zen Green Design Tokens)</h3>
    <table>
      <thead>
        <tr>
          <th>Token Name</th>
          <th>Hex Code</th>
          <th>บทบาทการใช้งานในระบบ (Context &amp; Usage)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Primary Dark</strong></td>
          <td><code>#064e3b</code> / <code>#065f46</code></td>
          <td>ส่วนหัวของแอปพลิเคชัน (App Header), แถบหัวข้อตาราง, ส่วนเน้นสำคัญ</td>
        </tr>
        <tr>
          <td><strong>Primary Emerald</strong></td>
          <td><code>#059669</code> / <code>#10b981</code></td>
          <td>ปุ่ม Primary Action (Save, Claim, Submit), Active Navigation Item, จุดเน้นสายตา</td>
        </tr>
        <tr>
          <td><strong>Pale Mint Green</strong></td>
          <td><code>#f0fdf4</code> / <code>#dcfce7</code></td>
          <td>พื้นหลังแถวที่ถูกเลือก (Selected Row), กรอบข้อความสาธารณะ (Public Comments)</td>
        </tr>
        <tr>
          <td><strong>Operational Amber</strong></td>
          <td><code>#fffbeb</code> / <code>#fef3c7</code></td>
          <td>แถบข้อความบันทึกภายในเฉพาะทีม IT (Internal Notes), สถานะ In Progress</td>
        </tr>
        <tr>
          <td><strong>Neutral Canvas</strong></td>
          <td><code>#ffffff</code> / <code>#f8fafc</code></td>
          <td>พื้นหลังหลักของหน้าจอ, การ์ดแสดงผลข้อมูล (Cards), กล่องข้อความ</td>
        </tr>
        <tr>
          <td><strong>Charcoal Text</strong></td>
          <td><code>#0f172a</code> / <code>#334155</code></td>
          <td>ข้อความเนื้อหาหลัก เพื่อความคมชัดสูง สบายตา และอ่านง่ายตามเกณฑ์ Contrast</td>
        </tr>
      </tbody>
    </table>

    <h3>9.2 การรองรับการแสดงผลบนอุปกรณ์ขนาดต่างๆ (Responsive Breakpoints)</h3>
    <ul>
      <li><strong>Desktop View (> 1024px):</strong> แสดงผลตารางคิวงานและตารางผู้ใช้แบบเต็มคอลัมน์, แถบตัวกรองวางแนวนอน, Modal อยู่กึ่งกลางหน้าจออย่างสมดุล</li>
      <li><strong>Tablet View (768px &ndash; 1023px):</strong> ตารางรองรับการเลื่อนแนวนอนแบบ Smooth Horizontal Scroll, ตัวกรองจัดเรียงเป็น 2 คอลัมน์, Header ยุบแถบโปรไฟล์ให้กะทัดรัด</li>
      <li><strong>Mobile View (&lt; 768px):</strong> แปลงตารางเป็น Card-Based Layout, ปุ่มกดขนาดไม่ต่ำกว่า 44px ตามมาตรฐาน Touch Target, ฟอร์มแสดงผลเต็มความกว้างจอโดยไม่มีเนื้อหาล้นจอ (No Horizontal Overflow)</li>
    </ul>

    <div class="placeholder-box">
      <div class="placeholder-title">[พื้นที่ใส่ภาพหน้าจอ: Responsive Layout (Desktop, Tablet, Mobile)]</div>
      <div>แสดงการจัดวางหน้าจอที่ตอบสนองต่อขนาดหน้าจอ Desktop (1440px), Tablet (768px) และ Mobile (375px)</div>
    </div>

    <h3>9.3 แบบประเมินความสมบูรณ์ด้าน Visual & Accessibility (Quality Checklist)</h3>
    <table>
      <thead>
        <tr>
          <th>หัวข้อการตรวจประเมิน</th>
          <th>เกณฑ์และมาตรฐานที่กำหนด</th>
          <th>ผลการประเมิน</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Design Consistency</strong></td>
          <td>ทุกหน้าจอใช้ตัวแปร CSS และโทนสี Zen Green ชุดเดียวกัน 100%</td>
          <td><span class="badge badge-pass">✔ PASS</span></td>
        </tr>
        <tr>
          <td><strong>Role Navigation</strong></td>
          <td>แสดงเฉพาะเมนูที่สิทธิ์ของผู้ใช้นั้นเข้าถึงได้ ไม่มีเมนูที่กดแล้วติด 403 ค้างไว้</td>
          <td><span class="badge badge-pass">✔ PASS</span></td>
        </tr>
        <tr>
          <td><strong>Consistent Badges</strong></td>
          <td>Badge ของ Status, IT Priority และ Role มีสีและรูปลักษณ์สม่ำเสมอทุกหน้าจอ</td>
          <td><span class="badge badge-pass">✔ PASS</span></td>
        </tr>
        <tr>
          <td><strong>Field States</strong></td>
          <td>แยกความแตกต่างระหว่างฟิลด์ที่แก้ไขได้ (กรอบขาว) กับ Read-only (พื้นเทา) ชัดเจน</td>
          <td><span class="badge badge-pass">✔ PASS</span></td>
        </tr>
        <tr>
          <td><strong>Validation Placement</strong></td>
          <td>ข้อความแจ้งเตือน Error ปรากฏใต้ฟิลด์นั้นๆ ทันที พร้อมไอคอนเตือนชัดเจน</td>
          <td><span class="badge badge-pass">✔ PASS</span></td>
        </tr>
        <tr>
          <td><strong>Focus & Keyboard Navigation</strong></td>
          <td>มี Focus Ring สีเขียวมรกตชัดเจนเมื่อกดปุ่ม Tab รองรับการเข้าถึงของผู้พิการ</td>
          <td><span class="badge badge-pass">✔ PASS</span></td>
        </tr>
        <tr>
          <td><strong>No Clipping / Overflow</strong></td>
          <td>ไม่มีข้อความถูกตัดขาด และไม่มีการเลื่อนออกนอกกรอบแนวนอนในมุมมองมือถือ</td>
          <td><span class="badge badge-pass">✔ PASS</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div>TokTickIT &mdash; Lab 3 Sprint Engineering Report (Part 1 - Part 9 Complete)</div>
    <div>CPE 334 Software Engineering in the Age of AI Agents &bull; KMUTT</div>
  </div>

</div>

</body>
</html>
"""

    # Write HTML file
    html_path = os.path.abspath("docs/lab-03/Lab_03_Report.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Written HTML report to {html_path}")

    # Generate PDF using Chrome / Edge headless
    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    ]
    
    browser_exe = None
    for p in chrome_paths:
        if os.path.exists(p):
            browser_exe = p
            break

    if not browser_exe:
        print("ERROR: No Chrome or Edge found to render PDF!")
        sys.exit(1)

    print(f"Using browser for PDF render: {browser_exe}")
    pdf_out_path = os.path.abspath("docs/lab-03/Lab_03_Report.pdf")
    temp_profile = os.path.abspath(".temp-chrome-profile")
    os.makedirs(temp_profile, exist_ok=True)

    cmd = [
        browser_exe,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        f"--user-data-dir={temp_profile}",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_out_path}",
        f"file:///{html_path.replace(os.sep, '/')}"
    ]

    print("Running command:", " ".join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    print("Return code:", res.returncode)
    if os.path.exists(pdf_out_path):
        size_kb = os.path.getsize(pdf_out_path) / 1024
        print(f"SUCCESS: Generated PDF at {pdf_out_path} ({size_kb:.1f} KB)")
    else:
        print(f"ERROR: PDF was not generated. Stderr: {res.stderr}")

if __name__ == "__main__":
    build_lab3_report()
