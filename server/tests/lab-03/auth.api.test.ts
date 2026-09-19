import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("Lab 3: Authentication API (/api/auth)", () => {
  beforeAll(async () => {
    const salt = await bcrypt.genSalt(10);
    const initialHash = await bcrypt.hash("InitialPassword123!", salt);
    await getPrisma().user.updateMany({
      where: { email: "staff.clara@toktickit.com" },
      data: {
        passwordHash: initialHash,
        mustChangePassword: true,
      },
    });
  });

  // AC-01 / API-01: Valid login
  it("should successfully authenticate an active user and return token and role", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "staff.alex@toktickit.com",
        password: "Password123!",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe("staff.alex@toktickit.com");
    expect(res.body.user.role).toBe("IT_STAFF");
    expect(res.body.user.isActive).toBe(true);
    expect(res.body.user).not.toHaveProperty("passwordHash");
  });

  // AC-02 / API-02: Inactive user login
  it("should reject login for deactivated/inactive account with HTTP 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "requester.inactive@toktickit.com",
        password: "Password123!",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/deactivated|invalid/i);
    expect(res.body).not.toHaveProperty("token");
  });

  // Invalid password
  it("should reject login with wrong password with HTTP 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "staff.alex@toktickit.com",
        password: "WrongPassword999!",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid/i);
  });

  // Get current user (/api/auth/me)
  it("should return the current user profile when authenticated", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@toktickit.com",
        password: "Password123!",
      });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe("admin@toktickit.com");
    expect(meRes.body.role).toBe("ADMINISTRATOR");
  });

  // AC-03: First login password change / change password
  it("should validate and successfully change password", async () => {
    // Login with Clara who has mustChangePassword = true
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "staff.clara@toktickit.com",
        password: "InitialPassword123!",
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.mustChangePassword).toBe(true);
    const token = loginRes.body.token;

    // Fail if new passwords mismatch
    const mismatchRes = await request(app)
      .post("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "InitialPassword123!",
        newPassword: "BrandNewPassword123!",
        confirmPassword: "DifferentPassword123!",
      });
    expect(mismatchRes.status).toBe(400);

    // Fail if new password equals current password
    const sameRes = await request(app)
      .post("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "InitialPassword123!",
        newPassword: "InitialPassword123!",
        confirmPassword: "InitialPassword123!",
      });
    expect(sameRes.status).toBe(400);

    // Success change password
    const successRes = await request(app)
      .post("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "InitialPassword123!",
        newPassword: "ClaraNewSecurePassword2026!",
        confirmPassword: "ClaraNewSecurePassword2026!",
      });

    expect(successRes.status).toBe(200);
    expect(successRes.body.user.mustChangePassword).toBe(false);

    // Login with new password should now succeed
    const newLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: "staff.clara@toktickit.com",
        password: "ClaraNewSecurePassword2026!",
      });
    expect(newLogin.status).toBe(200);
  });

  // AC-04 / API-04: Logout
  it("should respond with 200 on logout", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);
  });
});
