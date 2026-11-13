import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { api, formatDuration, formatNpr, formatTime } from "../../lib/api";
import { TopNav, BottomNav } from "../../components/TopNav";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { DEFAULT_CANCEL_POLICY } from "@yatrasewa/shared-types";
import { useState } from "react";

interface TripBusAmenities { wifi?: boolean; chargingPort?: boolean; waterBottle?: boolean; blanket?: boolean; readingLight?: boolean; cctv?: boolean; ac?: boolean; lunchIncluded?: boolean }
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

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const from = params.get("from") ?? "Kathmandu";
  const to = params.get("to") ?? "Pokhara";
  const date = params.get("date") ?? new Date().toISOString().slice(0, 10);
  const [sortBy, setSortBy] = useState<"price" | "departure" | "duration">("departure");
  const [filterType, setFilterType] = useState<string>("all");

  const query = useQuery({
    queryKey: ["trips", from, to, date],
    queryFn: async () => {
      try {
        const r = await api.get("/trips/search", { params: { from, to, date } });
        return Array.isArray(r.data) ? r.data : [];
      } catch (err) {
        console.error("Failed to fetch trips", err);
        return [];
      }
    },
    initialData: [],
  });

  const trips = (query.data ?? [])
    .filter((t) => filterType === "all" || (filterType === "ac" && t.bus.amenities.ac) || (filterType === "wifi" && t.bus.amenities.wifi))
    .sort((a, b) => sortBy === "price" ? a.fare - b.fare : sortBy === "departure" ? new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime() : 0);

  return (
    <div className="min-h-screen bg-[var(--color-ys-canvas)]">
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-ys-deep-pine)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Available Buses</h1>
            <div className="text-sm text-[var(--color-ys-ink-muted)]">{from} → {to} · {new Date(date).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => history.back()} className="flex h-9 items-center gap-1 rounded-[8px] border border-[var(--color-ys-border)] bg-white px-3 text-[var(--color-ys-ink-muted)] hover:bg-[var(--color-ys-canvas)]">
              <Icons.SwapIcon size={14} /> Modify
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          {/* Filters sidebar */}
          <aside className="space-y-4">
            <Card className="p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">Sort by</div>
              <div className="flex flex-col gap-1 text-sm">
                {[["departure", "Departure"], ["price", "Price: Low to High"], ["duration", "Duration"]].map(([k, l]) => (
                  <button key={k} onClick={() => setSortBy(k as any)} className={`rounded-md px-2 py-1.5 text-left ${sortBy === k ? "bg-[var(--color-ys-mint-tint)] font-semibold text-[var(--color-ys-emerald)]" : "text-[var(--color-ys-ink-muted)] hover:bg-[var(--color-ys-canvas)]"}`}>{l}</button>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">Bus type</div>
              <div className="flex flex-col gap-1 text-sm">
                {[["all", "All"], ["ac", "AC Delux"], ["wifi", "Wi-Fi available"]].map(([k, l]) => (
                  <label key={k} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-[var(--color-ys-canvas)]">
                    <input type="radio" checked={filterType === k} onChange={() => setFilterType(k)} className="accent-[var(--color-ys-emerald)]" />
                    {l}
                  </label>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">Cancellation policy</div>
              <div className="space-y-1 text-xs">
                {DEFAULT_CANCEL_POLICY.map((r, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 rounded-md bg-[var(--color-ys-canvas)] px-2 py-1.5">
                    <span className="text-[var(--color-ys-ink-muted)]">{r.label.replace(" before departure", "").replace("More than ", ">").replace("Less than ", "<")}</span>
                    <span className="font-semibold text-[var(--color-ys-emerald)]">{r.refundPercent}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </aside>

          {/* Results */}
          <div className="space-y-3">
            {trips.length === 0 && (
              <Card className="p-10 text-center text-[var(--color-ys-ink-muted)]">No buses match your filters.</Card>
            )}
            {trips.map((t) => {
              const dep = new Date(t.departureTime);
              const arr = new Date(t.arrivalTime);
              const durMin = Math.round((arr.getTime() - dep.getTime()) / 60000);
              return (
                <Card key={t.id} className="p-0 overflow-hidden">
                  <div className="p-4 md:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]">
                          <Icons.BusIcon size={26} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-base font-bold">{t.operator.brandName}</div>
                            {t.operator.status === "approved" && <Badge variant="mint" dot>APPROVED</Badge>}
                            {t.bus.amenities.ac && <Badge variant="mint">AC DELUXE</Badge>}
                          </div>
                          <div className="text-xs text-[var(--color-ys-ink-muted)]">{t.bus.nickname ?? t.bus.type.replace("_", " ")} • {t.bus.plate}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold tabular-npr text-[var(--color-ys-deep-pine)]">{formatNpr(t.fare)}</div>
                        <div className="text-[11px] text-[var(--color-ys-ink-subtle)]">per person</div>
                      </div>
                    </div>

                    {/* Time row */}
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <div className="text-center">
                        <div className="text-xl font-bold tabular-npr">{formatTime(dep)}</div>
                        <div className="text-[11px] text-[var(--color-ys-ink-muted)]">{t.route.from}</div>
                      </div>
                      <div className="flex-1 px-2">
                        <div className="relative flex items-center">
                          <div className="h-px flex-1 bg-[var(--color-ys-border)]"></div>
                          <div className="mx-2 flex items-center gap-1 text-[11px] font-semibold text-[var(--color-ys-ink-muted)]">
                            <Icons.ClockIcon size={12} /> {formatDuration(durMin)}
                          </div>
                          <div className="h-px flex-1 bg-[var(--color-ys-border)]"></div>
                        </div>
                        <div className="mt-0.5 text-center text-[10px] text-[var(--color-ys-ink-subtle)]">{t.route.distance} km · Prithvi Hwy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold tabular-npr">{formatTime(arr)}</div>
                        <div className="text-[11px] text-[var(--color-ys-ink-muted)]">{t.route.to}</div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {t.bus.amenities.wifi && <Amenity icon={<Icons.WifiIcon size={12} />} label="Wi-Fi" />}
                      {t.bus.amenities.chargingPort && <Amenity icon={<Icons.PlugIcon size={12} />} label="Charging port" />}
                      {t.bus.amenities.waterBottle && <Amenity icon={<span className="text-[10px]">💧</span>} label="Water bottle" />}
                      {t.bus.amenities.blanket && <Amenity icon={<span className="text-[10px]">🛏️</span>} label="Blanket" />}
                      {t.bus.amenities.readingLight && <Amenity icon={<span className="text-[10px]">💡</span>} label="Reading light" />}
                      {t.bus.amenities.cctv && <Amenity icon={<span className="text-[10px]">📷</span>} label="CCTV" />}
                      {t.bus.amenities.lunchIncluded && <Amenity icon={<span className="text-[10px]">🍛</span>} label="Complementary Lunch" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] px-4 py-2 md:px-5">
                    <div className="text-[11px] text-[var(--color-ys-ink-muted)]">
                      <span className="font-semibold text-[var(--color-ys-warning)]">{t.availableSeats} seats left</span> · Live tracking available
                    </div>
                    <a href={`/trip/${t.id}`}>
                      <Button variant="outline" size="md" className="gap-1">Select seats <Icons.ArrowRightIcon size={14} /></Button>
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav active="home" />
    </div>
  );
}

function Amenity({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] bg-[var(--color-ys-canvas)] px-2 py-1 text-[11px] text-[var(--color-ys-ink-muted)]">
      {icon}{label}
    </span>
  );
}
