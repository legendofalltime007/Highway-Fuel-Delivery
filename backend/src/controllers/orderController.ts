import { Response } from "express";
import Order from "../models/Order";
import User from "../models/User";
import { AuthRequest } from "../middlewares/auth";

/**
 * POST /api/orders
 * Create a new fuel request (Customer only)
 */
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fuelType, quantityGallons, customerLocation, deliveryAddress } = req.body;

    if (!fuelType || !quantityGallons || !customerLocation || !deliveryAddress) {
      res.status(400).json({ message: "fuelType, quantityGallons, customerLocation, and deliveryAddress are required." });
      return;
    }

    // Calculate price (simple: $4.50/gal gasoline, $5.00/gal diesel + $15 service fee)
    const pricePerGallon = fuelType === "diesel" ? 5.0 : 4.5;
    const totalPrice = quantityGallons * pricePerGallon + 15;

    const order = await Order.create({
      customerId: req.user!._id,
      fuelType,
      quantityGallons,
      totalPrice,
      customerLocation: {
        type: "Point",
        coordinates: customerLocation.coordinates, // [longitude, latitude]
      },
      deliveryAddress,
    });

    res.status(201).json({ message: "Fuel request created.", order });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error creating order." });
  }
};

/**
 * GET /api/orders
 * List orders (role-based filtering)
 * - Customer: sees only their orders
 * - Driver: sees pending orders + their assigned orders
 * - Admin: sees all orders
 */
export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    let filter: any = {};

    if (user.role === "customer") {
      filter.customerId = user._id;
    } else if (user.role === "driver") {
      filter = {
        $or: [{ status: "pending" }, { driverId: user._id }],
      };
    }
    // Admin: no filter, sees everything

    const orders = await Order.find(filter)
      .populate("customerId", "name email phone")
      .populate("driverId", "name phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error fetching orders." });
  }
};

/**
 * GET /api/orders/:id
 * Get single order details
 */
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customerId", "name email phone")
      .populate("driverId", "name phone currentLocation");

    if (!order) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    // Customers can only see their own orders
    if (req.user!.role === "customer" && order.customerId._id.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: "Access denied." });
      return;
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error fetching order." });
  }
};

/**
 * PATCH /api/orders/:id/status
 * Update order status (Driver or Admin)
 */
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ["accepted", "en-route", "arrived", "fueling", "completed", "cancelled"];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      return;
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    // If a driver is accepting, assign them to the order
    if (status === "accepted" && req.user!.role === "driver") {
      order.driverId = req.user!._id;
      order.acceptedAt = new Date();
    }

    if (status === "completed") {
      order.completedAt = new Date();
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated.", order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error updating order." });
  }
};
