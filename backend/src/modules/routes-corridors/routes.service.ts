import { prisma } from "@yatrasewa/database";

export interface SearchParams {
  from: string; // city name
  to: string;   // city name
  date: string; // ISO date
}

export async function searchAvailableTrips({ from, to, date }: SearchParams) {
  const origin = await prisma.city.findUnique({ where: { name: from } });
  const dest = await prisma.city.findUnique({ where: { name: to } });
  if (!origin || !dest) return [];

  const tripDate = new Date(date);

  const trips = await prisma.trip.findMany({
    where: {
      tripDate,
      status: "scheduled",
      route: { originCityId: origin.id, destCityId: dest.id },
    },
    include: {
      operator: true,
      bus: { include: { cabinLayout: true } },
      route: { include: { originCity: true, destCity: true, stops: { orderBy: { sequence: "asc" } } } },
    },
    orderBy: { departureTime: "asc" },
  });

  return trips.map((t) => ({
    id: t.id,
    operator: { id: t.operator.id, brandName: t.operator.brandName, logoUrl: t.operator.logoUrl, status: t.operator.status },
    bus: { plate: t.bus.plateNumber, nickname: t.bus.nickname, type: t.bus.vehicleType, amenities: t.bus.amenities },
    route: { name: t.route.routeName, from: t.route.originCity.name, to: t.route.destCity.name, distance: t.route.distanceKm },
    departureTime: t.departureTime,
    arrivalTime: t.arrivalTime,
    fare: t.fare,
    availableSeats: t.availableSeats,
    boarding: t.route.stops.filter((s) => s.isBoarding).map((s) => ({ name: s.stopName, time: new Date(new Date(t.departureTime).getTime() + s.arrivalOffsetMin * 60000) })),
    dropping: t.route.stops.filter((s) => s.isDropping).map((s) => ({ name: s.stopName, time: new Date(new Date(t.departureTime).getTime() + s.arrivalOffsetMin * 60000) })),
  }));
}

export async function listCities() {
  return prisma.city.findMany({ orderBy: { name: "asc" } });
}

export async function listCorridors() {
  return prisma.route.findMany({
    where: { isActive: true },
    include: { originCity: true, destCity: true },
    orderBy: { routeName: "asc" },
  });
}
