# Lab 3 AI Use & Reflection — TokTickIT Sprint 3

## LLM Models Used
- **Primary Coding & Specification Agent**: Gemini 3.6 Flash / Claude Opus 4.6 via Antigravity AI Agentic Assistant.

## Key Selected Prompts (6 Prompts)

1. **Prompt 1 (Specification & Architecture)**:
   > "ช่วยออกแบบ Specification และ Data Model Migration สำหรับ Lab 3 รองรับ Role: Requester, IT_STAFF, ADMINISTRATOR พร้อมระบบ Authentication และ Password Hashing"

2. **Prompt 2 (Authentication Foundation & JWT Middleware)**:
   > "Implement authentication controller, JWT middleware, และ API endpoints /api/auth/login, /api/auth/me, /api/auth/change-password พร้อม Test suites"

3. **Prompt 3 (IT Staff Queue & Filters)**:
   > "สร้าง IT Staff Ticket Queue API (GET /api/staff/tickets) รองรับ search, category filter, priority filter, status filter และ pagination พร้อม Component StaffTicketQueue.tsx ธีม Zen Green"

4. **Prompt 4 (Ticket Detail & Operational Actions)**:
   > "Implement Ticket Assignment, IT Priority update, Status workflow transition rules, Public Comments, และ Internal Notes สำหรับ IT Staff"

5. **Prompt 5 (Admin User Management & Safety Rules)**:
   > "Implement Admin User Management APIs และ UserManagement.tsx component รองรับ Create User, Edit User, Reset Password พร้อม Safety rules ป้องกัน self-deactivation และป้องกันการ demote/deactivate last active Admin"

6. **Prompt 6 (Peer Review & Release Integration)**:
   > "ช่วยสร้าง Pull Request และสเปกเอกสารสำหรับส่ง Lab 3 รวมถึง docs/lab-03/ สเปก และการรวมสาขา lab3-staging เข้า main"

---

## My Reflection

การใช้ AI Agent ใน Lab 3 ช่วยเพิ่มประสิทธิภาพในหลากหลายมิติ:
- **Speed & Precision**: ช่วยออกแบบและ Implement REST APIs ที่มีการตรวจสอบความปลอดภัย (Role-Based Authorization) และเขียน Unit/Integration Tests ครบทุก Scenario อย่างรวดเร็ว
- **Architectural Safety**: AI ช่วยตรวจสอบและปฏิบัติตาม Safety Business Rules เช่น การป้องกันไม่ให้ Administrator Deactivate บัญชีตัวเอง หรือการป้องกันการลบบทบาท Admin คนสุดท้ายในระบบ
- **UI Consistency**: การใช้ Design Tokens ธีม Zen Green ร่วมกับ Reusable Components ช่วยให้หน้าจอ Login, Queue, Ticket Detail และ User Management มีความสม่ำเสมอและสวยงามระดับส่วนประสานผู้ใช้งานสมัยใหม่
