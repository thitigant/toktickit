import express, { Request, Response } from "express";
import cors from "cors";
import { Role } from "@prisma/client";
import { getPrisma } from "./prisma.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { authenticate, optionalAuthenticate, requireRoles } from "./modules/auth/auth.middleware.js";

export const app = express();

app.use(cors());
app.use(express.json());

// Lab 3 — Auth routes
app.use("/api/auth", authRouter);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

const FALLBACK_CATEGORIES = [
  { id: 1, name: "Account and Access", code: "ACCOUNT_ACCESS" },
  { id: 2, name: "Hardware", code: "HARDWARE" },
  { id: 3, name: "Software", code: "SOFTWARE" },
  { id: 4, name: "Network", code: "NETWORK" },
];

const FALLBACK_SYSTEMS = [
  { id: 1, name: "Email", code: "EMAIL" },
  { id: 2, name: "Campus Wi-Fi", code: "WIFI" },
  { id: 3, name: "VPN", code: "VPN" },
  { id: 4, name: "LEB2 App", code: "LEB2" },
  { id: 5, name: "Grade Submission App", code: "GRADE_SUB" },
  { id: 6, name: "Printer", code: "PRINTER" },
  { id: 7, name: "Corporate Laptop", code: "LAPTOP" },
];

const FALLBACK_REQUESTERS = [
  { id: 1, name: "Thitigant Surayothin", email: "thitigant.surayothin@example.com", department: "IT Support" },
  { id: 2, name: "Jennifer Anderson", email: "jennifer.anderson@example.com", department: "IT Support" },
  { id: 3, name: "Michael Brown", email: "michael.brown@example.com", department: "Finance" },
  { id: 4, name: "Sarah Johnson", email: "sarah.johnson@example.com", department: "Marketing" },
  { id: 5, name: "David Lee", email: "david.lee@example.com", department: "Engineering" },
  { id: 6, name: "Gorn Proxie", email: "gorn.proxie@example.com", department: "Engineering" },
  { id: 7, name: "Emily Chen", email: "emily.chen@example.com", department: "HR" },
  { id: 8, name: "Tom Wilson", email: "tom.wilson@example.com", department: "Finance" },
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getPrisma().category.findMany({
      orderBy: { id: "asc" },
      select: { id: true, name: true, code: true },
    });
    if (categories && categories.length > 0) {
      return res.status(200).json(categories);
    }
    return res.status(200).json(FALLBACK_CATEGORIES);
  } catch {
    return res.status(200).json(FALLBACK_CATEGORIES);
  }
});

// ---------------------------------------------------------------------------
// Active Requesters (Lab 2 legacy / compatibility)
// ---------------------------------------------------------------------------
app.get("/api/requesters/active", async (_req: Request, res: Response) => {
  try {
    const requesters = await getPrisma().requesterUser.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: { id: true, name: true, email: true, department: true },
    });
    if (requesters && requesters.length > 0) {
      return res.status(200).json(requesters);
    }
    return res.status(200).json(FALLBACK_REQUESTERS);
  } catch {
    return res.status(200).json(FALLBACK_REQUESTERS);
  }
});

// ---------------------------------------------------------------------------
// Related Systems
// ---------------------------------------------------------------------------
app.get("/api/related-systems", async (_req: Request, res: Response) => {
  try {
    const systems = await getPrisma().relatedSystem.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: { id: true, name: true, code: true },
    });
    if (systems && systems.length > 0) {
      return res.status(200).json(systems);
    }
    return res.status(200).json(FALLBACK_SYSTEMS);
  } catch {
    return res.status(200).json(FALLBACK_SYSTEMS);
  }
});

// ---------------------------------------------------------------------------
// Active Staff and Admin users (for ticket assignment dropdown)
// ---------------------------------------------------------------------------
app.get(
  "/api/staff/list",
  authenticate,
  requireRoles(Role.IT_STAFF, Role.ADMINISTRATOR),
  async (_req: Request, res: Response) => {
    try {
      const staff = await getPrisma().user.findMany({
        where: {
          isActive: true,
          role: { in: [Role.IT_STAFF, Role.ADMINISTRATOR] },
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true, role: true },
      });
      return res.status(200).json(staff);
    } catch {
      return res.status(500).json({ error: "Failed to fetch staff users" });
    }
  }
);

// ---------------------------------------------------------------------------
// Create Ticket
// Supports authenticated users or legacy x-requester-id header
// ---------------------------------------------------------------------------
app.post("/api/tickets", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    let requesterId: number | undefined;

    if (req.user) {
      requesterId = req.user.id;
    } else {
      const rawRequesterId = req.headers["x-requester-id"];
      if (!rawRequesterId) {
        return res.status(400).json({
          statusCode: 400,
          error: "Bad Request",
          message: ["x-requester-id header is required when unauthenticated"],
        });
      }
      requesterId = parseInt(String(rawRequesterId), 10);
      if (isNaN(requesterId)) {
        return res.status(400).json({
          statusCode: 400,
          error: "Bad Request",
          message: ["x-requester-id header must be a valid number"],
        });
      }
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

    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"];
    const priority = (typeof requestedPriority === "string" ? requestedPriority.toUpperCase() : "MEDIUM");
    if (!validPriorities.includes(priority)) {
      errors.push("requestedPriority must be one of LOW, MEDIUM, HIGH, URGENT, CRITICAL");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: errors,
      });
    }

    const prisma = getPrisma();

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

    // Ensure requester exists in User or RequesterUser table
    let validRequester = await prisma.user.findUnique({ where: { id: requesterId } });
    if (!validRequester) {
      // Fallback check RequesterUser
      const legacyReq = await prisma.requesterUser.findUnique({ where: { id: requesterId } });
      if (!legacyReq || !legacyReq.isActive) {
        return res.status(400).json({
          statusCode: 400,
          error: "Bad Request",
          message: ["Requester not found or inactive"],
        });
      }
      // Look for or create corresponding User account
      let mappedUser = await prisma.user.findUnique({ where: { email: legacyReq.email } });
      if (!mappedUser) {
        mappedUser = await prisma.user.create({
          data: {
            email: legacyReq.email,
            name: legacyReq.name,
            passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF",
            role: Role.REQUESTER,
            department: legacyReq.department,
            isActive: true,
          },
        });
      }
      requesterId = mappedUser.id;
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
        itPriority: priority,
        currentStatus: "NEW",
        summary: trimmedSummary,
        description: trimmedDesc,
      },
      include: {
        category: { select: { id: true, name: true, code: true } },
        relatedSystem: { select: { id: true, name: true, code: true } },
        requester: { select: { id: true, name: true, email: true, department: true } },
      },
    });

    return res.status(201).json(newTicket);
  } catch (err: any) {
    console.error("Failed to create ticket:", err);
    return res.status(500).json({ error: "Failed to create ticket" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/tickets (Requester list or filtered ticket list)
// ---------------------------------------------------------------------------
app.get("/api/tickets", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    let requesterId: number | undefined;

    if (req.user) {
      if (req.user.role === Role.REQUESTER) {
        requesterId = req.user.id;
      }
    } else {
      const rawRequesterId = req.headers["x-requester-id"];
      if (!rawRequesterId) {
        return res.status(400).json({
          statusCode: 400,
          error: "Bad Request",
          message: ["x-requester-id header is required"],
        });
      }
      requesterId = parseInt(String(rawRequesterId), 10);
      if (isNaN(requesterId)) {
        return res.status(400).json({
          statusCode: 400,
          error: "Bad Request",
          message: ["x-requester-id header must be a valid number"],
        });
      }
    }

    const {
      search,
      category,
      priority,
      itPriority,
      status,
      all,
      viewAll,
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (requesterId && all !== "true" && viewAll !== "true") {
      where.requesterId = requesterId;
    }

    if (search && typeof search === "string" && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { ticketNumber: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category && category !== "ALL") {
      const catId = parseInt(String(category), 10);
      if (!isNaN(catId)) {
        where.categoryId = catId;
      }
    }

    if (priority && typeof priority === "string" && priority !== "ALL") {
      where.requestedPriority = priority.toUpperCase();
    }

    if (itPriority && typeof itPriority === "string" && itPriority !== "ALL") {
      where.itPriority = itPriority.toUpperCase();
    }

    if (status && typeof status === "string" && status !== "ALL") {
      where.currentStatus = status.toUpperCase().replace(/\s+/g, "_");
    }

    const validSortFields = ["createdAt", "updatedAt", "ticketNumber", "requestedPriority", "itPriority", "currentStatus"];
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
          category: { select: { id: true, name: true, code: true } },
          relatedSystem: { select: { id: true, name: true, code: true } },
          requester: { select: { id: true, name: true, email: true, department: true } },
          owner: { select: { id: true, name: true, email: true } },
          _count: {
            select: {
              comments: true,
              internalNotes: true,
              attachments: { where: { isRemoved: false } },
            },
          },
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
  } catch (err: any) {
    console.error("Failed to retrieve tickets:", err);
    return res.status(500).json({ error: "Failed to retrieve tickets" });
  }
});

// ---------------------------------------------------------------------------
// Shared Queue Handler for /api/staff/tickets and /api/tickets/queue
// ---------------------------------------------------------------------------
const handleQueueRequest = async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      requestedPriority,
      itPriority,
      priority,
      categoryId,
      category,
      ownerId,
      assignedTo,
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const where: any = {};

    if (search && typeof search === "string" && search.trim() !== "") {
      const query = search.trim();
      where.OR = [
        { ticketNumber: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
      ];
    }

    if (status && typeof status === "string" && status !== "ALL") {
      where.currentStatus = status.toUpperCase().replace(/\s+/g, "_");
    }

    const reqPri = requestedPriority || priority;
    if (reqPri && typeof reqPri === "string" && reqPri !== "ALL") {
      where.requestedPriority = reqPri.toUpperCase();
    }

    if (itPriority && typeof itPriority === "string" && itPriority !== "ALL") {
      where.itPriority = itPriority.toUpperCase();
    }

    const catParam = categoryId || category;
    if (catParam && catParam !== "ALL") {
      const parsedCat = parseInt(String(catParam), 10);
      if (!isNaN(parsedCat)) {
        where.categoryId = parsedCat;
      }
    }

    const ownerParam = ownerId || assignedTo;
    if (ownerParam && typeof ownerParam === "string" && ownerParam !== "ALL" && ownerParam !== "all") {
      if (ownerParam === "unassigned") {
        where.ownerId = null;
      } else if (ownerParam === "me" && req.user) {
        where.ownerId = req.user.id;
      } else {
        const parsedOwner = parseInt(String(ownerParam), 10);
        if (!isNaN(parsedOwner)) {
          where.ownerId = parsedOwner;
        }
      }
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 10));

    const allowedSortFields = ["createdAt", "updatedAt", "ticketNumber", "requestedPriority", "itPriority", "currentStatus"];
    const sortField = allowedSortFields.includes(String(sortBy)) ? String(sortBy) : "createdAt";
    const order = String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

    const prisma = getPrisma();
    const totalItems = await prisma.ticket.count({ where });
    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { [sortField]: order },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      include: {
        requester: { select: { id: true, name: true, email: true, department: true } },
        owner: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, code: true } },
        relatedSystem: { select: { id: true, name: true, code: true } },
        _count: {
          select: {
            comments: true,
            internalNotes: true,
            attachments: { where: { isRemoved: false } },
          },
        },
      },
    });

    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    return res.status(200).json({
      data: tickets,
      pagination: {
        total: totalItems,
        totalItems,
        page: pageNum,
        currentPage: pageNum,
        limit: limitNum,
        pageSize: limitNum,
        totalPages,
      },
    });
  } catch (err: any) {
    console.error("Failed to retrieve IT Staff ticket queue:", err);
    return res.status(500).json({ error: "Failed to retrieve IT Staff ticket queue" });
  }
};

app.get("/api/staff/tickets", authenticate, requireRoles(Role.IT_STAFF, Role.ADMINISTRATOR), handleQueueRequest);
app.get("/api/tickets/queue", authenticate, requireRoles(Role.IT_STAFF, Role.ADMINISTRATOR), handleQueueRequest);

// ---------------------------------------------------------------------------
// GET /api/tickets/:id (Ticket Detail)
// ---------------------------------------------------------------------------
app.get("/api/tickets/:id", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: ["Ticket ID must be a valid number"],
      });
    }

    const prisma = getPrisma();
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        category: { select: { id: true, name: true, code: true } },
        relatedSystem: { select: { id: true, name: true, code: true } },
        requester: { select: { id: true, name: true, email: true, department: true } },
        owner: { select: { id: true, name: true, email: true, role: true } },
        attachments: {
          where: { isRemoved: false },
          orderBy: { createdAt: "asc" },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        internalNotes: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        statusCode: 404,
        error: "Not Found",
        message: "Ticket not found",
      });
    }

    // Role check / Ownership check
    let isStaffOrAdmin = false;
    if (req.user) {
      if (req.user.role === Role.IT_STAFF || req.user.role === Role.ADMINISTRATOR) {
        isStaffOrAdmin = true;
      } else if (ticket.requesterId !== req.user.id) {
        return res.status(403).json({
          statusCode: 403,
          error: "Forbidden",
          message: "Access denied to ticket belonging to another requester",
        });
      }
    } else {
      const rawRequesterId = req.headers["x-requester-id"];
      if (!rawRequesterId) {
        return res.status(400).json({
          statusCode: 400,
          error: "Bad Request",
          message: ["x-requester-id header is required when unauthenticated"],
        });
      }
      const requesterId = parseInt(String(rawRequesterId), 10);
      if (ticket.requesterId !== requesterId) {
        return res.status(403).json({
          statusCode: 403,
          error: "Forbidden",
          message: "Access denied to ticket belonging to another requester",
        });
      }
    }

    // Strip internal notes if not staff or admin
    if (!isStaffOrAdmin) {
      const { internalNotes, ...requesterTicket } = ticket;
      return res.status(200).json(requesterTicket);
    }

    return res.status(200).json(ticket);
  } catch (err: any) {
    console.error("Failed to retrieve ticket details:", err);
    return res.status(500).json({ error: "Failed to retrieve ticket details" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/tickets/:id/assign (Ticket Assignment / Claim)
// ---------------------------------------------------------------------------
app.patch(
  "/api/tickets/:id/assign",
  authenticate,
  requireRoles(Role.IT_STAFF, Role.ADMINISTRATOR),
  async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const { ownerId } = req.body ?? {};
      const prisma = getPrisma();

      const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!existingTicket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      let parsedOwnerId: number | null = null;
      if (ownerId !== null && ownerId !== undefined && ownerId !== "") {
        parsedOwnerId = parseInt(String(ownerId), 10);
        if (isNaN(parsedOwnerId)) {
          return res.status(400).json({ error: "ownerId must be a valid number or null" });
        }

        const targetUser = await prisma.user.findUnique({ where: { id: parsedOwnerId } });
        if (!targetUser || !targetUser.isActive) {
          return res.status(400).json({ error: "Assigned owner must be an active user" });
        }
        if (targetUser.role !== Role.IT_STAFF && targetUser.role !== Role.ADMINISTRATOR) {
          return res.status(400).json({ error: "Ticket can only be assigned to IT Staff or Administrator" });
        }
      }

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { ownerId: parsedOwnerId },
        include: {
          category: true,
          relatedSystem: true,
          requester: { select: { id: true, name: true, email: true, department: true } },
          owner: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return res.status(200).json(updatedTicket);
    } catch (err: any) {
      console.error("Failed to assign ticket:", err);
      return res.status(500).json({ error: "Failed to assign ticket" });
    }
  }
);

// ---------------------------------------------------------------------------
// PATCH /api/tickets/:id/status (Update IT Priority & Status Transition)
// ---------------------------------------------------------------------------
const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ["OPEN", "IN_PROGRESS", "CANCELLED"],
  OPEN: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  IN_PROGRESS: ["WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  WAITING_FOR_REQUESTER: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED", "REOPENED"],
  CLOSED: ["REOPENED"],
  REOPENED: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
  CANCELLED: ["REOPENED"],
};

function normalizeStatus(s: string): string {
  const clean = s.trim().toUpperCase().replace(/\s+/g, "_");
  if (clean === "CANCELED") return "CANCELLED";
  return clean;
}

app.patch(
  "/api/tickets/:id/status",
  authenticate,
  requireRoles(Role.IT_STAFF, Role.ADMINISTRATOR),
  async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const { status, itPriority } = req.body ?? {};
      const prisma = getPrisma();

      const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!existingTicket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const updateData: any = {};

      if (itPriority) {
        const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"];
        const normalizedPri = String(itPriority).trim().toUpperCase();
        if (!validPriorities.includes(normalizedPri)) {
          return res.status(400).json({ error: "Invalid itPriority value" });
        }
        updateData.itPriority = normalizedPri;
      }

      if (status) {
        const normalizedTarget = normalizeStatus(String(status));
        const currentStatus = normalizeStatus(existingTicket.currentStatus);

        if (normalizedTarget !== currentStatus) {
          const allowed = VALID_TRANSITIONS[currentStatus] || [];
          if (!allowed.includes(normalizedTarget)) {
            return res.status(400).json({
              error: `Invalid status transition from ${existingTicket.currentStatus} to ${status}`,
            });
          }
          updateData.currentStatus = normalizedTarget;
        }
      }

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: updateData,
        include: {
          category: true,
          relatedSystem: true,
          requester: { select: { id: true, name: true, email: true, department: true } },
          owner: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return res.status(200).json(updatedTicket);
    } catch (err: any) {
      console.error("Failed to update status/priority:", err);
      return res.status(500).json({ error: "Failed to update status or priority" });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/tickets/:id/resolve-indication (Requester Problem Appears Resolved)
// ---------------------------------------------------------------------------
app.post(
  "/api/tickets/:id/resolve-indication",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      if (ticket.requesterId !== req.user?.id && req.user?.role === Role.REQUESTER) {
        return res.status(403).json({ error: "Access denied: Not ticket requester" });
      }

      const { note } = req.body ?? {};
      const commentText =
        typeof note === "string" && note.trim().length > 0
          ? `[Requester Update - Problem Appears Resolved]: ${note.trim()}`
          : "[Requester Update]: Problem appears resolved to the requester.";

      const comment = await prisma.comment.create({
        data: {
          ticketId,
          content: commentText,
          authorId: req.user!.id,
        },
        include: {
          author: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return res.status(200).json({
        message: "Resolution indication submitted successfully",
        comment,
      });
    } catch (err: any) {
      console.error("Failed to indicate resolution:", err);
      return res.status(500).json({ error: "Failed to submit resolution indication" });
    }
  }
);

// ---------------------------------------------------------------------------
// Comments Endpoints (Public Comments)
// ---------------------------------------------------------------------------
app.get(
  "/api/tickets/:id/comments",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      if (req.user?.role === Role.REQUESTER && ticket.requesterId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const comments = await prisma.comment.findMany({
        where: { ticketId },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return res.status(200).json(comments);
    } catch (err: any) {
      console.error("Failed to fetch comments:", err);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }
  }
);

app.post(
  "/api/tickets/:id/comments",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const { content } = req.body ?? {};
      const trimmed = typeof content === "string" ? content.trim() : "";
      if (!trimmed || trimmed.length === 0 || trimmed.length > 2000) {
        return res.status(400).json({ error: "Comment content must be between 1 and 2000 characters" });
      }

      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      if (req.user?.role === Role.REQUESTER && ticket.requesterId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const newComment = await prisma.comment.create({
        data: {
          ticketId,
          content: trimmed,
          authorId: req.user!.id,
        },
        include: {
          author: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return res.status(201).json(newComment);
    } catch (err: any) {
      console.error("Failed to create comment:", err);
      return res.status(500).json({ error: "Failed to create comment" });
    }
  }
);

// ---------------------------------------------------------------------------
// Internal Notes Endpoints (Staff and Admin only)
// ---------------------------------------------------------------------------
app.get(
  "/api/tickets/:id/notes",
  authenticate,
  requireRoles(Role.IT_STAFF, Role.ADMINISTRATOR),
  async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const notes = await prisma.internalNote.findMany({
        where: { ticketId },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return res.status(200).json(notes);
    } catch (err: any) {
      console.error("Failed to fetch internal notes:", err);
      return res.status(500).json({ error: "Failed to fetch internal notes" });
    }
  }
);

app.post(
  "/api/tickets/:id/notes",
  authenticate,
  requireRoles(Role.IT_STAFF, Role.ADMINISTRATOR),
  async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const { content } = req.body ?? {};
      const trimmed = typeof content === "string" ? content.trim() : "";
      if (!trimmed || trimmed.length === 0 || trimmed.length > 2000) {
        return res.status(400).json({ error: "Internal note content must be between 1 and 2000 characters" });
      }

      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const newNote = await prisma.internalNote.create({
        data: {
          ticketId,
          content: trimmed,
          authorId: req.user!.id,
        },
        include: {
          author: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return res.status(201).json(newNote);
    } catch (err: any) {
      console.error("Failed to create internal note:", err);
      return res.status(500).json({ error: "Failed to create internal note" });
    }
  }
);

// ---------------------------------------------------------------------------
// Lab 2 Attachments API
// ---------------------------------------------------------------------------
app.post("/api/tickets/:id/attachments", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    let requesterId: number | undefined;
    if (req.user) {
      requesterId = req.user.id;
    } else {
      const rawRequesterId = req.headers["x-requester-id"];
      if (!rawRequesterId) {
        return res.status(400).json({
          statusCode: 400,
          error: "Bad Request",
          message: ["x-requester-id header is required"],
        });
      }
      requesterId = parseInt(String(rawRequesterId), 10);
      if (isNaN(requesterId)) {
        return res.status(400).json({
          statusCode: 400,
          error: "Bad Request",
          message: ["x-requester-id header must be a valid number"],
        });
      }
    }

    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: ["Ticket ID must be a valid number"],
      });
    }

    const prisma = getPrisma();
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        attachments: { where: { isRemoved: false } },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        statusCode: 404,
        error: "Not Found",
        message: "Ticket not found",
      });
    }

    if (ticket.requesterId !== requesterId && req.user?.role !== Role.IT_STAFF && req.user?.role !== Role.ADMINISTRATOR) {
      return res.status(403).json({
        statusCode: 403,
        error: "Forbidden",
        message: "Access denied to ticket belonging to another requester",
      });
    }

    if (ticket.attachments.length >= 5) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: ["Maximum limit of 5 active attachments per ticket reached"],
      });
    }

    const { fileName, fileSize, mimeType, filePath } = req.body ?? {};
    const errors: string[] = [];

    const trimmedFileName = typeof fileName === "string" ? fileName.trim() : "";
    if (!trimmedFileName) {
      errors.push("fileName is required");
    }

    const parsedSize = parseInt(String(fileSize), 10);
    if (isNaN(parsedSize) || parsedSize <= 0) {
      errors.push("fileSize must be a positive number");
    } else if (parsedSize > 5 * 1024 * 1024) {
      errors.push("File size exceeds maximum allowed limit of 5 MB");
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!mimeType || typeof mimeType !== "string" || !allowedMimeTypes.includes(mimeType.toLowerCase())) {
      errors.push("Allowed file types are JPG, JPEG, PNG, WEBP, and PDF");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: errors,
      });
    }

    const attachment = await prisma.attachment.create({
      data: {
        ticketId,
        fileName: trimmedFileName,
        fileSize: parsedSize,
        mimeType: mimeType.toLowerCase(),
        filePath: filePath || `/uploads/${trimmedFileName}`,
        isRemoved: false,
      },
    });

    return res.status(201).json(attachment);
  } catch (err: any) {
    console.error("Failed to upload attachment:", err);
    return res.status(500).json({ error: "Failed to upload attachment" });
  }
});

app.get("/api/attachments/:id/download", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    let requesterId: number | undefined;
    if (req.user) {
      requesterId = req.user.id;
    } else {
      const rawRequesterId = req.headers["x-requester-id"];
      if (!rawRequesterId) {
        return res.status(400).json({
          statusCode: 400,
          error: "Bad Request",
          message: ["x-requester-id header is required"],
        });
      }
      requesterId = parseInt(String(rawRequesterId), 10);
    }

    const attachmentId = parseInt(req.params.id, 10);
    if (isNaN(attachmentId) || (requesterId === undefined && !req.user)) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: ["Invalid attachment ID or requester ID"],
      });
    }

    const prisma = getPrisma();
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: { select: { requesterId: true } } },
    });

    if (!attachment) {
      return res.status(404).json({
        statusCode: 404,
        error: "Not Found",
        message: "Attachment not found",
      });
    }

    if (
      attachment.ticket.requesterId !== requesterId &&
      req.user?.role !== Role.IT_STAFF &&
      req.user?.role !== Role.ADMINISTRATOR
    ) {
      return res.status(403).json({
        statusCode: 403,
        error: "Forbidden",
        message: "Access denied to attachment belonging to another requester",
      });
    }

    if (attachment.isRemoved) {
      return res.status(410).json({
        statusCode: 410,
        error: "Gone",
        message: "Attachment is soft-removed and unavailable for download",
      });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${attachment.fileName}"`);
    res.setHeader("Content-Type", attachment.mimeType);
    return res.status(200).send(`Binary stream content for file: ${attachment.fileName}`);
  } catch (err: any) {
    console.error("Failed to download attachment:", err);
    return res.status(500).json({ error: "Failed to download attachment" });
  }
});

app.delete("/api/attachments/:id", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    let requesterId: number | undefined;
    if (req.user) {
      requesterId = req.user.id;
    } else {
      const rawRequesterId = req.headers["x-requester-id"];
      if (!rawRequesterId) {
        return res.status(400).json({
          statusCode: 400,
          error: "Bad Request",
          message: ["x-requester-id header is required"],
        });
      }
      requesterId = parseInt(String(rawRequesterId), 10);
    }

    const attachmentId = parseInt(req.params.id, 10);
    if (isNaN(attachmentId) || (requesterId === undefined && !req.user)) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: ["Invalid attachment ID or requester ID"],
      });
    }

    const { removalReason } = req.body ?? {};
    const trimmedReason = typeof removalReason === "string" ? removalReason.trim() : "";
    if (!trimmedReason || trimmedReason.length < 3 || trimmedReason.length > 200) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: ["removalReason must be between 3 and 200 characters"],
      });
    }

    const prisma = getPrisma();
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: { select: { requesterId: true } } },
    });

    if (!attachment) {
      return res.status(404).json({
        statusCode: 404,
        error: "Not Found",
        message: "Attachment not found",
      });
    }

    if (
      attachment.ticket.requesterId !== requesterId &&
      req.user?.role !== Role.IT_STAFF &&
      req.user?.role !== Role.ADMINISTRATOR
    ) {
      return res.status(403).json({
        statusCode: 403,
        error: "Forbidden",
        message: "Access denied to attachment belonging to another requester",
      });
    }

    const updated = await prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        isRemoved: true,
        removedAt: new Date(),
        removalReason: trimmedReason,
      },
    });

    return res.status(200).json(updated);
  } catch (err: any) {
    console.error("Failed to remove attachment:", err);
    return res.status(500).json({ error: "Failed to remove attachment" });
  }
});

// ---------------------------------------------------------------------------
// Admin User Management (FR-12, FR-13)
// ---------------------------------------------------------------------------
import { hashPassword, validatePasswordComplexity } from "./modules/auth/auth.service.js";

// GET /api/admin/users — List all users with search, filter, pagination
app.get(
  "/api/admin/users",
  authenticate,
  requireRoles(Role.ADMINISTRATOR),
  async (req: Request, res: Response) => {
    try {
      const {
        search,
        role,
        isActive,
        page = "1",
        limit = "10",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const where: any = {};

      if (search && typeof search === "string" && search.trim().length > 0) {
        const q = search.trim();
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ];
      }

      if (role && typeof role === "string" && role !== "ALL") {
        const upperRole = role.toUpperCase();
        if (["REQUESTER", "IT_STAFF", "ADMINISTRATOR"].includes(upperRole)) {
          where.role = upperRole;
        }
      }

      if (isActive !== undefined && isActive !== "ALL") {
        if (isActive === "true") where.isActive = true;
        else if (isActive === "false") where.isActive = false;
      }

      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const allowedSortFields = ["createdAt", "updatedAt", "name", "email", "role"];
      const sortField = allowedSortFields.includes(String(sortBy)) ? String(sortBy) : "createdAt";
      const order = String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

      const prisma = getPrisma();
      const [totalItems, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { [sortField]: order },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            department: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      ]);

      const totalPages = Math.ceil(totalItems / limitNum) || 1;

      return res.status(200).json({
        data: users,
        pagination: {
          totalItems,
          currentPage: pageNum,
          totalPages,
          pageSize: limitNum,
        },
      });
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

// POST /api/admin/users — Create a new user
app.post(
  "/api/admin/users",
  authenticate,
  requireRoles(Role.ADMINISTRATOR),
  async (req: Request, res: Response) => {
    try {
      const { name, email, role, department, initialPassword, password: bodyPassword } = req.body ?? {};
      const errors: string[] = [];

      const trimmedName = typeof name === "string" ? name.trim() : "";
      if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
        errors.push("Name must be between 2 and 100 characters");
      }

      const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        errors.push("A valid email address is required");
      }

      const validRoles = ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"];
      const userRole = typeof role === "string" ? role.toUpperCase() : "";
      if (!validRoles.includes(userRole)) {
        errors.push("Role must be one of REQUESTER, IT_STAFF, ADMINISTRATOR");
      }

      const password = typeof initialPassword === "string" ? initialPassword : (typeof bodyPassword === "string" ? bodyPassword : "");
      const complexity = validatePasswordComplexity(password);
      if (!complexity.valid) {
        errors.push(complexity.error || "Password does not meet complexity requirements");
      }

      if (errors.length > 0) {
        return res.status(400).json({
          statusCode: 400,
          error: "Bad Request",
          message: errors,
        });
      }

      const prisma = getPrisma();

      // Check unique email
      const existingUser = await prisma.user.findUnique({ where: { email: trimmedEmail } });
      if (existingUser) {
        return res.status(409).json({
          statusCode: 409,
          error: "Conflict",
          message: "A user with this email already exists",
        });
      }

      const passwordHash = await hashPassword(password);

      const newUser = await prisma.user.create({
        data: {
          name: trimmedName,
          email: trimmedEmail,
          role: userRole as Role,
          department: typeof department === "string" ? department.trim() || null : null,
          passwordHash,
          mustChangePassword: true,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          department: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.status(201).json(newUser);
    } catch (err: any) {
      console.error("Failed to create user:", err);
      return res.status(500).json({ error: "Failed to create user" });
    }
  }
);

// PATCH /api/admin/users/:id — Edit user details, role, active state
app.patch(
  "/api/admin/users/:id",
  authenticate,
  requireRoles(Role.ADMINISTRATOR),
  async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const prisma = getPrisma();
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { name, email, role, department, isActive } = req.body ?? {};
      const updateData: any = {};

      if (name !== undefined) {
        const trimmedName = typeof name === "string" ? name.trim() : "";
        if (trimmedName.length < 2 || trimmedName.length > 100) {
          return res.status(400).json({ error: "Name must be between 2 and 100 characters" });
        }
        updateData.name = trimmedName;
      }

      if (email !== undefined) {
        const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
          return res.status(400).json({ error: "A valid email address is required" });
        }
        // Check uniqueness (exclude current user)
        const existingUser = await prisma.user.findFirst({
          where: { email: trimmedEmail, id: { not: userId } },
        });
        if (existingUser) {
          return res.status(409).json({ error: "A user with this email already exists" });
        }
        updateData.email = trimmedEmail;
      }

      if (role !== undefined) {
        const validRoles = ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"];
        const newRole = typeof role === "string" ? role.toUpperCase() : "";
        if (!validRoles.includes(newRole)) {
          return res.status(400).json({ error: "Role must be one of REQUESTER, IT_STAFF, ADMINISTRATOR" });
        }

        // BR-12: Cannot change role of last active admin
        if (targetUser.role === Role.ADMINISTRATOR && newRole !== "ADMINISTRATOR") {
          const activeAdminCount = await prisma.user.count({
            where: { role: Role.ADMINISTRATOR, isActive: true },
          });
          if (activeAdminCount <= 1) {
            return res.status(400).json({
              error: "Cannot change the role of the last active Administrator",
            });
          }
        }
        updateData.role = newRole;
      }

      if (department !== undefined) {
        updateData.department = typeof department === "string" ? department.trim() || null : null;
      }

      if (isActive !== undefined) {
        const active = Boolean(isActive);

        // BR-11: Cannot deactivate yourself
        if (!active && userId === req.user!.id) {
          return res.status(400).json({
            error: "You cannot deactivate your own account",
          });
        }

        // BR-12: Cannot deactivate last active admin
        if (!active && targetUser.role === Role.ADMINISTRATOR) {
          const activeAdminCount = await prisma.user.count({
            where: { role: Role.ADMINISTRATOR, isActive: true },
          });
          if (activeAdminCount <= 1) {
            return res.status(400).json({
              error: "Cannot deactivate the last active Administrator",
            });
          }
        }
        updateData.isActive = active;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          department: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.status(200).json(updatedUser);
    } catch (err: any) {
      console.error("Failed to update user:", err);
      return res.status(500).json({ error: "Failed to update user" });
    }
  }
);

// POST /api/admin/users/:id/reset-password — Set temporary password
app.post(
  "/api/admin/users/:id/reset-password",
  authenticate,
  requireRoles(Role.ADMINISTRATOR),
  async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const { newPassword } = req.body ?? {};
      if (!newPassword || typeof newPassword !== "string") {
        return res.status(400).json({ error: "newPassword is required" });
      }

      const complexity = validatePasswordComplexity(newPassword);
      if (!complexity.valid) {
        return res.status(400).json({ error: complexity.error });
      }

      const prisma = getPrisma();
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const passwordHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          mustChangePassword: true,
        },
      });

      return res.status(200).json({ message: "Password reset successfully. User must change password on next login." });
    } catch (err: any) {
      console.error("Failed to reset password:", err);
      return res.status(500).json({ error: "Failed to reset password" });
    }
  }
);

export default app;
