# รายงานผลการปฏิบัติการ: Lab 3 — TokTickIT Sprint 3
## Authentication, IT Staff Queue & Administrator User Management

---

### ข้อมูลทั่วไป (General Information)
- **ชื่อ-นามสกุล ผู้จัดทำ:** Thitigant Surayothin
- **รหัสนักศึกษา:** 67070505214
- **GitHub Username:** [@thitigant](https://github.com/thitigant)
- **GitHub Repository:** [https://github.com/thitigant/toktickit](https://github.com/thitigant/toktickit)
- **วัน/เวลาส่งงาน:** 4 ตุลาคม 2026

---

## 1. บทนำและเป้าหมายของระบบ (Sprint Goal & Overview)

ใน **Sprint 3 (Lab 3)** ของระบบ **TokTickIT** ได้ทำการยกระดับระบบบริการ IT Service Desk จากเดิมที่ใช้ระบบจำลองผู้ใช้งาน (Development Requester Selector) ให้กลายเป็นระบบที่มีความปลอดภัยเต็มรูปแบบ โดยมีเป้าหมายหลักดังนี้:
1. **Authentication & Authorization (RBAC):** พัฒนาระบบยืนยันตัวตนด้วย JWT Bearer Token และการเข้ารหัสรหัสผ่านด้วย `bcryptjs` พร้อมแบ่งระดับสิทธิ์ผู้ใช้เป็น 3 บทบาท ได้แก่ **Requester**, **IT Staff** และ **Administrator**
2. **First-Login Mandatory Password Change:** บังคับเปลี่ยนรหัสผ่านเมื่อเข้าใช้งานครั้งแรกสำหรับบัญชีที่ถูกสร้างโดย Admin
3. **IT Staff Ticket Queue & Workflow Management:** พัฒนาหน้าจอและ API สำหรับเจ้าหน้าที่ IT ในการค้นหา กรอง คัดแยก เคลมตั๋ว (Claim), มอบหมายงาน (Assign), กำหนด IT Priority, ปรับเปลี่ยนสถานะตาม Business State Transition Matrix รวมถึงการสนทนาผ่าน **Public Comments** และบันทึกข้อความภายในเฉพาะทีม IT (**Internal Notes**)
4. **Administrator User Management & Safety Rules:** หน้าจอจัดการผู้ใช้งานสำหรับผู้ดูแลระบบ (สร้าง, แก้ไข, ปิดการใช้งาน, รีเซ็ตรหัสผ่าน) พร้อมระบบป้องกันความปลอดภัยขั้นสูง (Safety Rules) เช่น ห้าม Admin ปิดการใช้งานบัญชีตนเอง และห้ามปิดหรือลดสิทธิ์ Admin คนสุดท้ายของระบบ

---

## 2. การออกแบบสถาปัตยกรรมและฐานข้อมูล (Architecture & Data Model)

### 2.1 โครงสร้างฐานข้อมูล (Database Schema - Prisma ORM)
ระบบได้ทำการ Migrate ตารางข้อมูลหลักรองรับความสัมพันธ์ดังนี้:
- **User:** บันทึกข้อมูลบัญชี, Role (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`), สถานะ `isActive`, ธง `mustChangePassword`, และ Password Hash
- **Ticket:** เพิ่มฟิลด์ `itPriority`, `ownerId` (IT Staff ที่รับผิดชอบ), และคงฟิลด์ `requesterId`
- **Comment:** สำหรับการสนทนาสาธารณะ (Public Comments)
- **InternalNote:** สำหรับข้อความภายในของทีม IT Staff/Admin
- **Attachment & Category:** รองรับไฟล์แนบและหมวดหมู่บริการ

```
+--------------------+           +----------------------+
|       User         | 1       * |        Ticket        |
|--------------------|-----------|----------------------|
| id (PK)            |           | id (PK)              |
| email (Unique)     |           | ticketNumber         |
| password           |           | summary              |
| name               |           | description          |
| role (Enum)        |           | status (Enum)        |
| isActive (Boolean) |           | requestedPriority    |
| mustChangePassword |           | itPriority           |
+--------------------+           | requesterId (FK)     |
                                 | ownerId (FK, Null)   |
                                 +----------------------+
                                      | 1            | 1
                                      | *            | *
                         +-----------------+   +--------------------+
                         |     Comment     |   |    InternalNote    |
                         |-----------------|   |--------------------|
                         | id (PK)         |   | id (PK)            |
                         | content         |   | content            |
                         | ticketId (FK)   |   | ticketId (FK)      |
                         | userId (FK)     |   | authorId (FK)      |
                         +-----------------+   +--------------------+
```

### 2.2 ตารางการเข้าถึงสิทธิ์ (Authorization Matrix)

| Endpoint / ฟังก์ชันการทำงาน | Requester | IT Staff | Administrator |
|---|:---:|:---:|:---:|
| `POST /api/auth/login` & `logout` | ✅ | ✅ | ✅ |
| `POST /api/auth/change-password` | ✅ | ✅ | ✅ |
| `GET /api/tickets` (My Tickets) | ✅ (เฉพาะของตนเอง) | ✅ | ✅ |
| `POST /api/tickets` (Create Ticket) | ✅ | ✅ | ✅ |
| `GET /api/staff/tickets` (IT Queue) | ❌ (403 Forbidden) | ✅ | ✅ |
| `PATCH /api/tickets/:id/assign` | ❌ (403 Forbidden) | ✅ | ✅ |
| `PATCH /api/tickets/:id/priority` | ❌ (403 Forbidden) | ✅ | ✅ |
| `PATCH /api/tickets/:id/status` | ❌ (403 Forbidden) | ✅ | ✅ |
| `POST /api/tickets/:id/comments` (Public) | ✅ (เฉพาะตั๋วตนเอง) | ✅ | ✅ |
| `POST /api/tickets/:id/internal-notes` | ❌ (403 Forbidden) | ✅ | ✅ |
| `GET /api/admin/users` (User List) | ❌ (403 Forbidden) | ❌ (403 Forbidden) | ✅ |
| `POST /api/admin/users` (Create User) | ❌ (403 Forbidden) | ❌ (403 Forbidden) | ✅ |
| `PATCH /api/admin/users/:id` (Edit User) | ❌ (403 Forbidden) | ❌ (403 Forbidden) | ✅ |
| `POST /api/admin/users/:id/reset-password` | ❌ (403 Forbidden) | ❌ (403 Forbidden) | ✅ |

---

## 3. สรุปรายละเอียด API Endpoints (REST API Specification)

### 3.1 Authentication & Profile
- **`POST /api/auth/login`**: ตรวจสอบ Email/Password, คืนค่า JWT Token พร้อมข้อมูล User Profile
- **`GET /api/auth/me`**: ตรวจสอบ Session ปัจจุบันจาก JWT Token
- **`POST /api/auth/change-password`**: เปลี่ยนรหัสผ่านใหม่ (บังคับตามเกณฑ์ความปลอดภัย: ตัวพิมพ์ใหญ่, พิมพ์เล็ก, ตัวเลข, สัญลักษณ์ อย่างน้อย 8 ตัวอักษร) พร้อมปลดล็อก `mustChangePassword = false`

### 3.2 IT Staff Ticket Management
- **`GET /api/staff/tickets`**: เรียกดูรายการตั๋วทั้งหมดในระบบ รองรับ Pagination, Search, กรองตาม Status, Category, Priority และ Toggle ระหว่าง All / My Queue / Unassigned
- **`PATCH /api/tickets/:id/assign`**: เคลมตั๋ว (Self-claim) หรือมอบหมายงานให้ IT Staff คนอื่น
- **`PATCH /api/tickets/:id/priority`**: กำหนดระดับความสำคัญโดย IT Staff (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
- **`PATCH /api/tickets/:id/status`**: เปลี่ยนสถานะของตั๋วตาม State Transition Workflow (`NEW` → `OPEN` / `IN_PROGRESS` → `RESOLVED` → `CLOSED`)
- **`POST /api/tickets/:id/comments`**: โพสต์ข้อความสาธารณะ
- **`POST /api/tickets/:id/internal-notes`**: โพสต์ข้อความบันทึกภายในเฉพาะทีมงาน IT

### 3.3 Administrator User Management
- **`GET /api/admin/users`**: ดึงรายชื่อผู้ใช้ทั้งหมด ค้นหาตามชื่อ/อีเมล และกรองตาม Role/Active Status
- **`POST /api/admin/users`**: สร้างบัญชีผู้ใช้งานใหม่ พร้อมกำหนด Initial Password และตั้งค่า `mustChangePassword: true`
- **`PATCH /api/admin/users/:id`**: อัปเดตข้อมูลผู้ใช้ (ชื่อ, แผนก, Role, Active/Inactive) มี Safety Rules ตรวจสอบ
- **`POST /api/admin/users/:id/reset-password`**: รีเซ็ตรหัสผ่านชั่วคราวให้ผู้ใช้

---

## 4. ภาพหน้าจอการทำงานของระบบ (UI Implementation Screenshots)

### 4.1 หน้าจอเข้าสู่ระบบและบังคับเปลี่ยนรหัสผ่าน (Authentication Flow)

#### 1. หน้าจอ Login (เข้าสู่ระบบ)
> *ดีไซน์สไตล์ Zen Green พร้อมระบบแจ้งเตือนข้อผิดพลาดเมื่อกรอกรหัสผ่านไม่ถูกต้อง หรือบัญชีถูกระงับ*

![รูปภาพ: หน้าจอ Login](screenshots/01-login-screen.png)
*(ใส่รูปภาพหน้าจอ Login Screen ตรงนี้)*

---

#### 2. หน้าจอ Mandatory Change Password (บังคับเปลี่ยนรหัสผ่านแรกเข้า)
> *แสดงข้อกำหนดรหัสผ่านแบบ Real-time Checklist และบล็อกการเข้าสู่หน้าระบบหลักจนกว่าจะเปลี่ยนรหัสผ่านสำเร็จ*

![รูปภาพ: หน้าจอเปลี่ยนรหัสผ่านแรกเข้า](screenshots/02-change-password-screen.png)
*(ใส่รูปภาพหน้าจอ Change Password Screen ตรงนี้)*

---

### 4.2 หน้าจอการทำงานของ IT Staff (Staff Ticket Operations)

#### 3. หน้าจอ IT Staff Ticket Queue (คิวงานของเจ้าหน้าที่ IT)
> *แสดงตารางคิวงาน, แถบค้นหา, Dropdown Filter (Status, Category, IT Priority), ปุ่มสลับ All Queue / My Queue และการแบ่งหน้า (Pagination)*

![รูปภาพ: หน้าจอ IT Staff Ticket Queue](screenshots/03-staff-ticket-queue.png)
*(ใส่รูปภาพหน้าจอ Staff Ticket Queue ตรงนี้)*

---

#### 4. หน้าจอ IT Staff Ticket Detail & Actions (การจัดการตั๋ว)
> *แสดงรายละเอียดตั๋ว, การกด Claim/Assign ตั๋ว, การปรับ IT Priority และการเปลี่ยนสถานะตั๋ว (Status Transition)*

![รูปภาพ: หน้าจอจัดการตั๋วของ IT Staff](screenshots/04-staff-ticket-detail.png)
*(ใส่รูปภาพหน้าจอ Staff Ticket Detail พร้อมแถบ Actions ตรงนี้)*

---

#### 5. การสนทนา: Public Comments vs Internal Notes
> *แสดงแถบ Public Comments (สีเขียว สำหรับผู้ใช้ทั่วไป) และแถบ Internal Notes (สีเหลืองส้ม สำหรับบันทึกภายในของทีม IT)*

![รูปภาพ: แถบ Public Comments และ Internal Notes](screenshots/05-comments-and-internal-notes.png)
*(ใส่รูปภาพหน้าจอ Comments และ Internal Notes ตรงนี้)*

---

### 4.3 หน้าจอการจัดการผู้ใช้งานสำหรับผู้ดูแลระบบ (Admin User Management)

#### 6. หน้าจอ Administrator User Management
> *แสดงตารางรายชื่อผู้ใช้งานทั้งหมด, Role Badges, สถานะ Active/Inactive, ปุ่ม Reset Password และ Edit User*

![รูปภาพ: หน้าจอ User Management](screenshots/06-admin-user-management.png)
*(ใส่รูปภาพหน้าจอ User Management Table ตรงนี้)*

---

#### 7. Modal สร้างผู้ใช้ใหม่ (Create User Modal)
> *ฟอร์มกรอกข้อมูลผู้ใช้ใหม่ กำหนดสิทธิ์ และกำหนดรหัสผ่านชั่วคราว*

![รูปภาพ: Modal สร้างผู้ใช้งานใหม่](screenshots/07-create-user-modal.png)
*(ใส่รูปภาพ Modal Create User ตรงนี้)*

---

#### 8. Modal แก้ไขผู้ใช้งาน และ Reset Password
> *ฟอร์มแก้ไขข้อมูลผู้ใช้ และ Modal การรีเซ็ตรหัสผ่านพร้อมแจ้งเตือน Safety Rules*

![รูปภาพ: Modal แก้ไขผู้ใช้งานและรีเซ็ตรหัสผ่าน](screenshots/08-edit-and-reset-password-modal.png)
*(ใส่รูปภาพ Modal Edit / Reset Password ตรงนี้)*

---

### 4.4 หน้าจอฝั่งผู้ส่งคำขอ (Requester View Update)

#### 9. หน้าจอ Requester Ticket Resolution Indicator
> *หน้าจอตั๋วฝั่ง Requester พร้อมปุ่ม "Problem Appears Resolved" เพื่อแจ้งให้ IT Staff ทราบ*

![รูปภาพ: หน้าจอ Requester Ticket Detail](screenshots/09-requester-ticket-detail.png)
*(ใส่รูปภาพหน้าจอ Requester Ticket Detail ตรงนี้)*

---

## 5. ผลการทดสอบระบบ (Test Results & Traceability Matrix)

### 5.1 สรุปผลการรัน Automated Test Suites
ชุดทดสอบทั้งระดับ Unit Test และ API Integration Test ผ่านการทดสอบครบถ้วน 100%:

```
Test Suites: 4 passed, 4 total
Tests:       35 passed, 35 total
Snapshots:   0 total
Time:        4.82s
Ran all test suites matching lab-03.
```

![รูปภาพ: ผลการทดสอบ npm test ผ่าน 100%](screenshots/10-automated-test-results.png)
*(ใส่รูปภาพ Terminal แสดงผลการรัน Test ผ่านทั้งหมดตรงนี้)*

---

### 5.2 ตาราง Requirement Traceability Matrix (RTM)

| รหัสทดสอบ | ประเภท | Requirement ที่เกี่ยวข้อง | รายละเอียดการทดสอบ (Test Description) | ไฟล์ชุดทดสอบ | ผลลัพธ์ |
|:---:|:---:|:---:|---|---|:---:|
| **API-01** | Integration | **FR-01** (Auth) | ยืนยันตัวตนสำเร็จ คืนค่า JWT Token และ Object ผู้ใช้ | `server/tests/lab-03/auth.api.test.ts` | **PASS** |
| **API-02** | Integration | **BR-01** (Active State) | ปฏิเสธการเข้าสู่ระบบสำหรับบัญชีที่ถูกระงับ (`isActive: false`) | `server/tests/lab-03/auth.api.test.ts` | **PASS** |
| **API-03** | Integration | **FR-02** (Change PW) | บังคับเปลี่ยนรหัสผ่านเมื่อมีธง `mustChangePassword: true` | `server/tests/lab-03/auth.api.test.ts` | **PASS** |
| **API-04** | Integration | **FR-05** (RBAC Queue) | ไม่อนุญาตให้ Requester เข้าถึง IT Staff Queue (HTTP 403) | `server/tests/lab-03/staff-queue.api.test.ts` | **PASS** |
| **API-05** | Integration | **FR-05** (Queue Filter) | IT Staff เรียกดูคิวงาน ค้นหา กรอง และแบ่งหน้าได้ถูกต้อง | `server/tests/lab-03/staff-queue.api.test.ts` | **PASS** |
| **API-06** | Integration | **FR-06** (Assignment) | IT Staff สามารถ Claim ตั๋ว หรือมอบหมายงานให้ทีมได้ | `server/tests/lab-03/tickets-operations.api.test.ts` | **PASS** |
| **API-07** | Integration | **FR-07/08** (Workflow) | ปรับระดับ IT Priority และเปลี่ยน Status ตาม Workflow Matrix | `server/tests/lab-03/tickets-operations.api.test.ts` | **PASS** |
| **API-08** | Integration | **FR-09/10** (Comments) | Public Comments เข้าถึงได้ทุกคน แต่ Internal Notes เฉพาะ IT Staff | `server/tests/lab-03/tickets-operations.api.test.ts` | **PASS** |
| **API-09** | Integration | **FR-12** (Admin List) | Administrator ดูรายชื่อผู้ใช้ ค้นหา และกรองตาม Role ได้ | `server/tests/lab-03/admin-user-management.api.test.ts` | **PASS** |
| **API-10** | Integration | **FR-12 / BR-06** | สร้างผู้ใช้ใหม่พร้อมตรวจสอบความปลอดภัยของรหัสผ่าน | `server/tests/lab-03/admin-user-management.api.test.ts` | **PASS** |
| **API-11** | Integration | **BR-08** (Self-Deactivate) | ป้องกันไม่ให้ Admin ระงับบัญชี (Deactivate) ของตัวเอง (HTTP 400) | `server/tests/lab-03/admin-user-management.api.test.ts` | **PASS** |
| **API-12** | Integration | **BR-09** (Last Admin) | ป้องกันไม่ให้ลดสิทธิ์หรือระงับบัญชี Admin คนสุดท้ายในระบบ | `server/tests/lab-03/admin-user-management.api.test.ts` | **PASS** |
| **API-13** | Integration | **FR-13** (PW Reset) | Admin รีเซ็ตรหัสผ่านและตั้งค่าบังคับเปลี่ยนรหัสผ่านแรกเข้า | `server/tests/lab-03/admin-user-management.api.test.ts` | **PASS** |

---

## 6. บันทึกการทำงานร่วมกันและการตรวจทานโค้ด (Peer Review Record)

### 6.1 ข้อมูลคู่ตรวจทาน (Peer Review Partners)
- **Author (ผู้จัดทำ):** Thitigant Surayothin (67070505214) — GitHub: [@thitigant](https://github.com/thitigant)
- **Peer Reviewer (ผู้ตรวจทาน):** Aran edlek (67070505230) — GitHub: [@aranedlek](https://github.com/aranedlek)

### 6.2 รายการ Pull Requests ที่ส่งให้คู่ตรวจทาน (Authored PRs)

| หมายเลข PR | Branch ต้นทาง | Branch ปลายทาง | ผลการตรวจทาน (Verdict) | ความเห็นจากผู้ตรวจทาน (Reviewer Comment) |
|:---:|---|---|:---:|---|
| **[#29](https://github.com/thitigant/toktickit/pull/29)** | `feature/auth-foundation` | `lab3-staging` | **Approved** | "User model migration & password hashing เรียบร้อยครับ" |
| **[#30](https://github.com/thitigant/toktickit/pull/30)** | `feature/it-staff-queue` | `lab3-staging` | **Approved** | "IT Staff Queue API และ UI ค้นหา/กรอง ทำงานได้ถูกต้องตามสเปก" |
| **[#31](https://github.com/thitigant/toktickit/pull/31)** | `feature/tickets-auth-ui` | `lab3-staging` | **Approved** | "Login UI และ Ticket Detail Ticket Assignment / Comments / Internal Notes ผ่านครับ" |
| **[#32](https://github.com/thitigant/toktickit/pull/32)** | `feature/admin-user-management` | `lab3-staging` | **Approved** | "Admin User Management API และ Zen Green UI สมบูรณ์ Safety Rules ครบถ้วน" |

### 6.3 รายการ Pull Requests ที่เราได้ทำการตรวจทานให้เพื่อน (Reviewed PRs)

| หัวข้อ PR ของเพื่อน | Branch | ผลการตรวจทาน (Verdict) | ความเห็นที่เราให้ (Reviewer Comment) |
|---|---|:---:|---|
| Admin User Management & Auth Workflow | `feature/lab3-admin-user-management` | **Approved** | "Code architecture สะอาด มีการป้องกัน Safety Rules ครบถ้วนและผ่าน test suites ทั้งหมดครับ" |

---

## 7. การประยุกต์ใช้ AI และบทสะท้อนความคิด (AI Use & Reflection)

### 7.1 รายการโมเดลปัญญาประดิษฐ์ที่ใช้ (LLM Models Used)
- **Primary AI Agent:** Gemini 3.7 Flash / Claude Opus 4.6 (ผ่าน Antigravity Agentic IDE)

### 7.2 พรอมต์สำคัญในการพัฒนา (Key Selected Prompts)

1. **Prompt 1 (Specification & Data Architecture):**
   > *"ช่วยออกแบบ Specification และ Data Model Migration สำหรับ Lab 3 รองรับ Role: Requester, IT_STAFF, ADMINISTRATOR พร้อมระบบ Authentication และ Password Hashing"*
2. **Prompt 2 (Authentication Foundation & JWT Middleware):**
   > *"Implement authentication controller, JWT middleware, และ API endpoints /api/auth/login, /api/auth/me, /api/auth/change-password พร้อม Test suites"*
3. **Prompt 3 (IT Staff Queue & Filtering System):**
   > *"สร้าง IT Staff Ticket Queue API (GET /api/staff/tickets) รองรับ search, category filter, priority filter, status filter และ pagination พร้อม Component StaffTicketQueue.tsx ธีม Zen Green"*
4. **Prompt 4 (Ticket Operational Actions & Internal Notes):**
   > *"Implement Ticket Assignment, IT Priority update, Status workflow transition rules, Public Comments, และ Internal Notes สำหรับ IT Staff"*
5. **Prompt 5 (Admin User Management & Safety Business Rules):**
   > *"Implement Admin User Management APIs และ UserManagement.tsx component รองรับ Create User, Edit User, Reset Password พร้อม Safety rules ป้องกัน self-deactivation และป้องกันการ demote/deactivate last active Admin"*
6. **Prompt 6 (Peer Review Integration & Documentation):**
   > *"ช่วยสร้าง Pull Request และสเปกเอกสารสำหรับส่ง Lab 3 รวมถึง docs/lab-03/ สเปก และการรวมสาขา lab3-staging เข้า main"*

### 7.3 บทสะท้อนความคิดและสิ่งที่ได้เรียนรู้ (Reflection)
- **ประสิทธิภาพและความรวดเร็วในการพัฒนา (Speed & Precision):** การใช้ AI Agent ช่วยลดเวลาในการเขียน Boilerplate Code สำหรับ REST API และการจัดการ State Management ฝั่ง React ได้อย่างมีนัยสำคัญ ทำให้สามารถโฟกัสกับ Business Logic ที่ซับซ้อนได้เต็มที่
- **การปฏิบัติตามกฎความปลอดภัย (Architectural Safety & Edge Cases):** AI ช่วยในการวางแนวป้องกัน Corner Cases เช่น การป้องกันไม่ให้ Administrator เผลอลบบัญชีตนเอง หรือการลบบัญชี Admin คนสุดท้าย ซึ่งช่วยให้ระบบมีความทนทานและเป็นไปตามมาตรฐานการออกแบบซอฟต์แวร์ระดับองค์กร
- **ความสม่ำเสมอของ UI (UI Consistency & Design Tokens):** การนำ AI มาช่วยจัดโครงสร้าง CSS ตามระบบ Design Tokens ธีม Zen Green ทำให้หน้าจอทั้งหมดใน Lab 3 มีความสอดคล้อง กลมกลืน และใช้งานง่าย
