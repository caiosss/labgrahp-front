import { Router } from "express";
import { requireAuth } from "../security/require-auth.mjs";
import { requireTrustedOrigin } from "../security/trusted-origin.mjs";
import { login, logout, me, refresh, register } from "./auth.controller.mjs";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", requireTrustedOrigin, refresh);
authRouter.post("/logout", requireTrustedOrigin, logout);
authRouter.get("/me", requireAuth, me);
