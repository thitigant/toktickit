import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("API-01 & API-02: POST /api/tickets", () => {
  it("should return 400 when x-requester-id header is missing", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .send({
        categoryId: 1,
        relatedSystemId: 1,
        summary: "Laptop keyboard not working",
        description: "The spacebar and enter key stopped working this morning.",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Bad Request");
  });

  it("should return 400 when summary is too short (< 5 chars)", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", "1")
      .send({
        categoryId: 1,
        relatedSystemId: 1,
        summary: "Help",
        description: "The spacebar and enter key stopped working this morning.",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("summary must be between 5 and 150 characters");
  });

  it("should return 400 when description is too short (< 10 chars)", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", "1")
      .send({
        categoryId: 1,
        relatedSystemId: 1,
        summary: "Laptop keyboard broken",
        description: "Broken",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("description must be between 10 and 2000 characters");
  });
});
