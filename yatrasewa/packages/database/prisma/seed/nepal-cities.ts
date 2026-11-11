import { Prisma } from "@prisma/client";
import { NEPAL_CITIES, NEPAL_CORRIDORS } from "@yatrasewa/shared-types";

/**
 * Seed Nepal cities and highway corridors with real boarding/dropping stop coordinates.
 */
export async function seedCitiesAndCorridors(prisma: Prisma.TransactionClient) {
  const cityMap = new Map<string, string>();

  for (const c of NEPAL_CITIES) {
    const created = await prisma.city.upsert({
      where: { name: c.name },
      update: { nameNe: c.nameNe, district: c.district, province: c.province, lat: c.lat, lng: c.lng, isPickupHub: c.isPickupHub },
      create: {
        name: c.name,
        nameNe: c.nameNe,
        district: c.district,
        province: c.province,
        lat: c.lat,
        lng: c.lng,
        isPickupHub: c.isPickupHub,
      },
    });
    cityMap.set(c.name, created.id);
  }

  for (const cor of NEPAL_CORRIDORS) {
    const originId = cityMap.get(cor.origin);
    const destId = cityMap.get(cor.destination);
    if (!originId || !destId) {
      console.warn(`Skipping corridor ${cor.key}: missing city`);
      continue;
    }

    const route = await prisma.route.create({
      data: {
        routeName: `${cor.origin} → ${cor.destination}`,
        corridorName: cor.highwayName,
        originCityId: originId,
        destCityId: destId,
        distanceKm: cor.distanceKm,
        baseFare: cor.baseFareNpr,
        isActive: true,
        stops: {
          create: buildCorridorStops(cor, cityMap),
        },
      },
    });
    console.log(`Seeded route ${route.routeName} (${route.id})`);
  }
}

function buildCorridorStops(cor: (typeof NEPAL_CORRIDORS)[number], cityMap: Map<string, string>): any[] {
  // Build stop sequence: origin, via[0..n], destination
  const all: Array<{ name: string; boarding: boolean; dropping: boolean }> = [];
  all.push({ name: cor.origin, boarding: true, dropping: false });
  for (const v of cor.via) all.push({ name: v, boarding: true, dropping: true });
  all.push({ name: cor.destination, boarding: false, dropping: true });

  // Lookup coordinates from city table (coordinates will be used from city table).
  return all.map((stop, i) => {
    const cityData = NEPAL_CITIES.find((c) => c.name === stop.name);
    return {
      sequence: i,
      stopName: stop.name,
      lat: cityData?.lat ?? 27.7,
      lng: cityData?.lng ?? 85.3,
      geofenceRadiusM: 1500,
      isBoarding: stop.boarding,
      isDropping: stop.dropping,
      arrivalOffsetMin: Math.round((i / (all.length - 1)) * cor.typicalDurationHours * 60),
    };
  });
}
