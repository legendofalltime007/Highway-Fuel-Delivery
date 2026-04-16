import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import config from "./config";
import connectDB from "./config/db";
import { errorHandler } from "./middlewares/errorHandler";
import { initializeSockets } from "./sockets";
import { seedAdmin } from "./utils/seed";

// Import routes
import authRoutes from "./routes/authRoutes";
import orderRoutes from "./routes/orderRoutes";
import driverRoutes from "./routes/driverRoutes";
import adminRoutes from "./routes/adminRoutes";

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Parse CORS origins (supports comma-separated list for multiple frontends)
const corsOrigins = config.corsOrigin.split(",").map((o) => o.trim());

// Initialize Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
  },
});

// ─── Middleware ───────────────────────────────────────────
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Highway Fuel Delivery API",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ──────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/admin", adminRoutes);

// ─── Error Handler (must be last) ────────────────────────
app.use(errorHandler);

// ─── Socket.io ───────────────────────────────────────────
initializeSockets(io);

// ─── Start Server ────────────────────────────────────────
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Seed default admin account
  await seedAdmin();

  server.listen(config.port, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║   🚛 Highway Fuel Delivery API              ║
║   Running on: http://localhost:${config.port}         ║
║   Environment: ${process.env.NODE_ENV || "development"}              ║
╚══════════════════════════════════════════════╝
    `);
  });
};

startServer();

export { app, io };
