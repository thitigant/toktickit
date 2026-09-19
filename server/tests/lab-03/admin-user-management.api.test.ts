import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("Lab 3: Admin User Management API (/api/admin/users)", () => {
  let adminToken: string;
  let adminUserId: number;
  let staffToken: string;

  beforeAll(async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("Password123!", salt);
    await getPrisma().user.updateMany({
      where: { email: { in: ["admin@toktickit.com", "staff.alex@toktickit.com"] } },
      data: { passwordHash: hash, isActive: true },
    });
  });

  it("should setup auth tokens for testing", async () => {
    // Admin login
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@toktickit.com",
        password: "Password123!",
      });

    expect(adminLogin.status).toBe(200);
    adminToken = adminLogin.body.token;
    adminUserId = adminLogin.body.user.id;

    // IT Staff login (non-admin)
    const staffLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: "staff.alex@toktickit.com",
        password: "Password123!",
      });

    expect(staffLogin.status).toBe(200);
    staffToken = staffLogin.body.token;
  });

  describe("GET /api/admin/users", () => {
    it("should return 401 when missing token", async () => {
      const res = await request(app).get("/api/admin/users");
      expect(res.status).toBe(401);
    });

    it("should return 403 when non-admin user calls endpoint", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
    });

    it("should return 200 with paginated users for admin", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should filter users by search and role", async () => {
      const res = await request(app)
        .get("/api/admin/users?role=ADMINISTRATOR&search=Admin")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((u: any) => u.role === "ADMINISTRATOR")).toBe(true);
    });
  });

  describe("POST /api/admin/users (Create User)", () => {
    let createdUserId: number;
    const testEmail = `test.user.${Date.now()}@toktickit.com`;

    it("should fail with weak password", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: `weak.${Date.now()}@toktickit.com`,
          name: "Weak Pass User",
          role: "REQUESTER",
          password: "123",
        });

      expect(res.status).toBe(400);
    });

    it("should create user successfully with valid input", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: testEmail,
          name: "Test Admin-Created User",
          role: "IT_STAFF",
          password: "SecurePassword123!",
        });

      expect(res.status).toBe(201);
      const userObj = res.body.user || res.body;
      expect(userObj).toHaveProperty("id");
      expect(userObj.email).toBe(testEmail);
      expect(userObj.role).toBe("IT_STAFF");
      expect(userObj).not.toHaveProperty("passwordHash");
      createdUserId = userObj.id;
    });

    it("should fail creating user with duplicate email", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: testEmail,
          name: "Duplicate User",
          role: "REQUESTER",
          password: "SecurePassword123!",
        });

      expect(res.status).toBe(409);
    });

    describe("PATCH /api/admin/users/:id (Update User)", () => {
      it("should update created user name and role", async () => {
        const res = await request(app)
          .patch(`/api/admin/users/${createdUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            name: "Updated Test Name",
            role: "REQUESTER",
          });

        expect(res.status).toBe(200);
        const userObj = res.body.user || res.body;
        expect(userObj.name).toBe("Updated Test Name");
        expect(userObj.role).toBe("REQUESTER");
      });

      it("should prevent admin from deactivating themselves", async () => {
        const res = await request(app)
          .patch(`/api/admin/users/${adminUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            isActive: false,
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/deactivate/i);
      });

      it("should prevent admin from demoting their own role", async () => {
        const res = await request(app)
          .patch(`/api/admin/users/${adminUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            role: "IT_STAFF",
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/cannot change/i);
      });
    });

    describe("POST /api/admin/users/:id/reset-password", () => {
      it("should fail reset with weak new password", async () => {
        const res = await request(app)
          .post(`/api/admin/users/${createdUserId}/reset-password`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            newPassword: "short",
          });

        expect(res.status).toBe(400);
      });

      it("should reset user password successfully and set mustChangePassword to true", async () => {
        const res = await request(app)
          .post(`/api/admin/users/${createdUserId}/reset-password`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            newPassword: "ResetPassword123!",
          });

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/success/i);

        // Verify user can now log in with the new password
        const loginRes = await request(app)
          .post("/api/auth/login")
          .send({
            email: testEmail,
            password: "ResetPassword123!",
          });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body.user.mustChangePassword).toBe(true);
      });
    });
  });
});
