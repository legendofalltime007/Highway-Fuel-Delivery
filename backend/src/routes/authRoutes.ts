import { Router } from "express";
import { register, login, refreshToken, getMe } from "../controllers/authController";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

// Protected routes
router.get("/me", authenticate, getMe);

export default router;
