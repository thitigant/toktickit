import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
// getPrisma() is your lazy database handle. Call it INSIDE a route when you
// need the DB (Issue 4). It is intentionally unused until then.
void getPrisma;

// The Express app is exported separately from app.listen() (see index.ts) so
// Supertest can import `app` without opening a port. Do not merge these files.
export const app = express();

app.use(cors());          // already wired: lets the Vite dev server call this API
app.use(express.json());

// ---------------------------------------------------------------------------
// Issue 2 — API health check
// Make the test in tests/lab-01/health.test.ts pass.
// It must return HTTP 200 with JSON: { status: "ok", service: "TokTickIT API" }
// ---------------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

// ---------------------------------------------------------------------------
// Issue 4 — Category list
// ---------------------------------------------------------------------------
app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getPrisma().category.findMany({
      orderBy: { id: "asc" },
      select: { id: true, name: true },
    });
    res.status(200).json(categories);
  } catch {
    res.status(500).json({ error: "Failed to retrieve categories" });
  }
});

// ---------------------------------------------------------------------------
// Lab 2 — GET /api/requesters/active
// Returns only active Development Requesters for the selector screen.
// ---------------------------------------------------------------------------
app.get("/api/requesters/active", async (_req: Request, res: Response) => {
  try {
    const requesters = await getPrisma().requesterUser.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: { id: true, name: true, email: true, department: true },
    });
    res.status(200).json(requesters);
  } catch {
    res.status(500).json({ error: "Failed to retrieve requesters" });
  }
});

// ---------------------------------------------------------------------------
// Lab 2 — GET /api/related-systems
// Returns only active Related Systems.
// ---------------------------------------------------------------------------
app.get("/api/related-systems", async (_req: Request, res: Response) => {
  try {
    const systems = await getPrisma().relatedSystem.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: { id: true, name: true, code: true },
    });
    res.status(200).json(systems);
  } catch {
    res.status(500).json({ error: "Failed to retrieve related systems" });
  }
});

// ---------------------------------------------------------------------------
// Lab 2 — POST /api/tickets
// Create a new IT support ticket. Requires x-requester-id header.
// ---------------------------------------------------------------------------
app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    const rawRequesterId = req.headers["x-requester-id"];
    if (!rawRequesterId) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: ["x-requester-id header is required"],
      });
    }

    const requesterId = parseInt(String(rawRequesterId), 10);
    if (isNaN(requesterId)) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: ["x-requester-id header must be a valid number"],
      });
    }

    const { categoryId, relatedSystemId, requestedPriority, summary, description } = req.body ?? {};

    const errors: string[] = [];

    const trimmedSummary = typeof summary === "string" ? summary.trim() : "";
    if (!trimmedSummary || trimmedSummary.length < 5 || trimmedSummary.length > 150) {
      errors.push("summary must be between 5 and 150 characters");
    }

    const trimmedDesc = typeof description === "string" ? description.trim() : "";
    if (!trimmedDesc || trimmedDesc.length < 10 || trimmedDesc.length > 2000) {
      errors.push("description must be between 10 and 2000 characters");
    }

    const parsedCategory = parseInt(String(categoryId), 10);
    if (isNaN(parsedCategory)) {
      errors.push("categoryId is required and must be a number");
    }

    const parsedSystem = parseInt(String(relatedSystemId), 10);
    if (isNaN(parsedSystem)) {
      errors.push("relatedSystemId is required and must be a number");
    }

    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    const priority = requestedPriority ?? "MEDIUM";
    if (!validPriorities.includes(priority)) {
      errors.push("requestedPriority must be one of LOW, MEDIUM, HIGH, URGENT");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: errors,
      });
    }

    const prisma = getPrisma();

    // Verify requester exists and is active
    const requester = await prisma.requesterUser.findUnique({
      where: { id: requesterId },
    });
    if (!requester || !requester.isActive) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: ["Requester not found or inactive"],
      });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: parsedCategory },
    });
    if (!category) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: ["Category not found"],
      });
    }

    // Verify system exists
    const system = await prisma.relatedSystem.findUnique({
      where: { id: parsedSystem },
    });
    if (!system) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: ["Related system not found"],
      });
    }

    const year = new Date().getFullYear();
    const count = await prisma.ticket.count();
    const ticketNumber = `TKT-${year}-${String(count + 1).padStart(6, "0")}`;

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        requesterId,
        categoryId: parsedCategory,
        relatedSystemId: parsedSystem,
        requestedPriority: priority,
        itPriority: "MEDIUM",
        currentStatus: "NEW",
        summary: trimmedSummary,
        description: trimmedDesc,
      },
    });

    return res.status(201).json(newTicket);
  } catch {
    return res.status(500).json({ error: "Failed to create ticket" });
  }
});

// ---------------------------------------------------------------------------
// Lab 2 — GET /api/tickets
// Retrieve paginated list of tickets owned by the current Requester.
// Supports search, category, priority, status filtering, sorting, and pagination.
// ---------------------------------------------------------------------------
app.get("/api/tickets", async (req: Request, res: Response) => {
  try {
    const rawRequesterId = req.headers["x-requester-id"];
    if (!rawRequesterId) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: ["x-requester-id header is required"],
      });
    }

    const requesterId = parseInt(String(rawRequesterId), 10);
    if (isNaN(requesterId)) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: ["x-requester-id header must be a valid number"],
      });
    }

    const {
      search,
      category,
      priority,
      status,
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      requesterId,
    };

    if (search && typeof search === "string" && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { ticketNumber: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category) {
      const catId = parseInt(String(category), 10);
      if (!isNaN(catId)) {
        where.categoryId = catId;
      }
    }

    if (priority && typeof priority === "string") {
      where.requestedPriority = priority;
    }

    if (status && typeof status === "string") {
      where.currentStatus = status;
    }

    const validSortFields = ["createdAt", "ticketNumber", "requestedPriority", "currentStatus"];
    const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : "createdAt";
    const order = String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

    const prisma = getPrisma();

    const [totalItems, tickets] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortField]: order },
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    return res.status(200).json({
      data: tickets,
      pagination: {
        totalItems,
        currentPage: pageNum,
        totalPages,
        pageSize: limitNum,
      },
    });
  } catch {
    return res.status(500).json({ error: "Failed to retrieve tickets" });
  }
});

export default app;
