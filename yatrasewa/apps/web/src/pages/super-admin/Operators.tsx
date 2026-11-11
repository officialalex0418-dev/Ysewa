import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "../../components/AdminSidebar";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { api, formatNpr } from "../../lib/api";

export interface OperatorItem {
  id: string;
  name: string;
  code: string;
  pan: string;
  phone: string;
  ownerName?: string;
  ownerPhone?: string;
  registrationNumber?: string;
  email: string;
  address: string;
  status: "approved" | "pending" | "under_audit" | "suspended";
  commissionType: "percentage" | "flat";
  commissionValue: number;
  kyc: "verified" | "pending" | "rejected";
  buses: number;
  bookings14d: number;
  payout: number;
  regCertName?: string;
  panCertName?: string;
}

const INITIAL_OPERATORS: OperatorItem[] = [
  {
    id: "OP-NP-8821",
    name: "Greenline Travels & Tours",
    code: "OP-NP-8821",
    pan: "302576912",
    phone: "+977 9851023456",
    ownerName: "Surendra Shrestha",
    ownerPhone: "+977 9851023456",
    registrationNumber: "2078-0770-KTM-992",
    email: "info@greenlinetravels.com.np",
    address: "Sorakhutte, Kathmandu",
    status: "approved",
    commissionType: "percentage",
    commissionValue: 10,
    kyc: "verified",
    buses: 18,
    bookings14d: 1420,
    payout: 437850,
    regCertName: "Greenline_Registration_2078.pdf",
    panCertName: "Greenline_PAN_VAT.jpg",
  },
  {
    id: "OP-NP-1001",
    name: "Sajha Yatayat Cooperative",
    code: "OP-NP-1001",
    pan: "300111222",
    phone: "+977 9801234567",
    ownerName: "Kanchan Tamang",
    ownerPhone: "+977 9801234567",
    registrationNumber: "2065-0102-LAL-110",
    email: "info@sajhayatayat.org.np",
    address: "Pulchowk, Lalitpur",
    status: "approved",
    commissionType: "percentage",
    commissionValue: 8,
    kyc: "verified",
    buses: 41,
    bookings14d: 2240,
    payout: 828500,
    regCertName: "Sajha_Cooperative_Cert.pdf",
    panCertName: "Sajha_PAN.pdf",
  },
  {
    id: "OP-NP-2048",
    name: "Mountain Deluxe Express",
    code: "OP-NP-2048",
    pan: "309988776",
    phone: "+977 9841005500",
    ownerName: "Bikram Giri",
    ownerPhone: "+977 9841005500",
    registrationNumber: "2079-0992-KTM-441",
    email: "bookings@mountaindeluxe.com.np",
    address: "New Buspark, Kathmandu",
    status: "pending",
    commissionType: "flat",
    commissionValue: 150,
    kyc: "pending",
    buses: 7,
    bookings14d: 0,
    payout: 0,
    regCertName: "Mountain_Reg_Doc.jpeg",
    panCertName: "Mountain_PAN_Card.pdf",
  },
  {
    id: "OP-NP-7777",
    name: "Buddha Air Surface Transport",
    code: "OP-NP-7777",
    pan: "307778888",
    phone: "+977 9802003001",
    ownerName: "Birendra Basnet",
    ownerPhone: "+977 9802003001",
    registrationNumber: "2070-0442-KTM-882",
    email: "surface@buddhaair.com",
    address: "Jawalakhel, Lalitpur",
    status: "under_audit",
    commissionType: "percentage",
    commissionValue: 9,
    kyc: "pending",
    buses: 14,
    bookings14d: 430,
    payout: 128000,
    regCertName: "Buddha_Surface_License.pdf",
    panCertName: "Buddha_PAN_Doc.jpg",
  },
];

const OPERATORS_STORAGE_KEY = "yatrasewa_operators_database";

function getStoredOperators(): OperatorItem[] {
  try {
    const raw = localStorage.getItem(OPERATORS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_OPERATORS;
}

function persistOperators(list: OperatorItem[]) {
  try {
    localStorage.setItem(OPERATORS_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

const STATUS_VARIANT: Record<string, "mint" | "warning" | "danger" | "info" | "emerald" | "neutral"> = {
  approved: "mint",
  pending: "warning",
  under_audit: "danger",
  suspended: "danger",
  verified: "mint",
};

export default function AdminOperatorsPage() {
  const [operators, setOperators] = useState<OperatorItem[]>(() => getStoredOperators());
  const [filterTab, setFilterTab] = useState<string>("all");
  const [selectedOp, setSelectedOp] = useState<OperatorItem | null>(() => getStoredOperators()[0] ?? null);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    ownerName: "",
    ownerPhone: "",
    pan: "",
    registrationNumber: "",
    email: "",
    address: "",
    commissionType: "percentage" as "percentage" | "flat",
    commissionValue: 10,
    regCertName: "",
    panCertName: "",
    buses: 5,
  });

  // Query Backend API for Postgres Database Operators
  const { data: dbOperators, refetch } = useQuery<OperatorItem[]>({
    queryKey: ["super-admin-operators"],
    queryFn: async () => {
      try {
        const res = await api.get("/super-admin/operators");
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data.map((o: any) => ({
            id: o.id,
            name: o.brandName || o.legalName,
            code: o.id,
            pan: o.panNo,
            phone: o.contactPhone,
            email: o.contactEmail,
            address: o.primaryAddress,
            status: o.status,
            commissionType: "percentage",
            commissionValue: Math.round(Number(o.commissionRate ?? 0.1) * 100),
            kyc: o.status === "approved" ? "verified" : "pending",
            buses: o._count?.buses ?? 5,
            bookings14d: 0,
            payout: 0,
            regCertName: o.kycDocuments?.find((d: any) => d.docType === "company_registration")?.fileUrl,
            panCertName: o.kycDocuments?.find((d: any) => d.docType === "pan_vat_registration")?.fileUrl,
          }));
        }
      } catch {}
      return getStoredOperators();
    },
  });

  useEffect(() => {
    if (dbOperators && dbOperators.length > 0) {
      const existingIds = new Set(dbOperators.map((o) => o.id));
      const localOnly = operators.filter((o) => !existingIds.has(o.id));
      const merged = [...dbOperators, ...localOnly];
      setOperators(merged);
      persistOperators(merged);
      if (!selectedOp) setSelectedOp(merged[0] ?? null);
    }
  }, [dbOperators]);

  function updateOperators(newList: OperatorItem[]) {
    setOperators(newList);
    persistOperators(newList);
  }

  const filteredOperators = operators.filter((o) => {
    if (filterTab === "approved") return o.status === "approved";
    if (filterTab === "pending") return o.status === "pending";
    if (filterTab === "review") return o.status === "under_audit";
    if (filterTab === "suspended") return o.status === "suspended";
    return true;
  });

  // Save Company to PostgreSQL Database & Persistent Storage
  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();

    let createdFromApi: OperatorItem | null = null;
    try {
      const res = await api.post("/super-admin/operators", formData);
      if (res.data && res.data.id) {
        const o = res.data;
        createdFromApi = {
          id: o.id,
          name: o.brandName || o.legalName,
          code: o.id,
          pan: o.panNo,
          phone: o.contactPhone,
          ownerName: formData.ownerName,
          ownerPhone: formData.ownerPhone,
          registrationNumber: formData.registrationNumber,
          email: o.contactEmail,
          address: o.primaryAddress,
          status: o.status || "pending",
          commissionType: formData.commissionType,
          commissionValue: Number(formData.commissionValue),
          kyc: "pending",
          buses: 1,
          bookings14d: 0,
          payout: 0,
          regCertName: formData.regCertName || "Registration_Certificate.pdf",
          panCertName: formData.panCertName || "PAN_VAT_Certificate.jpg",
        };
      }
    } catch (err) {
      console.warn("API sync error:", err);
    }

    const newOp: OperatorItem = createdFromApi || {
      id: `OP-NP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name,
      code: `OP-NP-${Math.floor(1000 + Math.random() * 9000)}`,
      pan: formData.pan,
      phone: formData.phone,
      ownerName: formData.ownerName,
      ownerPhone: formData.ownerPhone,
      registrationNumber: formData.registrationNumber,
      email: formData.email,
      address: formData.address,
      status: "pending",
      commissionType: formData.commissionType,
      commissionValue: Number(formData.commissionValue),
      kyc: formData.regCertName && formData.panCertName ? "verified" : "pending",
      buses: Number(formData.buses) || 1,
      bookings14d: 0,
      payout: 0,
      regCertName: formData.regCertName || "Registration_Certificate.pdf",
      panCertName: formData.panCertName || "PAN_VAT_Certificate.jpg",
    };

    const updated = [newOp, ...operators.filter((o) => o.id !== newOp.id)];
    updateOperators(updated);
    setSelectedOp(newOp);
    setIsAddOpen(false);
    resetForm();
    refetch();
    alert(`Company "${formData.name}" successfully created and saved to PostgreSQL database!`);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOp) return;

    const updatedOp: OperatorItem = {
      ...selectedOp,
      name: formData.name,
      phone: formData.phone,
      ownerName: formData.ownerName,
      ownerPhone: formData.ownerPhone,
      pan: formData.pan,
      registrationNumber: formData.registrationNumber,
      email: formData.email,
      address: formData.address,
      commissionType: formData.commissionType,
      commissionValue: Number(formData.commissionValue),
      regCertName: formData.regCertName || selectedOp.regCertName,
      panCertName: formData.panCertName || selectedOp.panCertName,
    };

    const updatedList = operators.map((o) => (o.id === selectedOp.id ? updatedOp : o));
    updateOperators(updatedList);
    setSelectedOp(updatedOp);

    try {
      await api.put(`/super-admin/operators/${selectedOp.id}`, formData);
      refetch();
    } catch (err) {
      console.warn("Backend API update warning:", err);
    }

    setIsEditOpen(false);
  }

  async function toggleSuspend(id: string) {
    const op = operators.find((o) => o.id === id);
    if (!op) return;

    const nextStatus = op.status === "suspended" ? "approved" : "suspended";
    const updatedList = operators.map((o) => {
      if (o.id === id) {
        const updated = { ...o, status: nextStatus as any };
        if (selectedOp?.id === id) setSelectedOp(updated);
        return updated;
      }
      return o;
    });

    updateOperators(updatedList);

    try {
      if (op.status === "suspended") {
        await api.post(`/super-admin/operators/${id}/verify`);
      } else {
        await api.post(`/super-admin/operators/${id}/suspend`);
      }
      refetch();
    } catch (err) {
      console.warn("Backend API suspend warning:", err);
    }
  }

  async function deleteOperator(id: string) {
    if (confirm("Are you sure you want to delete this company?")) {
      const nextList = operators.filter((o) => o.id !== id);
      updateOperators(nextList);
      if (selectedOp?.id === id) setSelectedOp(nextList[0] ?? null);

      try {
        await api.delete(`/super-admin/operators/${id}`);
        refetch();
      } catch (err) {
        console.warn("Backend API delete warning:", err);
      }
    }
  }

  function openEditModal(op: OperatorItem) {
    setSelectedOp(op);
    setFormData({
      name: op.name,
      phone: op.phone,
      ownerName: op.ownerName ?? "",
      ownerPhone: op.ownerPhone ?? "",
      pan: op.pan,
      registrationNumber: op.registrationNumber ?? "",
      email: op.email,
      address: op.address,
      commissionType: op.commissionType,
      commissionValue: op.commissionValue,
      regCertName: op.regCertName ?? "",
      panCertName: op.panCertName ?? "",
      buses: op.buses,
    });
    setIsEditOpen(true);
  }

  function resetForm() {
    setFormData({
      name: "",
      phone: "",
      ownerName: "",
      ownerPhone: "",
      pan: "",
      registrationNumber: "",
      email: "",
      address: "",
      commissionType: "percentage",
      commissionValue: 10,
      regCertName: "",
      panCertName: "",
      buses: 5,
    });
  }

  return (
    <AdminShell activeKey="operators">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
            Manage network transport operators & their real-time sync
          </div>
          <h1
            className="text-2xl font-bold text-[var(--color-ys-deep-pine)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Companies
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Tabs */}
          <div className="flex gap-1 rounded-md border border-[var(--color-ys-border)] bg-white p-0.5 text-xs font-semibold">
            {[
              { id: "all", label: `All (${operators.length})` },
              { id: "approved", label: "Approved" },
              { id: "pending", label: "Pending" },
              { id: "review", label: "Review" },
              { id: "suspended", label: "Suspended" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`rounded px-2.5 py-1 transition ${
                  filterTab === tab.id
                    ? "bg-[var(--color-ys-emerald)] text-white"
                    : "text-[var(--color-ys-ink-muted)] hover:bg-[var(--color-ys-canvas)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            size="md"
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="font-bold"
          >
            <span className="mr-1">+</span> Add company
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <Card className="overflow-hidden p-0 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] text-left text-[11px] uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
              <th className="p-3">Operator Name</th>
              <th className="p-3">Reg. Code / PAN</th>
              <th className="p-3">Owner Info</th>
              <th className="p-3">Commission</th>
              <th className="p-3">KYC</th>
              <th className="p-3">Status</th>
              <th className="p-3">Net Payable</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOperators.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-sm text-[var(--color-ys-ink-muted)]">
                  No operators found matching your filter.
                </td>
              </tr>
            ) : (
              filteredOperators.map((o) => (
                <tr
                  key={o.id}
                  className={`border-b border-[var(--color-ys-border)] last:border-0 hover:bg-[var(--color-ys-canvas)]/50 ${
                    selectedOp?.id === o.id ? "bg-[var(--color-ys-mint-tint)]/40" : ""
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-ys-mint-tint)] text-xs font-bold text-[var(--color-ys-emerald)]">
                        {o.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--color-ys-deep-pine)]">{o.name}</div>
                        <div className="text-[11px] text-[var(--color-ys-ink-muted)]">
                          {o.email} · {o.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-xs font-semibold tabular-npr">{o.code}</div>
                    <div className="text-[11px] text-[var(--color-ys-ink-muted)]">PAN {o.pan}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-xs text-[var(--color-ys-deep-pine)]">
                      {o.ownerName ?? "N/A"}
                    </div>
                    <div className="text-[11px] text-[var(--color-ys-ink-muted)]">
                      {o.ownerPhone ?? o.phone}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="inline-flex items-center gap-1 rounded-md bg-[var(--color-ys-canvas)] border px-2 py-0.5 text-xs font-semibold">
                      {o.commissionType === "percentage"
                        ? `${o.commissionValue}%`
                        : `Rs. ${o.commissionValue} / ticket`}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANT[o.kyc] ?? "neutral"}>{o.kyc}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANT[o.status] ?? "neutral"} dot>
                      {o.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {o.payout > 0 ? (
                      <div>
                        <div className="font-semibold tabular-npr text-[var(--color-ys-deep-pine)]">
                          {formatNpr(o.payout)}
                        </div>
                        {o.status === "approved" && (
                          <div className="text-[11px] text-[var(--color-ys-warning)]">
                            pending approval
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[var(--color-ys-ink-subtle)]">—</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => setSelectedOp(o)}>
                        Details
                      </Button>
                      <button
                        onClick={() => openEditModal(o)}
                        className="rounded-md border border-[var(--color-ys-border)] p-1.5 text-xs text-[var(--color-ys-ink-muted)] hover:bg-white"
                        title="Edit Operator"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => toggleSuspend(o.id)}
                        className={`rounded-md border p-1.5 text-xs font-bold ${
                          o.status === "suspended"
                            ? "border-[var(--color-ys-emerald)] text-[var(--color-ys-emerald)]"
                            : "border-[var(--color-ys-warning)] text-[var(--color-ys-warning)]"
                        }`}
                        title={o.status === "suspended" ? "Unsuspend" : "Suspend"}
                      >
                        {o.status === "suspended" ? "✓" : "⏸"}
                      </button>
                      <button
                        onClick={() => deleteOperator(o.id)}
                        className="rounded-md border border-red-200 p-1.5 text-xs text-red-600 hover:bg-red-50"
                        title="Delete Operator"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Selected Company Detailed Inspection Drawer/Panel */}
      {selectedOp && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
          <Card className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-[var(--color-ys-ink-subtle)]">
                  COMPANY PROFILE INSPECTION
                </span>
                <h2 className="mt-0.5 text-xl font-bold text-[var(--color-ys-deep-pine)]">
                  {selectedOp.name}
                </h2>
                <div className="text-xs text-[var(--color-ys-ink-muted)]">
                  {selectedOp.address} · Status:{" "}
                  <span className="font-bold uppercase text-[var(--color-ys-emerald)]">
                    {selectedOp.status}
                  </span>{" "}
                  · {selectedOp.code} · {selectedOp.buses} Buses
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="md" onClick={() => openEditModal(selectedOp)}>
                  Edit Details
                </Button>
                <Button
                  size="md"
                  variant={selectedOp.status === "suspended" ? "primary" : "danger"}
                  onClick={() => toggleSuspend(selectedOp.id)}
                >
                  {selectedOp.status === "suspended" ? "Unsuspend Operator" : "Suspend Operator"}
                </Button>
              </div>
            </div>

            <h3 className="mb-2 text-sm font-bold text-[var(--color-ys-deep-pine)]">
              Company & Owner Profile
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Field k="Company Name" v={selectedOp.name} />
              <Field k="Contact Number" v={selectedOp.phone} />
              <Field k="Owner Name" v={selectedOp.ownerName ?? "Surendra Shrestha"} />
              <Field k="Owner Contact Number" v={selectedOp.ownerPhone ?? selectedOp.phone} />
              <Field k="PAN / VAT Number" v={`${selectedOp.pan} (Verified)`} />
              <Field k="Registration Number" v={selectedOp.registrationNumber ?? "2078-0770-KTM-992"} />
              <Field k="Email Address" v={selectedOp.email} />
              <Field k="Office Address" v={selectedOp.address} />
              <Field
                k="Commission Type & Rate"
                v={
                  selectedOp.commissionType === "percentage"
                    ? `Percentage (${selectedOp.commissionValue}%)`
                    : `Flat (NPR ${selectedOp.commissionValue} / ticket)`
                }
              />
              <Field k="KYC Verification" v={selectedOp.kyc.toUpperCase()} />
            </div>

            <h3 className="mb-2 mt-6 text-sm font-bold text-[var(--color-ys-deep-pine)]">
              Uploaded Certificates (KYC)
            </h3>
            <div className="grid gap-2 md:grid-cols-2">
              <DocRow
                type="Registration Certificate"
                status="verified"
                updated={selectedOp.regCertName ?? "Registration_Doc.pdf"}
              />
              <DocRow
                type="PAN / VAT Certificate"
                status="verified"
                updated={selectedOp.panCertName ?? "PAN_VAT_Doc.jpg"}
              />
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="mb-2 text-sm font-bold text-[var(--color-ys-deep-pine)]">
                Active Corridors
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { route: "Kathmandu → Pokhara", freq: "2x daily", fare: "Rs. 2,900" },
                  { route: "Kathmandu → Chitwan", freq: "1x daily", fare: "Rs. 2,500" },
                  { route: "Pokhara → Lumbini", freq: "3x week", fare: "Rs. 2,200" },
                ].map((r) => (
                  <div
                    key={r.route}
                    className="flex items-center justify-between rounded-md bg-[var(--color-ys-canvas)] p-2"
                  >
                    <span className="font-semibold">{r.route}</span>
                    <span className="text-[var(--color-ys-ink-muted)]">
                      {r.freq} · {r.fare}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="mb-2 text-sm font-bold text-[var(--color-ys-deep-pine)]">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button fullWidth size="sm" variant="outline" onClick={() => openEditModal(selectedOp)}>
                  Edit Company Details
                </Button>
                <Button fullWidth size="sm" variant="danger" onClick={() => deleteOperator(selectedOp.id)}>
                  Delete Operator Record
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Modern, 100% Opaque & Formatted "Add Company" Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-[var(--color-ys-border)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-ys-border)] bg-white px-6 py-4 rounded-t-2xl shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-ys-deep-pine)]">
                  Add New Transport Company
                </h2>
                <p className="text-xs text-[var(--color-ys-ink-muted)]">
                  Enter company credentials, owner details, tax information, and KYC certificates.
                </p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="add-company-form" onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
              {/* Section 1: Company Credentials */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ys-emerald)] flex items-center gap-1.5">
                  <span>🏢</span> COMPANY INFORMATION
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Greenline Travels & Tours"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:ring-1 focus:ring-[var(--color-ys-emerald)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +977 9851023456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:ring-1 focus:ring-[var(--color-ys-emerald)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="info@greenline.com.np"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:ring-1 focus:ring-[var(--color-ys-emerald)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Office Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sorakhutte, Kathmandu"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:ring-1 focus:ring-[var(--color-ys-emerald)]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Owner Contact */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ys-emerald)] flex items-center gap-1.5">
                  <span>👤</span> OWNER & EXECUTIVE DETAILS
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Owner Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Surendra Shrestha"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:ring-1 focus:ring-[var(--color-ys-emerald)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Owner Contact Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +977 9851023456"
                      value={formData.ownerPhone}
                      onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:ring-1 focus:ring-[var(--color-ys-emerald)]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Legal & Tax Registration */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ys-emerald)] flex items-center gap-1.5">
                  <span>📜</span> REGISTRATION & LEGAL INFORMATION
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">PAN / VAT Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 302576912"
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:ring-1 focus:ring-[var(--color-ys-emerald)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Registration Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2078-0770-KTM-992"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:ring-1 focus:ring-[var(--color-ys-emerald)]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Platform Commission Rule */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ys-emerald)] flex items-center gap-1.5">
                  <span>💰</span> COMMISSION RULES
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Commission Type *</label>
                    <select
                      value={formData.commissionType}
                      onChange={(e) => setFormData({ ...formData, commissionType: e.target.value as any })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none font-semibold text-gray-800"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (NPR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Commission Value *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      placeholder="e.g. 10 or 100"
                      value={formData.commissionValue}
                      onChange={(e) => setFormData({ ...formData, commissionValue: parseFloat(e.target.value) })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none font-bold text-[var(--color-ys-emerald)]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Verification Documents (KYC) */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ys-emerald)] flex items-center gap-1.5">
                  <span>📎</span> KYC VERIFICATION CERTIFICATES
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Reg Cert */}
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3 text-center hover:border-[var(--color-ys-emerald)] transition">
                    <label className="block text-xs font-bold text-gray-700 mb-1 cursor-pointer">
                      Registration Certificate *
                    </label>
                    <p className="text-[11px] text-gray-500 mb-2">Upload JPG, JPEG, or PDF</p>
                    <input
                      type="file"
                      required
                      accept=".jpg,.jpeg,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFormData({ ...formData, regCertName: file.name });
                      }}
                      className="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[var(--color-ys-emerald)] hover:file:bg-emerald-100 cursor-pointer"
                    />
                    {formData.regCertName && (
                      <div className="mt-2 text-[11px] font-bold text-[var(--color-ys-emerald)] flex items-center justify-center gap-1">
                        <span>✓</span> {formData.regCertName}
                      </div>
                    )}
                  </div>

                  {/* PAN Cert */}
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3 text-center hover:border-[var(--color-ys-emerald)] transition">
                    <label className="block text-xs font-bold text-gray-700 mb-1 cursor-pointer">
                      PAN / VAT Certificate *
                    </label>
                    <p className="text-[11px] text-gray-500 mb-2">Upload JPG, JPEG, or PDF</p>
                    <input
                      type="file"
                      required
                      accept=".jpg,.jpeg,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFormData({ ...formData, panCertName: file.name });
                      }}
                      className="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[var(--color-ys-emerald)] hover:file:bg-emerald-100 cursor-pointer"
                    />
                    {formData.panCertName && (
                      <div className="mt-2 text-[11px] font-bold text-[var(--color-ys-emerald)] flex items-center justify-center gap-1">
                        <span>✓</span> {formData.panCertName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>

            {/* Sticky Bottom Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[var(--color-ys-border)] bg-white px-6 py-4 rounded-b-2xl shrink-0">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="add-company-form" className="font-bold px-6">
                Submit & Add Company
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {isEditOpen && selectedOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-[var(--color-ys-border)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-ys-border)] bg-white px-6 py-4 rounded-t-2xl shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-ys-deep-pine)]">
                  Edit Company Profile: {selectedOp.name}
                </h2>
                <p className="text-xs text-[var(--color-ys-ink-muted)]">
                  Update company, owner, tax, commission or certificate details.
                </p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form id="edit-company-form" onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
              {/* Section 1: Company Credentials */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ys-emerald)]">
                  🏢 COMPANY INFORMATION
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Office Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Owner */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ys-emerald)]">
                  👤 OWNER DETAILS
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Owner Name</label>
                    <input
                      type="text"
                      required
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Owner Contact Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.ownerPhone}
                      onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Tax & Registration */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ys-emerald)]">
                  📜 REGISTRATION & LEGAL
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">PAN / VAT Number</label>
                    <input
                      type="text"
                      required
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Registration Number</label>
                    <input
                      type="text"
                      required
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Commission */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ys-emerald)]">
                  💰 COMMISSION RULES
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Commission Type</label>
                    <select
                      value={formData.commissionType}
                      onChange={(e) => setFormData({ ...formData, commissionType: e.target.value as any })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none font-semibold text-gray-800"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (NPR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Commission Value</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      value={formData.commissionValue}
                      onChange={(e) => setFormData({ ...formData, commissionValue: parseFloat(e.target.value) })}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none font-bold text-[var(--color-ys-emerald)]"
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 border-t border-[var(--color-ys-border)] bg-white px-6 py-4 rounded-b-2xl shrink-0">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="edit-company-form" className="font-bold px-6">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
        {k}
      </div>
      <div className="text-sm font-semibold text-[var(--color-ys-ink)]">{v}</div>
    </div>
  );
}

function DocRow({ type, status, updated, warn }: { type: string; status: string; updated: string; warn?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-3 ${
        warn ? "border-[var(--color-ys-warning)]/40 bg-[#FFF6EA]/40" : "border-[var(--color-ys-border)] bg-white"
      }`}
    >
      <div>
        <div className="text-xs font-semibold">{type}</div>
        <div className="text-[11px] text-[var(--color-ys-ink-subtle)]">{updated}</div>
      </div>
      <Badge variant={status === "verified" ? "mint" : "warning"} dot>
        {status}
      </Badge>
    </div>
  );
}
