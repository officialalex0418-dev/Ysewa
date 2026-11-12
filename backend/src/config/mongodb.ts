// @ts-nocheck
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/yatrasewa";

let isConnected = false;

export async function connectMongoDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true,
    });
    isConnected = true;
    console.log("[MongoDB Atlas] Connected successfully!");
  } catch (err) {
    console.warn("[MongoDB Atlas] Connection notice:", err);
  }
}

const OperatorSchema = new mongoose.Schema(
  {
    operatorId: { type: String, required: true, unique: true },
    legalName: { type: String, required: true },
    brandName: { type: String, required: true },
    panNo: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    ownerName: { type: String },
    ownerPhone: { type: String },
    registrationNumber: { type: String },
    primaryAddress: { type: String, required: true },
    status: { type: String, default: "pending" },
    commissionType: { type: String, default: "percentage" },
    commissionValue: { type: Number, default: 10 },
    regCertName: { type: String },
    panCertName: { type: String },
  },
  { timestamps: true }
);

export const MongoOperator =
  mongoose.models.Operator || mongoose.model("Operator", OperatorSchema);
