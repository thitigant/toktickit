import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Lab 3: IT Staff Ticket Queue API (/api/staff/tickets)", () => {
  // 1. Authorization checks
  it("should return 401 Unauthorized when missing authentication token", async () => {
    const res = await request(app).get("/api/staff/tickets");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 403 Forbidden when a Requester user attempts to access staff queue", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "requester.jennifer@toktickit.com",
        password: "Password123!",
      });

    if (loginRes.status === 200 && loginRes.body.token) {
      const res = await request(app)
        .get("/api/staff/tickets")
        .set("Authorization", `Bearer ${loginRes.body.token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/forbidden/i);
    }
  });

  it("should return 200 OK with paginated tickets list when IT Staff user requests queue", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "staff.alex@toktickit.com",
        password: "Password123!",
      });

    if (loginRes.status === 200 && loginRes.body.token) {
      const res = await request(app)
        .get("/api/staff/tickets")
        .set("Authorization", `Bearer ${loginRes.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toHaveProperty("total");
      expect(res.body.pagination).toHaveProperty("page");
      expect(res.body.pagination).toHaveProperty("limit");
    }
  });

  it("should support search query and filter parameters", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "staff.alex@toktickit.com",
        password: "Password123!",
      });

    if (loginRes.status === 200 && loginRes.body.token) {
      const res = await request(app)
        .get("/api/staff/tickets?status=NEW&search=laptop&limit=5")
        .set("Authorization", `Bearer ${loginRes.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(5);
    }
  });
});
