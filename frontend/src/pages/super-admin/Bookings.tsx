import { useState } from "react";
import { AdminShell } from "../../components/AdminSidebar";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { formatNpr } from "../../lib/api";

export interface SystemBooking {
  id: string;
  pnr: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  operatorName: string;
  busPlate: string;
  route: string;
  travelDate: string;
  departureTime: string;
  seats: string[];
  totalFare: number;
  platformFee: number;
  operatorPayout: number;
  paymentMethod: "eSewa" | "Khalti" | "Fonepay" | "ConnectIPS" | "Card";
  paymentTxnId: string;
  status: "COMPLETED" | "CONFIRMED" | "PENDING" | "CANCELLED" | "FAILED";
  createdAt: string;
}

const MOCK_BOOKINGS: SystemBooking[] = [
  {
    id: "bk-1001",
    pnr: "PNR-8821-9921",
    passengerName: "Aayush Shrestha",
    passengerPhone: "+977 9841000008",
    passengerEmail: "aayush.shrestha@gmail.com",
    operatorName: "Greenline Travels & Tours",
    busPlate: "BA 2 KHA 4512",
    route: "Kathmandu → Pokhara",
    travelDate: "12 Nov 2026",
    departureTime: "07:00 AM",
    seats: ["A1", "A2"],
    totalFare: 5800,
    platformFee: 580,
    operatorPayout: 5220,
    paymentMethod: "eSewa",
    paymentTxnId: "ESEWA-99281726",
    status: "CONFIRMED",
    createdAt: "10 Nov 2026, 08:30 AM",
  },
  {
    id: "bk-1002",
    pnr: "PNR-1001-4412",
    passengerName: "Sujita Adhikari",
    passengerPhone: "+977 9801998877",
    passengerEmail: "sujita.adhikari@yahoo.com",
    operatorName: "Sajha Yatayat Cooperative",
    busPlate: "NA 2 KHA 1105",
    route: "Kathmandu → Pokhara",
    travelDate: "11 Nov 2026",
    departureTime: "20:30 PM",
    seats: ["S1", "S2"],
    totalFare: 2400,
    platformFee: 192,
    operatorPayout: 2208,
    paymentMethod: "Khalti",
    paymentTxnId: "KHL-88201923",
    status: "COMPLETED",
    createdAt: "09 Nov 2026, 14:15 PM",
  },
  {
    id: "bk-1003",
    pnr: "PNR-2048-7711",
    passengerName: "Prashant Thapa",
    passengerPhone: "+977 9851122334",
    passengerEmail: "prashant.thapa@outlook.com",
    operatorName: "Mountain Deluxe Express",
    busPlate: "GA 2 KHA 4390",
    route: "Kathmandu → Chitwan",
    travelDate: "10 Nov 2026",
    departureTime: "09:00 AM",
    seats: ["VIP1"],
    totalFare: 2200,
    platformFee: 264,
    operatorPayout: 1936,
    paymentMethod: "ConnectIPS",
    paymentTxnId: "NPI-55192837",
    status: "PENDING",
    createdAt: "10 Nov 2026, 00:10 AM",
  },
  {
    id: "bk-1004",
    pnr: "PNR-7777-3321",
    passengerName: "Bikash Gurung",
    passengerPhone: "+977 9812345678",
    passengerEmail: "bikash.gurung@hotmail.com",
    operatorName: "Buddha Air Surface Transport",
    busPlate: "LU 1 KHA 9012",
    route: "Kathmandu → Birgunj",
    travelDate: "08 Nov 2026",
    departureTime: "06:30 AM",
    seats: ["C1"],
    totalFare: 1600,
    platformFee: 144,
    operatorPayout: 1456,
    paymentMethod: "Fonepay",
    paymentTxnId: "FONE-0019283",
    status: "CANCELLED",
    createdAt: "07 Nov 2026, 19:40 PM",
  },
  {
    id: "bk-1005",
    pnr: "PNR-8821-0021",
    passengerName: "Ramesh Sharma",
    passengerPhone: "+977 9841223344",
    passengerEmail: "ramesh.sharma@gmail.com",
    operatorName: "Greenline Travels & Tours",
    busPlate: "BA 2 KHA 4512",
    route: "Pokhara → Kathmandu",
    travelDate: "06 Nov 2026",
    departureTime: "07:30 AM",
    seats: ["A4"],
    totalFare: 2900,
    platformFee: 290,
    operatorPayout: 2610,
    paymentMethod: "eSewa",
    paymentTxnId: "ESEWA-77182930",
    status: "FAILED",
    createdAt: "05 Nov 2026, 11:20 AM",
  },
];

const STATUS_VARIANTS: Record<string, "mint" | "warning" | "danger" | "info"> = {
  COMPLETED: "mint",
  CONFIRMED: "mint",
  PENDING: "warning",
  CANCELLED: "danger",
  FAILED: "danger",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<SystemBooking[]>(MOCK_BOOKINGS);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<SystemBooking | null>(null);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchesSearch =
      b.pnr.toLowerCase().includes(search.toLowerCase()) ||
      b.passengerName.toLowerCase().includes(search.toLowerCase()) ||
      b.passengerPhone.includes(search) ||
      b.operatorName.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminShell activeKey="bookings">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
            Master Transit Ticket Ledger & History
          </div>
          <h1
            className="text-2xl font-bold text-[var(--color-ys-deep-pine)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            All Bookings
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="flex gap-1 rounded-md border border-[var(--color-ys-border)] bg-white p-0.5 text-xs font-semibold">
            {["ALL", "CONFIRMED", "COMPLETED", "PENDING", "CANCELLED", "FAILED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded px-2.5 py-1 transition ${
                  statusFilter === st
                    ? "bg-[var(--color-ys-emerald)] text-white"
                    : "text-[var(--color-ys-ink-muted)] hover:bg-[var(--color-ys-canvas)]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Icons.SearchIcon
              width={14}
              height={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ys-ink-subtle)]"
            />
            <input
              type="text"
              placeholder="Search PNR, passenger, operator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-[var(--color-ys-border)] bg-white pl-9 pr-3 text-xs outline-none focus:border-[var(--color-ys-emerald)]"
            />
          </div>
        </div>
      </div>

      <Card className="overflow-hidden p-0 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] text-left text-[11px] uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
              <th className="p-3">PNR & Date</th>
              <th className="p-3">Passenger Info</th>
              <th className="p-3">Route & Departure</th>
              <th className="p-3">Operator & Bus</th>
              <th className="p-3">Seats</th>
              <th className="p-3">Total Fare</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-sm text-[var(--color-ys-ink-muted)]">
                  No bookings found matching criteria.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="cursor-pointer border-b border-[var(--color-ys-border)] last:border-0 hover:bg-[var(--color-ys-canvas)]/50 transition"
                >
                  <td className="p-3">
                    <div className="font-bold text-[var(--color-ys-emerald)]">{b.pnr}</div>
                    <div className="text-[11px] text-[var(--color-ys-ink-subtle)]">{b.createdAt}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-[var(--color-ys-deep-pine)]">{b.passengerName}</div>
                    <div className="text-[11px] text-[var(--color-ys-ink-muted)]">
                      {b.passengerPhone}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-xs">{b.route}</div>
                    <div className="text-[11px] text-[var(--color-ys-ink-muted)]">
                      {b.travelDate} · {b.departureTime}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-xs">{b.operatorName}</div>
                    <div className="text-[11px] text-[var(--color-ys-ink-muted)]">{b.busPlate}</div>
                  </td>
                  <td className="p-3">
                    <span className="rounded bg-[var(--color-ys-mint-tint)] px-2 py-0.5 text-xs font-bold text-[var(--color-ys-emerald)]">
                      {b.seats.join(", ")}
                    </span>
                  </td>
                  <td className="p-3 font-bold tabular-npr text-[var(--color-ys-deep-pine)]">
                    {formatNpr(b.totalFare)}
                  </td>
                  <td className="p-3">
                    <div className="text-xs font-semibold">{b.paymentMethod}</div>
                    <div className="text-[10px] text-[var(--color-ys-ink-subtle)]">{b.paymentTxnId}</div>
                  </td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANTS[b.status] ?? "neutral"} dot>
                      {b.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Detailed Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--color-ys-border)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[var(--color-ys-deep-pine)]">
                    Booking Details: {selectedBooking.pnr}
                  </h2>
                  <Badge variant={STATUS_VARIANTS[selectedBooking.status] ?? "neutral"}>
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div className="text-xs text-[var(--color-ys-ink-muted)] mt-0.5">
                  Booked on {selectedBooking.createdAt}
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-black font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg border p-3 bg-[var(--color-ys-canvas)]">
                <span className="block text-[10px] font-bold uppercase text-[var(--color-ys-ink-subtle)] mb-1">
                  Passenger Information
                </span>
                <div className="font-bold text-sm text-[var(--color-ys-deep-pine)]">
                  {selectedBooking.passengerName}
                </div>
                <div className="text-[var(--color-ys-ink-muted)]">{selectedBooking.passengerPhone}</div>
                <div className="text-[var(--color-ys-ink-muted)]">{selectedBooking.passengerEmail}</div>
              </div>

              <div className="rounded-lg border p-3 bg-[var(--color-ys-canvas)]">
                <span className="block text-[10px] font-bold uppercase text-[var(--color-ys-ink-subtle)] mb-1">
                  Trip & Vehicle Details
                </span>
                <div className="font-bold text-sm text-[var(--color-ys-deep-pine)]">
                  {selectedBooking.route}
                </div>
                <div className="text-[var(--color-ys-ink-muted)]">
                  {selectedBooking.operatorName} ({selectedBooking.busPlate})
                </div>
                <div className="text-[var(--color-ys-ink-muted)]">
                  {selectedBooking.travelDate} at {selectedBooking.departureTime}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border p-4 bg-white">
              <h3 className="mb-2 text-xs font-bold uppercase text-[var(--color-ys-ink-subtle)]">
                Financial Split & Payment
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--color-ys-ink-muted)]">Total Passenger Fare:</span>
                  <span className="font-bold tabular-npr text-sm text-[var(--color-ys-deep-pine)]">
                    {formatNpr(selectedBooking.totalFare)}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--color-ys-warning)]">
                  <span>Platform Commission Fee (10%):</span>
                  <span className="font-semibold tabular-npr">- {formatNpr(selectedBooking.platformFee)}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-bold text-[var(--color-ys-emerald)] text-sm">
                  <span>Net Operator Payable:</span>
                  <span className="tabular-npr">{formatNpr(selectedBooking.operatorPayout)}</span>
                </div>
                <div className="mt-3 flex justify-between rounded bg-[var(--color-ys-canvas)] p-2 text-[11px]">
                  <span>Payment Gateway: <b>{selectedBooking.paymentMethod}</b></span>
                  <span>Txn Ref: <b className="font-mono">{selectedBooking.paymentTxnId}</b></span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" size="sm" onClick={() => alert("Resent ticket SMS/Email to passenger")}>
                Resend SMS / Email
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert("Printing E-Ticket...")}>
                Print Ticket
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
