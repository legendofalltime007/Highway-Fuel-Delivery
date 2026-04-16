import mongoose, { Document, Schema } from "mongoose";

export interface IVehicle extends Document {
  plateNumber: string;
  capacity: number; // total capacity in gallons
  currentStock: {
    gasoline: number;
    diesel: number;
  };
  assignedDriverId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    plateNumber: { type: String, required: true, unique: true, uppercase: true },
    capacity: { type: Number, required: true },
    currentStock: {
      gasoline: { type: Number, default: 0 },
      diesel: { type: Number, default: 0 },
    },
    assignedDriverId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model<IVehicle>("Vehicle", VehicleSchema);
export default Vehicle;
