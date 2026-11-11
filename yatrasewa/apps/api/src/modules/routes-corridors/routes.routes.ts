import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares/validate.js";
import { searchAvailableTrips, listCities, listCorridors } from "./routes.service.js";

const router = Router();

const SearchSchema = z.object({
  from: z.string().min(2),
  to: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.get("/search", validate(SearchSchema, "query"), async (req, res, next) => {
  try {
    const trips = await searchAvailableTrips({
      from: String(req.query.from),
      to: String(req.query.to),
      date: String(req.query.date),
    });
    res.json(trips);
  } catch (e) { next(e); }
});

router.get("/cities", async (_req, res, next) => {
  try { res.json(await listCities()); } catch (e) { next(e); }
});

router.get("/corridors", async (_req, res, next) => {
  try { res.json(await listCorridors()); } catch (e) { next(e); }
});

export default router;
