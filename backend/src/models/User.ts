import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "customer" | "driver" | "admin";
  phone: string;
  // Driver-specific fields
  licenseNumber?: string;
  isOnline?: boolean;
  currentLocation?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  truckId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "driver", "admin"], default: "customer" },
    phone: { type: String, required: true },
    // Driver-specific
    licenseNumber: { type: String },
    isOnline: { type: Boolean, default: false },
    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    truckId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
  },
  { timestamps: true }
);

// Geospatial index for finding nearby drivers
UserSchema.index({ currentLocation: "2dsphere" });

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
