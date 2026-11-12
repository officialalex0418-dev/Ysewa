import { Icons } from "@yatrasewa/ui";
import type { SVGProps } from "react";

const NAV = [
  { key: "dashboard", label: "Overview", href: "/operator/dashboard", icon: Icons.ChartIcon },
  { key: "fleet", label: "Your Fleet", href: "/operator/fleet", icon: Icons.CarIcon, badge: "92%" },
  { key: "trips", label: "Schedule Control Room", href: "/operator/trips", icon: Icons.ClockIcon, badge: "1.2k" },
  { key: "seatbuilder", label: "Interactive Seat Builder", href: "/operator/fleet", icon: Icons.SeatIcon },
  { key: "routes", label: "Routes Network", href: "/operator/dashboard", icon: Icons.RouteIcon },
  { key: "live", label: "Live Seat Status", href: "/operator/trips", icon: Icons.GpsIcon },
  { key: "maintenance", label: "Maintenance Tracker", href: "/operator/dashboard", icon: Icons.SettingsIcon },
  { key: "staff", label: "Staff Management", href: "/operator/dashboard", icon: Icons.UsersIcon },
  { key: "settlements", label: "Settlements", href: "/operator/dashboard", icon: Icons.BankIcon, badge: "Rs.4.37L" },
  { key: "manifest", label: "Passenger Manifest", href: "/operator/dashboard", icon: Icons.TicketIcon },
];

export function OperatorShell({ children, activeKey, operatorName = "Greenline Travels" }: { children: React.ReactNode; activeKey: string; operatorName?: string }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-ys-canvas)]">
      <aside className="hidden w-60 border-r border-[var(--color-ys-border)] bg-white md:block">
        <div className="p-5 border-b border-[var(--color-ys-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--color-ys-ink-muted)]">
            <Icons.BuildingIcon size={14} className="text-[var(--color-ys-emerald)]" />
            <span className="truncate">{operatorName}</span>
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ys-deep-pine)]">Fleet Operations Suite</div>
        </div>
        <nav className="p-2 space-y-0.5">
          {NAV.map((n) => {
            const I = n.icon;
            const active = activeKey === n.key;
            return (
              <a key={n.key} href={n.href} className={`flex items-center justify-between rounded-md px-3 py-2 text-xs ${active ? "bg-[var(--color-ys-mint-tint)] font-bold text-[var(--color-ys-emerald)]" : "text-[var(--color-ys-ink-muted)] hover:bg-[var(--color-ys-canvas)]"}`}>
                <span className="flex items-center gap-2"><I size={14} />{n.label}</span>
                {n.badge && <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white text-[var(--color-ys-emerald)]" : "bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]"}`}>{n.badge}</span>}
              </a>
            );
          })}
        </nav>
        <div className="m-2 rounded-lg bg-[var(--color-ys-mint-tint)] p-3 text-[11px] text-[var(--color-ys-emerald)]">
          <b>Tip:</b> Uploaded documents are auto-verified within 60 minutes.
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--color-ys-border)] bg-white px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]"><Icons.BusIcon size={18} /></div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-[var(--color-ys-deep-pine)]">{operatorName}</div>
              <div className="text-[10px] text-[var(--color-ys-ink-subtle)]">Fleet Operations Dashboard · Verified Operator</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 rounded-md bg-[var(--color-ys-mint-tint)] px-2 py-1 font-semibold text-[var(--color-ys-emerald)]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-ys-emerald)]" /> Live sync</span>
            <button className="rounded-md bg-[var(--color-ys-emerald)] px-3 py-1.5 font-bold text-white">+ Register vehicle</button>
            <button className="h-8 w-8 rounded-full bg-[var(--color-ys-deep-pine)] text-center text-xs font-bold text-white leading-8">SS</button>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
