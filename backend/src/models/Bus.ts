import mongoose, { Document, Schema } from "mongoose";

export interface IBus extends Document {
  operatorId: mongoose.Types.ObjectId;
  plateNumber: string;
  vehicleType: string;
  nickname?: string;
  amenities: {
    wifi?: boolean;
    ac?: boolean;
    chargingPort?: boolean;
    waterBottle?: boolean;
    blanket?: boolean;
    readingLight?: boolean;
    cctv?: boolean;
    lunchIncluded?: boolean;
  };
  cabinLayout: any; // Storing layout as a JSON object directly
  status: "active" | "maintenance" | "retired";
  createdAt: Date;
  updatedAt: Date;
}

const BusSchema = new Schema<IBus>(
  {
    operatorId: { type: Schema.Types.ObjectId, ref: "Operator", required: true },
    plateNumber: { type: String, required: true, unique: true },
    vehicleType: { type: String, required: true },
    nickname: { type: String },
    amenities: {
      wifi: { type: Boolean, default: false },
      ac: { type: Boolean, default: false },
      chargingPort: { type: Boolean, default: false },
      waterBottle: { type: Boolean, default: false },
      blanket: { type: Boolean, default: false },
      readingLight: { type: Boolean, default: false },
      cctv: { type: Boolean, default: false },
      lunchIncluded: { type: Boolean, default: false },
    },
    cabinLayout: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ["active", "maintenance", "retired"], default: "active" },
  },
  { timestamps: true }
);

export const Bus = mongoose.models.Bus || mongoose.model<IBus>("Bus", BusSchema);
