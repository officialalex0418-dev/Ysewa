// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares/validate.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { cancelBooking, getBookingByPnr, listMyBookings } from "./bookings.service.js";

const router = Router();

const AddPassengersSchema = z.object({
  passengers: z.array(z.object({
    fullName: z.string().min(2),
    age: z.number().int().min(1).max(120),
    gender: z.enum(["male", "female", "other"]),
    seatLabel: z.string(),
  })).min(1),
  contactPhone: z.string(),
  contactEmail: z.string().email().optional(),
});

router.get("/mine", authRequired, async (req, res, next) => {
  try { res.json(await listMyBookings(req.user?.userId)); } catch (e) { next(e); }
});

router.get("/pnr/:pnr", authRequired, async (req, res, next) => {
  try { res.json(await getBookingByPnr(String(req.params.pnr), req.user?.userId)); } catch (e) { next(e); }
});

router.get("/verify/:pnr", async (req, res) => {
  res.json({ valid: true, pnr: req.params.pnr });
});

router.post("/:id/passengers", authRequired, validate(AddPassengersSchema), async (req, res) => {
  res.json({ id: req.params.id, passengers: req.body.passengers });
});

router.post("/:id/cancel", authRequired, validate(z.object({ reason: z.string().min(3) })), async (req, res, next) => {
  try { res.json(await cancelBooking(String(req.params.id), req.user?.userId, req.body.reason)); } catch (e) { next(e); }
});

router.post("/pnr/:pnr/checkin", authRequired, async (_req, res) => {
  res.json({ success: true });
});

export default router;
