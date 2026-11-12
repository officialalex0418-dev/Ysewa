// Quick API launcher using tsx with strict TS typecheck relaxed.
// In production, build the API properly with prisma migrate + a clean tsc build.
// This runner is used for the workspace demo when PG/Redis are not installed.
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "yatrasewa-api-demo" }));

// Public trip search demo data
const DEMO_TRIPS = [
  {
    id: "demo-trip-greenline", operator: { brandName: "Greenline Travels", status: "approved" },
    bus: { plate: "BA 2 KHA 4512", nickname: "Greenline Deluxe", type: "ac_deluxe", amenities: { wifi: true, chargingPort: true, waterBottle: true, cctv: true, ac: true, lunchIncluded: true } },
    route: { from: "Kathmandu", to: "Pokhara", distance: 200 },
    departureTime: new Date(new Date().setHours(7, 0, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(13, 30, 0, 0)).toISOString(),
    fare: 2900, availableSeats: 18,
  },
  {
    id: "demo-trip-sajha", operator: { brandName: "Sajha Yatayat", status: "approved" },
    bus: { plate: "NA 2 KHA 1105", nickname: "Sajha AC Sleeper", type: "sleeper", amenities: { wifi: false, chargingPort: true, waterBottle: true, blanket: true, readingLight: true, cctv: true, ac: true } },
    route: { from: "Kathmandu", to: "Pokhara", distance: 200 },
    departureTime: new Date(new Date().setHours(8, 30, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    fare: 950, availableSeats: 22,
  },
  {
    id: "demo-trip-mountain", operator: { brandName: "Mountain Deluxe Express", status: "approved" },
    bus: { plate: "GA 2 KHA 4390", nickname: "Mountain VIP Sofa", type: "vip_sofa_2x1", amenities: { chargingPort: true } },
    route: { from: "Kathmandu", to: "Pokhara", distance: 200 },
    departureTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
    fare: 2200, availableSeats: 3,
  },
];

app.get("/api/v1/trips/search", (req, res) => {
  res.json(DEMO_TRIPS);
});

app.get("/api/v1/trips/:id", (req, res) => {
  const trip = DEMO_TRIPS.find((t) => t.id === req.params.id) ?? DEMO_TRIPS[0];
  const seatStates = { A3: "booked", A4: "booked", B1: "locked", B2: "locked", J2: "booked", C3: "booked", C4: "booked" };
  res.json({ ...trip, route: { originCity: { name: trip.route.from }, destCity: { name: trip.route.to }, stops: [] }, seatStates });
});

app.post("/api/v1/auth/send-otp", (_req, res) => res.json({ sent: true, devOtp: "123456" }));
app.post("/api/v1/auth/verify-otp", (req, res) => {
  res.json({
    accessToken: "dev-access-token",
    refreshToken: "dev-refresh-token",
    expiresIn: 900,
    user: { id: "dev-user", fullName: "Aayush Shrestha", phone: req.body.phone, email: null, role: "CUSTOMER", operatorId: null, counterId: null, is2faEnabled: false, requires2fa: false },
  });
});
app.post("/api/v1/auth/login", (_req, res) => {
  res.json({
    accessToken: "dev-access-token", refreshToken: "dev-refresh-token", expiresIn: 900,
    user: { id: "dev-user", fullName: "Aayush Shrestha", phone: "9841000007", email: null, role: "CUSTOMER", operatorId: null, counterId: null, is2faEnabled: false, requires2fa: false },
  });
});
app.get("/api/v1/me", (_req, res) => res.json(null));

app.use((req, res) => {
  if (req.path.startsWith("/api")) return res.status(200).json({ demo: true, note: "API demo stub" });
  res.status(404).json({ status: 404 });
});

const PORT = process.env.API_PORT ?? 4000;
app.listen(PORT, () => console.log(`[yatrasewa-api-demo] listening on :${PORT}`));
