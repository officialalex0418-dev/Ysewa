import { Router } from "express";
import { GpsPingSchema } from "@yatrasewa/shared-types";
import { validate } from "../../middlewares/validate.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { ingestGpsPing, getLiveState } from "./telemetry.service.js";
import type { Server as IOServer } from "socket.io";

const router = Router();

export function attachTelemetryRoutes(io: IOServer) {
  router.post("/ping", authRequired, validate(GpsPingSchema), async (req, res, next) => {
    try {
      const operatorId = req.user!.operatorId ?? undefined;
      await ingestGpsPing({ ...req.body, operatorId });
      io.to(`track:${req.body.tripId}`).emit("telemetry:update", { tripId: req.body.tripId, lat: req.body.lat, lng: req.body.lng, speedKmh: req.body.speedKmh, headingDeg: req.body.headingDeg, ts: Date.now() });
      res.json({ ok: true });
    } catch (e) { next(e); }
  });

  router.get("/:tripId/live", async (req, res, next) => {
    try {
      res.json(await getLiveState(req.params.tripId));
    } catch (e) { next(e); }
  });

  return router;
}

export default router;
