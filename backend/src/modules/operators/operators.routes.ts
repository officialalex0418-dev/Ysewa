// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares/validate.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/rbac.middleware.js";
import { httpError } from "../../middlewares/error-handler.js";
import { generate2x2Deluxe } from "../../types/index.js";

const router = Router();

router.get("/overview", authRequired, requireRole("OPERATOR_OWNER", "OPERATOR_STAFF"), async (_req, res) => {
  res.json({
    kpis: { fleet: 4, activeBuses: 4, totalRoutes: 6, upcomingTrips: 12, monthlyBookings: 86, monthlyRevenue: 124000 },
  });
});

router.get("/me", authRequired, async (req, res) => {
  res.json({ id: req.user?.operatorId || "OP-1", brandName: "YatraSewa Transport" });
});

router.get("/fleet", authRequired, requireRole("OPERATOR_OWNER", "OPERATOR_STAFF"), async (_req, res) => {
  res.json([]);
});

const BusCreateSchema = z.object({
  plateNumber: z.string().min(3),
  nickname: z.string().optional(),
  vehicleType: z.enum(["deluxe", "ac_deluxe", "vip_sofa_2x1", "sleeper", "tourist"]),
  totalSeats: z.number().int().min(10).max(60),
  layoutName: z.string().default("2x2 Deluxe"),
});

router.post("/fleet", authRequired, requireRole("OPERATOR_OWNER"), validate(BusCreateSchema), async (req, res) => {
  const base = generate2x2Deluxe(req.body.layoutName);
  res.json({ id: `BUS-${Date.now()}`, plateNumber: req.body.plateNumber, layout: base });
});

router.get("/trips", authRequired, requireRole("OPERATOR_OWNER", "OPERATOR_STAFF"), async (_req, res) => {
  res.json([]);
});

router.get("/cabins", authRequired, requireRole("OPERATOR_OWNER", "OPERATOR_STAFF"), async (_req, res) => {
  res.json([]);
});

router.get("/settlements", authRequired, requireRole("OPERATOR_OWNER"), async (_req, res) => {
  res.json([]);
});

export default router;
