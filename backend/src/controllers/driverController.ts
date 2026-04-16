import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middlewares/auth";

/**
 * GET /api/drivers/nearby
 * Find nearby available drivers using geospatial query
 * Query Params: lng, lat, maxDistance (in meters, default 50km)
 */
export const getNearbyDrivers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lng, lat, maxDistance } = req.query;

    if (!lng || !lat) {
      res.status(400).json({ message: "lng and lat query parameters are required." });
      return;
    }

    const longitude = parseFloat(lng as string);
    const latitude = parseFloat(lat as string);
    const distance = parseInt((maxDistance as string) || "50000", 10); // default 50km

    const drivers = await User.find({
      role: "driver",
      isOnline: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: distance,
        },
      },
    }).select("name phone currentLocation");

    res.status(200).json({ drivers, count: drivers.length });
  } catch (error) {
    console.error("Nearby drivers error:", error);
    res.status(500).json({ message: "Server error finding nearby drivers." });
  }
};

/**
 * PUT /api/drivers/status
 * Toggle driver online/offline status
 */
export const updateDriverStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isOnline, coordinates } = req.body;

    if (typeof isOnline !== "boolean") {
      res.status(400).json({ message: "isOnline (boolean) is required." });
      return;
    }

    const updateData: any = { isOnline };

    // Update location if going online
    if (isOnline && coordinates) {
      updateData.currentLocation = {
        type: "Point",
        coordinates, // [longitude, latitude]
      };
    }

    const driver = await User.findByIdAndUpdate(req.user!._id, updateData, { new: true }).select(
      "-passwordHash"
    );

    if (!driver) {
      res.status(404).json({ message: "Driver not found." });
      return;
    }

    res.status(200).json({
      message: `Driver is now ${isOnline ? "online" : "offline"}.`,
      driver,
    });
  } catch (error) {
    console.error("Update driver status error:", error);
    res.status(500).json({ message: "Server error updating driver status." });
  }
};

/**
 * PUT /api/drivers/location
 * Update driver's live location (called frequently during delivery)
 */
export const updateDriverLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || coordinates.length !== 2) {
      res.status(400).json({ message: "coordinates [lng, lat] are required." });
      return;
    }

    await User.findByIdAndUpdate(req.user!._id, {
      currentLocation: {
        type: "Point",
        coordinates,
      },
    });

    res.status(200).json({ message: "Location updated." });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ message: "Server error updating location." });
  }
};
