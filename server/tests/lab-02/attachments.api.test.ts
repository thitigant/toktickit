import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("Attachment Lifecycle API Endpoints (AC-04, AC-05, AC-06)", () => {
  let requesterAId: number;
  let requesterBId: number;
  let ticketId: number;
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

    // Ticket
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: "TKT-2026-000888",
        requesterId: requesterAId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
        currentStatus: "NEW",
        summary: "Attachment testing ticket",
        description: "Testing attachment upload limits and soft removal rules.",
      },
    });
    ticketId = ticket.id;

    // Active attachment
    const activeAtt = await prisma.attachment.create({
      data: {
        ticketId: ticketId,
        fileName: "valid_doc.pdf",
        fileSize: 1024 * 1024, // 1MB
        mimeType: "application/pdf",
        filePath: "/uploads/valid_doc.pdf",
        isRemoved: false,
      },
    });
    activeAttachmentId = activeAtt.id;

    // Removed attachment
    const removedAtt = await prisma.attachment.create({
      data: {
        ticketId: ticketId,
        fileName: "removed_old.png",
        fileSize: 500000,
        mimeType: "image/png",
        filePath: "/uploads/removed_old.png",
        isRemoved: true,
        removedAt: new Date(),
        removalReason: "File uploaded by mistake",
      },
    });
    removedAttachmentId = removedAtt.id;
  });

  describe("AC-04: File Type & Size Constraints", () => {
    it("rejects file extension not in allowed types (JPG, JPEG, PNG, WEBP, PDF)", async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketId}/attachments`)
        .set("x-requester-id", String(requesterAId))
        .send({
          fileName: "script.exe",
          fileSize: 1024,
          mimeType: "application/x-msdownload",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Allowed file types are JPG, JPEG, PNG, WEBP, and PDF");
    });

    it("rejects file size greater than 5 MB", async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketId}/attachments`)
        .set("x-requester-id", String(requesterAId))
        .send({
          fileName: "large_file.pdf",
          fileSize: 6 * 1024 * 1024, // 6MB
          mimeType: "application/pdf",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("File size exceeds maximum allowed limit of 5 MB");
    });

    it("accepts valid PDF file under 5 MB", async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketId}/attachments`)
        .set("x-requester-id", String(requesterAId))
        .send({
          fileName: "sample_log.pdf",
          fileSize: 2 * 1024 * 1024, // 2MB
          mimeType: "application/pdf",
          filePath: "/uploads/sample_log.pdf",
        });

      expect(res.status).toBe(201);
      expect(res.body.fileName).toBe("sample_log.pdf");
    });
  });

  describe("AC-06: Soft Removal Rules & Download Restriction", () => {
    it("soft removes attachment with valid reason and records metadata", async () => {
      const res = await request(app)
        .delete(`/api/attachments/${activeAttachmentId}`)
        .set("x-requester-id", String(requesterAId))
        .send({ removalReason: "Outdated attachment file" });

      expect(res.status).toBe(200);
      expect(res.body.isRemoved).toBe(true);
      expect(res.body.removalReason).toBe("Outdated attachment file");
    });

    it("blocks download of soft-removed file returning 410 Gone or 404 Not Found", async () => {
      const res = await request(app)
        .get(`/api/attachments/${removedAttachmentId}/download`)
        .set("x-requester-id", String(requesterAId));

      expect([410, 404]).toContain(res.status);
    });

    it("prevents unauthorized user from soft removing attachment", async () => {
      const res = await request(app)
        .delete(`/api/attachments/${removedAttachmentId}`)
        .set("x-requester-id", String(requesterBId))
        .send({ removalReason: "Attempt unauthorized delete" });

      expect([403, 404]).toContain(res.status);
    });
  });
});
