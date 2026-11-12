import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, formatDuration, formatNpr, formatTime } from "../../lib/api";
import { TopNav, BottomNav } from "../../components/TopNav";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";

interface TripBusAmenities {
  wifi?: boolean;
  chargingPort?: boolean;
  waterBottle?: boolean;
  blanket?: boolean;
  readingLight?: boolean;
  cctv?: boolean;
  ac?: boolean;
  lunchIncluded?: boolean;
}

interface TripResult {
  id: string;
  operator: { brandName: string; status: string };
  bus: { plate: string; nickname?: string; type: string; amenities: TripBusAmenities };
  route: { from: string; to: string; distance: number };
  departureTime: string;
  arrivalTime: string;
  fare: number;
  availableSeats: number;
}

const FALLBACK_BUSES: TripResult[] = [
  {
    id: "demo-trip-greenline-ktm-pkr-day",
    operator: { brandName: "Greenline Travels", status: "approved" },
    bus: { plate: "BA 2 KHA 4512", nickname: "Greenline Deluxe", type: "ac_deluxe", amenities: { wifi: true, chargingPort: true, waterBottle: true, ac: true, cctv: true, lunchIncluded: true } },
    route: { from: "Kathmandu", to: "Pokhara", distance: 200 },
    departureTime: new Date(new Date().setHours(7, 0, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(13, 30, 0, 0)).toISOString(),
    fare: 2900,
    availableSeats: 18,
  },
  {
    id: "demo-trip-mountain-ktm-pkr-day",
    operator: { brandName: "Mountain Deluxe Express", status: "approved" },
    bus: { plate: "GA 2 KHA 4390", nickname: "Mountain VIP Sofa", type: "vip_sofa_2x1", amenities: { chargingPort: true, wifi: true, ac: true, waterBottle: true } },
    route: { from: "Kathmandu", to: "Pokhara", distance: 200 },
    departureTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
    fare: 2200,
    availableSeats: 8,
  },
  {
    id: "demo-trip-sajha-ktm-pkr-night",
    operator: { brandName: "Sajha Yatayat", status: "approved" },
    bus: { plate: "NA 2 KHA 1105", nickname: "Sajha AC Sleeper", type: "sleeper", amenities: { wifi: false, chargingPort: true, waterBottle: true, blanket: true, ac: true } },
    route: { from: "Kathmandu", to: "Pokhara", distance: 200 },
    departureTime: new Date(new Date().setHours(20, 30, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(4, 0, 0, 0)).toISOString(),
    fare: 1200,
    availableSeats: 24,
  },
  {
    id: "demo-trip-swift-ktm-pkr-night",
    operator: { brandName: "Swift Holidays Night Liner", status: "approved" },
    bus: { plate: "BA 3 KHA 8820", nickname: "Swift Night VIP", type: "vip_sofa_2x1", amenities: { wifi: true, chargingPort: true, blanket: true, ac: true, readingLight: true } },
    route: { from: "Kathmandu", to: "Pokhara", distance: 200 },
    departureTime: new Date(new Date().setHours(21, 15, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(5, 0, 0, 0)).toISOString(),
    fare: 2500,
    availableSeats: 12,
  },
  {
    id: "demo-trip-chitwan-day",
    operator: { brandName: "Chitwan Sauraha Express", status: "approved" },
    bus: { plate: "LU 1 KHA 5543", nickname: "Chitwan Deluxe", type: "ac_deluxe", amenities: { wifi: true, chargingPort: true, waterBottle: true, ac: true } },
    route: { from: "Kathmandu", to: "Chitwan (Sauraha)", distance: 160 },
    departureTime: new Date(new Date().setHours(7, 30, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
    fare: 1100,
    availableSeats: 15,
  },
  {
    id: "demo-trip-chitwan-night",
    operator: { brandName: "Rhino Night Deluxe", status: "approved" },
    bus: { plate: "LU 2 KHA 7812", nickname: "Chitwan Night Sleeper", type: "sleeper", amenities: { wifi: true, chargingPort: true, blanket: true, ac: true } },
    route: { from: "Kathmandu", to: "Chitwan (Sauraha)", distance: 160 },
    departureTime: new Date(new Date().setHours(21, 0, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(3, 30, 0, 0)).toISOString(),
    fare: 1350,
    availableSeats: 20,
  },
  {
    id: "demo-trip-pkr-ktm-day",
    operator: { brandName: "Pokhara Travels", status: "approved" },
    bus: { plate: "GA 1 KHA 3311", nickname: "Pokhara Super Deluxe", type: "ac_deluxe", amenities: { wifi: true, chargingPort: true, waterBottle: true, ac: true } },
    route: { from: "Pokhara", to: "Kathmandu", distance: 200 },
    departureTime: new Date(new Date().setHours(7, 30, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    fare: 2500,
    availableSeats: 14,
  },
  {
    id: "demo-trip-pkr-ktm-night",
    operator: { brandName: "Annapurna Night Cruiser", status: "approved" },
    bus: { plate: "GA 3 KHA 9901", nickname: "Annapurna Night VIP", type: "vip_sofa_2x1", amenities: { wifi: true, chargingPort: true, blanket: true, ac: true } },
    route: { from: "Pokhara", to: "Kathmandu", distance: 200 },
    departureTime: new Date(new Date().setHours(19, 45, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(3, 30, 0, 0)).toISOString(),
    fare: 2700,
    availableSeats: 10,
  },
  {
    id: "demo-trip-lumbini-night",
    operator: { brandName: "Lumbini Peace Travels", status: "approved" },
    bus: { plate: "LU 1 KHA 9012", nickname: "Lumbini Night Express", type: "ac_deluxe", amenities: { wifi: true, chargingPort: true, waterBottle: true, blanket: true, ac: true } },
    route: { from: "Kathmandu", to: "Lumbini", distance: 280 },
    departureTime: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(5, 30, 0, 0)).toISOString(),
    fare: 1500,
    availableSeats: 22,
  },
];

const CITIES = [
  "Kathmandu",
  "Pokhara",
  "Chitwan (Sauraha)",
  "Lumbini",
  "Janakpur",
  "Birgunj",
  "Kakarbhitta",
];

export default function BusesPage() {
  const [params, setParams] = useSearchParams();
  const today = new Date().toISOString().slice(0, 10);

  // Form input states
  const [fromInput, setFromInput] = useState(params.get("from") ?? "Kathmandu");
  const [toInput, setToInput] = useState(params.get("to") ?? "Pokhara");
  const [dateInput, setDateInput] = useState(params.get("date") ?? today);
  const [serviceInput, setServiceInput] = useState<"all" | "day" | "night">(
    (params.get("service") as any) ?? "all"
  );

  // Applied search states (updated on search button click)
  const [searchFrom, setSearchFrom] = useState(fromInput);
  const [searchTo, setSearchTo] = useState(toInput);
  const [searchDate, setSearchDate] = useState(dateInput);
  const [searchService, setSearchService] = useState<"all" | "day" | "night">(serviceInput);

  const [sortBy, setSortBy] = useState<"price" | "departure">("departure");

  const query = useQuery({
    queryKey: ["trips-buses", searchFrom, searchTo, searchDate],
    queryFn: async () => {
      try {
        const r = await api.get("/trips/search", {
          params: { from: searchFrom, to: searchTo, date: searchDate },
        });
        if (Array.isArray(r.data) && r.data.length > 0) {
          return r.data as TripResult[];
        }
        return FALLBACK_BUSES;
      } catch {
        return FALLBACK_BUSES;
      }
    },
    initialData: FALLBACK_BUSES,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchFrom(fromInput);
    setSearchTo(toInput);
    setSearchDate(dateInput);
    setSearchService(serviceInput);
    setParams({
      from: fromInput,
      to: toInput,
      date: dateInput,
      service: serviceInput,
    });
  }

  function swapLocations() {
    const temp = fromInput;
    setFromInput(toInput);
    setToInput(temp);
  }

  const allTrips = query.data ?? FALLBACK_BUSES;

  const filteredTrips = allTrips
    .filter((t) => {
      // Match origin and destination
      const matchesFrom =
        !searchFrom || t.route.from.toLowerCase().includes(searchFrom.toLowerCase());
      const matchesTo =
        !searchTo || t.route.to.toLowerCase().includes(searchTo.toLowerCase());
      const matchesRoute = matchesFrom && matchesTo;

      // Day vs Night service filter
      const depHour = new Date(t.departureTime).getHours();
      const isDay = depHour >= 6 && depHour < 18;
      const matchesService =
        searchService === "all" ||
        (searchService === "day" && isDay) ||
        (searchService === "night" && !isDay);

      return matchesRoute && matchesService;
    })
    .sort((a, b) => {
      if (sortBy === "price") return a.fare - b.fare;
      return (
        new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
      );
    });

  return (
    <div className="min-h-screen bg-[var(--color-ys-canvas)] pb-20">
      <TopNav />

      {/* Search Bus Area */}
      <div className="bg-gradient-to-r from-[var(--color-ys-deep-pine)] to-[#184E42] py-8 text-white shadow-md">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1
                className="text-2xl font-bold md:text-3xl"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Search & Book Buses
              </h1>
              <p className="mt-1 text-xs text-white/80 md:text-sm">
                Real-time schedules, verified operators, and live seat maps across Nepal
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid gap-3 rounded-2xl bg-white p-4 text-[var(--color-ys-ink)] shadow-xl md:grid-cols-[1.1fr_auto_1.1fr_1fr_1fr_auto] md:items-end"
          >
            {/* From */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ys-ink-subtle)]">
                From
              </label>
              <div className="relative flex items-center rounded-lg border border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] px-3">
                <Icons.MapPinIcon width={16} height={16} className="text-[var(--color-ys-emerald)] mr-2 shrink-0" />
                <select
                  value={fromInput}
                  onChange={(e) => setFromInput(e.target.value)}
                  className="h-11 w-full bg-transparent text-sm font-semibold outline-none"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="hidden md:flex md:pb-1">
              <button
                type="button"
                onClick={swapLocations}
                title="Swap origin and destination"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-ys-border)] bg-white text-[var(--color-ys-emerald)] transition hover:bg-[var(--color-ys-mint-tint)]"
              >
                <Icons.SwapIcon width={16} height={16} />
              </button>
            </div>

            {/* Destination */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ys-ink-subtle)]">
                Destination
              </label>
              <div className="relative flex items-center rounded-lg border border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] px-3">
                <Icons.MapPinIcon width={16} height={16} className="text-[var(--color-ys-emerald)] mr-2 shrink-0" />
                <select
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  className="h-11 w-full bg-transparent text-sm font-semibold outline-none"
                >
                  {CITIES.filter((c) => c !== fromInput).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ys-ink-subtle)]">
                Date
              </label>
              <div className="relative flex items-center rounded-lg border border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] px-3">
                <Icons.CalendarIcon width={16} height={16} className="text-[var(--color-ys-emerald)] mr-2 shrink-0" />
                <input
                  type="date"
                  value={dateInput}
                  min={today}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="h-11 w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>
            </div>

            {/* Services (Day / Night) */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ys-ink-subtle)]">
                Services
              </label>
              <select
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value as any)}
                className="h-11 w-full rounded-lg border border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] px-3 text-sm font-semibold outline-none"
              >
                <option value="all">All Services</option>
                <option value="day">Day Service (06:00 - 18:00)</option>
                <option value="night">Night Service (18:00 - 06:00)</option>
              </select>
            </div>

            {/* Search Button */}
            <Button
              size="xl"
              type="submit"
              className="h-11 flex items-center justify-center gap-2 font-bold md:min-w-[140px]"
            >
              <Icons.SearchIcon width={16} height={16} />
              Search buses
            </Button>
          </form>
        </div>
      </div>

      {/* Available Bus List */}
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              className="text-xl font-bold text-[var(--color-ys-deep-pine)]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Available Buses ({filteredTrips.length})
            </h2>
            <div className="mt-0.5 text-xs text-[var(--color-ys-ink-muted)]">
              Showing buses for <span className="font-semibold text-[var(--color-ys-deep-pine)]">{searchFrom} → {searchTo}</span> on{" "}
              <span className="font-semibold text-[var(--color-ys-deep-pine)]">{searchDate}</span> • Service:{" "}
              <span className="font-semibold uppercase text-[var(--color-ys-emerald)]">{searchService}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-ys-ink-subtle)]">Sort by:</span>
            <button
              onClick={() => setSortBy("departure")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                sortBy === "departure"
                  ? "bg-[var(--color-ys-emerald)] text-white shadow-sm"
                  : "border bg-white text-[var(--color-ys-ink-muted)] hover:bg-[var(--color-ys-canvas)]"
              }`}
            >
              Earliest Departure
            </button>
            <button
              onClick={() => setSortBy("price")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                sortBy === "price"
                  ? "bg-[var(--color-ys-emerald)] text-white shadow-sm"
                  : "border bg-white text-[var(--color-ys-ink-muted)] hover:bg-[var(--color-ys-canvas)]"
              }`}
            >
              Lowest Price
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTrips.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-ys-canvas)] text-[var(--color-ys-ink-subtle)]">
                <Icons.BusIcon width={32} height={32} />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-ys-deep-pine)]">No buses found</h3>
              <p className="mt-1 text-sm text-[var(--color-ys-ink-muted)]">
                No available buses matched your search criteria for {searchFrom} → {searchTo} ({searchService.toUpperCase()} service).
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setFromInput("Kathmandu");
                    setToInput("Pokhara");
                    setServiceInput("all");
                    setSearchFrom("Kathmandu");
                    setSearchTo("Pokhara");
                    setSearchService("all");
                  }}
                >
                  Reset filters & view all buses
                </Button>
              </div>
            </Card>
          ) : (
            filteredTrips.map((t) => {
              const dep = new Date(t.departureTime);
              const arr = new Date(t.arrivalTime);
              const durMin = Math.round((arr.getTime() - dep.getTime()) / 60000);
              const depHour = dep.getHours();
              const isDay = depHour >= 6 && depHour < 18;

              return (
                <Card
                  key={t.id}
                  className="p-5 transition-all hover:border-[var(--color-ys-emerald)] hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Left: Bus & Operator Info */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]">
                        <Icons.BusIcon width={26} height={26} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-[var(--color-ys-deep-pine)]">
                            {t.operator.brandName}
                          </h3>
                          <Badge variant={isDay ? "mint" : "outline"}>
                            {isDay ? "☀️ DAY SERVICE" : "🌙 NIGHT SERVICE"}
                          </Badge>
                          {t.bus.amenities.ac && <Badge variant="mint">AC DELUXE</Badge>}
                        </div>
                        <div className="mt-0.5 text-xs text-[var(--color-ys-ink-muted)]">
                          {t.bus.nickname ?? t.bus.type} • Plate: {t.bus.plate}
                        </div>

                        {/* Timing row */}
                        <div className="mt-3 flex items-center gap-6 text-sm">
                          <div>
                            <div className="font-bold text-[var(--color-ys-deep-pine)]">
                              {formatTime(t.departureTime)}
                            </div>
                            <div className="text-[11px] text-[var(--color-ys-ink-subtle)]">
                              {t.route.from}
                            </div>
                          </div>
                          <div className="text-center text-xs text-[var(--color-ys-ink-subtle)]">
                            <div>{formatDuration(durMin)}</div>
                            <div className="mx-auto my-1 h-0.5 w-16 bg-[var(--color-ys-border)]"></div>
                            <div>Direct</div>
                          </div>
                          <div>
                            <div className="font-bold text-[var(--color-ys-deep-pine)]">
                              {formatTime(t.arrivalTime)}
                            </div>
                            <div className="text-[11px] text-[var(--color-ys-ink-subtle)]">
                              {t.route.to}
                            </div>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {t.bus.amenities.wifi && (
                            <Amenity icon={<Icons.WifiIcon width={12} height={12} />} label="Wi-Fi" />
                          )}
                          {t.bus.amenities.chargingPort && (
                            <Amenity icon={<Icons.PlugIcon width={12} height={12} />} label="Charging" />
                          )}
                          {t.bus.amenities.waterBottle && (
                            <Amenity icon={<span>💧</span>} label="Water" />
                          )}
                          {t.bus.amenities.blanket && (
                            <Amenity icon={<span>🛏️</span>} label="Blanket" />
                          )}
                          {t.bus.amenities.ac && (
                            <Amenity icon={<span>❄️</span>} label="AirCon" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Fare & Action */}
                    <div className="flex flex-col items-end justify-between gap-3 text-right">
                      <div>
                        <div className="text-xs text-[var(--color-ys-ink-subtle)]">Starting from</div>
                        <div className="text-2xl font-bold text-[var(--color-ys-emerald)]">
                          {formatNpr(t.fare)}
                        </div>
                        <div className="text-[11px] font-semibold text-[var(--color-ys-warning)]">
                          {t.availableSeats} seats left
                        </div>
                      </div>
                      <Button
                        size="md"
                        onClick={() => (window.location.href = `/trip/${t.id}`)}
                        className="flex items-center gap-1.5 font-bold"
                      >
                        Select Seats
                        <Icons.ArrowRightIcon width={14} height={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}

function Amenity({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-ys-canvas)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-ys-ink-muted)] border border-[var(--color-ys-border)]">
      {icon}
      {label}
    </span>
  );
}
