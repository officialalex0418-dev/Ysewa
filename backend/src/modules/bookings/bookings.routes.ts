import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares/validate.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { prisma } from "@yatrasewa/database";
import { cancelBooking, getBookingByPnr, listMyBookings } from "./bookings.service.js";

const router = Router();

const AddPassengersSchema = z.object({
  passengers: z.array(z.object({
    fullName: z.string().min(2),
    age: z.number().int().min(1).max(120),
    gender: z.enum(["male", "female", "other"]),
    seatLabel: z.string(),
    idType: z.enum(["citizenship", "passport", "driving_license", "national_id", "none"]).default("none"),
    idNumber: z.string().optional(),
  })).min(1),
  contactPhone: z.string().regex(/^9[78]\d{8}$/),
  contactEmail: z.string().email().optional(),
});

router.get("/mine", authRequired, async (req, res, next) => {
  try { res.json(await listMyBookings(req.user!.userId)); } catch (e) { next(e); }
});

router.get("/pnr/:pnr", authRequired, async (req, res, next) => {
  try { res.json(await getBookingByPnr(String(req.params.pnr), req.user!.userId)); } catch (e) { next(e); }
});

// Public QR verification endpoint (conductor scans QR)
router.get("/verify/:pnr", async (req, res, next) => {
  try {
    const b = await prisma.booking.findUnique({
      where: { pnr: String(req.params.pnr) },
      include: { passengers: true, trip: { include: { route: { include: { originCity: true, destCity: true } }, bus: true, operator: true } } },
    });
    if (!b) return res.status(404).json({ valid: false });
    res.json({ valid: b.status === "CONFIRMED", booking: b });
  } catch (e) { next(e); }
});

router.post("/:id/passengers", authRequired, validate(AddPassengersSchema), async (req, res, next) => {
  try {
    const b = await prisma.booking.update({
      where: { id: String(req.params.id) },
      data: {
        contactPhone: req.body.contactPhone,
        contactEmail: req.body.contactEmail,
        passengers: { create: req.body.passengers },
      },
      include: { passengers: true, trip: true },
    });
    res.json(b);
  } catch (e) { next(e); }
});

router.post("/:id/cancel", authRequired, validate(z.object({ reason: z.string().min(3) })), async (req, res, next) => {
  try { res.json(await cancelBooking(String(req.params.id), req.user!.userId, req.body.reason)); } catch (e) { next(e); }
});

// Conductor check-in
router.post("/pnr/:pnr/checkin", authRequired, async (req, res, next) => {
  try {
    const b = await prisma.booking.findUnique({ where: { pnr: String(req.params.pnr) } });
    if (!b) return res.status(404).json({ error: "Not found" });
    await prisma.bookingPassenger.updateMany({
      where: { bookingId: b.id },
      data: { checkedIn: true, checkedInAt: new Date(), checkedInById: req.user!.userId },
    });
    res.json({ success: true });
  } catch (e) { next(e); }
});

export default router;
