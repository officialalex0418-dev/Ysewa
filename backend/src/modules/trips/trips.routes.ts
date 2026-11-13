import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Trip } from "../../models/Trip.js";
import { TripSeat } from "../../models/TripSeat.js";
import { Bus } from "../../models/Bus.js";
import { validate } from "../../middlewares/validate.js";
import { authRequired, optionalAuth } from "../../middlewares/auth.middleware.js";
import { httpError } from "../../middlewares/error-handler.js";

const router = Router();

const CreateTripSchema = z.object({
  busId: z.string(),
  routeId: z.string(),
  tripDate: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  fare: z.number().positive(),
  driverId: z.string().optional(),
  conductorId: z.string().optional(),
});

router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("operatorId")
      .populate("busId")
      .populate({
        path: "routeId",
        populate: [{ path: "originCityId" }, { path: "destCityId" }]
      })
      .lean();

    if (!trip) throw httpError(404, "Trip not found");

    // Map seats to available/booked
    const seats = await TripSeat.find({ tripId: trip._id }).lean();
    const seatStates: Record<string, string> = {};
    seats.forEach((s) => { seatStates[s.seatLabel] = s.status; });

    res.json({ ...trip, seatStates });
  } catch (e) { next(e); }
});

router.post("/", authRequired, validate(CreateTripSchema), async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user!.operatorId) throw httpError(403, "Operator required");
    const bus = await Bus.findById(req.body.busId).session(session);
    if (!bus) throw httpError(404, "Bus not found");

    // Detect schedule conflicts (same bus on same date within 6h window)
    const dep = new Date(req.body.departureTime);
    const conflict = await Trip.findOne({
      busId: bus._id,
      departureTime: {
          $gte: new Date(dep.getTime() - 6 * 3600000),
          $lte: new Date(dep.getTime() + 6 * 3600000)
      }
    }).session(session);

    if (conflict) throw httpError(409, "Schedule conflict: this bus already has a trip within 6 hours");

    const t = await Trip.create([{
        operatorId: req.user!.operatorId!,
        busId: bus._id,
        routeId: req.body.routeId,
        tripDate: new Date(req.body.tripDate),
        departureTime: dep,
        arrivalTime: new Date(req.body.arrivalTime),
        driverId: req.body.driverId,
        conductorId: req.body.conductorId,
        fare: req.body.fare,
        availableSeats: bus.cabinLayout.totalSeats,
    }], { session });

    const trip = t[0];

    // Create seat rows
    const layout = bus.cabinLayout as any;
    const seatData = layout.layoutJson.seats
        .filter((s: any) => s.type === "regular" || s.type === "lady" || s.type === "vip" || s.type === "sleeper")
        .map((s: any) => ({ tripId: trip._id, seatLabel: s.label, status: "available" as const, version: 1 }));

    if (seatData.length) await TripSeat.insertMany(seatData, { session });

    await session.commitTransaction();
    res.json(trip);
  } catch (e) {
      await session.abortTransaction();
      next(e);
  } finally {
      session.endSession();
  }
});

router.post("/:id/start", authRequired, async (req, res, next) => {
  try {
    await Trip.findByIdAndUpdate(req.params.id, { status: "in_transit" });
    res.json({ success: true });
  } catch (e) { next(e); }
});

router.post("/:id/complete", authRequired, async (req, res, next) => {
  try {
    await Trip.findByIdAndUpdate(req.params.id, { status: "completed" });
    res.json({ success: true });
  } catch (e) { next(e); }
});

export default router;
