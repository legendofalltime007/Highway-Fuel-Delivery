import { Router } from "express";
import { getNearbyDrivers, updateDriverStatus, updateDriverLocation } from "../controllers/driverController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

// All driver routes require authentication
router.use(authenticate);

router.get("/nearby", getNearbyDrivers);
router.put("/status", authorize("driver"), updateDriverStatus);
router.put("/location", authorize("driver"), updateDriverLocation);

export default router;
