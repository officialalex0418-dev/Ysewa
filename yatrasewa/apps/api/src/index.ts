import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import bookingRoutes from "./modules/bookings/bookings.routes.js";
import operatorRoutes from "./modules/operators/operators.routes.js";
import paymentRoutes from "./modules/payments/payments.routes.js";
import routeRoutes from "./modules/routes-corridors/routes.routes.js";
import { attachSeatRoutes } from "./modules/seat-locks/seat-lock.routes.js";
import superAdminRoutes from "./modules/super-admin/super-admin.routes.js";
import telemetryRoutes from "./modules/telemetry/telemetry.routes.js";
import tripRoutes from "./modules/trips/trips.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { authRequired } from "./middlewares/auth.middleware.js";
import { prisma } from "@yatrasewa/database";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { connectMongoDB } from "./config/mongodb.js";

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Connect MongoDB Database
connectMongoDB();

app.get("/health", (_req, res) => res.json({ ok: true, service: "yatrasewa-api" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/operators", operatorRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/routes", routeRoutes);
app.use("/api/v1/trips", tripRoutes);
app.use("/api/v1/admin", superAdminRoutes);
app.use("/api/v1/super-admin", superAdminRoutes);
app.use("/api/v1/telemetry", telemetryRoutes);
app.use("/api/v1/seats", attachSeatRoutes(io));
app.use("/api/v1/trips", attachSeatRoutes(io)); // Support /api/v1/trips/:tripId/seats/lock as well

app.get("/api/v1/me", authRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, fullName: true, phone: true, email: true, role: true, operatorId: true, counterId: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

app.use(errorHandler);

const PORT = process.env.API_PORT ?? 4000;
server.listen(PORT, () => {
  console.log(`[yatrasewa-api] running on port ${PORT}`);
});
