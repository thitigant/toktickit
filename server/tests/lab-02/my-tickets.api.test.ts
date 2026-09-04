import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("GET /api/tickets", () => {
  let requesterAId: number;
  let requesterBId: number;
  let categoryHardwareId: number;
  let categorySoftwareId: number;
  let systemLaptopId: number;

  beforeAll(async () => {
    const prisma = getPrisma();

    // Clear existing tickets to have predictable test environment
    await prisma.attachment.deleteMany();
    await prisma.ticket.deleteMany();

    // Ensure requesters exist
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

    // Categories
    let catHw = await prisma.category.findFirst({ where: { name: "Hardware" } });
    if (!catHw) {
      catHw = await prisma.category.create({ data: { name: "Hardware", code: "HARDWARE" } });
    }
    categoryHardwareId = catHw.id;

    let catSw = await prisma.category.findFirst({ where: { name: "Software" } });
    if (!catSw) {
      catSw = await prisma.category.create({ data: { name: "Software", code: "SOFTWARE" } });
    }
    categorySoftwareId = catSw.id;

    // Related Systems
    let sysLap = await prisma.relatedSystem.findFirst({ where: { name: "Corporate Laptop" } });
    if (!sysLap) {
      sysLap = await prisma.relatedSystem.create({ data: { name: "Corporate Laptop", code: "LAPTOP" } });
    }
    systemLaptopId = sysLap.id;

    // Create tickets for Requester A
    await prisma.ticket.create({
      data: {
        ticketNumber: "TKT-2026-000001",
        requesterId: requesterAId,
        categoryId: categoryHardwareId,
        relatedSystemId: systemLaptopId,
        requestedPriority: "HIGH",
        itPriority: "HIGH",
        currentStatus: "NEW",
        summary: "Screen flicker on laptop",
        description: "The laptop display flickers randomly during heavy usage.",
      },
    });

    await prisma.ticket.create({
      data: {
        ticketNumber: "TKT-2026-000002",
        requesterId: requesterAId,
        categoryId: categorySoftwareId,
        relatedSystemId: systemLaptopId,
        requestedPriority: "LOW",
        itPriority: "MEDIUM",
        currentStatus: "IN_PROGRESS",
        summary: "VPN software connection timeout",
        description: "Cannot connect to VPN from home network.",
      },
    });

    // Create ticket for Requester B
    await prisma.ticket.create({
      data: {
        ticketNumber: "TKT-2026-000003",
        requesterId: requesterBId,
        categoryId: categoryHardwareId,
        relatedSystemId: systemLaptopId,
        requestedPriority: "URGENT",
        itPriority: "HIGH",
        currentStatus: "NEW",
        summary: "Printer power cable broken",
        description: "Power cord is damaged.",
      },
    });
  });

  it("should return 400 if x-requester-id header is missing", async () => {
    const res = await request(app).get("/api/tickets");
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("x-requester-id header is required");
  });

  it("should return tickets strictly owned by Requester A", async () => {
    const res = await request(app)
      .get("/api/tickets")
      .set("x-requester-id", String(requesterAId));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toEqual({
      totalItems: 2,
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
    });
    // Check that Requester B's ticket is not included
    const summaries = res.body.data.map((t: { summary: string }) => t.summary);
    expect(summaries).toContain("Screen flicker on laptop");
    expect(summaries).toContain("VPN software connection timeout");
    expect(summaries).not.toContain("Printer power cable broken");
  });

  it("should filter tickets by search query (summary or ticket number)", async () => {
    const res = await request(app)
      .get("/api/tickets?search=flicker")
      .set("x-requester-id", String(requesterAId));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].summary).toBe("Screen flicker on laptop");
  });

  it("should filter tickets by category", async () => {
    const res = await request(app)
      .get(`/api/tickets?category=${categorySoftwareId}`)
      .set("x-requester-id", String(requesterAId));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].summary).toBe("VPN software connection timeout");
  });

  it("should filter tickets by priority", async () => {
    const res = await request(app)
      .get("/api/tickets?priority=HIGH")
      .set("x-requester-id", String(requesterAId));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].requestedPriority).toBe("HIGH");
  });

  it("should filter tickets by status", async () => {
    const res = await request(app)
      .get("/api/tickets?status=IN_PROGRESS")
      .set("x-requester-id", String(requesterAId));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].currentStatus).toBe("IN_PROGRESS");
  });

  it("should handle pagination correctly", async () => {
    const res = await request(app)
      .get("/api/tickets?page=1&limit=1")
      .set("x-requester-id", String(requesterAId));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toEqual({
      totalItems: 2,
      currentPage: 1,
      totalPages: 2,
      pageSize: 1,
    });
  });

  it("should return empty data array when search matches nothing", async () => {
    const res = await request(app)
      .get("/api/tickets?search=nonexistentsearchterm")
      .set("x-requester-id", String(requesterAId));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.totalItems).toBe(0);
  });
});
