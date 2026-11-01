import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { generateToken } from "../../src/modules/auth/auth.service.js";
import { Role } from "@prisma/client";

describe("Lab 4: IT Staff & Admin Operational Dashboard API (/api/dashboards/staff)", () => {
  const prisma = getPrisma();
  let staffToken: string;
  let adminToken: string;
  let requesterToken: string;

  beforeAll(async () => {
    const admin = await prisma.user.findFirst({ where: { role: Role.ADMINISTRATOR } });
    adminToken = generateToken({
      id: admin!.id,
      email: admin!.email,
      role: Role.ADMINISTRATOR,
      name: admin!.name,
    });

    const staff = await prisma.user.findFirst({ where: { role: Role.IT_STAFF, isActive: true } });
    staffToken = generateToken({
      id: staff!.id,
      email: staff!.email,
      role: Role.IT_STAFF,
      name: staff!.name,
    });

    const reqUser = await prisma.user.findFirst({ where: { role: Role.REQUESTER, isActive: true } });
    requesterToken = generateToken({
      id: reqUser!.id,
      email: reqUser!.email,
      role: Role.REQUESTER,
      name: reqUser!.name,
    });
  });

  it("should return 401 when token is missing", async () => {
    const res = await request(app).get("/api/dashboards/staff");
    expect(res.status).toBe(401);
  });

  it("should return 403 Forbidden when Requester attempts to access staff dashboard", async () => {
    const res = await request(app)
      .get("/api/dashboards/staff")
      .set("Authorization", `Bearer ${requesterToken}`);

    expect(res.status).toBe(403);
  });

  it("should return operational metrics and recent tickets for IT Staff", async () => {
    const res = await request(app)
      .get("/api/dashboards/staff")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("metrics");
    expect(res.body).toHaveProperty("recentTickets");

    const { metrics } = res.body;
    expect(metrics).toHaveProperty("newCount");
    expect(metrics).toHaveProperty("openCount");
    expect(metrics).toHaveProperty("inProgressCount");
    expect(metrics).toHaveProperty("waitingForRequesterCount");
    expect(metrics).toHaveProperty("myAssignedCount");
    expect(metrics).toHaveProperty("unassignedCount");
    expect(metrics).toHaveProperty("highPriorityCount");
    expect(metrics).toHaveProperty("criticalPriorityCount");

    // Regular IT staff does not receive userSummary
    expect(res.body.userSummary).toBeUndefined();
  });

  it("should return userSummary when Administrator requests staff dashboard", async () => {
    const res = await request(app)
      .get("/api/dashboards/staff")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("userSummary");
    const { userSummary } = res.body;
    expect(userSummary).toHaveProperty("totalUsers");
    expect(userSummary).toHaveProperty("activeStaff");
    expect(userSummary).toHaveProperty("activeRequesters");
    expect(typeof userSummary.totalUsers).toBe("number");
  });
});

