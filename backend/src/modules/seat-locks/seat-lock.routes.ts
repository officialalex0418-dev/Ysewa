import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares/validate.js";
import { authRequired, optionalAuth } from "../../middlewares/auth.middleware.js";
import { acquireSeats, releaseSeats, getSeatStates } from "./seat-lock.service.js";
import { httpError } from "../../middlewares/error-handler.js";
import type { Server as IOServer } from "socket.io";

const router = Router();

export function attachSeatRoutes(io: IOServer) {
  const LockSchema = z.object({
    tripId: z.string().uuid(),
    seats: z.array(z.string().min(1).max(6)),
    channel: z.enum(["online", "bookie", "conductor"]).default("online"),
  });

  router.get("/:tripId/seats", optionalAuth, async (req, res, next) => {
    try {
      const tripId = String(req.params.tripId);
      const states = await getSeatStates(tripId, req.user?.userId);
      res.json({ tripId, seatStates: states });
    } catch (e) { next(e); }
  });

  router.post("/:tripId/seats/lock", authRequired, validate(LockSchema), async (req, res, next) => {
    try {
      const tripId = String(req.params.tripId);
      if (req.body.tripId !== tripId) throw httpError(400, "Trip ID mismatch");
      const actorId = req.user!.userId;
      // Map channel from role if not specified
      let channel = req.body.channel;
      if (req.user!.role === "BOOKIE_COUNTER") channel = "bookie";
      if (req.user!.role === "CONDUCTOR") channel = "conductor";
      const r = await acquireSeats({ tripId, seatLabels: req.body.seats, actorId, channel });
      // Broadcast state change to trip room
      io.to(`trip:${tripId}`).emit("seat:state-changed", { tripId, actorId, seats: req.body.seats, state: "locked" });
      res.json(r);
    } catch (e) { next(e); }
  });

  router.delete("/:tripId/seats/release", authRequired, validate(z.object({ seats: z.array(z.string().min(1)) }), "body"), async (req, res, next) => {
    try {
      const tripId = String(req.params.tripId);
      await releaseSeats(tripId, req.body.seats, req.user!.userId);
      io.to(`trip:${tripId}`).emit("seat:state-changed", { tripId, actorId: req.user!.userId, seats: req.body.seats, state: "available" });
      res.json({ success: true });
    } catch (e) { next(e); }
  });

  return router;
}

export default router;
