// @ts-nocheck
import { Router } from "express";
import { GpsPingSchema } from "../../types/index.js";
import { validate } from "../../middlewares/validate.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { ingestGpsPing, getLiveState } from "./telemetry.service.js";

const router = Router();

export function attachTelemetryRoutes(io: any) {
  router.post("/ping", authRequired, validate(GpsPingSchema), async (req, res, next) => {
    try {
      const operatorId = req.user?.operatorId ?? undefined;
      await ingestGpsPing({ ...req.body, operatorId });
      if (io) {
        io.to(`track:${req.body.tripId}`).emit("telemetry:update", { tripId: req.body.tripId, lat: req.body.lat, lng: req.body.lng, ts: Date.now() });
      }
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
