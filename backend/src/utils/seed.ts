import bcrypt from "bcryptjs";
import User from "../models/User";

/**
 * Seed a default admin account if none exists
 * This runs once on server startup
 */
export const seedAdmin = async (): Promise<void> => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("ℹ️  Admin account already exists. Skipping seed.");
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash("admin123", salt);

    await User.create({
      name: "System Admin",
      email: "admin@highwayfuel.com",
      passwordHash,
      role: "admin",
      phone: "1234567890",
    });

    console.log("✅ Default admin seeded: admin@highwayfuel.com / admin123");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
  }
};
