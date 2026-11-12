import { useState } from "react";
import { AdminShell } from "../../components/AdminSidebar";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { formatNpr } from "../../lib/api";

export interface CustomerUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  joinedDate: string;
  loyaltyPoints: number;
  totalSpent: number;
  purchaseCount: number;
  purchaseFrequency: string; // e.g., "14 bookings / 6 months (~2.3/mo)"
  status: "active" | "flagged" | "blocked";
  bookings: Array<{
    pnr: string;
    route: string;
    operator: string;
    travelDate: string;
    fare: number;
    seats: string;
    status: "COMPLETED" | "CONFIRMED" | "CANCELLED" | "PENDING";
  }>;
}

const MOCK_CUSTOMERS: CustomerUser[] = [
  {
    id: "usr-101",
    fullName: "Aayush Shrestha",
    phone: "+977 9841000008",
    email: "aayush.shrestha@gmail.com",
    role: "CUSTOMER",
    joinedDate: "14 Jan 2024",
    loyaltyPoints: 1450,
    totalSpent: 42500,
    purchaseCount: 16,
    purchaseFrequency: "16 bookings (~2.6/mo)",
    status: "active",
    bookings: [
      { pnr: "PNR-8821-45", route: "Kathmandu → Pokhara", operator: "Greenline Travels", travelDate: "12 Nov 2026", fare: 5800, seats: "A1, A2", status: "CONFIRMED" },
      { pnr: "PNR-1001-12", route: "Kathmandu → Chitwan", operator: "Sajha Yatayat", travelDate: "28 Oct 2026", fare: 2200, seats: "B4, B5", status: "COMPLETED" },
      { pnr: "PNR-2048-09", route: "Pokhara → Lumbini", operator: "Mountain Deluxe", travelDate: "05 Sep 2026", fare: 4400, seats: "VIP1, VIP2", status: "COMPLETED" },
    ],
  },
  {
    id: "usr-102",
    fullName: "Prashant Thapa",
    phone: "+977 9851122334",
    email: "prashant.thapa@outlook.com",
    role: "CUSTOMER",
    joinedDate: "02 Feb 2024",
    loyaltyPoints: 890,
    totalSpent: 28400,
    purchaseCount: 11,
    purchaseFrequency: "11 bookings (~1.8/mo)",
    status: "active",
    bookings: [
      { pnr: "PNR-7777-88", route: "Kathmandu → Birgunj", operator: "Buddha Air Surface", travelDate: "01 Nov 2026", fare: 3200, seats: "C1, C2", status: "COMPLETED" },
      { pnr: "PNR-8821-31", route: "Pokhara → Kathmandu", operator: "Greenline Travels", travelDate: "15 Oct 2026", fare: 2900, seats: "A3", status: "COMPLETED" },
    ],
  },
  {
    id: "usr-103",
    fullName: "Sujita Adhikari",
    phone: "+977 9801998877",
    email: "sujita.adhikari@yahoo.com",
    role: "CUSTOMER",
    joinedDate: "20 Mar 2024",
    loyaltyPoints: 2100,
    totalSpent: 65000,
    purchaseCount: 24,
    purchaseFrequency: "24 bookings (~3.4/mo)",
    status: "active",
    bookings: [
      { pnr: "PNR-1001-99", route: "Kathmandu → Pokhara", operator: "Sajha Yatayat", travelDate: "09 Nov 2026", fare: 2400, seats: "S1, S2", status: "CONFIRMED" },
      { pnr: "PNR-8821-77", route: "Kathmandu → Sauraha", operator: "Greenline Travels", travelDate: "22 Aug 2026", fare: 5000, seats: "A1, A2", status: "COMPLETED" },
    ],
  },
  {
    id: "usr-104",
    fullName: "Bikash Gurung",
    phone: "+977 9812345678",
    email: "bikash.gurung@hotmail.com",
    role: "CUSTOMER",
    joinedDate: "05 May 2024",
    loyaltyPoints: 120,
    totalSpent: 4500,
    purchaseCount: 2,
    purchaseFrequency: "2 bookings (~0.4/mo)",
    status: "flagged",
    bookings: [
      { pnr: "PNR-2048-02", route: "Kathmandu → Pokhara", operator: "Mountain Deluxe", travelDate: "10 Oct 2026", fare: 2200, seats: "B1", status: "CANCELLED" },
    ],
  },
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerUser[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerUser | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell activeKey="customers">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
            Registered Travelers & Loyalty Management
          </div>
          <h1
            className="text-2xl font-bold text-[var(--color-ys-deep-pine)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Customers
          </h1>
        </div>

        <div className="relative w-72">
          <Icons.SearchIcon
            width={14}
            height={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ys-ink-subtle)]"
          />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--color-ys-border)] bg-white pl-9 pr-3 text-xs outline-none focus:border-[var(--color-ys-emerald)]"
          />
        </div>
      </div>

      <Card className="overflow-hidden p-0 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] text-left text-[11px] uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
              <th className="p-3">Customer</th>
              <th className="p-3">Phone & Email</th>
              <th className="p-3">Joined Date</th>
              <th className="p-3">Loyalty Points</th>
              <th className="p-3">Total Spent</th>
              <th className="p-3">Frequency</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className="cursor-pointer border-b border-[var(--color-ys-border)] last:border-0 hover:bg-[var(--color-ys-canvas)]/50 transition"
              >
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-ys-mint-tint)] font-bold text-xs text-[var(--color-ys-emerald)]">
                      {c.fullName.split(" ").map((w) => w[0]).join("")}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--color-ys-deep-pine)]">{c.fullName}</div>
                      <div className="text-[11px] text-[var(--color-ys-ink-subtle)]">ID: {c.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-xs font-semibold tabular-npr">{c.phone}</div>
                  <div className="text-[11px] text-[var(--color-ys-ink-muted)]">{c.email}</div>
                </td>
                <td className="p-3 text-xs text-[var(--color-ys-ink-muted)]">{c.joinedDate}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-ys-mint-tint)] px-2 py-0.5 text-xs font-bold text-[var(--color-ys-emerald)]">
                    ⭐ {c.loyaltyPoints} pts
                  </span>
                </td>
                <td className="p-3 font-bold tabular-npr text-[var(--color-ys-deep-pine)]">
                  {formatNpr(c.totalSpent)}
                </td>
                <td className="p-3 text-xs text-[var(--color-ys-ink-muted)]">{c.purchaseFrequency}</td>
                <td className="p-3">
                  <Badge variant={c.status === "active" ? "mint" : "warning"} dot>
                    {c.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Customer Full Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--color-ys-border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-ys-mint-tint)] font-bold text-base text-[var(--color-ys-emerald)]">
                  {selectedCustomer.fullName.split(" ").map((w) => w[0]).join("")}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-ys-deep-pine)]">
                    {selectedCustomer.fullName}
                  </h2>
                  <div className="text-xs text-[var(--color-ys-ink-muted)]">
                    Customer ID: {selectedCustomer.id} · Member since {selectedCustomer.joinedDate}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-black font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Profile Overview Tiles */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Tile label="Total Purchase Amount" value={formatNpr(selectedCustomer.totalSpent)} />
              <Tile label="Total Tickets Bought" value={`${selectedCustomer.purchaseCount} tickets`} />
              <Tile label="Loyalty Points" value={`⭐ ${selectedCustomer.loyaltyPoints}`} />
              <Tile label="Purchase Frequency" value={selectedCustomer.purchaseFrequency} />
            </div>

            {/* Customer Personal Details */}
            <div className="mt-5 rounded-xl border border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-ys-ink-subtle)]">
                Profile & Contact Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[var(--color-ys-ink-subtle)] block">Full Name:</span>
                  <span className="font-bold text-[var(--color-ys-deep-pine)]">
                    {selectedCustomer.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-ys-ink-subtle)] block">Mobile Number:</span>
                  <span className="font-bold tabular-npr text-[var(--color-ys-deep-pine)]">
                    {selectedCustomer.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-ys-ink-subtle)] block">Email Address:</span>
                  <span className="font-bold text-[var(--color-ys-deep-pine)]">
                    {selectedCustomer.email}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-ys-ink-subtle)] block">Account Status:</span>
                  <Badge variant={selectedCustomer.status === "active" ? "mint" : "warning"}>
                    {selectedCustomer.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Customer Booking History */}
            <div className="mt-5">
              <h3 className="mb-3 text-sm font-bold text-[var(--color-ys-deep-pine)]">
                Booking History ({selectedCustomer.bookings.length})
              </h3>
              <div className="space-y-2">
                {selectedCustomer.bookings.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[var(--color-ys-ink-muted)]">
                    No bookings recorded for this customer yet.
                  </div>
                ) : (
                  selectedCustomer.bookings.map((b) => (
                    <div
                      key={b.pnr}
                      className="flex items-center justify-between rounded-lg border border-[var(--color-ys-border)] bg-white p-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--color-ys-emerald)]">{b.pnr}</span>
                          <span className="font-semibold text-[var(--color-ys-deep-pine)]">{b.route}</span>
                          <Badge
                            variant={
                              b.status === "COMPLETED"
                                ? "mint"
                                : b.status === "CONFIRMED"
                                ? "mint"
                                : b.status === "CANCELLED"
                                ? "danger"
                                : "warning"
                            }
                          >
                            {b.status}
                          </Badge>
                        </div>
                        <div className="mt-1 text-[11px] text-[var(--color-ys-ink-muted)]">
                          Operator: {b.operator} · Travel Date: {b.travelDate} · Seats: {b.seats}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold tabular-npr text-sm text-[var(--color-ys-deep-pine)]">
                          {formatNpr(b.fare)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                Close Window
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-ys-border)] bg-white p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ys-ink-subtle)]">
        {label}
      </div>
      <div className="mt-1 text-sm font-bold text-[var(--color-ys-deep-pine)]">{value}</div>
    </div>
  );
}
