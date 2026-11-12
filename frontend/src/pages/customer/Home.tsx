import { useState } from "react";
import { TopNav, BottomNav } from "../../components/TopNav";
import { Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { formatNpr } from "../../lib/api";
import { NEPAL_CORRIDORS } from "@yatrasewa/shared-types";

export default function HomePage() {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState("Kathmandu");
  const [to, setTo] = useState("Pokhara");
  const [date, setDate] = useState(today);

  function swap() { const a = from; setFrom(to); setTo(a); }
  function submit() { window.location.href = `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`; }

  return (
    <div className="min-h-screen bg-[var(--color-ys-canvas)]">
      <TopNav />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-ys-deep-pine)] to-[var(--color-ys-emerald)] pb-36 pt-16 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-ys-mint)]" />
              Live GPS tracking • eSewa / Khalti / Fonepay / ConnectIPS
            </div>
            <h1 className="text-4xl font-bold leading-[1.1] md:text-5xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Where are you traveling next?
            </h1>
            <p className="mt-3 text-white/80">Book bus tickets across Nepal's highways with real-time GPS tracking, instant refunds and verified operators.</p>
          </div>
        </div>
        {/* decorative bus illustration */}
        <div className="pointer-events-none absolute -right-10 -top-4 hidden opacity-20 md:block">
          <Icons.BusIcon width={320} height={320} />
        </div>
      </section>

      {/* Search card */}
      <div className="relative z-20 mx-auto -mt-20 max-w-5xl px-4 md:px-6">
        <Card className="p-6 shadow-[var(--shadow-modal)]">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-[var(--color-ys-ink-muted)]">
            <Icons.SearchIcon width={16} height={16} />
            Find your bus
          </div>
          <div className="grid gap-3 md:grid-cols-[1.2fr_auto_1.2fr_1fr_auto] md:items-center">
            <Field label="FROM" icon={<Icons.MapPinIcon width={16} height={16} />}>
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-transparent text-base font-semibold text-[var(--color-ys-ink)] outline-none">
                {["Kathmandu", "Pokhara", "Chitwan (Sauraha)", "Lumbini", "Janakpur", "Birgunj", "Kakarbhitta"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <button type="button" onClick={swap} className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-ys-border)] bg-white text-[var(--color-ys-emerald)] hover:bg-[var(--color-ys-mint-tint)]">
              <Icons.SwapIcon width={18} height={18} />
            </button>
            <Field label="TO" icon={<Icons.MapPinIcon width={16} height={16} />}>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-transparent text-base font-semibold text-[var(--color-ys-ink)] outline-none">
                {["Kathmandu", "Pokhara", "Chitwan (Sauraha)", "Lumbini", "Janakpur", "Birgunj", "Kakarbhitta"].filter((c) => c !== from).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="TRAVEL DATE" icon={<Icons.CalendarIcon width={16} height={16} />}>
              <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-base font-semibold text-[var(--color-ys-ink)] outline-none" />
            </Field>
            <Button size="xl" onClick={submit} className="md:min-w-[160px] h-14 flex items-center justify-center gap-2">
              Search buses
              <Icons.ArrowRightIcon width={18} height={18} />
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-[var(--color-ys-ink-subtle)]">
            <span>Popular:</span>
            {NEPAL_CORRIDORS.slice(0, 4).map((c) => (
              <button key={c.key} onClick={() => { setFrom(c.origin); setTo(c.destination); }} className="rounded-md bg-[var(--color-ys-mint-tint)] px-2 py-0.5 text-[var(--color-ys-emerald)] hover:brightness-95">
                {c.origin} → {c.destination}
              </button>
            ))}
          </div>
        </Card>

        {/* Trust badges */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <TrustBadge icon={<Icons.ShieldCheckIcon width={22} height={22} />} title="Safe Journey Guarantee" desc="Verified operators only" />
          <TrustBadge icon={<Icons.WalletIcon width={22} height={22} />} title="Instant Refunds" desc="To source within 24h" />
          <TrustBadge icon={<Icons.GpsIcon width={22} height={22} />} title="Live GPS Tracking" desc="Board with 1.5 km alerts" />
          <TrustBadge icon={<Icons.QrCodeIcon width={22} height={22} />} title="QR E-Ticket" desc="Scan & board, no print" />
        </div>

        {/* Popular corridors */}
        <h2 className="mb-3 mt-10 text-lg font-bold text-[var(--color-ys-deep-pine)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Popular transit corridors</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {NEPAL_CORRIDORS.map((c) => (
            <Card key={c.key} className="cursor-pointer p-5 transition hover:shadow-[var(--shadow-modal)]" onClick={() => { setFrom(c.origin); setTo(c.destination); submit(); }}>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-bold text-[var(--color-ys-deep-pine)]">{c.origin} → {c.destination}</div>
                <span className="rounded-md bg-[var(--color-ys-mint-tint)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-ys-emerald)]">from {formatNpr(c.baseFareNpr)}</span>
              </div>
              <div className="text-xs text-[var(--color-ys-ink-muted)]">{c.highwayName} · {c.distanceKm} km · ~{c.typicalDurationHours}h</div>
              <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-ys-emerald)]">View buses <Icons.ArrowRightIcon width={14} height={14} /></div>
            </Card>
          ))}
        </div>

        {/* Recent searches mock */}
        <h2 className="mb-3 mt-10 text-lg font-bold text-[var(--color-ys-deep-pine)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent searches</h2>
        <Card className="divide-y divide-[var(--color-ys-border)]">
          <RecentRow from="Kathmandu" to="Pokhara" date="14 Sep 2026" />
          <RecentRow from="Pokhara" to="Chitwan (Sauraha)" date="03 Sep 2026" />
          <RecentRow from="Kathmandu" to="Biratnagar" date="18 Aug 2026" />
        </Card>

        {/* Traveler tip */}
        <div className="mt-6 mb-10 rounded-[var(--radius-card)] border border-[#D5E8F3] bg-[#EAF3FB] p-4 text-sm">
          <div className="mb-1 font-semibold text-[var(--color-ys-info)]">Traveler Tip for Pokhara Route</div>
          <p className="text-[var(--color-ys-ink-muted)]">Prithvi Highway gets busy after 9 AM. Book 07:00 AM departures for a smooth ~6.5 hour ride. Mugling (38 km from Narayanghat) is the breakfast stop.</p>
        </div>
      </div>
      <BottomNav active="home" />
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex h-14 items-center gap-3 rounded-[var(--radius-btn)] border border-[var(--color-ys-border)] px-3 transition focus-within:border-[var(--color-ys-emerald)] focus-within:ring-2 focus-within:ring-[var(--color-ys-emerald)]/20 bg-white">
      <span className="text-[var(--color-ys-emerald)]">{icon}</span>
      <span className="flex-1">
        <span className="block text-[10px] font-semibold tracking-wide text-[var(--color-ys-ink-subtle)]">{label}</span>
        {children}
      </span>
    </label>
  );
}

function TrustBadge({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="mb-2 text-[var(--color-ys-emerald)]">{icon}</div>
      <div className="text-sm font-bold">{title}</div>
      <div className="text-xs text-[var(--color-ys-ink-muted)]">{desc}</div>
    </div>
  );
}

function RecentRow({ from, to, date }: { from: string; to: string; date: string }) {
  return (
    <button className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-[var(--color-ys-canvas)]" onClick={() => window.location.href = `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${new Date().toISOString().slice(0, 10)}`}>
      <div className="flex items-center gap-3">
        <Icons.ClockIcon width={18} height={18} className="text-[var(--color-ys-ink-subtle)]" />
        <div>
          <div className="text-sm font-semibold">{from} → {to}</div>
          <div className="text-xs text-[var(--color-ys-ink-subtle)]">{date} • 1 passenger</div>
        </div>
      </div>
      <Icons.ArrowRightIcon width={16} height={16} className="text-[var(--color-ys-ink-subtle)]" />
    </button>
  );
}
