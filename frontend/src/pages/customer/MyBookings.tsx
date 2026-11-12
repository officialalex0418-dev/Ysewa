import { useState } from "react";
import { TopNav, BottomNav } from "../../components/TopNav";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { formatNpr, formatTime } from "../../lib/api";

const BOOKINGS = [
  { pnr: "YS-GR3N-POKBKK", from: "Kathmandu", to: "Pokhara", date: "14 Sep 2026", dep: "07:00 AM", arr: "01:30 PM", operator: "Greenline Travels", seats: ["A1", "A2"], status: "CONFIRMED", fare: 5800, badge: "mint" },
  { pnr: "YS-4JKN-SAUCHA", from: "Pokhara", to: "Chitwan", date: "28 Oct 2026", dep: "08:30 AM", arr: "02:00 PM", operator: "Sajha Yatayat", seats: ["B3"], status: "PENDING_PAYMENT", fare: 1100, badge: "warning" },
  { pnr: "YS-X1P8-LUMB", from: "Pokhara", to: "Lumbini", date: "02 Oct 2026", dep: "07:30 AM", arr: "01:00 PM", operator: "Mountain Deluxe", seats: ["C1", "C2"], status: "COMPLETED", fare: 2400, badge: "neutral" },
];

export default function MyBookingsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const filtered = BOOKINGS.filter((b) => (tab === "upcoming" ? b.status !== "COMPLETED" : b.status === "COMPLETED"));

  return (
    <div className="min-h-screen bg-[var(--color-ys-canvas)]">
      <TopNav />
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
        <h1 className="mb-4 text-2xl font-bold text-[var(--color-ys-deep-pine)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My bookings</h1>

        <div className="mb-4 inline-flex rounded-lg border border-[var(--color-ys-border)] bg-white p-1">
          {(["upcoming", "past"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-md px-4 py-1.5 text-sm font-semibold capitalize ${tab === t ? "bg-[var(--color-ys-emerald)] text-white" : "text-[var(--color-ys-ink-muted)]"}`}>
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]"><Icons.TicketIcon size={32} /></div>
            <div className="mb-1 font-bold">No bookings yet</div>
            <div className="mb-4 text-sm text-[var(--color-ys-ink-muted)]">Your upcoming and past trips will show up here.</div>
            <a href="/"><Button>Search buses</Button></a>
          </Card>
        )}

        <div className="space-y-3">
          {filtered.map((b) => (
            <Card key={b.pnr} className="p-0">
              <div className="p-5">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold">{b.from} → {b.to}</div>
                      <Badge variant={b.badge as any} dot>{b.status.replace("_", " ")}</Badge>
                    </div>
                    <div className="text-xs text-[var(--color-ys-ink-muted)]">{b.operator} · {b.date} · Seats {b.seats.join(", ")}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold tabular-npr">{formatNpr(b.fare)}</div>
                    <div className="text-[10px] text-[var(--color-ys-ink-subtle)]">PNR: <span className="tabular-npr">{b.pnr}</span></div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div><b className="tabular-npr">{b.dep}</b> <span className="text-xs text-[var(--color-ys-ink-subtle)]">{b.from.slice(0, 3).toUpperCase()} Bus Park</span></div>
                  <Icons.ArrowRightIcon size={16} className="text-[var(--color-ys-emerald)]" />
                  <div className="text-right"><b className="tabular-npr">{b.arr}</b> <span className="text-xs text-[var(--color-ys-ink-subtle)]">{b.to.slice(0, 3).toUpperCase()}</span></div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] px-5 py-2">
                {b.status === "CONFIRMED" ? (
                  <>
                    <a href={`/track/demo`} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-ys-emerald)]"><Icons.GpsIcon size={14} /> Track bus</a>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Cancel</Button>
                      <Button size="sm"><Icons.QrCodeIcon size={14} /> View ticket</Button>
                    </div>
                  </>
                ) : b.status === "PENDING_PAYMENT" ? (
                  <>
                    <span className="text-xs text-[var(--color-ys-warning)]">⚠ Payment pending — lock expires in 09:42</span>
                    <Button size="sm">Pay now</Button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-[var(--color-ys-ink-subtle)]">Trip completed on {b.date}</span>
                    <Button variant="outline" size="sm">Book again</Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav active="bookings" />
    </div>
  );
}
