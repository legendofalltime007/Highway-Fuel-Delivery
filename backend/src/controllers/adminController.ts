import { Request, Response } from "express";
import User from "../models/User";
import Order from "../models/Order";
import Vehicle from "../models/Vehicle";
import { AuthRequest } from "../middlewares/auth";

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalCustomers, totalDrivers, onlineDrivers, totalOrders, activeOrders, completedOrders, totalVehicles] =
      await Promise.all([
        User.countDocuments({ role: "customer" }),
        User.countDocuments({ role: "driver" }),
        User.countDocuments({ role: "driver", isOnline: true }),
        Order.countDocuments(),
        Order.countDocuments({ status: { $nin: ["completed", "cancelled"] } }),
        Order.countDocuments({ status: "completed" }),
        Vehicle.countDocuments(),
      ]);

    // Calculate total revenue from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      stats: {
        totalCustomers,
        totalDrivers,
        onlineDrivers,
        totalOrders,
        activeOrders,
        completedOrders,
        totalVehicles,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error fetching stats." });
  }
};

/**
 * GET /api/admin/users
 * Get all users with optional role filter
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.query;
    const filter: any = {};
    if (role) filter.role = role;

    const users = await User.find(filter).select("-passwordHash").sort({ createdAt: -1 });
    res.status(200).json({ users, count: users.length });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error fetching users." });
  }
};

/**
 * GET /api/admin/orders
 * Get all orders with optional status filter
 */
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate("customerId", "name email phone")
      .populate("driverId", "name phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders, count: orders.length });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Server error fetching orders." });
  }
};
