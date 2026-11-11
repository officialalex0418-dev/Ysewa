import { Icons } from "@yatrasewa/ui";
import type { ComponentType } from "react";

const SUPERADMIN_NAV: Array<{
  key: string;
  label: string;
  href: string;
  icon: ComponentType<{ width?: number; height?: number; className?: string }>;
  badge?: string;
}> = [
  { key: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: Icons.ChartIcon },
  { key: "operators", label: "Companies", href: "/admin/operators", icon: Icons.BuildingIcon, badge: "4" },
  { key: "customers", label: "Customers", href: "/admin/customers", icon: Icons.UsersIcon },
  { key: "bookings", label: "Bookings", href: "/admin/bookings", icon: Icons.TicketIcon },
  { key: "commissions", label: "Commission & Payments", href: "/admin/commissions", icon: Icons.WalletIcon },
  { key: "employees", label: "System Employees", href: "/admin/employees", icon: Icons.UsersIcon },
  { key: "settlements", label: "Settlements", href: "/admin/settlements", icon: Icons.BankIcon, badge: "4 PROCESSING" },
  { key: "audit", label: "Audit Logs", href: "/admin/audit", icon: Icons.ShieldCheckIcon },
  { key: "settings", label: "Settings", href: "/admin/settings", icon: Icons.SettingsIcon },
];

export function AdminShell({ children, activeKey }: { children: React.ReactNode; activeKey: string }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-ys-canvas)]">
      <aside className="hidden w-64 border-r border-[var(--color-ys-border)] bg-white md:block">
        <div className="flex items-center gap-2 border-b border-[var(--color-ys-border)] p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-ys-deep-pine)] text-white">
            <Icons.BusIcon width={20} height={20} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-[var(--color-ys-deep-pine)]">YatraSewa</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-ys-emerald)]">
              Super Admin
            </div>
          </div>
        </div>
        <nav className="space-y-0.5 p-2">
          {SUPERADMIN_NAV.map((n) => {
            const I = n.icon;
            const isActive = activeKey === n.key;
            return (
              <a
                key={n.key}
                href={n.href}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                  isActive
                    ? "bg-[var(--color-ys-mint-tint)] font-semibold text-[var(--color-ys-emerald)]"
                    : "text-[var(--color-ys-ink-muted)] hover:bg-[var(--color-ys-canvas)]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <I width={16} height={16} />
                  {n.label}
                </span>
                {n.badge && (
                  <span className="rounded bg-[var(--color-ys-mint-tint)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-ys-emerald)]">
                    {n.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
        <div className="m-3 rounded-lg bg-[var(--color-ys-mint-tint)] p-3 text-xs text-[var(--color-ys-deep-pine)]">
          <div className="flex items-center gap-1 font-bold">
            <Icons.ShieldCheckIcon width={14} height={14} /> Zero Trust Policy
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-ys-ink-muted)]">
            Hardware 2FA required for all high-altitude operator accounts.
          </p>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--color-ys-border)] bg-white px-6">
          <div className="relative w-80">
            <Icons.SearchIcon
              width={14}
              height={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ys-ink-subtle)]"
            />
            <input
              placeholder="Search companies, bookings, PNRs…"
              className="h-9 w-full rounded-[8px] border border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] pl-9 pr-3 text-sm outline-none focus:border-[var(--color-ys-emerald)]"
            />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
