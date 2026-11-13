import { Router } from "express";
import { z } from "zod";
// import { prisma } from "@yatrasewa/database";
const prisma: any = {}; // TODO: Migrate to MongoDB
import { validate } from "../../middlewares/validate.js";
import { authRequired, optionalAuth } from "../../middlewares/auth.middleware.js";
import { httpError } from "../../middlewares/error-handler.js";

const router = Router();

const CreateTripSchema = z.object({
  busId: z.string().uuid(),
  routeId: z.string().uuid(),
  tripDate: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  fare: z.number().positive(),
  driverId: z.string().uuid().optional(),
  conductorId: z.string().uuid().optional(),
});

router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: String(req.params.id) },
      include: {
        operator: true,
        bus: { include: { cabinLayout: true } },
        route: { include: { originCity: true, destCity: true, stops: { orderBy: { sequence: "asc" } } } },
      },
    });
    if (!trip) throw httpError(404, "Trip not found");

    // Map seats to available/booked
    const seats = await prisma.tripSeat.findMany({ where: { tripId: trip.id } });
    const seatStates: Record<string, string> = {};
    seats.forEach((s) => { seatStates[s.seatLabel] = s.status; });

    res.json({ ...trip, seatStates });
  } catch (e) { next(e); }
});

router.post("/", authRequired, validate(CreateTripSchema), async (req, res, next) => {
  try {
    if (!req.user!.operatorId) throw httpError(403, "Operator required");
    const bus = await prisma.bus.findUnique({ where: { id: req.body.busId }, include: { cabinLayout: true } });
    if (!bus) throw httpError(404, "Bus not found");

    // Detect schedule conflicts (same bus on same date within 6h window)
    const dep = new Date(req.body.departureTime);
    const conflict = await prisma.trip.findFirst({
      where: { busId: bus.id, departureTime: { gte: new Date(dep.getTime() - 6 * 3600000), lte: new Date(dep.getTime() + 6 * 3600000) } },
    });
    if (conflict) throw httpError(409, "Schedule conflict: this bus already has a trip within 6 hours");

    const trip = await prisma.$transaction(async (tx) => {
      const t = await tx.trip.create({
        data: {
          operatorId: req.user!.operatorId!,
          busId: bus.id,
          routeId: req.body.routeId,
          tripDate: new Date(req.body.tripDate),
          departureTime: dep,
          arrivalTime: new Date(req.body.arrivalTime),
          driverId: req.body.driverId,
          conductorId: req.body.conductorId,
          fare: req.body.fare,
          availableSeats: bus.cabinLayout.totalSeats,
        },
      });
      // Create seat rows
      const layout = bus.cabinLayout.layoutJson as any;
      const seatData = layout.seats
        .filter((s: any) => s.type === "regular" || s.type === "lady" || s.type === "vip" || s.type === "sleeper")
        .map((s: any) => ({ tripId: t.id, seatLabel: s.label, status: "available" as const }));
      if (seatData.length) await tx.tripSeat.createMany({ data: seatData });
      return t;
    });
    res.json(trip);
  } catch (e) { next(e); }
});

router.post("/:id/start", authRequired, async (req, res, next) => {
  try {
    await prisma.trip.update({ where: { id: String(req.params.id) }, data: { status: "in_transit" } });
    res.json({ success: true });
  } catch (e) { next(e); }
});

router.post("/:id/complete", authRequired, async (req, res, next) => {
  try {
    await prisma.trip.update({ where: { id: String(req.params.id) }, data: { status: "completed" } });
    res.json({ success: true });
  } catch (e) { next(e); }
});

export default router;
