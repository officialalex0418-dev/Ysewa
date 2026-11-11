import { useState } from "react";
import { TopNav, BottomNav } from "../../components/TopNav";
import { Button, Card, Badge } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";

interface ComingSoonProps {
  service: "Flights" | "Rentals" | "Hotels" | "Tours";
}

const SERVICE_INFO: Record<
  ComingSoonProps["service"],
  {
    title: string;
    description: string;
    icon: string;
    features: string[];
    bgGradient: string;
  }
> = {
  Flights: {
    title: "Domestic & International Flight Bookings",
    description:
      "We're integrating with top Nepalese airlines including Buddha Air, Yeti Airlines, and Shree Airlines for instant ticket booking and real-time flight status.",
    icon: "✈️",
    features: [
      "Instant e-Ticket generation",
      "Live flight status & baggage tracking",
      "Exclusive airline cashback & deals",
      "Seamless seat & meal selection",
    ],
    bgGradient: "from-[#0F3854] to-[#184E42]",
  },
  Rentals: {
    title: "Vehicle & Private Charter Rentals",
    description:
      "Rent SUVs, Scorpio 4x4s, HiAce vans, or full passenger buses for private tours, corporate trips, and wedding events across Nepal.",
    icon: "🚘",
    features: [
      "Verified local drivers & well-maintained fleet",
      "Custom itinerary & hourly/daily rates",
      "Transparent fuel and toll pricing",
      "24/7 roadside assistance guarantee",
    ],
    bgGradient: "from-[#184E42] to-[#0F3854]",
  },
  Hotels: {
    title: "Hotel & Resort Reservations",
    description:
      "Book budget lodges, boutique stays, and luxury resorts in Pokhara, Kathmandu, Sauraha, Lumbini, and Nagarkot with zero hidden fees.",
    icon: "🏨",
    features: [
      "Pay-at-hotel options",
      "Verified guest reviews & photos",
      "Free cancellation on select rooms",
      "Special transit bundle discounts",
    ],
    bgGradient: "from-[#2A4138] to-[#184E42]",
  },
  Tours: {
    title: "Trekking & Travel Packages",
    description:
      "Explore curated travel experiences, Annapurna circuit treks, Chitwan jungle safaris, and heritage tours guided by certified local experts.",
    icon: "🏔️",
    features: [
      "Certified local tour guides",
      "All-inclusive permit & transport packages",
      "Group discounts & custom itineraries",
      "Full safety & emergency backup",
    ],
    bgGradient: "from-[#0F3854] to-[#2A4138]",
  },
};

export default function ComingSoonPage({ service }: ComingSoonProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const info = SERVICE_INFO[service] ?? SERVICE_INFO.Flights;

  function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-ys-canvas)] pb-20">
      <TopNav />

      {/* Hero Header */}
      <div className={`bg-gradient-to-r ${info.bgGradient} py-16 text-white shadow-md`}>
        <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
          <Badge variant="mint" className="mb-4 inline-flex px-3 py-1 text-xs uppercase tracking-wider">
            🚀 Launching Soon
          </Badge>
          <div className="mb-3 text-5xl md:text-6xl">{info.icon}</div>
          <h1
            className="text-3xl font-bold md:text-4xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {service} Booking is Coming Soon!
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/80 md:text-base">
            {info.description}
          </p>

          {/* Email Notification Form */}
          <div className="mx-auto mt-8 max-w-md">
            {subscribed ? (
              <div className="rounded-xl bg-white/10 p-4 text-sm font-semibold text-[var(--color-ys-mint)] backdrop-blur border border-white/20">
                🎉 Thank you! We'll notify you as soon as {service} booking goes live.
              </div>
            ) : (
              <form onSubmit={handleNotify} className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  required
                  placeholder="Enter your email for early access..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 flex-1 rounded-xl bg-white px-4 text-sm text-[var(--color-ys-ink)] outline-none placeholder:text-[var(--color-ys-ink-subtle)]"
                />
                <Button size="lg" type="submit" className="h-12 font-bold shrink-0">
                  Notify Me
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Features preview */}
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
        <h2
          className="mb-6 text-center text-xl font-bold text-[var(--color-ys-deep-pine)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          What to expect from YatraSewa {service}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {info.features.map((feat, idx) => (
            <Card key={idx} className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]">
                <Icons.CheckIcon width={18} height={18} />
              </div>
              <span className="text-sm font-semibold text-[var(--color-ys-deep-pine)]">
                {feat}
              </span>
            </Card>
          ))}
        </div>

        {/* CTA Banner */}
        <Card className="mt-10 p-8 text-center bg-gradient-to-br from-white to-[var(--color-ys-canvas)] border border-[var(--color-ys-border)]">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]">
            <Icons.BusIcon width={24} height={24} />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-ys-deep-pine)]">
            In the meantime, book bus tickets across Nepal!
          </h3>
          <p className="mt-1 text-xs text-[var(--color-ys-ink-muted)]">
            Seamless travel with verified operators, live seat selection, and instant refunds.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <a href="/buses">
              <Button size="md" className="gap-2 font-bold">
                Browse Buses
                <Icons.ArrowRightIcon width={16} height={16} />
              </Button>
            </a>
            <a href="/">
              <Button size="md" variant="outline">
                Go to Home
              </Button>
            </a>
          </div>
        </Card>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
