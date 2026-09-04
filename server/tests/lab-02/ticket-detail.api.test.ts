import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("Ticket Detail & Attachment Lifecycle APIs", () => {
  let requesterAId: number;
  let requesterBId: number;
  let ticketAId: number;
  let ticketBId: number;
  let activeAttachmentId: number;
  let removedAttachmentId: number;

  beforeAll(async () => {
    const prisma = getPrisma();

    await prisma.attachment.deleteMany();
    await prisma.ticket.deleteMany();

    // Requesters
    let reqA = await prisma.requesterUser.findFirst({ where: { email: "jennifer.anderson@example.com" } });
    if (!reqA) {
      reqA = await prisma.requesterUser.create({
        data: { name: "Jennifer Anderson", email: "jennifer.anderson@example.com", department: "IT", isActive: true },
      });
    }
    requesterAId = reqA.id;

    let reqB = await prisma.requesterUser.findFirst({ where: { email: "michael.brown@example.com" } });
    if (!reqB) {
      reqB = await prisma.requesterUser.create({
        data: { name: "Michael Brown", email: "michael.brown@example.com", department: "Finance", isActive: true },
      });
    }
    requesterBId = reqB.id;

    // Categories & Systems
    let cat = await prisma.category.findFirst();
    if (!cat) {
      cat = await prisma.category.create({ data: { name: "Hardware", code: "HARDWARE" } });
    }
    let sys = await prisma.relatedSystem.findFirst();
    if (!sys) {
      sys = await prisma.relatedSystem.create({ data: { name: "Corporate Laptop", code: "LAPTOP" } });
    }

    // Tickets
    const ticketA = await prisma.ticket.create({
      data: {
        ticketNumber: "TKT-2026-000101",
        requesterId: requesterAId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        requestedPriority: "HIGH",
        itPriority: "HIGH",
        currentStatus: "NEW",
        summary: "Laptop screen issue",
        description: "Screen flickering continuously.",
      },
    });
    ticketAId = ticketA.id;

    const ticketB = await prisma.ticket.create({
      data: {
        ticketNumber: "TKT-2026-000102",
        requesterId: requesterBId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        requestedPriority: "LOW",
        itPriority: "LOW",
        currentStatus: "NEW",
        summary: "Printer paper jam",
        description: "Paper jammed in feeder tray.",
      },
    });
    ticketBId = ticketB.id;

    // Attachments for Ticket A
    const attActive = await prisma.attachment.create({
      data: {
        ticketId: ticketAId,
        fileName: "error_screenshot.png",
        fileSize: 1024500,
        mimeType: "image/png",
        filePath: "/uploads/error_screenshot.png",
        isRemoved: false,
      },
    });
    activeAttachmentId = attActive.id;

    const attRemoved = await prisma.attachment.create({
      data: {
        ticketId: ticketAId,
        fileName: "old_log.txt",
        fileSize: 500,
        mimeType: "text/plain",
        filePath: "/uploads/old_log.txt",
        isRemoved: true,
        removedAt: new Date(),
        removalReason: "Uploaded wrong log file",
      },
    });
    removedAttachmentId = attRemoved.id;
  });

  describe("GET /api/tickets/:id", () => {
    it("should return ticket detail owned by active Requester", async () => {
      const res = await request(app)
        .get(`/api/tickets/${ticketAId}`)
        .set("x-requester-id", String(requesterAId));

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(ticketAId);
      expect(res.body.summary).toBe("Laptop screen issue");
      expect(res.body.attachments).toBeDefined();
    });

    it("should reject access (403/404) when Requester B tries to view Requester A's ticket", async () => {
      const res = await request(app)
        .get(`/api/tickets/${ticketAId}`)
        .set("x-requester-id", String(requesterBId));

      expect([403, 404]).toContain(res.status);
    });
  });

  describe("POST /api/tickets/:id/attachments", () => {
    it("should upload a valid attachment to owned ticket", async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketAId}/attachments`)
        .set("x-requester-id", String(requesterAId))
        .send({
          fileName: "diag_report.pdf",
          fileSize: 204800,
          mimeType: "application/pdf",
          filePath: "/uploads/diag_report.pdf",
        });

      expect(res.status).toBe(201);
      expect(res.body.fileName).toBe("diag_report.pdf");
      expect(res.body.isRemoved).toBe(false);
    });

    it("should reject invalid file type", async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketAId}/attachments`)
        .set("x-requester-id", String(requesterAId))
        .send({
          fileName: "malware.exe",
          fileSize: 1000,
          mimeType: "application/x-msdownload",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Allowed file types are JPG, JPEG, PNG, WEBP, and PDF");
    });

    it("should reject file larger than 5MB", async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketAId}/attachments`)
        .set("x-requester-id", String(requesterAId))
        .send({
          fileName: "huge_video.mp4",
          fileSize: 10 * 1024 * 1024, // 10MB
          mimeType: "image/png",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("File size exceeds maximum allowed limit of 5 MB");
    });
  });

  describe("DELETE /api/attachments/:id", () => {
    it("should reject soft removal without valid reason", async () => {
      const res = await request(app)
        .delete(`/api/attachments/${activeAttachmentId}`)
        .set("x-requester-id", String(requesterAId))
        .send({ removalReason: "hi" }); // less than 3 chars

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("removalReason must be between 3 and 200 characters");
    });

    it("should soft remove active attachment with valid reason", async () => {
      const res = await request(app)
        .delete(`/api/attachments/${activeAttachmentId}`)
        .set("x-requester-id", String(requesterAId))
        .send({ removalReason: "Uploaded wrong screenshot" });

      expect(res.status).toBe(200);
      expect(res.body.isRemoved).toBe(true);
      expect(res.body.removalReason).toBe("Uploaded wrong screenshot");
    });
  });

  describe("GET /api/attachments/:id/download", () => {
    it("should reject download of soft-removed attachment (410/404)", async () => {
      const res = await request(app)
        .get(`/api/attachments/${removedAttachmentId}/download`)
        .set("x-requester-id", String(requesterAId));

      expect([410, 404]).toContain(res.status);
    });
  });
});
