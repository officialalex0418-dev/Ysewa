import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  pnr: string;
  userId?: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  operatorId: mongoose.Types.ObjectId;
  counterId?: mongoose.Types.ObjectId;
  channel: "online" | "counter" | "bookie" | "conductor";
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalFare: number;
  discountAmt: number;
  netPayable: number;
  passengerCount: number;
  seatLabels: string[];
  contactPhone: string;
  contactEmail?: string;
  passengerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    pnr: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    operatorId: { type: Schema.Types.ObjectId, ref: "Operator", required: true },
    counterId: { type: Schema.Types.ObjectId, ref: "Counter" },
    channel: {
      type: String,
      enum: ["online", "counter", "bookie", "conductor"],
      required: true
    },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING_PAYMENT"
    },
    totalFare: { type: Number, required: true },
    discountAmt: { type: Number, default: 0 },
    netPayable: { type: Number, required: true },
    passengerCount: { type: Number, required: true },
    seatLabels: [{ type: String, required: true }],
    contactPhone: { type: String, required: true },
    contactEmail: { type: String },
    passengerName: { type: String },
  },
  { timestamps: true }
);

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
