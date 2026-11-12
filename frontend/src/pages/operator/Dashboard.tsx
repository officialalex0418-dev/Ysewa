import { OperatorShell } from "../../components/OperatorShell";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { formatNpr } from "../../lib/api";

export default function OperatorDashboardPage() {
  return (
    <OperatorShell activeKey="dashboard">
      <div className="mb-5">
        <div className="text-xs uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">Fleet overview</div>
        <h1 className="text-2xl font-bold text-[var(--color-ys-deep-pine)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Good morning, Name</h1>
      </div>

      <div className="grid gap-3 md:grid-cols-4 mb-6">
        <Kpi title="Daily trips (7d avg)" value="27.4" delta="+3" icon={<Icons.BusIcon size={16} />} positive />
        <Kpi title="Fleet Utilization" value="78.4%" delta="A3.72%" icon={<Icons.ChartIcon size={16} />} positive />
        <Kpi title="Revenue (30d)" value={formatNpr(437850)} delta="+18%" icon={<Icons.WalletIcon size={16} />} positive />
        <Kpi title="Seats sold" value="43" delta="76.4% occupancy" icon={<Icons.TicketIcon size={16} />} positive />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold">Recent activity</h3>
              <button className="text-xs font-semibold text-[var(--color-ys-emerald)]">View all (24)</button>
            </div>
            <div className="divide-y divide-[var(--color-ys-border)]">
              <ActLine title="Dispatch confirmed · BA 2 KHA 4512" meta="07:00 KTM-PKR, 38 passengers booked, 2 walk-ins" time="8 min ago" color="bg-[var(--color-ys-emerald)]" icon="✓" />
              <ActLine title="Maintenance ticket #M-428 closed" meta="BA 3 KHA 8820 brake service complete — back in service" time="1h ago" color="bg-[var(--color-ys-info)]" icon="🔧" />
              <ActLine title="Driver check-in: Dipendra Koirala" meta="Started trip #YS240914-1, telemetry ping normal" time="2h ago" color="bg-[var(--color-ys-mint)]" icon="●" />
              <ActLine title="Settlement batch credited" meta="Sep 16-30 net Rs.4,12,850 via NCHL NPI" time="yesterday" color="bg-[var(--color-ys-success)]" icon="$" />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-sm font-bold">Upcoming departures today</h3>
            <div className="space-y-2">
              {[
                { bus: "BA 2 KHA 4512", route: "Kathmandu → Pokhara", dep: "07:00", booked: 38, cap: 40, status: "BOARDING" },
                { bus: "BA 3 KHA 8820", route: "Kathmandu → Chitwan", dep: "08:30", booked: 31, cap: 36, status: "BOARDING SOON" },
                { bus: "BA 2 KHA 4550", route: "Pokhara → Kathmandu", dep: "10:00", booked: 22, cap: 40, status: "SCHEDULED" },
              ].map((t) => (
                <div key={t.bus} className="flex items-center justify-between rounded-lg border border-[var(--color-ys-border)] p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)] font-bold text-xs">{t.dep}</div>
                    <div>
                      <div className="text-sm font-bold">{t.route}</div>
                      <div className="text-[11px] text-[var(--color-ys-ink-muted)]">{t.bus} · {t.booked}/{t.cap} booked</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={t.status === "BOARDING" ? "mint" : t.status === "BOARDING SOON" ? "warning" : "info"} dot>{t.status}</Badge>
                    <Button variant="outline" size="sm">Manifest →</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-bold">Fleet snapshot</h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <StatBlock label="Active" value="4" tint="mint" />
              <StatBlock label="In Maintenance" value="2" tint="warning" />
              <StatBlock label="Retired" value="1" tint="neutral" />
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-md bg-[var(--color-ys-canvas)] p-2"><span>BA 2 KHA 4512</span><Badge variant="mint" dot>IN SERVICE</Badge></div>
              <div className="flex items-center justify-between rounded-md bg-[var(--color-ys-canvas)] p-2"><span>BA 3 KHA 8820</span><Badge variant="mint" dot>IN SERVICE</Badge></div>
              <div className="flex items-center justify-between rounded-md bg-[var(--color-ys-canvas)] p-2"><span>GA 2 KHA 4599</span><Badge variant="warning">DOCS EXPIRED</Badge></div>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-2 text-sm font-bold">Settlement status</h3>
            <div className="text-3xl font-bold tabular-npr text-[var(--color-ys-deep-pine)]">{formatNpr(437850)}</div>
            <div className="text-xs text-[var(--color-ys-warning)]">Pending approval · Oct 1-15 cycle</div>
            <div className="mt-3 rounded-md bg-[var(--color-ys-mint-tint)] p-2 text-[11px] text-[var(--color-ys-emerald)]">Previous settlement of {formatNpr(412850)} received 3 Oct via NCHL NPI.</div>
          </Card>
        </div>
      </div>
    </OperatorShell>
  );
}

function Kpi({ title, value, delta, icon, positive }: any) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]">{icon}</div>
      </div>
      <div className="mt-2 text-[11px] font-semibold uppercase text-[var(--color-ys-ink-subtle)]">{title}</div>
      <div className="text-2xl font-bold tabular-npr text-[var(--color-ys-deep-pine)]">{value}</div>
      <div className={`mt-1 text-xs font-semibold ${positive ? "text-[var(--color-ys-emerald)]" : "text-[var(--color-ys-warning)]"}`}>{delta}</div>
    </Card>
  );
}

function ActLine({ title, meta, time, color, icon }: any) {
  return (
    <div className="flex gap-3 py-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs text-white ${color}`}>{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-[var(--color-ys-ink-muted)]">{meta}</div>
      </div>
      <div className="text-[11px] text-[var(--color-ys-ink-subtle)]">{time}</div>
    </div>
  );
}

function StatBlock({ label, value, tint }: { label: string; value: string; tint: "mint" | "warning" | "neutral" }) {
  const bg = { mint: "bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]", warning: "bg-[#FFF1E2] text-[var(--color-ys-warning)]", neutral: "bg-[#F1F3F6] text-[var(--color-ys-ink-muted)]" }[tint];
  return <div className={`rounded-lg p-2 ${bg}`}><div className="text-xl font-bold tabular-npr">{value}</div><div className="text-[10px]">{label}</div></div>;
}
