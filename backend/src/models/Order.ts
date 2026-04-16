import mongoose, { Document, Schema } from "mongoose";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "en-route"
  | "arrived"
  | "fueling"
  | "completed"
  | "cancelled";

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  status: OrderStatus;
  fuelType: "gasoline" | "diesel";
  quantityGallons: number;
  totalPrice: number;
  customerLocation: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  deliveryAddress: string; // highway marker details
  requestedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["pending", "accepted", "en-route", "arrived", "fueling", "completed", "cancelled"],
      default: "pending",
    },
    fuelType: { type: String, enum: ["gasoline", "diesel"], required: true },
    quantityGallons: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    customerLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    deliveryAddress: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

OrderSchema.index({ customerLocation: "2dsphere" });

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
