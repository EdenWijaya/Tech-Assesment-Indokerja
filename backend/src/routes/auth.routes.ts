import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../validations/auth.validation";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", authenticate, getMe);

export default router;
