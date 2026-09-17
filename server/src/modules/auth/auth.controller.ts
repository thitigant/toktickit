import { Request, Response } from "express";
import { getPrisma } from "../../prisma.js";
import {
  comparePassword,
  generateToken,
  hashPassword,
  toSafeUser,
  validatePasswordComplexity,
} from "./auth.service.js";

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  if (!user.isActive) {
    res.status(401).json({ error: "Account is deactivated. Please contact an administrator." });
    return;
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  const token = generateToken(user);
  res.status(200).json({
    user: toSafeUser(user),
    token,
  });
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.status(200).json(req.user);
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(400).json({ error: "All password fields are required." });
    return;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: "New password and confirmation do not match." });
    return;
  }

  if (currentPassword === newPassword) {
    res.status(400).json({ error: "New password must be different from the current password." });
    return;
  }

  const complexity = validatePasswordComplexity(newPassword);
  if (!complexity.valid) {
    res.status(400).json({ error: complexity.error });
    return;
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  const isCurrentMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isCurrentMatch) {
    res.status(400).json({ error: "Incorrect current password." });
    return;
  }

  const newHash = await hashPassword(newPassword);
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
    },
  });

  const newToken = generateToken(updatedUser);

  res.status(200).json({
    message: "Password changed successfully.",
    user: toSafeUser(updatedUser),
    token: newToken,
  });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // Stateles JWT token client-side discard / acknowledge
  res.status(200).json({ message: "Logged out successfully." });
}
