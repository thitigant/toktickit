import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("GET /api/requesters/active", () => {
  it("should return 200 with an array of active requesters", async () => {
    const res = await request(app).get("/api/requesters/active");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Each requester should have id, name, email, department
    if (res.body.length > 0) {
      const requester = res.body[0];
      expect(requester).toHaveProperty("id");
      expect(requester).toHaveProperty("name");
      expect(requester).toHaveProperty("email");
      expect(requester).toHaveProperty("department");
    }
  });

  it("should not include inactive requesters", async () => {
    const res = await request(app).get("/api/requesters/active");
    expect(res.status).toBe(200);

    // Inactive Test User should not appear in the list
    const inactive = res.body.find(
      (r: { email: string }) => r.email === "inactive.user@example.com"
    );
    expect(inactive).toBeUndefined();
  });
});

describe("GET /api/related-systems", () => {
  it("should return 200 with an array of related systems", async () => {
    const res = await request(app).get("/api/related-systems");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Each system should have id, name, code
    if (res.body.length > 0) {
      const system = res.body[0];
      expect(system).toHaveProperty("id");
      expect(system).toHaveProperty("name");
      expect(system).toHaveProperty("code");
    }
  });
});
