import { useState } from "react";
import { AdminShell } from "../../components/AdminSidebar";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { formatNpr } from "../../lib/api";

export interface OperatorCommissionRow {
  operatorId: string;
  operatorName: string;
  code: string;
  totalBookings: number;
  totalBookingAmount: number;
  commissionType: "percentage" | "flat";
  commissionRate: number; // e.g., 10% or 150
  platformCommissionAmount: number;
  payableAmount: number;
  status: "Settled" | "Pending Approval" | "Processing";
}

const MOCK_COMMISSIONS: OperatorCommissionRow[] = [
  {
    operatorId: "OP-NP-8821",
    operatorName: "Greenline Travels & Tours",
    code: "OP-NP-8821",
    totalBookings: 1420,
    totalBookingAmount: 4378500,
    commissionType: "percentage",
    commissionRate: 10,
    platformCommissionAmount: 437850,
    payableAmount: 3940650,
    status: "Pending Approval",
  },
  {
    operatorId: "OP-NP-1001",
    operatorName: "Sajha Yatayat Cooperative",
    code: "OP-NP-1001",
    totalBookings: 2240,
    totalBookingAmount: 8285000,
    commissionType: "percentage",
    commissionRate: 8,
    platformCommissionAmount: 662800,
    payableAmount: 7622200,
    status: "Pending Approval",
  },
  {
    operatorId: "OP-NP-2048",
    operatorName: "Mountain Deluxe Express",
    code: "OP-NP-2048",
    totalBookings: 320,
    totalBookingAmount: 704000,
    commissionType: "flat",
    commissionRate: 150,
    platformCommissionAmount: 48000,
    payableAmount: 656000,
    status: "Processing",
  },
  {
    operatorId: "OP-NP-7777",
    operatorName: "Buddha Air Surface Transport",
    code: "OP-NP-7777",
    totalBookings: 430,
    totalBookingAmount: 1280000,
    commissionType: "percentage",
    commissionRate: 9,
    platformCommissionAmount: 115200,
    payableAmount: 1164800,
    status: "Settled",
  },
];

export default function AdminCommissionsPage() {
  const [rows, setRows] = useState<OperatorCommissionRow[]>(MOCK_COMMISSIONS);
  const [search, setSearch] = useState("");

  const totalBookings = rows.reduce((s, r) => s + r.totalBookings, 0);
  const totalBookingAmount = rows.reduce((s, r) => s + r.totalBookingAmount, 0);
  const totalCommissionAmount = rows.reduce((s, r) => s + r.platformCommissionAmount, 0);
  const totalPayableAmount = rows.reduce((s, r) => s + r.payableAmount, 0);

  const filtered = rows.filter(
    (r) =>
      r.operatorName.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell activeKey="commissions">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
            Platform Revenue & Commission Analytics
          </div>
          <h1
            className="text-2xl font-bold text-[var(--color-ys-deep-pine)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Commission & Payments
          </h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="md">
            Export Report
          </Button>
          <Button size="md" className="font-bold">
            Recalculate Ledger
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-3 md:grid-cols-4 mb-6">
        <Card className="p-4 border-l-4 border-[var(--color-ys-emerald)]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ys-ink-subtle)]">
            Total Bookings
          </div>
          <div className="mt-1 text-2xl font-bold tabular-npr text-[var(--color-ys-deep-pine)]">
            {(totalBookings || 0).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[var(--color-ys-emerald)] font-semibold">Across 4 active operators</div>
        </Card>

        <Card className="p-4 border-l-4 border-[var(--color-ys-emerald)]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ys-ink-subtle)]">
            Total Booking Amount (Gross)
          </div>
          <div className="mt-1 text-2xl font-bold tabular-npr text-[var(--color-ys-deep-pine)]">
            {formatNpr(totalBookingAmount)}
          </div>
          <div className="mt-1 text-xs text-[var(--color-ys-ink-muted)]">Gross ticket volume</div>
        </Card>

        <Card className="p-4 border-l-4 border-[var(--color-ys-warning)]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ys-ink-subtle)]">
            Total Commission Earned
          </div>
          <div className="mt-1 text-2xl font-bold tabular-npr text-[var(--color-ys-emerald)]">
            {formatNpr(totalCommissionAmount)}
          </div>
          <div className="mt-1 text-xs text-[var(--color-ys-emerald)] font-semibold">Platform Net Revenue</div>
        </Card>

        <Card className="p-4 border-l-4 border-blue-500">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ys-ink-subtle)]">
            Total Net Payable to Operators
          </div>
          <div className="mt-1 text-2xl font-bold tabular-npr text-[var(--color-ys-deep-pine)]">
            {formatNpr(totalPayableAmount)}
          </div>
          <div className="mt-1 text-xs text-[var(--color-ys-ink-muted)]">After commission deduction</div>
        </Card>
      </div>

      {/* Operator Wise Commission Table */}
      <Card className="overflow-hidden p-0 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--color-ys-border)] p-4 bg-white">
          <h3 className="text-sm font-bold text-[var(--color-ys-deep-pine)]">
            Operator-wise Commission Breakdown
          </h3>
          <div className="relative w-64">
            <Icons.SearchIcon
              width={14}
              height={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ys-ink-subtle)]"
            />
            <input
              type="text"
              placeholder="Search operator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] pl-9 pr-3 text-xs outline-none focus:border-[var(--color-ys-emerald)]"
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] text-left text-[11px] uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
              <th className="p-3">Operator Name</th>
              <th className="p-3">Total Bookings</th>
              <th className="p-3">Total Booking Amount</th>
              <th className="p-3">Commission Rate</th>
              <th className="p-3">Platform Commission</th>
              <th className="p-3">Payable Amount</th>
              <th className="p-3">Settlement Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.operatorId}
                className="border-b border-[var(--color-ys-border)] last:border-0 hover:bg-[var(--color-ys-canvas)]/50 transition"
              >
                <td className="p-3">
                  <div className="font-bold text-[var(--color-ys-deep-pine)]">{r.operatorName}</div>
                  <div className="text-[11px] text-[var(--color-ys-ink-muted)]">{r.code}</div>
                </td>
                <td className="p-3 font-semibold tabular-npr">{r.totalBookings} bookings</td>
                <td className="p-3 font-bold tabular-npr text-[var(--color-ys-deep-pine)]">
                  {formatNpr(r.totalBookingAmount)}
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center rounded-md bg-[var(--color-ys-canvas)] border px-2 py-0.5 text-xs font-semibold">
                    {r.commissionType === "percentage"
                      ? `${r.commissionRate}%`
                      : `Rs. ${r.commissionRate} / ticket`}
                  </span>
                </td>
                <td className="p-3 font-bold tabular-npr text-[var(--color-ys-emerald)]">
                  {formatNpr(r.platformCommissionAmount)}
                </td>
                <td className="p-3 font-bold tabular-npr text-[var(--color-ys-deep-pine)]">
                  {formatNpr(r.payableAmount)}
                </td>
                <td className="p-3">
                  <Badge
                    variant={
                      r.status === "Settled"
                        ? "mint"
                        : r.status === "Processing"
                        ? "info"
                        : "warning"
                    }
                  >
                    {r.status}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alert(`Adjusting commission rules for ${r.operatorName}`)}
                  >
                    Edit Rate
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}
