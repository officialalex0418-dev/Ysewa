import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares/validate.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { prisma } from "@yatrasewa/database";
import { initiateEsewa, verifyEsewa } from "./esewa.adapter.js";
import { initiateKhalti, verifyKhalti } from "./khalti.adapter.js";
import { confirmBooking } from "../bookings/bookings.service.js";
import { httpError } from "../../middlewares/error-handler.js";
import type { Server as IOServer } from "socket.io";

const router = Router();

export function attachPaymentRoutes(io: IOServer) {
  // Payment method list (for UI)
  router.get("/methods", (_req, res) => {
    res.json([
      { id: "esewa", name: "eSewa", tagline: "Pay using eSewa wallet", badge: "POPULAR", iconKey: "esewa" },
      { id: "khalti", name: "Khalti", tagline: "Mobile banking & Khalti digital wallet", iconKey: "khalti" },
      { id: "fonepay", name: "FonePay", tagline: "QR scan & bank transfer", iconKey: "fonepay" },
      { id: "connectips", name: "ConnectIPS", tagline: "Direct bank transfer (NCHL)", iconKey: "connectips" },
    ]);
  });

  // eSewa initiate
  router.post("/esewa/initiate", authRequired, validate(z.object({ bookingId: z.string().uuid() })), async (req, res, next) => {
    try {
      const booking = await prisma.booking.findUnique({ where: { id: req.body.bookingId } });
      if (!booking) throw httpError(404, "Booking not found");
      const r = await initiateEsewa({ bookingId: booking.id, amount: Number(booking.netPayable) });
      // Persist gateway transaction record
      await prisma.paymentTransaction.create({
        data: { bookingId: booking.id, gateway: "esewa", amount: booking.netPayable, gatewayTransactionId: r.transactionUuid, status: "INITIATED" },
      });
      res.json(r);
    } catch (e) { next(e); }
  });

  // eSewa callback (GET from eSewa redirect)
  router.get("/esewa/callback", async (req, res, next) => {
    try {
      const { oid: transactionUuid, amt: totalAmount, refId } = req.query as Record<string, string>;
      if (!transactionUuid || !totalAmount) throw httpError(400, "Missing eSewa callback params");
      const verification = await verifyEsewa({ transactionUuid, totalAmount });
      const txn = await prisma.paymentTransaction.findFirst({ where: { gatewayTransactionId: transactionUuid } });
      if (!txn) throw httpError(404, "Transaction not found");
      await confirmBooking(txn.bookingId, verification.transactionCode ?? refId);
      const booking = await prisma.booking.findUniqueOrThrow({ where: { id: txn.bookingId } });
      io.to(`trip:${booking.tripId}`).emit("booking:confirmed", { bookingId: txn.bookingId });
      res.redirect(`${process.env.CORS_ORIGIN ?? "http://localhost:5173"}/payment/success?pnr=${booking.pnr}`);
    } catch (e) { next(e); }
  });

  // Khalti initiate
  router.post("/khalti/initiate", authRequired, validate(z.object({ bookingId: z.string().uuid() })), async (req, res, next) => {
    try {
      const booking = await prisma.booking.findUnique({ where: { id: req.body.bookingId }, include: { user: true } });
      if (!booking) throw httpError(404, "Booking not found");
      const r = await initiateKhalti({
        bookingId: booking.id,
        amount: Number(booking.netPayable),
        customerName: booking.user?.fullName,
        customerPhone: booking.user?.phone ?? undefined,
      });
      await prisma.paymentTransaction.create({
        data: { bookingId: booking.id, gateway: "khalti", amount: booking.netPayable, gatewayTransactionId: r.pidx, status: "INITIATED", requestPayload: r as any },
      });
      res.json(r);
    } catch (e) { next(e); }
  });

  // Khalti callback
  router.get("/khalti/callback", async (req, res, next) => {
    try {
      const { pidx } = req.query as Record<string, string>;
      if (!pidx) throw httpError(400, "Missing pidx");
      const v = await verifyKhalti(pidx);
      const txn = await prisma.paymentTransaction.findFirst({ where: { gatewayTransactionId: pidx } });
      if (txn) {
        await confirmBooking(txn.bookingId, v.transactionId);
        const booking = await prisma.booking.findUniqueOrThrow({ where: { id: txn.bookingId } });
        io.to(`trip:${booking.tripId}`).emit("booking:confirmed", { bookingId: txn.bookingId });
        res.redirect(`${process.env.CORS_ORIGIN ?? "http://localhost:5173"}/payment/success?pnr=${booking.pnr}`);
      } else res.redirect(`${process.env.CORS_ORIGIN ?? "http://localhost:5173"}/payment/failure`);
    } catch (e) { next(e); }
  });

  // Bookie float payment (instant debit from float wallet)
  router.post("/bookie-float/pay", authRequired, validate(z.object({ bookingId: z.string().uuid() })), async (req, res, next) => {
    try {
      const booking = await prisma.booking.findUnique({ where: { id: req.body.bookingId } });
      if (!booking) throw httpError(404, "Booking not found");
      if (!req.user!.counterId) throw httpError(403, "Only bookie counters can use float");
      const counter = await prisma.bookieCounter.findUnique({ where: { id: req.user!.counterId } });
      if (!counter) throw httpError(404, "Counter not found");
      const netToPlatform = Number(booking.netPayable); // bookie settles gross
      if (Number(counter.floatBalance) < netToPlatform) throw httpError(402, "Insufficient float balance. Top-up required.");
      await prisma.$transaction(async (tx) => {
        await tx.bookieCounter.update({ where: { id: counter.id }, data: { floatBalance: { decrement: netToPlatform } } });
        await tx.paymentTransaction.create({ data: { bookingId: booking.id, gateway: "bookie_float", amount: booking.netPayable, status: "COMPLETED", verified: true, verifiedAt: new Date() } });
      });
      const confirmed = await confirmBooking(booking.id, "bookie-" + Date.now());
      io.to(`trip:${confirmed.tripId}`).emit("booking:confirmed", { bookingId: booking.id });
      res.json({ success: true, booking: confirmed });
    } catch (e) { next(e); }
  });

  return router;
}

export default router;
