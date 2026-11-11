import { OperatorShell } from "../../components/OperatorShell";
import { Badge, Button, Card, Input } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { useState } from "react";

const FLEET = [
  { plate: "BA 2 KHA 4241", nickname: "Greenline VIP Sofa 2+1", type: "vip_sofa_2x1", seats: 36, trips: 42, rating: 4.8, status: "active", docs: "valid", amenities: { wifi: true, ac: true, charging: true, water: true, usb: true } },
  { plate: "BA 2 KHA 8421", nickname: "Greenline Deluxe Coach", type: "deluxe", seats: 40, trips: 38, rating: 4.6, status: "active", docs: "valid", amenities: { wifi: false, ac: true, charging: true, water: true, blanket: true } },
  { plate: "BA 3 KHA 1105", nickname: "Greenline Sleeper", type: "sleeper", seats: 30, trips: 22, rating: 4.9, status: "active", docs: "expiring", amenities: { wifi: true, ac: true, charging: true, blanket: true, reading: true } },
  { plate: "BA 2 KHA 8820", nickname: "Tourist Bus #7", type: "tourist", seats: 36, trips: 18, rating: 4.7, status: "maintenance", docs: "valid", amenities: { wifi: false, ac: false, charging: false, water: false } },
  { plate: "GA 2 KHA 4599", nickname: "Mountain Tourist", type: "tourist", seats: 40, trips: 0, rating: 0, status: "documents_expired", docs: "expired", amenities: {} },
];

export default function OperatorFleetPage() {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <OperatorShell activeKey="fleet">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">Registered vehicle pool · Real-time maintenance & compliance monitor</div>
          <h1 className="text-2xl font-bold text-[var(--color-ys-deep-pine)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your Fleet</h1>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 rounded-md border border-[var(--color-ys-border)] bg-white p-0.5 text-xs">
            {["87.5% on-time", "A2", "312", "1"].map((f, i) => (
              <button key={f} className={`rounded px-2 py-1 font-semibold ${i === 1 ? "bg-[var(--color-ys-emerald)] text-white" : "text-[var(--color-ys-ink-muted)]"}`}>{f}</button>
            ))}
          </div>
          <Button size="md" onClick={() => setShowAdd(true)}>+ Register vehicle</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {FLEET.map((v) => (
          <Card key={v.plate} className="p-0 overflow-hidden">
            <div className={`p-4 ${v.status === "documents_expired" ? "bg-[#FCE8E8]/40" : v.status === "maintenance" ? "bg-[#FFF6EA]/40" : "bg-white"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]"><Icons.BusIcon size={22} /></div>
                  <div>
                    <div className="text-sm font-bold tabular-npr">{v.plate}</div>
                    <div className="text-[11px] text-[var(--color-ys-ink-muted)]">{v.nickname}</div>
                  </div>
                </div>
                <StatusBadge status={v.status} />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
                <Stat label="Seats" val={String(v.seats)} />
                <Stat label="Trips (30d)" val={String(v.trips)} />
                <Stat label="Rating" val={v.rating ? `★${v.rating}` : "—"} />
              </div>

              <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
                {v.amenities.wifi && <Amen>Wi-Fi</Amen>}
                {v.amenities.ac && <Amen>A/C</Amen>}
                {v.amenities.charging && <Amen>Charging</Amen>}
                {v.amenities.usb && <Amen>USB</Amen>}
                {v.amenities.water && <Amen>Water</Amen>}
                {v.amenities.blanket && <Amen>Blanket</Amen>}
                {v.amenities.reading && <Amen>Reading</Amen>}
                {!Object.values(v.amenities).some(Boolean) && <span className="text-[var(--color-ys-ink-subtle)]">No amenities defined</span>}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] px-4 py-2 text-xs">
              <div className="flex items-center gap-1 text-[var(--color-ys-ink-muted)]">
                {v.docs === "expired" ? (
                  <span className="text-[var(--color-ys-danger)] font-semibold">⚠ Documents expired — renew</span>
                ) : v.docs === "expiring" ? (
                  <span className="text-[var(--color-ys-warning)] font-semibold">⚠ Documents expire in 14 days</span>
                ) : (
                  <span className="text-[var(--color-ys-emerald)]"><Icons.CheckIcon size={12} /> All documents valid</span>
                )}
              </div>
              <button className="text-[var(--color-ys-emerald)] font-semibold">Manage →</button>
            </div>
          </Card>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <Card className="w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--color-ys-deep-pine)]">Register vehicle</h3>
              <button onClick={() => setShowAdd(false)} className="text-[var(--color-ys-ink-subtle)] text-xl">×</button>
            </div>
            <div className="space-y-3">
              <Input label="Plate number (e.g. BA 2 KHA 4512)" defaultValue="BA 2 KHA 8821" />
              <Input label="Nickname" placeholder="Greenline VIP Sofa" />
              <label className="block text-xs font-semibold text-[var(--color-ys-ink-muted)]">
                Vehicle Type
                <select className="mt-1.5 block h-11 w-full rounded-[var(--radius-btn)] border border-[var(--color-ys-border)] bg-white px-3 text-sm">
                  <option>Deluxe Coach (2+2)</option><option>AC Deluxe (2+2)</option><option>VIP Sofa (2+1)</option><option>Sleeper</option><option>Tourist</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-[var(--color-ys-ink-muted)]">Seats & telematics</label>
              <div className="flex gap-2 text-xs">
                {["Wi-Fi", "AC", "GPS Tracking", "Charging", "CCTV", "Blanket"].map((a) => (
                  <label key={a} className="flex items-center gap-1 rounded-md border border-[var(--color-ys-border)] px-2 py-1"><input type="checkbox" defaultChecked={["AC", "GPS Tracking", "Charging"].includes(a)} className="accent-[var(--color-ys-emerald)]" />{a}</label>
                ))}
              </div>
              <div className="mt-3 rounded-md border-2 border-dashed border-[var(--color-ys-border)] p-4 text-center text-xs text-[var(--color-ys-ink-muted)]">
                📄 Upload registration certificate (bluebook), insurance, and fitness certificate
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="md" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button size="md" onClick={() => { alert("Vehicle registered (demo)"); setShowAdd(false); }}>Save vehicle</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </OperatorShell>
  );
}

function Stat({ label, val }: { label: string; val: string }) {
  return (
    <div className="rounded-md bg-[var(--color-ys-canvas)] py-1.5">
      <div className="text-sm font-bold tabular-npr text-[var(--color-ys-deep-pine)]">{val}</div>
      <div className="text-[9px] uppercase text-[var(--color-ys-ink-subtle)]">{label}</div>
    </div>
  );
}

function Amen({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-[var(--color-ys-mint-tint)] px-1.5 py-0.5 font-semibold text-[var(--color-ys-emerald)]">{children}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const v: any = { active: { v: "mint", l: "ACTIVE" }, maintenance: { v: "warning", l: "MAINTENANCE" }, documents_expired: { v: "danger", l: "DOCS EXPIRED" } }[status] ?? { v: "neutral", l: status.toUpperCase() };
  return <Badge variant={v.v} dot={status === "active"}>{v.l}</Badge>;
}
