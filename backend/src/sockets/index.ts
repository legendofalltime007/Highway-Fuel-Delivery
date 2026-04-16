import { Server as SocketIOServer, Socket } from "socket.io";

/**
 * Initialize Socket.io event handlers for real-time features:
 * - Driver location broadcasting
 * - Order status change notifications
 */
export const initializeSockets = (io: SocketIOServer): void => {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /**
     * Join an order-specific room for live tracking
     * Client emits: socket.emit("join-order", orderId)
     */
    socket.on("join-order", (orderId: string) => {
      socket.join(`order_${orderId}`);
      console.log(`📡 Socket ${socket.id} joined room: order_${orderId}`);
    });

    /**
     * Leave an order room
     */
    socket.on("leave-order", (orderId: string) => {
      socket.leave(`order_${orderId}`);
      console.log(`📡 Socket ${socket.id} left room: order_${orderId}`);
    });

    /**
     * Driver sends live location updates during delivery
     * Client emits: socket.emit("driver-location", { orderId, coordinates: [lng, lat] })
     * Server broadcasts to: order_${orderId} room
     */
    socket.on("driver-location", (data: { orderId: string; coordinates: [number, number] }) => {
      const { orderId, coordinates } = data;
      io.to(`order_${orderId}`).emit("location-update", {
        orderId,
        coordinates,
        timestamp: new Date(),
      });
    });

    /**
     * Order status change notification
     * Server emits to order room when status changes
     */
    socket.on("order-status-change", (data: { orderId: string; status: string }) => {
      io.to(`order_${data.orderId}`).emit("status-update", {
        orderId: data.orderId,
        status: data.status,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
