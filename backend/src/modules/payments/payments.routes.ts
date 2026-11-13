// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares/validate.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { initiateEsewa, verifyEsewa } from "./esewa.adapter.js";
import { initiateKhalti, verifyKhalti } from "./khalti.adapter.js";
import { confirmBooking } from "../bookings/bookings.service.js";
import { httpError } from "../../middlewares/error-handler.js";

const router = Router();

export function attachPaymentRoutes(io: any) {
  router.get("/methods", (_req, res) => {
    res.json([
      { id: "esewa", name: "eSewa", tagline: "Pay using eSewa wallet", badge: "POPULAR", iconKey: "esewa" },
      { id: "khalti", name: "Khalti", tagline: "Mobile banking & Khalti digital wallet", iconKey: "khalti" },
      { id: "fonepay", name: "FonePay", tagline: "QR scan & bank transfer", iconKey: "fonepay" },
      { id: "connectips", name: "ConnectIPS", tagline: "Direct bank transfer (NCHL)", iconKey: "connectips" },
    ]);
  });

  router.post("/esewa/initiate", authRequired, validate(z.object({ bookingId: z.string() })), async (req, res, next) => {
    try {
      const r = await initiateEsewa({ bookingId: req.body.bookingId, amount: 1200 });
      res.json(r);
    } catch (e) { next(e); }
  });

  router.get("/esewa/callback", async (req, res) => {
    res.redirect(`${process.env.CORS_ORIGIN || "http://localhost:5173"}/payment/success`);
  });

  router.post("/khalti/initiate", authRequired, validate(z.object({ bookingId: z.string() })), async (req, res, next) => {
    try {
      const r = await initiateKhalti({ bookingId: req.body.bookingId, amount: 1200 });
      res.json(r);
    } catch (e) { next(e); }
  });

  router.get("/khalti/callback", async (_req, res) => {
    res.redirect(`${process.env.CORS_ORIGIN || "http://localhost:5173"}/payment/success`);
  });

  router.post("/bookie-float/pay", authRequired, validate(z.object({ bookingId: z.string() })), async (req, res, next) => {
    try {
      const confirmed = await confirmBooking(req.body.bookingId, "bookie-" + Date.now());
      res.json({ success: true, booking: confirmed });
    } catch (e) { next(e); }
  });

  return router;
}

export default router;
