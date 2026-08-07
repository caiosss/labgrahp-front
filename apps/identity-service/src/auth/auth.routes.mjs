import { Router } from "express";
import { login, register } from "./auth.controller.mjs";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
