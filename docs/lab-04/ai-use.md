# Lab 4 AI Use & Reflection — TokTickIT Sprint 4

## LLM Models Used
- **Specification & Coding Agent**: Gemini 3.8 Flash / Antigravity AI Agentic Assistant.

---

## Key Selected Prompts (Planned 6–10 Prompts)

1. **Prompt 1 (Handout Analysis & Sprint 4 Roadmap):**
   > "ช่วยอ่านไฟล์แลป 4 และอธิบายหน่อยว่าแลปนี้ต้องทำอะไรบ้าง"
   - *Purpose*: วิเคราะห์เอกสารข้อกำหนด Lab 4 อย่างละเอียด สรุปขอบเขตงาน (Actions Taken, Ticket Workflow, Dashboards, Final Regression) และข้อกำหนดคะแนน 9 ส่วน (60 คะแนน).

2. **Prompt 2 (Git Branch Flow & Staging Setup):**
   > "ขั้นตอนแรกต้องทำอะไร และช่วยทำขั้นตอนที่ 1 ให้เลยได้ไหม"
   - *Purpose*: เตรียมความพร้อม Git repository, จัดการ commit งานเก่าของ Lab 3, สร้าง `lab4-staging` แตกออกจาก `main` และเปิด feature branch `feature/lab4-specs`.

3. **Prompt 3 (Spec DD — Engineering Contract Generation):**
   > "สร้างเอกสารสเปก docs/lab-04/ ได้แก่ specification.md, api-spec.md, ui-spec.md, tests.md, reviewer.md, ai-use.md ให้ครบถ้วนตามข้อกำหนด Lab 4"
   - *Purpose*: กำหนด Functional Requirements (FR-01 to FR-13), Business Rules (BR-01 to BR-10), Status Transition Matrix, Database Schema Justifications, และ Acceptance Criteria (AC-01 to AC-12).

4. **Prompt 4 (Database Schema & Actions Taken Model):**
   > *(Planned)* "อัปเดต Prisma schema เพิ่มโมเดล ActionTaken พร้อม Relation, Foreign keys, และ Indexes ตามสเปก พร้อมเขียน Idempotent seed data"
   - *Purpose*: สร้าง Parent-child work structure และเตรียมข้อมูลทดสอบที่มี 0, 1, และหลาย Actions Taken.

5. **Prompt 5 (Actions Taken & Dashboard REST APIs):**
   > *(Planned)* "สร้าง REST API endpoints สำหรับ Actions Taken (/api/tickets/:id/actions-taken) และ Dashboards (/api/dashboards/staff, /api/dashboards/requester) พร้อมการ Validate และ Concurrency conflict check"
   - *Purpose*: พัฒนา Backend routes, controllers, middleware, และ test suites.

6. **Prompt 6 (Zen Green UI Components & Dashboards):**
   > *(Planned)* "สร้าง React UI สำหรับ IT Staff Dashboard, Requester Dashboard และส่วน Actions Taken ใน Ticket Detail ตาม Zen Green design language และ Accessibility standards"
   - *Purpose*: สร้าง Metric cards, Drill-down navigation, และ Create/Edit Action Taken modal/inline form.

7. **Prompt 7 (Ticket Workflow & Stale Update Protection):**
   > *(Planned)* "เชื่อมโยง Ticket status transitions ให้ตรงตาม Matrix และจัดการ HTTP 409 Conflict เมื่อมีการแก้ไขชนกัน"
   - *Purpose*: บังคับใช้ Resolution Gate และความถูกต้องของสถานะ Ticket.

8. **Prompt 8 (Comprehensive Regression & E2E Testing):**
   > *(Planned)* "รันการทดสอบ Unit, API, UI และสร้าง Playwright E2E tests สำหรับ Sprint 4 พร้อมตรวจสอบว่าการทำงานของ Lab 1–3 ไม่พัง"
   - *Purpose*: ป้องกันข้อผิดพลาดแบบ Regression และเตรียมหลักฐานการทดสอบทั้งหมด 100%.

---

## My Reflection

การนำ AI Agent (Antigravity with Gemini 3.8 Flash) มาประยุกต์ใช้ใน Sprint 4 นี้:
- **Specification-Agent Capabilities**: การให้ AI ช่วยวิเคราะห์ Handout และสังเคราะห์ออกมาเป็น Engineering Contract (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`) ช่วยประหยัดเวลาอย่างมหาศาล และทำให้แน่ใจว่าเงื่อนไขที่ซับซ้อน เช่น Parent-child relations, State Transition Matrix, Concurrency handling และ Dashboard aggregations ถูกนิยามไว้อย่างชัดเจน รัดกุม ครบถ้วนก่อนเขียนโค้ดจริง
- **Traceability & Rigor**: AI ช่วยสร้างตาราง Traceability Matrix ที่เชื่อมโยงระหว่าง Acceptance Criteria (AC) ไปยัง Automated Test File แต่ละไฟล์โดยตรง ทำให้กระบวนการพัฒนาเป็นไปตามหลัก Test-Driven Development (TDD) อย่างแท้จริง
- **Consistency**: การอ้างอิง Design Tokens จาก Lab 2 และ 3 ทำให้ UI ใหม่ในแลปนี้ยังคงเอกลักษณ์ของ Zen Green Design System ได้อย่างกลมกลืน ไร้รอยต่อ
