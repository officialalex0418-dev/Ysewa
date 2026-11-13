import mongoose, { Document, Schema } from "mongoose";

export interface IOperator extends Document {
  legalName: string;
  brandName: string;
  panNo: string;
  contactEmail: string;
  contactPhone: string;
  ownerName?: string;
  ownerPhone?: string;
  registrationNumber?: string;
  primaryAddress: string;
  status: "pending" | "approved" | "rejected";
  commissionType: "percentage" | "fixed";
  commissionValue: number;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OperatorSchema = new Schema<IOperator>(
  {
    legalName: { type: String, required: true },
    brandName: { type: String, required: true },
    panNo: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    ownerName: { type: String },
    ownerPhone: { type: String },
    registrationNumber: { type: String },
    primaryAddress: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    commissionType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    commissionValue: { type: Number, default: 10 },
    logoUrl: { type: String },
  },
  { timestamps: true }
);

export const Operator = mongoose.models.Operator || mongoose.model<IOperator>("Operator", OperatorSchema);
