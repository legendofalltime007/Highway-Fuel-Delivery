import { Router } from "express";
import { getDashboardStats, getAllUsers, getAllOrders } from "../controllers/adminController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/orders", getAllOrders);

export default router;
