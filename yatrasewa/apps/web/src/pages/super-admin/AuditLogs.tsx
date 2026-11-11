import { useState } from "react";
import { AdminShell } from "../../components/AdminSidebar";
import { Badge, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: "SUPER_ADMIN" | "SYSTEM_EMPLOYEE" | "OPERATOR_OWNER" | "OPERATOR_STAFF" | "USER";
  category: "Auth" | "Operator" | "Settlement" | "Commission" | "User" | "System";
  action: string;
  target: string;
  ipAddress: string;
}

const MOCK_LOGS: AuditLogItem[] = [
  {
    id: "LOG-9901",
    timestamp: "10 Nov 2026, 00:41:05",
    actorName: "YatraSewa Super Admin",
    actorRole: "SUPER_ADMIN",
    category: "Commission",
    action: "Updated commission rate for OP-NP-8821 to 10%",
    target: "Greenline Travels",
    ipAddress: "192.168.1.11",
  },
  {
    id: "LOG-9902",
    timestamp: "10 Nov 2026, 00:30:12",
    actorName: "Kriti Sharma (Finance Admin)",
    actorRole: "SYSTEM_EMPLOYEE",
    category: "Settlement",
    action: "Approved settlement payout batch #SET-102 (Rs 8,42,540)",
    target: "Sajha Yatayat Co-op",
    ipAddress: "103.1.200.45",
  },
  {
    id: "LOG-9903",
    timestamp: "09 Nov 2026, 21:14:00",
    actorName: "Surendra Shrestha (Greenline)",
    actorRole: "OPERATOR_OWNER",
    category: "Operator",
    action: "Added 2 new buses (BA 3 KHA 9912, BA 3 KHA 9913) to fleet",
    target: "Fleet Inventory",
    ipAddress: "27.34.40.11",
  },
  {
    id: "LOG-9904",
    timestamp: "09 Nov 2026, 18:22:30",
    actorName: "Ramesh Conductor",
    actorRole: "OPERATOR_STAFF",
    category: "Operator",
    action: "Marked seats A1, A2 as boarded for PNR-8821-45",
    target: "Trip #TRP-4012",
    ipAddress: "110.44.112.5",
  },
  {
    id: "LOG-9905",
    timestamp: "09 Nov 2026, 14:15:00",
    actorName: "Aayush Shrestha",
    actorRole: "USER",
    category: "User",
    action: "Booked 2 seats (A1, A2) on Kathmandu → Pokhara via eSewa",
    target: "PNR-8821-45",
    ipAddress: "110.44.120.8",
  },
  {
    id: "LOG-9906",
    timestamp: "08 Nov 2026, 11:05:22",
    actorName: "YatraSewa Super Admin",
    actorRole: "SUPER_ADMIN",
    category: "System",
    action: "Updated global Zero Trust 2FA policy for operator accounts",
    target: "System Security",
    ipAddress: "192.168.1.11",
  },
];

const ROLE_VARIANTS: Record<AuditLogItem["actorRole"], "mint" | "info" | "warning" | "danger" | "emerald"> = {
  SUPER_ADMIN: "mint",
  SYSTEM_EMPLOYEE: "info",
  OPERATOR_OWNER: "emerald",
  OPERATOR_STAFF: "warning",
  USER: "info",
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>(MOCK_LOGS);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter((l) => {
    const matchesRole = roleFilter === "ALL" || l.actorRole === roleFilter;
    const matchesSearch =
      l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress.includes(search);
    return matchesRole && matchesSearch;
  });

  return (
    <AdminShell activeKey="audit">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold text-[var(--color-ys-deep-pine)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Audit Logs
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Role filter */}
          <div className="flex gap-1 rounded-md border border-[var(--color-ys-border)] bg-white p-0.5 text-xs font-semibold">
            {["ALL", "SUPER_ADMIN", "SYSTEM_EMPLOYEE", "OPERATOR_OWNER", "OPERATOR_STAFF", "USER"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded px-2.5 py-1 transition ${
                  roleFilter === r
                    ? "bg-[var(--color-ys-emerald)] text-white"
                    : "text-[var(--color-ys-ink-muted)] hover:bg-[var(--color-ys-canvas)]"
                }`}
              >
                {r.replace("_", " ")}
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
              placeholder="Search action, actor, IP..."
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
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor & Role</th>
              <th className="p-3">Category</th>
              <th className="p-3">Action Description</th>
              <th className="p-3">Target Entity</th>
              <th className="p-3">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-[var(--color-ys-ink-muted)]">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-[var(--color-ys-border)] last:border-0 hover:bg-[var(--color-ys-canvas)]/50 transition text-xs"
                >
                  <td className="p-3 font-mono text-[11px] text-[var(--color-ys-ink-muted)]">
                    {log.timestamp}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-[var(--color-ys-deep-pine)]">{log.actorName}</div>
                    <Badge variant={ROLE_VARIANTS[log.actorRole] ?? "neutral"}>
                      {log.actorRole.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span className="rounded bg-gray-100 border px-2 py-0.5 font-bold text-[10px]">
                      {log.category}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-[var(--color-ys-ink)]">{log.action}</td>
                  <td className="p-3 font-semibold text-[var(--color-ys-emerald)]">{log.target}</td>
                  <td className="p-3 font-mono text-[11px] text-[var(--color-ys-ink-subtle)]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}
