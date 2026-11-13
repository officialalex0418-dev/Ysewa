import mongoose, { Document, Schema } from "mongoose";

export interface ITripSeat extends Document {
  tripId: mongoose.Types.ObjectId;
  seatLabel: string;
  status: "available" | "locked" | "booked" | "held_crew";
  lockedBy?: string;
  lockedUntil?: Date;
  bookingId?: mongoose.Types.ObjectId;
  version: number;
}

const TripSeatSchema = new Schema<ITripSeat>({
  tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
  seatLabel: { type: String, required: true },
  status: {
    type: String,
    enum: ["available", "locked", "booked", "held_crew"],
    default: "available"
  },
  lockedBy: { type: String },
  lockedUntil: { type: Date },
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
  version: { type: Number, default: 1 }, // Used for optimistic concurrency control
});

// Composite unique index
TripSeatSchema.index({ tripId: 1, seatLabel: 1 }, { unique: true });

export const TripSeat = mongoose.models.TripSeat || mongoose.model<ITripSeat>("TripSeat", TripSeatSchema);
