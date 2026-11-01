import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("Lab 4: Actions Taken REST API (/api/tickets/:id/actions-taken)", () => {
  let adminToken: string;
  let staffToken: string;
  let requesterToken: string;
  let otherRequesterToken: string;

  let staffUser: any;
  let requesterUser: any;
  let otherRequesterUser: any;

  let testTicket: any;
  let otherTicket: any;

  beforeAll(async () => {
    const prisma = getPrisma();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("Password123!", salt);

    // Load users
    staffUser = await prisma.user.findUnique({ where: { email: "staff.alex@toktickit.com" } });
    requesterUser = await prisma.user.findUnique({ where: { email: "requester.jennifer@toktickit.com" } });
    otherRequesterUser = await prisma.user.findUnique({ where: { email: "requester.michael@toktickit.com" } });

    // Ensure known password
    await prisma.user.updateMany({
      where: { email: { in: ["staff.alex@toktickit.com", "requester.jennifer@toktickit.com", "requester.michael@toktickit.com", "admin@toktickit.com"] } },
      data: { passwordHash: hash, isActive: true },
    });

    // Obtain JWT tokens
    const adminLogin = await request(app).post("/api/auth/login").send({ email: "admin@toktickit.com", password: "Password123!" });
    adminToken = adminLogin.body.token;
    const staffLogin = await request(app).post("/api/auth/login").send({ email: "staff.alex@toktickit.com", password: "Password123!" });
    staffToken = staffLogin.body.token;
    const reqLogin = await request(app).post("/api/auth/login").send({ email: "requester.jennifer@toktickit.com", password: "Password123!" });
    requesterToken = reqLogin.body.token;
    const otherReqLogin = await request(app).post("/api/auth/login").send({ email: "requester.michael@toktickit.com", password: "Password123!" });
    otherRequesterToken = otherReqLogin.body.token;

    // Get or create sample tickets
    const category = await prisma.category.findFirst();
    const system = await prisma.relatedSystem.findFirst();

    testTicket = await prisma.ticket.findUnique({ where: { ticketNumber: "TKT-2026-000001" } });
    if (!testTicket) {
      testTicket = await prisma.ticket.create({
        data: {
          ticketNumber: "TKT-2026-000001",
          summary: "Sample Ticket 1",
          description: "Sample description",
          requesterId: requesterUser.id,
          categoryId: category.id,
          relatedSystemId: system.id,
          requestedPriority: "MEDIUM",
        },
      });
    }

    otherTicket = await prisma.ticket.findUnique({ where: { ticketNumber: "TKT-2026-000002" } });
    if (!otherTicket) {
      otherTicket = await prisma.ticket.create({
        data: {
          ticketNumber: "TKT-2026-000002",
          summary: "Sample Ticket 2",
          description: "Sample description",
          requesterId: otherRequesterUser.id,
          categoryId: category.id,
          relatedSystemId: system.id,
          requestedPriority: "HIGH",
        },
      });
    }

    // Create a single sample action for testTicket
    await getPrisma().actionTaken.create({
      data: {
        ticketId: testTicket.id,
        actionDescription: "Initial action",
        result: "Initial result",
        performedById: staffUser.id,
        followUpRequired: false,
      },
    });
  });

  describe("GET /api/tickets/:id/actions-taken", () => {
    it("should return 401 when token is missing", async () => {
      const res = await request(app).get(`/api/tickets/${testTicket.id}/actions-taken`);
      expect(res.status).toBe(401);
    });

    it("should allow IT Staff to view Actions Taken for any ticket", async () => {
      const res = await request(app)
        .get(`/api/tickets/${testTicket.id}/actions-taken`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should allow Requester to view Actions Taken for their OWN ticket", async () => {
      const res = await request(app)
        .get(`/api/tickets/${testTicket.id}/actions-taken`)
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should reject Requester viewing Actions Taken for ANOTHER user's ticket with 403 Forbidden", async () => {
      const res = await request(app)
        .get(`/api/tickets/${otherTicket.id}/actions-taken`)
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/forbidden|permission|not authorized/i);
    });
  });

  describe("POST /api/tickets/:id/actions-taken", () => {
    it("should reject Requester trying to create Action Taken with 403 Forbidden", async () => {
      const res = await request(app)
        .post(`/api/tickets/${testTicket.id}/actions-taken`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({
          actionDescription: "Attempted to add action by requester",
          result: "Should fail",
          followUpRequired: false,
        });
      expect(res.status).toBe(403);
    });

    it("should reject creation when followUpRequired is true but followUpNote is missing", async () => {
      const res = await request(app)
        .post(`/api/tickets/${testTicket.id}/actions-taken`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          actionDescription: "Replaced faulty power brick",
          result: "Power stable",
          followUpRequired: true,
          followUpNote: "",
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/follow-up note/i);
    });

    it("should allow IT Staff to create Action Taken and automatically set performedBy to caller (AC-01, BR-02, BR-03)", async () => {
      const payload = {
        actionDescription: "Installed latest firmware patch v1.4.2",
        result: "Diagnostic memory test finished with zero errors",
        followUpRequired: true,
        followUpNote: "Call requester in 48 hours to confirm system stability",
        attachmentNotes: "memtest_log.txt",
      };

      const res = await request(app)
        .post(`/api/tickets/${testTicket.id}/actions-taken`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.actionDescription).toBe(payload.actionDescription);
      expect(res.body.data.result).toBe(payload.result);
      expect(res.body.data.followUpRequired).toBe(true);
      expect(res.body.data.followUpNote).toBe(payload.followUpNote);
      expect(res.body.data.performedById).toBe(staffUser.id);
      expect(res.body.data.performedBy.email).toBe(staffUser.email);
    });
  });

  describe("PATCH /api/tickets/:id/actions-taken/:actionId", () => {
    let createdActionId: number;

    beforeAll(async () => {
      const action = await getPrisma().actionTaken.create({
        data: {
          ticketId: testTicket.id,
          actionDescription: "Initial investigation of hardware sound",
          result: "Cooling fan bearing is worn out",
          performedById: staffUser.id,
          followUpRequired: false,
        },
      });
      createdActionId = action.id;
    });

    it("should reject Requester from updating Action Taken with 403 Forbidden", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicket.id}/actions-taken/${createdActionId}`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({
          result: "Requester unauthorized modification",
        });
      expect(res.status).toBe(403);
    });

    it("should validate followUpNote requirement on update", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicket.id}/actions-taken/${createdActionId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          followUpRequired: true,
          followUpNote: "   ",
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/follow-up note/i);
    });

    it("should allow IT Staff/Admin to update Action Taken fields successfully", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicket.id}/actions-taken/${createdActionId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          actionDescription: "Replaced cooling fan assembly with spare unit",
          result: "Fan spinning silently, CPU temperature steady at 38C",
          followUpRequired: true,
          followUpNote: "Check fan speed sensor log tomorrow",
          attachmentNotes: "fan_serial_photo.jpg",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.actionDescription).toBe("Replaced cooling fan assembly with spare unit");
      expect(res.body.data.followUpRequired).toBe(true);
      expect(res.body.data.followUpNote).toBe("Check fan speed sensor log tomorrow");
    });
  });
});
