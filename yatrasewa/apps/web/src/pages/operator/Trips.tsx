import { OperatorShell } from "../../components/OperatorShell";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { formatNpr, formatTime } from "../../lib/api";

const SCHEDULE = [
  { id: 1, route: "Kathmandu → Pokhara", bus: "BA 2 KHA 4512", dep: "07:00", arr: "13:30", date: "14 Sep", sold: 38, cap: 40, rev: 110200, status: "ON_TIME", driver: "Dipendra K.", conductor: "Sneha G.", conflict: null },
  { id: 2, route: "Kathmandu → Chitwan", bus: "BA 3 KHA 8820", dep: "08:30", arr: "13:30", date: "14 Sep", sold: 31, cap: 36, rev: 77500, status: "BOARDING", driver: "R. Thapa", conductor: "A. Sharma", conflict: null },
  { id: 3, route: "Pokhara → Kathmandu", bus: "BA 2 KHA 4550", dep: "10:00", arr: "16:30", date: "14 Sep", sold: 22, cap: 40, rev: 55000, status: "SCHEDULED", driver: "Unassigned", conductor: "Unassigned", conflict: null },
  { id: 4, route: "Kathmandu → Janakpur", bus: "BA 2 KHA 4241", dep: "06:30", arr: "13:30", date: "15 Sep", sold: 0, cap: 36, rev: 0, status: "CONFLICT", driver: "Dipendra K.", conductor: "Sneha G.", conflict: "Driver assigned to KTM-PKR trip 2h earlier" },
];

export default function OperatorTripsPage() {
  return (
    <OperatorShell activeKey="trips">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">Operations are on track</div>
          <h1 className="text-2xl font-bold text-[var(--color-ys-deep-pine)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Schedule control room</h1>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded-md bg-[var(--color-ys-mint-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ys-emerald)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ys-emerald)] animate-pulse" /> 84% · 3 · 1,284</div>
          <Button size="md">+ Schedule trip</Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniKpi label="All scheduled (48h)" val="42" />
        <MiniKpi label="On time %" val="94%" positive />
        <MiniKpi label="Active fleet" val="3" />
        <MiniKpi label="Live occupancy" val="1,284" />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-[var(--color-ys-border)] p-4">
          <div className="flex gap-1 rounded-md border border-[var(--color-ys-border)] p-0.5 text-xs">
            {["All scheduled", "2+2 AC Deluxe", "4 seats", "VIP Sofa", "Sleeper (32)"].map((f, i) => (
              <button key={f} className={`rounded px-2 py-1 font-semibold ${i === 0 ? "bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]" : "text-[var(--color-ys-ink-muted)]"}`}>{f}</button>
            ))}
          </div>
          <div className="text-xs text-[var(--color-ys-ink-muted)]">Selected: <b className="text-[var(--color-ys-deep-pine)]">Oct 21, 23:25 (NPT)</b></div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] text-left text-[11px] uppercase text-[var(--color-ys-ink-subtle)]">
              <th className="p-3">Route & Date</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Departure</th>
              <th className="p-3">Bookings</th>
              <th className="p-3">Revenue</th>
              <th className="p-3">Status</th>
              <th className="p-3">Crew</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {SCHEDULE.map((t) => (
              <tr key={t.id} className={`border-b border-[var(--color-ys-border)] last:border-0 ${t.conflict ? "bg-[#FCE8E8]/30" : "hover:bg-[var(--color-ys-canvas)]/40"}`}>
                <td className="p-3">
                  <div className="font-semibold">{t.route}</div>
                  <div className="text-[11px] text-[var(--color-ys-ink-muted)]">{t.date}</div>
                </td>
                <td className="p-3 text-xs font-semibold tabular-npr">{t.bus}</td>
                <td className="p-3">
                  <div className="font-bold tabular-npr">{t.dep} → {t.arr}</div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--color-ys-border)]">
                      <div className="h-full rounded-full bg-[var(--color-ys-emerald)]" style={{ width: `${(t.sold / t.cap) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold tabular-npr">{t.sold}/{t.cap}</span>
                  </div>
                </td>
                <td className="p-3 font-semibold tabular-npr">{formatNpr(t.rev)}</td>
                <td className="p-3">
                  {t.status === "CONFLICT" ? (
                    <Badge variant="danger">⚠ CONFLICT</Badge>
                  ) : (
                    <Badge variant={t.status === "ON_TIME" ? "mint" : t.status === "BOARDING" ? "info" : "warning"} dot>{t.status.replace("_", " ")}</Badge>
                  )}
                </td>
                <td className="p-3 text-xs">
                  <div className="font-semibold">{t.driver}</div>
                  <div className="text-[var(--color-ys-ink-muted)]">{t.conductor}</div>
                </td>
                <td className="p-3 text-right">
                  {t.conflict ? (
                    <Button size="sm" variant="danger">Resolve conflict</Button>
                  ) : (
                    <Button size="sm" variant="outline">View manifest →</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {SCHEDULE.some(s => s.conflict) && (
        <Card className="mt-4 border-l-4 border-[var(--color-ys-danger)] bg-[#FCE8E8]/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[var(--color-ys-danger)] flex items-center gap-2">
                <Icons.XIcon size={16} />
                VISIBLE DOUBLE BOOKING CONFLICT
              </div>
              <div className="mt-1 text-xs text-[var(--color-ys-ink-muted)]">Bus BA 2 KHA 4241 assigned to KTM-JKR 06:30 but driver Dipendra K. is assigned to KTM-PKR 07:00 (only 30min gap) — <b>recommended: swap driver</b>.</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Adjust time</Button>
              <Button size="sm"><Icons.UserIcon size={12} /> Reassign vehicle</Button>
            </div>
          </div>
        </Card>
      )}
    </OperatorShell>
  );
}

function MiniKpi({ label, val, positive }: { label: string; val: string; positive?: boolean }) {
  return (
    <Card className="p-3">
      <div className="text-[11px] font-semibold uppercase text-[var(--color-ys-ink-subtle)]">{label}</div>
      <div className={`mt-1 text-xl font-bold tabular-npr ${positive ? "text-[var(--color-ys-emerald)]" : "text-[var(--color-ys-deep-pine)]"}`}>{val}</div>
    </Card>
  );
}
