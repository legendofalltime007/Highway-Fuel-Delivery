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

// Parse CORS origins (supports '*' for all or comma-separated list)
const rawCorsOrigin = config.corsOrigin;
const isWildcard = rawCorsOrigin.trim() === "*";

// Build a CORS origin value that works correctly:
// - If '*', use a callback that reflects the requesting origin (needed with credentials)
// - Otherwise, split comma-separated list into an array
const corsOriginConfig: any = isWildcard
  ? (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      callback(null, true); // Allow all origins
    }
  : rawCorsOrigin.split(",").map((o) => o.trim());

const corsOptions = {
  origin: corsOriginConfig,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Initialize Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: isWildcard ? true : rawCorsOrigin.split(",").map((o) => o.trim()),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ─── Middleware ───────────────────────────────────────────
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight for all routes
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

  const HOST = "0.0.0.0";
  server.listen(config.port, HOST, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║   🚛 Highway Fuel Delivery API              ║
║   Running on: http://${HOST}:${config.port}            ║
║   Environment: ${process.env.NODE_ENV || "development"}              ║
╚══════════════════════════════════════════════╝
    `);
  });
};

startServer();

export { app, io };
