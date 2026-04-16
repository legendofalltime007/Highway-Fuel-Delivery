import { Router } from "express";
import { createOrder, getOrders, getOrderById, updateOrderStatus } from "../controllers/orderController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.post("/", authorize("customer"), createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", authorize("driver", "admin"), updateOrderStatus);

export default router;
