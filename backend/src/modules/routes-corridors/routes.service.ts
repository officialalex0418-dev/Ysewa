import { City } from "../../models/Route.js";
import { Trip } from "../../models/Trip.js";
import { Route } from "../../models/Route.js";

export interface SearchParams {
  from: string; // city name
  to: string;   // city name
  date: string; // ISO date
}

export async function searchAvailableTrips({ from, to, date }: SearchParams) {
  // Use regex for case-insensitive city search
  const origin = await City.findOne({ name: { $regex: new RegExp(`^${from}$`, "i") } });
  const dest = await City.findOne({ name: { $regex: new RegExp(`^${to}$`, "i") } });
  if (!origin || !dest) return [];

  const tripDate = new Date(date);
  tripDate.setHours(0, 0, 0, 0);

  const endOfDay = new Date(tripDate);
  endOfDay.setHours(23, 59, 59, 999);

  const trips = await Trip.find({
    tripDate: { $gte: tripDate, $lte: endOfDay },
    status: "scheduled",
  })
  .populate("operatorId")
  .populate("busId")
  .populate({
    path: "routeId",
    populate: [{ path: "originCityId" }, { path: "destCityId" }]
  })
  .sort({ departureTime: 1 })
  .lean();

  // Filter routes that match origin and destination explicitly
  const filteredTrips = trips.filter(t => {
      const route: any = t.routeId;
      return route.originCityId._id.toString() === origin._id.toString() &&
             route.destCityId._id.toString() === dest._id.toString();
  });

  return filteredTrips.map((t: any) => ({
    id: t._id,
    operator: { id: t.operatorId._id, brandName: t.operatorId.brandName, logoUrl: t.operatorId.logoUrl, status: t.operatorId.status },
    bus: { plate: t.busId.plateNumber, nickname: t.busId.nickname, type: t.busId.vehicleType, amenities: t.busId.amenities },
    route: { name: t.routeId.routeName, from: t.routeId.originCityId.name, to: t.routeId.destCityId.name, distance: t.routeId.distanceKm },
    departureTime: t.departureTime,
    arrivalTime: t.arrivalTime,
    fare: t.fare,
    availableSeats: t.availableSeats,
    boarding: t.routeId.stops.filter((s: any) => s.isBoarding).map((s: any) => ({ name: s.stopName, time: new Date(new Date(t.departureTime).getTime() + s.arrivalOffsetMin * 60000) })),
    dropping: t.routeId.stops.filter((s: any) => s.isDropping).map((s: any) => ({ name: s.stopName, time: new Date(new Date(t.departureTime).getTime() + s.arrivalOffsetMin * 60000) })),
  }));
}

export async function listCities() {
  return City.find().sort({ name: 1 }).lean();
}

export async function listCorridors() {
  return Route.find({ isActive: true })
    .populate("originCityId")
    .populate("destCityId")
    .sort({ routeName: 1 })
    .lean();
}
