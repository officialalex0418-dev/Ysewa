import mongoose, { Document, Schema } from "mongoose";

export interface ITrip extends Document {
  operatorId: mongoose.Types.ObjectId;
  busId: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  tripDate: Date;
  departureTime: Date;
  arrivalTime: Date;
  driverId?: mongoose.Types.ObjectId;
  conductorId?: mongoose.Types.ObjectId;
  fare: number;
  availableSeats: number;
  status: "scheduled" | "boarding" | "in_transit" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    operatorId: { type: Schema.Types.ObjectId, ref: "Operator", required: true },
    busId: { type: Schema.Types.ObjectId, ref: "Bus", required: true },
    routeId: { type: Schema.Types.ObjectId, ref: "Route", required: true },
    tripDate: { type: Date, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "User" },
    conductorId: { type: Schema.Types.ObjectId, ref: "User" },
    fare: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    status: {
      type: String,
      enum: ["scheduled", "boarding", "in_transit", "completed", "cancelled"],
      default: "scheduled"
    },
  },
  { timestamps: true }
);

export const Trip = mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);
