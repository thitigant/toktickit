import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Lab 3: Ticket Operations, Ownership, Priority, Status, Comments, and Internal Notes", () => {
  let requesterToken: string;
  let otherRequesterToken: string;
  let staffToken: string;
  let adminToken: string;
  let ticketId: number;

  beforeAll(async () => {
    // Login as Requester Jennifer
    const reqLogin = await request(app).post("/api/auth/login").send({
      email: "requester.jennifer@toktickit.com",
      password: "Password123!",
    });
    requesterToken = reqLogin.body.token;

    // Login as Requester Michael
    const otherReqLogin = await request(app).post("/api/auth/login").send({
      email: "requester.michael@toktickit.com",
      password: "Password123!",
    });
    otherRequesterToken = otherReqLogin.body.token;

    // Login as Staff Alex
    const staffLogin = await request(app).post("/api/auth/login").send({
      email: "staff.alex@toktickit.com",
      password: "Password123!",
    });
    staffToken = staffLogin.body.token;

    // Login as Admin
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admin@toktickit.com",
      password: "Password123!",
    });
    adminToken = adminLogin.body.token;

    // Create a fresh ticket by Jennifer
    const createRes = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${requesterToken}`)
      .send({
        categoryId: 1,
        relatedSystemId: 1,
        requestedPriority: "HIGH",
        summary: "Integration test ticket for operations workflow",
        description: "Detailed description for integration testing ticket operations in Lab 3.",
      });
    expect(createRes.status).toBe(201);
    ticketId = createRes.body.id;
  });

  // 1. Comments
  describe("Public Comments API", () => {
    it("should allow Requester to post and view public comment on their ticket", async () => {
      const postRes = await request(app)
        .post(`/api/tickets/${ticketId}/comments`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ content: "Hello, I am providing more info on this issue." });

      expect(postRes.status).toBe(201);
      expect(postRes.body.content).toBe("Hello, I am providing more info on this issue.");
      expect(postRes.body.author.name).toBe("Jennifer Anderson");

      const getRes = await request(app)
        .get(`/api/tickets/${ticketId}/comments`)
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.length).toBeGreaterThanOrEqual(1);
    });

    it("should reject another Requester from posting comments to a ticket they do not own", async () => {
      const postRes = await request(app)
        .post(`/api/tickets/${ticketId}/comments`)
        .set("Authorization", `Bearer ${otherRequesterToken}`)
        .send({ content: "Unauthorized comment attempt." });

      expect(postRes.status).toBe(403);
    });

    it("should allow IT Staff to post public comments", async () => {
      const postRes = await request(app)
        .post(`/api/tickets/${ticketId}/comments`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ content: "Staff response: We are looking into this." });

      expect(postRes.status).toBe(201);
      expect(postRes.body.author.role).toBe("IT_STAFF");
    });
  });

  // 2. Internal Notes
  describe("Internal Notes API", () => {
    it("should reject Requester access to internal notes with 403 Forbidden", async () => {
      const getRes = await request(app)
        .get(`/api/tickets/${ticketId}/notes`)
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(getRes.status).toBe(403);

      const postRes = await request(app)
        .post(`/api/tickets/${ticketId}/notes`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ content: "Sneaky requester trying to add internal note" });

      expect(postRes.status).toBe(403);
    });

    it("should allow IT Staff and Admin to add and view internal notes", async () => {
      const postRes = await request(app)
        .post(`/api/tickets/${ticketId}/notes`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ content: "Private note: Checked logs on auth server." });

      expect(postRes.status).toBe(201);
      expect(postRes.body.content).toBe("Private note: Checked logs on auth server.");

      const getRes = await request(app)
        .get(`/api/tickets/${ticketId}/notes`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.some((n: any) => n.content.includes("Private note"))).toBe(true);
    });
  });

  // 3. Ticket Assignment / Ownership
  describe("Ticket Assignment API", () => {
    it("should reject Requester from reassigning tickets", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${ticketId}/assign`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ ownerId: 6 });

      expect(res.status).toBe(403);
    });

    it("should allow IT Staff to assign ticket to another staff member", async () => {
      // Bob is user id or let's get staff list
      const staffListRes = await request(app)
        .get("/api/staff/list")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffListRes.status).toBe(200);
      expect(staffListRes.body.length).toBeGreaterThan(0);
      const bob = staffListRes.body.find((u: any) => u.email.includes("bob")) || staffListRes.body[0];

      const assignRes = await request(app)
        .patch(`/api/tickets/${ticketId}/assign`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ ownerId: bob.id });

      expect(assignRes.status).toBe(200);
      expect(assignRes.body.ownerId).toBe(bob.id);
      expect(assignRes.body.owner.email).toBe(bob.email);
    });
  });

  // 4. Status Workflow & IT Priority
  describe("Status Workflow & IT Priority API", () => {
    it("should allow valid status transitions according to transition matrix", async () => {
      // NEW -> OPEN
      const step1 = await request(app)
        .patch(`/api/tickets/${ticketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "OPEN", itPriority: "CRITICAL" });

      expect(step1.status).toBe(200);
      expect(step1.body.currentStatus).toBe("OPEN");
      expect(step1.body.itPriority).toBe("CRITICAL");

      // OPEN -> IN_PROGRESS
      const step2 = await request(app)
        .patch(`/api/tickets/${ticketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "IN_PROGRESS" });

      expect(step2.status).toBe(200);
      expect(step2.body.currentStatus).toBe("IN_PROGRESS");

      // IN_PROGRESS -> RESOLVED
      const step3 = await request(app)
        .patch(`/api/tickets/${ticketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "RESOLVED" });

      expect(step3.status).toBe(200);
      expect(step3.body.currentStatus).toBe("RESOLVED");
    });

    it("should reject invalid status transition with HTTP 400 Bad Request", async () => {
      // Current is RESOLVED. Trying to transition directly to IN_PROGRESS (disallowed, must be REOPENED or CLOSED)
      const invalidRes = await request(app)
        .patch(`/api/tickets/${ticketId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "IN_PROGRESS" });

      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.error).toMatch(/invalid status transition/i);
    });
  });

  // 5. Requester Resolution Indication
  describe("Requester Resolution Indication", () => {
    it("should record a public comment when requester clicks problem appears resolved", async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketId}/resolve-indication`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ note: "The system started working again after restarting." });

      expect(res.status).toBe(200);
      expect(res.body.comment.content).toContain("Problem Appears Resolved");
      expect(res.body.comment.content).toContain("The system started working again");
    });
  });
});
