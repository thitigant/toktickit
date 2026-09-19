import { Router } from "express";
import { changePassword, getCurrentUser, login, logout } from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, getCurrentUser);
authRouter.post("/change-password", authenticate, changePassword);
