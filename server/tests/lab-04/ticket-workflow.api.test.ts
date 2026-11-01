import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { generateToken } from "../../src/modules/auth/auth.service.js";
import { Role } from "@prisma/client";

describe("Lab 4 Sprint 4 — Ticket Workflow, Resolution Gate & Concurrency API Tests", () => {
  const prisma = getPrisma();
  let staffToken: string;
  let adminToken: string;
  let requesterToken: string;
  let otherRequesterToken: string;

  let testTicketId: number;
  let requesterUserId: number;

  beforeAll(async () => {
    // 1. Setup users and auth tokens
    const adminUser = await prisma.user.findFirst({ where: { role: Role.ADMINISTRATOR } });
    adminToken = generateToken({
      id: adminUser?.id || 1,
      email: adminUser?.email || "admin@toktickit.com",
      role: Role.ADMINISTRATOR,
      name: "Admin User",
    });

    const staffUser = await prisma.user.findFirst({ where: { role: Role.IT_STAFF, isActive: true } });
    staffToken = generateToken({
      id: staffUser?.id || 2,
      email: staffUser?.email || "staff@toktickit.com",
      role: Role.IT_STAFF,
      name: "Staff User",
    });

    const reqUsers = await prisma.user.findMany({ where: { role: Role.REQUESTER, isActive: true }, take: 2 });
    requesterUserId = reqUsers[0].id;
    requesterToken = generateToken({
      id: requesterUserId,
      email: reqUsers[0].email,
      role: Role.REQUESTER,
      name: reqUsers[0].name,
    });

    // Create a real second active requester for authorization test
    let otherReq = reqUsers[1];
    if (!otherReq) {
      otherReq = await prisma.user.create({
        data: {
          email: `other-req-${Date.now()}@toktickit.com`,
          name: "Other Requester",
          passwordHash: "dummyhash",
          role: Role.REQUESTER,
          isActive: true,
          department: "IT",
        },
      });
    }
    otherRequesterToken = generateToken({
      id: otherReq.id,
      email: otherReq.email,
      role: Role.REQUESTER,
      name: otherReq.name,
    });

    // 2. Create test ticket with status NEW
    const category = await prisma.category.findFirst();
    const system = await prisma.relatedSystem.findFirst();

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-${Date.now()}`,
        requesterId: requesterUserId,
        categoryId: category!.id,
        relatedSystemId: system!.id,
        summary: "Workflow Resolution Test Ticket",
        description: "Testing status lifecycle, advisory resolution and concurrency",
        currentStatus: "NEW",
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
      },
    });

    testTicketId = ticket.id;
  });

  afterAll(async () => {
    if (testTicketId) {
      await prisma.actionTaken.deleteMany({ where: { ticketId: testTicketId } }).catch(() => {});
      await prisma.comment.deleteMany({ where: { ticketId: testTicketId } }).catch(() => {});
      await prisma.internalNote.deleteMany({ where: { ticketId: testTicketId } }).catch(() => {});
      await prisma.attachment.deleteMany({ where: { ticketId: testTicketId } }).catch(() => {});
      await prisma.ticket.delete({ where: { id: testTicketId } }).catch(() => {});
    }
  });

  describe("Resolution Gate Enforcement", () => {
    it("should forbid Requester from accessing PATCH /api/tickets/:id/status (HTTP 403)", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicketId}/status`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ status: "RESOLVED" });

      expect(res.status).toBe(403);
    });

    it("should permit IT Staff and Admin to transition ticket status", async () => {
      // NEW -> OPEN
      const res = await request(app)
        .patch(`/api/tickets/${testTicketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "OPEN" });

      expect(res.status).toBe(200);
      expect(res.body.currentStatus).toBe("OPEN");
    });
  });

  describe("Permitted Status Transition Matrix", () => {
    it("should allow OPEN -> IN_PROGRESS transition", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "IN_PROGRESS" });

      expect(res.status).toBe(200);
      expect(res.body.currentStatus).toBe("IN_PROGRESS");
    });

    it("should reject disallowed transition (e.g. IN_PROGRESS -> CLOSED directly) with HTTP 400", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "CLOSED" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid status transition/i);
    });

    it("should allow IN_PROGRESS -> RESOLVED transition by IT Staff", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "RESOLVED" });

      expect(res.status).toBe(200);
      expect(res.body.currentStatus).toBe("RESOLVED");
    });

    it("should allow RESOLVED -> REOPENED transition", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicketId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "REOPENED" });

      expect(res.status).toBe(200);
      expect(res.body.currentStatus).toBe("REOPENED");
    });

    it("should allow REOPENED -> IN_PROGRESS -> RESOLVED -> CLOSED (Terminal state)", async () => {
      // REOPENED -> IN_PROGRESS
      const step1 = await request(app)
        .patch(`/api/tickets/${testTicketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "IN_PROGRESS" });
      expect(step1.status).toBe(200);

      // IN_PROGRESS -> RESOLVED
      const step2 = await request(app)
        .patch(`/api/tickets/${testTicketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "RESOLVED" });
      expect(step2.status).toBe(200);

      // RESOLVED -> CLOSED
      const step3 = await request(app)
        .patch(`/api/tickets/${testTicketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "CLOSED" });
      expect(step3.status).toBe(200);
      expect(step3.body.currentStatus).toBe("CLOSED");
    });

    it("should reject transition out of terminal state CLOSED with HTTP 400", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "OPEN" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid status transition/i);
    });
  });

  describe("Optimistic Concurrency & Stale Update Detection", () => {
    let freshTicketId: number;
    let originalUpdatedAt: string;

    beforeAll(async () => {
      const category = await prisma.category.findFirst();
      const system = await prisma.relatedSystem.findFirst();
      const t = await prisma.ticket.create({
        data: {
          ticketNumber: `TKT-CONC-${Date.now()}`,
          requesterId: requesterUserId,
          categoryId: category!.id,
          relatedSystemId: system!.id,
          summary: "Concurrency Test Ticket",
          description: "Testing HTTP 409 stale conflict detection",
          currentStatus: "NEW",
          requestedPriority: "MEDIUM",
        },
      });
      freshTicketId = t.id;
      originalUpdatedAt = t.updatedAt.toISOString();
    });

    afterAll(async () => {
      if (freshTicketId) {
        await prisma.ticket.delete({ where: { id: freshTicketId } }).catch(() => {});
      }
    });

    it("should accept status update when expectedUpdatedAt matches current record", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${freshTicketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          status: "OPEN",
          expectedUpdatedAt: originalUpdatedAt,
        });

      expect(res.status).toBe(200);
      expect(res.body.currentStatus).toBe("OPEN");
    });

    it("should return HTTP 409 Conflict when expectedUpdatedAt is stale", async () => {
      // Intentionally provide a timestamp in the past to trigger stale concurrency conflict
      const staleTimestamp = new Date(Date.now() - 60000).toISOString();

      const staleRes = await request(app)
        .patch(`/api/tickets/${freshTicketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          status: "IN_PROGRESS",
          expectedUpdatedAt: staleTimestamp, // stale timestamp!
        });

      expect(staleRes.status).toBe(409);
      expect(staleRes.body.error).toMatch(/conflict/i);
    });
  });

  describe("Requester Advisory Endpoint (resolve-advisory)", () => {
    let advisoryTicketId: number;

    beforeAll(async () => {
      const category = await prisma.category.findFirst();
      const system = await prisma.relatedSystem.findFirst();
      const t = await prisma.ticket.create({
        data: {
          ticketNumber: `TKT-ADV-${Date.now()}`,
          requesterId: requesterUserId,
          categoryId: category!.id,
          relatedSystemId: system!.id,
          summary: "Advisory Test Ticket",
          description: "Testing advisory confirmation endpoint",
          currentStatus: "IN_PROGRESS",
          requestedPriority: "LOW",
        },
      });
      advisoryTicketId = t.id;
    });

    afterAll(async () => {
      if (advisoryTicketId) {
        await prisma.comment.deleteMany({ where: { ticketId: advisoryTicketId } }).catch(() => {});
        await prisma.ticket.delete({ where: { id: advisoryTicketId } }).catch(() => {});
      }
    });

    it("should permit Requester to submit advisory confirmation without changing status to RESOLVED", async () => {
      const res = await request(app)
        .post(`/api/tickets/${advisoryTicketId}/resolve-advisory`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ note: "Problem fixed on my side!" });

      expect(res.status).toBe(200);

      // Verify ticket status was NOT changed to RESOLVED
      const checkTicket = await prisma.ticket.findUnique({ where: { id: advisoryTicketId } });
      expect(checkTicket?.currentStatus).toBe("IN_PROGRESS");
    });

    it("should forbid another requester from submitting advisory feedback on someone else's ticket", async () => {
      const res = await request(app)
        .post(`/api/tickets/${advisoryTicketId}/resolve-advisory`)
        .set("Authorization", `Bearer ${otherRequesterToken}`)
        .send({ note: "Malicious requester trying to advise" });

      expect(res.status).toBe(403);
    });
  });
});
