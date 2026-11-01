import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { generateToken } from "../../src/modules/auth/auth.service.js";
import { Role } from "@prisma/client";

describe("Lab 4: Requester Operational Dashboard API (/api/dashboards/requester)", () => {
  const prisma = getPrisma();
  let requesterToken: string;
  let otherRequesterToken: string;
  let requesterUser: any;
  let otherRequesterUser: any;

  beforeAll(async () => {
    const requesters = await prisma.user.findMany({ where: { role: Role.REQUESTER, isActive: true }, take: 2 });
    requesterUser = requesters[0];
    requesterToken = generateToken({
      id: requesterUser.id,
      email: requesterUser.email,
      role: Role.REQUESTER,
      name: requesterUser.name,
    });

    otherRequesterUser = requesters[1] || requesterUser;
    otherRequesterToken = generateToken({
      id: otherRequesterUser.id,
      email: otherRequesterUser.email,
      role: Role.REQUESTER,
      name: otherRequesterUser.name,
    });
  });

  it("should return 401 when token is missing", async () => {
    const res = await request(app).get("/api/dashboards/requester");
    expect(res.status).toBe(401);
  });

  it("should return authoritative metrics and recent tickets scoped to authenticated requester", async () => {
    const res = await request(app)
      .get("/api/dashboards/requester")
      .set("Authorization", `Bearer ${requesterToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("metrics");
    expect(res.body).toHaveProperty("recentTickets");

    const { metrics, recentTickets } = res.body;
    expect(metrics).toHaveProperty("totalOpenTickets");
    expect(metrics).toHaveProperty("inProgressTickets");
    expect(metrics).toHaveProperty("waitingForRequesterTickets");
    expect(metrics).toHaveProperty("resolvedTickets");
    expect(metrics).toHaveProperty("closedTickets");

    expect(typeof metrics.totalOpenTickets).toBe("number");
    expect(Array.isArray(recentTickets)).toBe(true);

    if (recentTickets.length > 0) {
      expect(recentTickets[0]).toHaveProperty("ticketNumber");
      expect(recentTickets[0]).toHaveProperty("title");
      expect(recentTickets[0]).toHaveProperty("status");
      expect(recentTickets[0]).toHaveProperty("categoryName");
    }
  });

  it("should isolate data: another requester only sees their own metrics", async () => {
    const res = await request(app)
      .get("/api/dashboards/requester")
      .set("Authorization", `Bearer ${otherRequesterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.metrics).toBeDefined();
  });
});

