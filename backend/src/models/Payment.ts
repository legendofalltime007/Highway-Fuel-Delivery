import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  providerTxId?: string; // e.g., Stripe PaymentIntent ID
  status: "pending" | "succeeded" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    providerTxId: { type: String },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
