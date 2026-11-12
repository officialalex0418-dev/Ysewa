import { useState } from "react";
import { AdminShell } from "../../components/AdminSidebar";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { formatNpr } from "../../lib/api";

export interface SettlementQueueItem {
  id: string;
  operator: string;
  code: string;
  period: string;
  gross: number;
  commission: number;
  tds: number;
  net: number;
  batches: number;
  time: string;
  status: "Verified" | "Approved" | "Disbursed" | "Completed";
}

const INITIAL_QUEUE: SettlementQueueItem[] = [
  {
    id: "SET-101",
    operator: "Greenline Travels & Tour",
    code: "OP-NP-8821",
    period: "Oct 1-15, 2026",
    gross: 1240000,
    commission: 124000,
    tds: 1860,
    net: 1114140,
    batches: 4,
    time: "51 min ago",
    status: "Verified",
  },
  {
    id: "SET-102",
    operator: "Sajha Yatayat Co-op",
    code: "OP-NP-1001",
    period: "Oct 1-15, 2026",
    gross: 917000,
    commission: 73360,
    tds: 1100,
    net: 842540,
    batches: 3,
    time: "3h ago",
    status: "Approved",
  },
  {
    id: "SET-103",
    operator: "Mountain Deluxe Exp",
    code: "OP-NP-2048",
    period: "Oct 1-15, 2026",
    gross: 43000,
    commission: 5160,
    tds: 77,
    net: 37763,
    batches: 1,
    time: "yesterday",
    status: "Disbursed",
  },
  {
    id: "SET-104",
    operator: "Buddha Air Surface",
    code: "OP-NP-7777",
    period: "Sep 16-30, 2026",
    gross: 240000,
    commission: 21600,
    tds: 324,
    net: 218076,
    batches: 2,
    time: "2 days ago",
    status: "Completed",
  },
];

const STATUS_VARIANTS: Record<SettlementQueueItem["status"], "mint" | "warning" | "info" | "emerald"> = {
  Verified: "warning",
  Approved: "info",
  Disbursed: "mint",
  Completed: "mint",
};

export default function AdminSettlementsPage() {
  const [queue, setQueue] = useState<SettlementQueueItem[]>(INITIAL_QUEUE);
  const [statusTab, setStatusTab] = useState<string>("ALL");

  const totalGross = queue.reduce((s, q) => s + q.gross, 0);
  const totalCommission = queue.reduce((s, q) => s + q.commission, 0);
  const totalNetPayable = queue.reduce((s, q) => s + q.net, 0);

  const filteredQueue = queue.filter(
    (q) => statusTab === "ALL" || q.status.toUpperCase() === statusTab
  );

  function advanceStatus(id: string) {
    setQueue(
      queue.map((q) => {
        if (q.id === id) {
          let nextStatus: SettlementQueueItem["status"] = q.status;
          if (q.status === "Verified") nextStatus = "Approved";
          else if (q.status === "Approved") nextStatus = "Disbursed";
          else if (q.status === "Disbursed") nextStatus = "Completed";
          return { ...q, status: nextStatus };
        }
        return q;
      })
    );
  }

  return (
    <AdminShell activeKey="settlements">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
            Central command & control
          </div>
          <h1
            className="text-2xl font-bold text-[var(--color-ys-deep-pine)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Settlements
          </h1>
          <div className="text-xs text-[var(--color-ys-ink-muted)] mt-0.5">
            Real-time transit commissions, live disbursement history, and NCHL NPI payouts.
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="md">
            Live · 182 ms
          </Button>
          <Button size="md" className="font-bold">
            Execute Batch Payout
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-3 md:grid-cols-4 mb-6">
        <Tile label="Total Booking Amount" sub={formatNpr(totalGross)} icon={<Icons.TicketIcon size={18} />} />
        <Tile label="Platform Fee Collected" sub={formatNpr(totalCommission)} icon={<Icons.BankIcon size={18} />} />
        <Tile label="Net Payable Amount" sub={formatNpr(totalNetPayable)} icon={<Icons.WalletIcon size={18} />} />
        <Tile label="Settlement History" sub={`${queue.length} Batches`} icon={<Icons.BuildingIcon size={18} />} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden p-0 shadow-sm">
          <div className="flex flex-wrap items-center justify-between border-b border-[var(--color-ys-border)] p-4 bg-white">
            <h3 className="text-sm font-bold text-[var(--color-ys-deep-pine)]">Settlement Queue & History</h3>

            {/* Disbursement Status Tabs */}
            <div className="flex gap-1 rounded-md border border-[var(--color-ys-border)] p-0.5 text-xs font-semibold">
              {["ALL", "VERIFIED", "APPROVED", "DISBURSED", "COMPLETED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusTab(tab)}
                  className={`rounded px-2.5 py-1 transition ${
                    statusTab === tab
                      ? "bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]"
                      : "text-[var(--color-ys-ink-muted)] hover:bg-[var(--color-ys-canvas)]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] text-left text-[11px] uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
                <th className="p-3">Operator</th>
                <th className="p-3">Gross Ticket Flow</th>
                <th className="p-3">Platform Fee</th>
                <th className="p-3">TDS @ 1.5%</th>
                <th className="p-3">Net Payable</th>
                <th className="p-3">Disbursement Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-[var(--color-ys-border)] last:border-0 hover:bg-[var(--color-ys-canvas)]/50 transition"
                >
                  <td className="p-3">
                    <div className="font-semibold text-[var(--color-ys-deep-pine)]">{q.operator}</div>
                    <div className="text-[11px] text-[var(--color-ys-ink-muted)]">
                      {q.code} · {q.period} · {q.batches} batch · {q.time}
                    </div>
                  </td>
                  <td className="p-3 tabular-npr font-semibold">{formatNpr(q.gross)}</td>
                  <td className="p-3 tabular-npr text-[var(--color-ys-warning)]">
                    - {formatNpr(q.commission)}
                  </td>
                  <td className="p-3 tabular-npr text-[var(--color-ys-warning)]">
                    - {formatNpr(q.tds)}
                  </td>
                  <td className="p-3 tabular-npr font-bold text-[var(--color-ys-deep-pine)]">
                    {formatNpr(q.net)}
                  </td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANTS[q.status] ?? "neutral"} dot>
                      {q.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    {q.status === "Completed" ? (
                      <span className="text-xs font-bold text-[var(--color-ys-emerald)]">✓ Settled</span>
                    ) : (
                      <Button size="sm" onClick={() => advanceStatus(q.id)}>
                        {q.status === "Verified"
                          ? "Approve"
                          : q.status === "Approved"
                          ? "Disburse"
                          : "Mark Completed"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] px-4 py-3 text-xs text-[var(--color-ys-ink-muted)]">
            <div>
              Showing {filteredQueue.length} cycles · Disbursing Net{" "}
              <b className="tabular-npr text-[var(--color-ys-deep-pine)]">
                {formatNpr(filteredQueue.reduce((s, q) => s + q.net, 0))}
              </b>
            </div>
            <button className="font-semibold text-[var(--color-ys-emerald)]">
              Automated Central Ledger →
            </button>
          </div>
        </Card>

        {/* Right Info Column */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-2 text-sm font-bold text-[var(--color-ys-deep-pine)]">
              Disbursing Net Summary
            </h3>
            <div className="mb-3 text-3xl font-bold tabular-npr text-[var(--color-ys-deep-pine)]">
              {formatNpr(totalNetPayable)}
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--color-ys-ink-muted)]">Gross Collected</span>
                <span className="tabular-npr font-semibold">{formatNpr(totalGross)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-ys-ink-muted)]">Platform Fee</span>
                <span className="tabular-npr text-[var(--color-ys-warning)]">
                  - {formatNpr(totalCommission)}
                </span>
              </div>
            </div>
            <div className="mt-4 rounded-md bg-[var(--color-ys-mint-tint)] p-3 text-[11px] text-[var(--color-ys-emerald)] font-semibold">
              <b>Automated NCHL ConnectIPS NPI transfers</b> execute nightly at 02:00 NPT.
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

function Tile({ label, sub, icon }: { label: string; sub: string; icon: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]">
          {icon}
        </div>
        <span className="text-[10px] font-semibold text-[var(--color-ys-emerald)]">● LIVE SYNC</span>
      </div>
      <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
        {label}
      </div>
      <div className="text-2xl font-bold tabular-npr text-[var(--color-ys-deep-pine)]">{sub}</div>
    </Card>
  );
}
