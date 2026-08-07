import { Router } from "express";
import { register } from "./auth.controller.mjs";

export const authRouter = Router();

authRouter.post("/register", register);