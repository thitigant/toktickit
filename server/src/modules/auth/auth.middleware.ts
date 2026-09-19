import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { getPrisma } from "../../prisma.js";
import { toSafeUser, verifyToken, SafeUser } from "./auth.service.js";

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers["x-auth-token"]) {
    token = req.headers["x-auth-token"] as string;
  }

  if (!token) {
    res.status(401).json({ error: "Unauthorized: Missing authentication token." });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Unauthorized: Invalid or expired token." });
    return;
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id: payload.id } });

  if (!user || !user.isActive) {
    res.status(401).json({ error: "Unauthorized: Account not found or deactivated." });
    return;
  }

  req.user = toSafeUser(user);
  next();
}

export function requireRoles(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: Authentication required." });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden: You do not have permission to access this resource." });
      return;
    }

    next();
  };
}

export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers["x-auth-token"]) {
    token = req.headers["x-auth-token"] as string;
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const prisma = getPrisma();
      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (user && user.isActive) {
        req.user = toSafeUser(user);
      }
    }
  }
  next();
}

