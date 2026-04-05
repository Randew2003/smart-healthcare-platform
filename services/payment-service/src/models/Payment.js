import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    appointmentId: {
      type: String,
      required: true,
      index: true
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: "",
      trim: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "LKR",
      trim: true
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "PENDING"
    },
    paymentMethod: {
      type: String,
      default: "PayHere"
    },
    payhere: {
      paymentId: { type: String, default: "" },
      statusCode: { type: String, default: "" },
      md5sig: { type: String, default: "" },
      method: { type: String, default: "" },
      cardHolderName: { type: String, default: "" },
      cardNo: { type: String, default: "" },
      capturedAmount: { type: String, default: "" },
      currency: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);