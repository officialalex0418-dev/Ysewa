import { Router } from "express";
import { z } from "zod";
import { prisma } from "@yatrasewa/database";
import { validate } from "../../middlewares/validate.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/rbac.middleware.js";
import { tenantScope } from "../../middlewares/tenant-isolation.middleware.js";
import { httpError } from "../../middlewares/error-handler.js";

const router = Router();

// Operator overview KPIs (for operator panel dashboard)
router.get("/overview", authRequired, requireRole("OPERATOR_OWNER", "OPERATOR_STAFF"), async (req, res, next) => {
  try {
    if (!req.user!.operatorId) throw httpError(403, "No operator assigned");
    const opId = req.user!.operatorId;
    const [fleet, activeBuses, totalRoutes, upcomingTrips, monthlyBookings, monthlyRevenue] = await Promise.all([
      prisma.bus.count({ where: { operatorId: opId } }),
      prisma.bus.count({ where: { operatorId: opId, status: "active" } }),
      prisma.route.count({ where: { operatorId: opId, isActive: true } }),
      prisma.trip.count({ where: { operatorId: opId, status: "scheduled", departureTime: { gte: new Date() } } }),
      prisma.booking.count({ where: { trip: { operatorId: opId }, status: "CONFIRMED", createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
      prisma.booking.aggregate({ _sum: { netPayable: true }, where: { trip: { operatorId: opId }, status: "CONFIRMED", createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
    ]);
    res.json({
      kpis: { fleet, activeBuses, totalRoutes, upcomingTrips, monthlyBookings, monthlyRevenue: Number(monthlyRevenue._sum.netPayable ?? 0) },
    });
  } catch (e) { next(e); }
});

router.get("/me", authRequired, async (req, res, next) => {
  try {
    if (!req.user!.operatorId) return res.json(null);
    res.json(await prisma.operator.findUnique({ where: { id: req.user!.operatorId } }));
  } catch (e) { next(e); }
});

// Fleet
router.get("/fleet", authRequired, requireRole("OPERATOR_OWNER", "OPERATOR_STAFF"), async (req, res, next) => {
  try { res.json(await prisma.bus.findMany({ where: tenantScope(req) as any, include: { cabinLayout: true }, orderBy: { createdAt: "desc" } })); } catch (e) { next(e); }
});

const BusCreateSchema = z.object({
  plateNumber: z.string().min(3),
  nickname: z.string().optional(),
  vehicleType: z.enum(["deluxe", "ac_deluxe", "vip_sofa_2x1", "sleeper", "tourist"]),
  totalSeats: z.number().int().min(10).max(60),
  layoutName: z.string().default("2x2 Deluxe"),
  amenities: z.object({
    wifi: z.boolean().default(false),
    chargingPort: z.boolean().default(false),
    waterBottle: z.boolean().default(false),
    blanket: z.boolean().default(false),
    readingLight: z.boolean().default(false),
    cctv: z.boolean().default(false),
    ac: z.boolean().default(false),
    lunchIncluded: z.boolean().default(false),
    gpsTelematics: z.boolean().default(false),
  }).default({}),
});

router.post("/fleet", authRequired, requireRole("OPERATOR_OWNER"), validate(BusCreateSchema), async (req, res, next) => {
  try {
    if (!req.user!.operatorId) throw httpError(403, "No operator assigned");
    // Create a cabin layout (2x2 deluxe default) if no existing layout
    let layout = await prisma.cabinLayout.findFirst({ where: { operatorId: req.user!.operatorId, totalSeats: req.body.totalSeats } });
    if (!layout) {
      const { generate2x2Deluxe } = await import("@yatrasewa/shared-types");
      const base = generate2x2Deluxe(req.body.layoutName);
      layout = await prisma.cabinLayout.create({
        data: {
          operatorId: req.user!.operatorId,
          name: req.body.layoutName,
          layoutJson: base as any,
          deckCount: base.deckCount,
          totalSeats: req.body.totalSeats,
        },
      });
    }
    const bus = await prisma.bus.create({
      data: {
        operatorId: req.user!.operatorId,
        plateNumber: req.body.plateNumber,
        nickname: req.body.nickname,
        cabinLayoutId: layout.id,
        vehicleType: req.body.vehicleType,
        amenities: req.body.amenities,
        telematicsEnabled: req.body.amenities.gpsTelematics,
      },
    });
    res.json(bus);
  } catch (e) { next(e); }
});

// Trips list for operator
router.get("/trips", authRequired, requireRole("OPERATOR_OWNER", "OPERATOR_STAFF"), async (req, res, next) => {
  try {
    res.json(await prisma.trip.findMany({
      where: tenantScope(req) as any,
      include: { bus: true, route: { include: { originCity: true, destCity: true } } },
      orderBy: { departureTime: "desc" },
      take: 50,
    }));
  } catch (e) { next(e); }
});

// Cabin layouts
router.get("/cabins", authRequired, requireRole("OPERATOR_OWNER", "OPERATOR_STAFF"), async (req, res, next) => {
  try { res.json(await prisma.cabinLayout.findMany({ where: tenantScope(req) as any })); } catch (e) { next(e); }
});

// Settlements for operator
router.get("/settlements", authRequired, requireRole("OPERATOR_OWNER"), async (req, res, next) => {
  try {
    if (!req.user!.operatorId) throw httpError(403, "No operator assigned");
    res.json(await prisma.settlementPayout.findMany({ where: { operatorId: req.user!.operatorId }, orderBy: { createdAt: "desc" } }));
  } catch (e) { next(e); }
});

export default router;
