import mongoose, { Document, Schema } from "mongoose";

export interface ICity extends Document {
  name: string;
  state: string;
}

const CitySchema = new Schema<ICity>({
  name: { type: String, required: true, unique: true },
  state: { type: String, required: true },
});

export const City = mongoose.models.City || mongoose.model<ICity>("City", CitySchema);

export interface IRoute extends Document {
  routeName: string;
  originCityId: mongoose.Types.ObjectId;
  destCityId: mongoose.Types.ObjectId;
  distanceKm: number;
  isActive: boolean;
  stops: {
    stopName: string;
    sequence: number;
    arrivalOffsetMin: number;
    isBoarding: boolean;
    isDropping: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema = new Schema<IRoute>(
  {
    routeName: { type: String, required: true },
    originCityId: { type: Schema.Types.ObjectId, ref: "City", required: true },
    destCityId: { type: Schema.Types.ObjectId, ref: "City", required: true },
    distanceKm: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    stops: [
      {
        stopName: { type: String, required: true },
        sequence: { type: Number, required: true },
        arrivalOffsetMin: { type: Number, required: true },
        isBoarding: { type: Boolean, default: true },
        isDropping: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

export const Route = mongoose.models.Route || mongoose.model<IRoute>("Route", RouteSchema);
