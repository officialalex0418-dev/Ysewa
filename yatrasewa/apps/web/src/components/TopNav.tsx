import { Icons } from "@yatrasewa/ui";
import { useAuth } from "../lib/auth";
import type { ComponentType, SVGProps } from "react";

export function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-ys-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Left: Logo & YatraSewa with tagline */}
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--color-ys-emerald)] text-white shadow-sm">
            <Icons.BusIcon width={24} height={24} />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-[var(--color-ys-deep-pine)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>YatraSewa</div>
            <div className="text-[10px] font-medium text-[var(--color-ys-ink-subtle)] -mt-0.5">Seamless transit across Nepal</div>
          </div>
        </a>

        {/* Center: Home, Buses, Flights, Rentals, Hotels, Tours */}
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--color-ys-ink-muted)] md:flex">
          <a href="/" className="hover:text-[var(--color-ys-emerald)] transition">Home</a>
          <a href="/buses" className="hover:text-[var(--color-ys-emerald)] transition">Buses</a>
          <a href="/flights" className="hover:text-[var(--color-ys-emerald)] transition">Flights</a>
          <a href="/rentals" className="hover:text-[var(--color-ys-emerald)] transition">Rentals</a>
          <a href="/hotels" className="hover:text-[var(--color-ys-emerald)] transition">Hotels</a>
          <a href="/tours" className="hover:text-[var(--color-ys-emerald)] transition">Tours</a>
        </nav>

        {/* Right: SignIn & SignUp OR Profile & Logout */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <a href="/bookings" className="flex items-center gap-2 rounded-lg bg-[var(--color-ys-mint-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ys-emerald)] hover:brightness-95">
                <Icons.UserIcon width={14} height={14} />
                {user.fullName}
              </a>
              <button onClick={logout} className="inline-flex h-9 items-center rounded-[8px] border border-[var(--color-ys-border)] px-3 text-xs font-semibold text-[var(--color-ys-ink-muted)] hover:bg-[var(--color-ys-canvas)]">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a href="/auth/login" className="inline-flex h-9 items-center rounded-[8px] px-3.5 text-sm font-semibold text-[var(--color-ys-ink-muted)] hover:bg-[var(--color-ys-canvas)]">
                Sign In
              </a>
              <a href="/auth/login" className="inline-flex h-9 items-center rounded-[8px] bg-[var(--color-ys-emerald)] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-ys-emerald-hover)]">
                Sign Up
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ active }: { active: "home" | "bookings" | "alerts" | "account" }) {
  const items: Array<{ key: typeof active; label: string; icon: ComponentType<{ width?: number; height?: number; className?: string }>; href: string }> = [
    { key: "home", label: "Home", icon: Icons.HomeIcon, href: "/" },
    { key: "bookings", label: "Bookings", icon: Icons.BookmarkIcon, href: "/bookings" },
    { key: "alerts", label: "Alerts", icon: Icons.BellIcon, href: "/bookings" },
    { key: "account", label: "Account", icon: Icons.UserIcon, href: "/auth/login" },
  ];
  return (
    <nav className="sticky bottom-0 z-30 border-t border-[var(--color-ys-border)] bg-white md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((it) => {
          const I = it.icon;
          const isActive = active === it.key;
          return (
            <a key={it.key} href={it.href} className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] ${isActive ? "text-[var(--color-ys-emerald)]" : "text-[var(--color-ys-ink-muted)]"}`}>
              <I width={22} height={22} />
              {it.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
