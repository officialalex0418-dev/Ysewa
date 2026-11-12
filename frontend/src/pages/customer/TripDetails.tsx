import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, formatNpr, formatTime } from "../../lib/api";
import { getSocket } from "../../lib/socket";
import { TopNav } from "../../components/TopNav";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { SeatMap } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { DEFAULT_CANCEL_POLICY, generate2x2Deluxe, type SeatStatus } from "@yatrasewa/shared-types";
import { useAuth } from "../../lib/auth";

interface TripData {
  id: string; fare: number; departureTime: string; arrivalTime: string; status: string;
  operator: { brandName: string };
  bus: { plate: string; nickname?: string; vehicleType: string; amenities: any };
  route: { from?: string; to?: string; originCity?: { name: string }; destCity?: { name: string }; stops: any[] };
  seatStates?: Record<string, string>;
}

export default function TripDetailsPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [seatStates, setSeatStates] = useState<Record<string, SeatStatus>>({});

  const tripQuery = useQuery({
    queryKey: ["trip", tripId],
    queryFn: async (): Promise<TripData> => {
      try {
        const r = await api.get(`/trips/${tripId}`);
        return r.data;
      } catch {
        return FALLBACK_TRIP;
      }
    },
  });

  const trip = tripQuery.data;
  const layout = useMemo(() => generate2x2Deluxe(), []);

  useEffect(() => {
    if (trip?.seatStates) {
      setSeatStates(trip.seatStates as any);
    }
  }, [trip?.seatStates]);

  // Live socket updates
  useEffect(() => {
    if (!tripId) return;
    const s = getSocket();
    s.emit("trip:subscribe", tripId);
    s.on("seat:state-changed", (evt: { seats: string[]; state: string }) => {
      setSeatStates((prev) => {
        const next = { ...prev };
        for (const seat of evt.seats) next[seat] = evt.state === "locked" ? "locked" : "available";
        return next;
      });
    });
    return () => { s.off("seat:state-changed"); s.emit("trip:unsubscribe", tripId); };
  }, [tripId]);

  function toggleSeat(label: string) {
    setSelected((prev) => prev.includes(label) ? prev.filter((s) => s !== label) : prev.length < 6 ? [...prev, label] : prev);
  }

  async function handleContinue() {
    if (!selected.length) return;
    if (!user) { navigate(`/auth/login?next=/trip/${tripId}`); return; }
    try {
      if (tripId?.startsWith("demo-")) {
        navigate(`/checkout/demo-booking-123?seats=${selected.join(",")}`);
        return;
      }
      const r = await api.post(`/trips/${tripId}/seats/lock`, { tripId, seats: selected });
      navigate(`/checkout/${r.data.bookingId}?seats=${selected.join(",")}`);
    } catch (e: any) {
      alert(e?.response?.data?.title ?? e?.response?.data?.message ?? "Could not lock seats. Please try again.");
    }
  }

  if (!trip) return <div className="p-10 text-center">Loading...</div>;

  const originName = trip.route.originCity?.name ?? "Kathmandu";
  const destName = trip.route.destCity?.name ?? "Pokhara";
  const totalFare = Number(trip.fare) * selected.length;
  const dep = new Date(trip.departureTime);
  const arr = new Date(trip.arrivalTime);

  // Stops
  const stops = trip.route.stops?.length ? trip.route.stops : [
    { stopName: "Sorakhutte (Main Terminal)", isBoarding: true, isDropping: false, arrivalOffsetMin: 0 },
    { stopName: "New Buspark (Gongabu)", isBoarding: true, isDropping: false, arrivalOffsetMin: 20 },
    { stopName: "Kalanki Bypass", isBoarding: true, isDropping: true, arrivalOffsetMin: 45 },
    { stopName: "Prithvi Chowk (Pokhara)", isBoarding: false, isDropping: true, arrivalOffsetMin: 360 },
    { stopName: "Tourist Bus Park (Pokhara)", isBoarding: false, isDropping: true, arrivalOffsetMin: 390 },
  ];
  const boardings = stops.filter((s: any) => s.isBoarding);
  const droppings = stops.filter((s: any) => s.isDropping);

  return (
    <div className="min-h-screen bg-[var(--color-ys-canvas)] pb-24">
      <TopNav />
      <div className="mx-auto max-w-5xl px-4 py-5 md:px-6">
        {/* breadcrumb */}
        <button onClick={() => history.back()} className="mb-3 text-sm text-[var(--color-ys-emerald)] hover:underline">← Back to results</button>

        {/* Trip header card */}
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]"><Icons.BusIcon size={26} /></div>
                <div>
                  <div className="text-lg font-bold">{trip.operator.brandName}</div>
                  <div className="text-xs text-[var(--color-ys-ink-muted)]">{trip.bus.nickname ?? trip.bus.vehicleType} • {trip.bus.plate}</div>
                </div>
                <Badge variant="mint" dot>LIVE SYNC</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-lg bg-[var(--color-ys-mint-tint)] px-3 py-2 text-center">
                <div className="text-[10px] uppercase text-[var(--color-ys-ink-subtle)]">Departure</div>
                <div className="text-sm font-bold">{formatTime(dep)}</div>
                <div className="text-[10px] text-[var(--color-ys-ink-muted)]">{originName}</div>
              </div>
              <div className="flex flex-col justify-center text-center">
                <Icons.ArrowRightIcon size={20} className="text-[var(--color-ys-emerald)]" />
                <div className="text-[10px] text-[var(--color-ys-ink-subtle)]">6h 30m</div>
              </div>
              <div className="rounded-lg bg-[var(--color-ys-mint-tint)] px-3 py-2 text-center">
                <div className="text-[10px] uppercase text-[var(--color-ys-ink-subtle)]">Arrival</div>
                <div className="text-sm font-bold">{formatTime(arr)}</div>
                <div className="text-[10px] text-[var(--color-ys-ink-muted)]">{destName}</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_320px]">
          {/* Seat map column */}
          <div className="space-y-4">
            <SeatMap
              seats={layout.seats.filter((s) => s.type !== "driver")}
              seatStates={seatStates}
              selected={selected}
              onSeatClick={toggleSeat}
              maxSeats={6}
            />
            {/* Fare summary sticky bottom */}
          </div>

          {/* Right sidebar: amenities, boarding/dropping, cancellation */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="mb-2 text-sm font-bold">Amenities</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-ys-ink-muted)]">
                <Amenity on={trip.bus.amenities.wifi}><Icons.WifiIcon size={14} /> Wi-Fi</Amenity>
                <Amenity on={trip.bus.amenities.chargingPort}><Icons.PlugIcon size={14} /> Charging</Amenity>
                <Amenity on={trip.bus.amenities.waterBottle}>💧 Water bottle</Amenity>
                <Amenity on={trip.bus.amenities.blanket}>🛏️ Blanket</Amenity>
                <Amenity on={trip.bus.amenities.readingLight}>💡 Reading light</Amenity>
                <Amenity on={trip.bus.amenities.cctv}>📷 CCTV</Amenity>
                <Amenity on={trip.bus.amenities.ac}>❄️ AC</Amenity>
                <Amenity on={trip.bus.amenities.lunchIncluded}>🍛 Lunch</Amenity>
              </div>
            </Card>

            <Card className="p-4">
              <div className="mb-2 text-sm font-bold">Pickup points</div>
              <div className="space-y-2">
                {boardings.map((s: any, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <Icons.MapPinIcon size={14} className="mt-0.5 text-[var(--color-ys-emerald)]" />
                    <div>
                      <div className="text-sm font-semibold">{s.stopName}</div>
                      <div className="text-[11px] text-[var(--color-ys-ink-subtle)]">
                        {formatTime(new Date(dep.getTime() + (s.arrivalOffsetMin ?? 0) * 60000))} · {s.isDropping ? "Pickup/Drop" : "Pickup"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="mb-2 text-sm font-bold">Drop points</div>
              <div className="space-y-2">
                {droppings.map((s: any, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <Icons.MapPinIcon size={14} className="mt-0.5 text-[var(--color-ys-info)]" />
                    <div>
                      <div className="text-sm font-semibold">{s.stopName}</div>
                      <div className="text-[11px] text-[var(--color-ys-ink-subtle)]">
                        Estimated {formatTime(new Date(dep.getTime() + (s.arrivalOffsetMin ?? 0) * 60000))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Icons.ShieldCheckIcon size={16} className="text-[var(--color-ys-warning)]" />
                Cancellation policy
              </div>
              <div className="text-[11px] text-[var(--color-ys-ink-muted)] mb-2 p-2 rounded bg-[#FFF6EA] border border-[#FFE2BE]">
                ⚠ Time-sensitive cancellation policy. Cancelling within 6 hours of departure incurs a 50% fee.
              </div>
              <div className="space-y-1.5">
                {DEFAULT_CANCEL_POLICY.map((r, i) => {
                  const pct = r.refundPercent;
                  return (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[var(--color-ys-ink-muted)]">{r.label}</span>
                        <span className="font-semibold">{pct}% refund</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--color-ys-border)] overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[var(--color-ys-danger)] via-[var(--color-ys-warning)] to-[var(--color-ys-emerald)]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky checkout bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-ys-border)] bg-white shadow-[0_-4px_20px_rgba(23,92,73,.08)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <div className="text-[11px] text-[var(--color-ys-ink-subtle)]">
              {selected.length === 0 ? "Select at least 1 seat" : `${selected.length} seat${selected.length > 1 ? "s" : ""}: ${selected.sort().join(", ")}`}
            </div>
            <div className="text-xl font-bold tabular-npr text-[var(--color-ys-deep-pine)]">
              {selected.length ? formatNpr(totalFare) : "—"}
            </div>
            <div className="text-[10px] text-[var(--color-ys-mint)]">Free cancellation up to 24h before departure</div>
          </div>
          <Button size="xl" disabled={selected.length === 0} onClick={handleContinue}>
            Continue to payment <Icons.ArrowRightIcon size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Amenity({ on, children }: { on?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-1 ${on ? "text-[var(--color-ys-ink)]" : "text-[var(--color-ys-ink-subtle)]/50 line-through"}`}>
      {children}
    </div>
  );
}

const FALLBACK_TRIP: TripData = {
  id: "demo-trip-greenline", fare: 2900,
  departureTime: new Date(new Date().setHours(7, 0, 0, 0)).toISOString(),
  arrivalTime: new Date(new Date().setHours(13, 30, 0, 0)).toISOString(),
  status: "scheduled",
  operator: { brandName: "Greenline Travels" },
  bus: { plate: "BA 2 KHA 4512", nickname: "Greenline Deluxe 2x2", vehicleType: "ac_deluxe", amenities: { wifi: true, chargingPort: true, waterBottle: true, blanket: false, readingLight: true, cctv: true, ac: true, lunchIncluded: true } },
  route: { originCity: { name: "Kathmandu" }, destCity: { name: "Pokhara" }, stops: [] },
  seatStates: { A3: "booked", A4: "booked", B1: "locked", B2: "locked", J2: "booked", C3: "booked", C4: "booked" },
};
