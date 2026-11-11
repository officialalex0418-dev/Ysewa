import { TopNav } from "../../components/TopNav";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";

export default function TrackBusPage() {
  // Simplified live GPS map with SVG
  const stops = [
    { name: "Sorakhutte", km: 0, eta: "-", passed: true },
    { name: "Kalanki", km: 8, eta: "07:22", passed: true },
    { name: "Naubise", km: 32, eta: "08:05", passed: true },
    { name: "Mugling", km: 85, eta: "09:15", passed: false, current: true },
    { name: "Damauli", km: 142, eta: "11:20", passed: false },
    { name: "Prithvi Chowk", km: 195, eta: "13:05", passed: false },
    { name: "Tourist Bus Park", km: 200, eta: "13:30", passed: false, dest: true },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-ys-canvas)]">
      <TopNav />
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <button className="mb-3 text-sm text-[var(--color-ys-emerald)]">← Back to bookings</button>
        <Card className="overflow-hidden">
          {/* Map area */}
          <div className="relative h-[400px] bg-gradient-to-br from-[#E8F5EE] via-[#D5EDDE] to-[#C5E5CF]">
            <svg viewBox="0 0 600 400" className="absolute inset-0 h-full w-full">
              <path d="M40 80 Q 150 100, 200 130 T 350 190 T 560 310" stroke="#08976B" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="2 8" />
              <path d="M40 80 Q 150 100, 200 130 T 275 170" stroke="#0B7A5A" strokeWidth="6" fill="none" strokeLinecap="round" />
              {stops.map((s, i) => {
                const t = i / (stops.length - 1);
                const x = 40 + t * 520;
                const y = 80 + Math.sin(t * Math.PI * 0.8) * 120 + t * 150;
                return (
                  <g key={s.name}>
                    <circle cx={x} cy={y} r={s.current ? 12 : 8} fill={s.passed ? "#08976B" : s.dest ? "#175C49" : "#B3570C"} stroke="#fff" strokeWidth="2" />
                    {s.current && <circle cx={x} cy={y} r={22} fill="#08976B" opacity="0.25"><animate attributeName="r" from="12" to="26" dur="1.5s" repeatCount="indefinite" /></circle>}
                    <text x={x} y={y - 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="#175C49">{s.name}</text>
                  </g>
                );
              })}
              {/* Bus marker at current stop */}
              <g transform="translate(275 170)">
                <rect x="-16" y="-10" width="32" height="20" rx="4" fill="#fff" stroke="#08976B" strokeWidth="2" />
                <text textAnchor="middle" y="5" fontSize="14" fill="#08976B">🚌</text>
              </g>
            </svg>
            <div className="absolute left-4 top-4 rounded-lg bg-white p-3 shadow-md">
              <div className="flex items-center gap-2">
                <Badge variant="mint" dot>LIVE GPS</Badge>
                <span className="text-xs text-[var(--color-ys-ink-muted)]">Updated 4 sec ago</span>
              </div>
              <div className="mt-2 text-sm font-bold text-[var(--color-ys-deep-pine)]">Greenline Deluxe · BA 2 KHA 4512</div>
              <div className="text-xs text-[var(--color-ys-ink-muted)]">Kathmandu → Pokhara · PNR YS-GR3N-POKBKK</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                <div><div className="text-lg font-bold text-[var(--color-ys-emerald)] tabular-npr">58 km/h</div><div className="text-[10px] text-[var(--color-ys-ink-subtle)]">Speed</div></div>
                <div><div className="text-lg font-bold text-[var(--color-ys-deep-pine)] tabular-npr">3h 42m</div><div className="text-[10px] text-[var(--color-ys-ink-subtle)]">ETA</div></div>
                <div><div className="text-lg font-bold tabular-npr">62%</div><div className="text-[10px] text-[var(--color-ys-ink-subtle)]">Progress</div></div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold">Trip timeline</h3>
              <div className="flex items-center gap-1 text-xs text-[var(--color-ys-warning)]"><Icons.BellIcon size={14} /> 1.5 km pickup alert enabled</div>
            </div>
            <div className="space-y-3">
              {stops.map((s) => (
                <div key={s.name} className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.current ? "bg-[var(--color-ys-emerald)] text-white ring-4 ring-[var(--color-ys-mint-tint)]" : s.passed ? "bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]" : s.dest ? "bg-[var(--color-ys-deep-pine)] text-white" : "bg-[var(--color-ys-border)] text-[var(--color-ys-ink-subtle)]"}`}>
                    {s.passed || s.current ? <Icons.CheckIcon size={14} /> : s.dest ? <Icons.MapPinIcon size={14} /> : s.km}
                  </div>
                  <div className="flex-1 border-b border-[var(--color-ys-border)] pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`text-sm font-semibold ${s.current ? "text-[var(--color-ys-emerald)]" : ""}`}>{s.name}{s.current && <Badge variant="mint" dot className="ml-2">NOW APPROACHING</Badge>}</div>
                      <div className="text-xs tabular-npr text-[var(--color-ys-ink-muted)]">{s.dest ? <b className="text-[var(--color-ys-deep-pine)]">{s.eta}</b> : s.eta}</div>
                    </div>
                    <div className="text-[11px] text-[var(--color-ys-ink-subtle)]">{s.km} km from origin</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="md" className="flex-1">Share live location</Button>
              <Button size="md" className="flex-1">Call conductor</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
