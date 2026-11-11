import { useState } from "react";
import { AdminShell } from "../../components/AdminSidebar";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";

export interface PaymentGatewayItem {
  id: string;
  name: string;
  provider: "eSewa" | "Khalti" | "Fonepay" | "ConnectIPS" | "Card";
  merchantId: string;
  status: "active" | "inactive";
  feePercent: number;
}

const INITIAL_GATEWAYS: PaymentGatewayItem[] = [
  { id: "gw-1", name: "eSewa Direct SDK", provider: "eSewa", merchantId: "EPAYTEST", status: "active", feePercent: 1.2 },
  { id: "gw-2", name: "Khalti Merchant Gateway", provider: "Khalti", merchantId: "KHL_MERCHANT_982", status: "active", feePercent: 1.5 },
  { id: "gw-3", name: "NCHL ConnectIPS NPI", provider: "ConnectIPS", merchantId: "NCHL_SYS_001", status: "active", feePercent: 0.8 },
  { id: "gw-4", name: "Fonepay QR & Merchant", provider: "Fonepay", merchantId: "FONE_TEST_007", status: "active", feePercent: 1.0 },
  { id: "gw-5", name: "HBL Visa / Mastercard Gateway", provider: "Card", merchantId: "HBL_CARD_9921", status: "inactive", feePercent: 2.8 },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "commission" | "gateways" | "security">("general");

  // General state
  const [generalConfig, setGeneralConfig] = useState({
    platformName: "YatraSewa Transport Platform",
    supportEmail: "support@yatrasewa.com.np",
    supportPhone: "+977 1 4982000",
    cancelWindowMinutes: 30,
    maintenanceMode: false,
  });

  // Global Commission state
  const [commissionConfig, setCommissionConfig] = useState({
    globalDefaultPercent: 10,
    globalFlatFeeNpr: 50,
    tdsDeductionPercent: 1.5,
    autoSettlementCycleDays: 14,
  });

  // Payment Gateways state
  const [gateways, setGateways] = useState<PaymentGatewayItem[]>(INITIAL_GATEWAYS);
  const [isAddGatewayOpen, setIsAddGatewayOpen] = useState(false);
  const [newGw, setNewGw] = useState({
    name: "",
    provider: "eSewa" as PaymentGatewayItem["provider"],
    merchantId: "",
    feePercent: 1.5,
  });

  function saveGeneral(e: React.FormEvent) {
    e.preventDefault();
    alert("General system settings saved successfully!");
  }

  function saveCommission(e: React.FormEvent) {
    e.preventDefault();
    alert("Global commission rate & ledger policies updated!");
  }

  function toggleGateway(id: string) {
    setGateways(
      gateways.map((g) =>
        g.id === id ? { ...g, status: g.status === "active" ? "inactive" : "active" } : g
      )
    );
  }

  function deleteGateway(id: string) {
    if (confirm("Are you sure you want to delete this payment gateway?")) {
      setGateways(gateways.filter((g) => g.id !== id));
    }
  }

  function handleAddGateway(e: React.FormEvent) {
    e.preventDefault();
    const item: PaymentGatewayItem = {
      id: `gw-${Date.now()}`,
      name: newGw.name,
      provider: newGw.provider,
      merchantId: newGw.merchantId,
      status: "active",
      feePercent: Number(newGw.feePercent),
    };
    setGateways([...gateways, item]);
    setIsAddGatewayOpen(false);
    setNewGw({ name: "", provider: "eSewa", merchantId: "", feePercent: 1.5 });
  }

  return (
    <AdminShell activeKey="settings">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
            System Configuration & Global Policies
          </div>
          <h1
            className="text-2xl font-bold text-[var(--color-ys-deep-pine)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Settings
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-[var(--color-ys-border)]">
        {[
          { id: "general", label: "General System" },
          { id: "commission", label: "Commission & Ledger Rates" },
          { id: "gateways", label: "Payment Gateways & Methods" },
          { id: "security", label: "Security & Zero Trust" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 text-sm font-bold transition border-b-2 ${
              activeTab === tab.id
                ? "border-[var(--color-ys-emerald)] text-[var(--color-ys-emerald)]"
                : "border-transparent text-[var(--color-ys-ink-muted)] hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. General System Tab */}
      {activeTab === "general" && (
        <Card className="max-w-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--color-ys-deep-pine)] mb-4">General Platform Settings</h2>
          <form onSubmit={saveGeneral} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Platform Display Name</label>
              <input
                type="text"
                value={generalConfig.platformName}
                onChange={(e) => setGeneralConfig({ ...generalConfig, platformName: e.target.value })}
                className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Support Email</label>
                <input
                  type="email"
                  value={generalConfig.supportEmail}
                  onChange={(e) => setGeneralConfig({ ...generalConfig, supportEmail: e.target.value })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Support Helpline Phone</label>
                <input
                  type="text"
                  value={generalConfig.supportPhone}
                  onChange={(e) => setGeneralConfig({ ...generalConfig, supportPhone: e.target.value })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Unpaid Seat Hold Window (Minutes)</label>
              <input
                type="number"
                value={generalConfig.cancelWindowMinutes}
                onChange={(e) => setGeneralConfig({ ...generalConfig, cancelWindowMinutes: parseInt(e.target.value) })}
                className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4 bg-[var(--color-ys-canvas)]">
              <div>
                <div className="text-sm font-bold text-[var(--color-ys-deep-pine)]">System Maintenance Mode</div>
                <div className="text-xs text-[var(--color-ys-ink-muted)]">
                  Temporarily pause new customer bookings for scheduled updates
                </div>
              </div>
              <input
                type="checkbox"
                checked={generalConfig.maintenanceMode}
                onChange={(e) => setGeneralConfig({ ...generalConfig, maintenanceMode: e.target.checked })}
                className="h-5 w-5 accent-[var(--color-ys-emerald)] cursor-pointer"
              />
            </div>

            <Button type="submit" className="font-bold">Save General Settings</Button>
          </form>
        </Card>
      )}

      {/* 2. Commission Rates Tab */}
      {activeTab === "commission" && (
        <Card className="max-w-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--color-ys-deep-pine)] mb-4">Commission & Ledger Default Rules</h2>
          <form onSubmit={saveCommission} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Default Platform Commission Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={commissionConfig.globalDefaultPercent}
                onChange={(e) => setCommissionConfig({ ...commissionConfig, globalDefaultPercent: parseFloat(e.target.value) })}
                className="w-full h-10 rounded-lg border px-3 text-sm outline-none font-bold text-[var(--color-ys-emerald)]"
              />
              <span className="text-[11px] text-[var(--color-ys-ink-muted)]">
                Applies to all newly onboarded operators unless custom rate is assigned.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Default Flat Ticket Fee (NPR)</label>
              <input
                type="number"
                value={commissionConfig.globalFlatFeeNpr}
                onChange={(e) => setCommissionConfig({ ...commissionConfig, globalFlatFeeNpr: parseInt(e.target.value) })}
                className="w-full h-10 rounded-lg border px-3 text-sm outline-none font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Government TDS Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={commissionConfig.tdsDeductionPercent}
                  onChange={(e) => setCommissionConfig({ ...commissionConfig, tdsDeductionPercent: parseFloat(e.target.value) })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Settlement Cycle (Days)</label>
                <input
                  type="number"
                  value={commissionConfig.autoSettlementCycleDays}
                  onChange={(e) => setCommissionConfig({ ...commissionConfig, autoSettlementCycleDays: parseInt(e.target.value) })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                />
              </div>
            </div>

            <Button type="submit" className="font-bold">Update Commission Defaults</Button>
          </form>
        </Card>
      )}

      {/* 3. Payment Gateways Tab */}
      {activeTab === "gateways" && (
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--color-ys-deep-pine)]">Payment Gateways & Methods</h2>
            <Button size="sm" className="font-bold" onClick={() => setIsAddGatewayOpen(true)}>
              + Add Gateway
            </Button>
          </div>

          <Card className="overflow-hidden p-0 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] text-left text-[11px] uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
                  <th className="p-3">Gateway Name</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Merchant ID</th>
                  <th className="p-3">Processing Fee</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {gateways.map((g) => (
                  <tr key={g.id} className="border-b border-[var(--color-ys-border)] last:border-0 hover:bg-[var(--color-ys-canvas)]/50">
                    <td className="p-3 font-bold text-[var(--color-ys-deep-pine)]">{g.name}</td>
                    <td className="p-3 font-semibold text-xs text-[var(--color-ys-emerald)]">{g.provider}</td>
                    <td className="p-3 font-mono text-xs text-[var(--color-ys-ink-muted)]">{g.merchantId}</td>
                    <td className="p-3 text-xs font-semibold">{g.feePercent}%</td>
                    <td className="p-3">
                      <Badge variant={g.status === "active" ? "mint" : "danger"} dot>
                        {g.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => toggleGateway(g.id)}
                          className={`rounded px-2 py-1 text-xs font-bold border ${
                            g.status === "active" ? "border-amber-300 text-amber-700 bg-amber-50" : "border-emerald-300 text-emerald-700 bg-emerald-50"
                          }`}
                        >
                          {g.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => deleteGateway(g.id)}
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* 4. Security Tab */}
      {activeTab === "security" && (
        <Card className="max-w-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[var(--color-ys-deep-pine)]">Security & Zero Trust Policies</h2>
          <div className="rounded-lg border p-4 bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-deep-pine)]">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Icons.ShieldCheckIcon width={18} height={18} /> Hardware 2FA & Audit Logging
            </div>
            <p className="mt-1 text-xs text-[var(--color-ys-ink-muted)]">
              All high-altitude actions (payout approvals, operator suspensions, commission changes) are cryptographically signed.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-bold">Mandatory Operator 2FA</div>
                <div className="text-[var(--color-ys-ink-muted)]">Require TOTP / SMS 2FA for all operator owner logins</div>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--color-ys-emerald)]" />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-bold">Super Admin Session Timeout</div>
                <div className="text-[var(--color-ys-ink-muted)]">Auto-logout after 15 minutes of inactivity</div>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--color-ys-emerald)]" />
            </div>
          </div>
        </Card>
      )}

      {/* Add Gateway Modal */}
      {isAddGatewayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[var(--color-ys-deep-pine)] mb-4">Add Payment Gateway</h2>
            <form onSubmit={handleAddGateway} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Gateway Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fonepay Direct QR"
                  value={newGw.name}
                  onChange={(e) => setNewGw({ ...newGw, name: e.target.value })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Provider Type</label>
                <select
                  value={newGw.provider}
                  onChange={(e) => setNewGw({ ...newGw, provider: e.target.value as any })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none bg-white"
                >
                  <option value="eSewa">eSewa</option>
                  <option value="Khalti">Khalti</option>
                  <option value="Fonepay">Fonepay</option>
                  <option value="ConnectIPS">ConnectIPS</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Merchant Code / Secret Key *</label>
                <input
                  type="text"
                  required
                  placeholder="MERCHANT_CODE_XYZ"
                  value={newGw.merchantId}
                  onChange={(e) => setNewGw({ ...newGw, merchantId: e.target.value })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Processing Fee (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newGw.feePercent}
                  onChange={(e) => setNewGw({ ...newGw, feePercent: parseFloat(e.target.value) })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddGatewayOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="font-bold">
                  Save Gateway
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
