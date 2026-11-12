import { useState } from "react";
import { AdminShell } from "../../components/AdminSidebar";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";

export interface SystemEmployee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  systemRole: "Super Admin" | "System Employee" | "Support Lead" | "Finance Admin" | "Compliance Officer";
  department: string;
  status: "active" | "inactive";
  createdAt: string;
}

const INITIAL_EMPLOYEES: SystemEmployee[] = [
  {
    id: "EMP-001",
    fullName: "Surendra Shrestha",
    email: "surendra@yatrasewa.com.np",
    phone: "+977 9851011111",
    systemRole: "Super Admin",
    department: "Executive & Platform",
    status: "active",
    createdAt: "10 Jan 2023",
  },
  {
    id: "EMP-002",
    fullName: "Kriti Sharma",
    email: "kriti.sharma@yatrasewa.com.np",
    phone: "+977 9841222333",
    systemRole: "Finance Admin",
    department: "Finance & Settlements",
    status: "active",
    createdAt: "15 Apr 2023",
  },
  {
    id: "EMP-003",
    fullName: "Rohan Pokharel",
    email: "rohan.p@yatrasewa.com.np",
    phone: "+977 9801333444",
    systemRole: "Support Lead",
    department: "Customer Operations",
    status: "active",
    createdAt: "01 Aug 2023",
  },
  {
    id: "EMP-004",
    fullName: "Anil Karki",
    email: "anil.karki@yatrasewa.com.np",
    phone: "+977 9811444555",
    systemRole: "Compliance Officer",
    department: "Legal & Operator KYC",
    status: "inactive",
    createdAt: "12 Nov 2023",
  },
];

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<SystemEmployee[]>(INITIAL_EMPLOYEES);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<SystemEmployee | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    systemRole: "System Employee" as SystemEmployee["systemRole"],
    department: "Operations",
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const newEmp: SystemEmployee = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      systemRole: form.systemRole,
      department: form.department,
      status: "active",
      createdAt: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
    };
    setEmployees([newEmp, ...employees]);
    setIsAddOpen(false);
    resetForm();
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEmp) return;
    setEmployees(
      employees.map((emp) =>
        emp.id === selectedEmp.id
          ? {
              ...emp,
              fullName: form.fullName,
              email: form.email,
              phone: form.phone,
              systemRole: form.systemRole,
              department: form.department,
            }
          : emp
      )
    );
    setIsEditOpen(false);
  }

  function toggleStatus(id: string) {
    setEmployees(
      employees.map((emp) =>
        emp.id === id ? { ...emp, status: emp.status === "active" ? "inactive" : "active" } : emp
      )
    );
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this system employee?")) {
      setEmployees(employees.filter((emp) => emp.id !== id));
    }
  }

  function openEdit(emp: SystemEmployee) {
    setSelectedEmp(emp);
    setForm({
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone,
      systemRole: emp.systemRole,
      department: emp.department,
    });
    setIsEditOpen(true);
  }

  function resetForm() {
    setForm({
      fullName: "",
      email: "",
      phone: "",
      systemRole: "System Employee",
      department: "Operations",
    });
  }

  return (
    <AdminShell activeKey="employees">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
            Internal Staff & Access Control Management
          </div>
          <h1
            className="text-2xl font-bold text-[var(--color-ys-deep-pine)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            System Employees
          </h1>
        </div>

        <Button
          size="md"
          className="font-bold"
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
        >
          <span className="mr-1">+</span> Create Employee
        </Button>
      </div>

      <Card className="overflow-hidden p-0 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] text-left text-[11px] uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">
              <th className="p-3">Employee</th>
              <th className="p-3">Contact</th>
              <th className="p-3">System Role</th>
              <th className="p-3">Department</th>
              <th className="p-3">Date Joined</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className="border-b border-[var(--color-ys-border)] last:border-0 hover:bg-[var(--color-ys-canvas)]/50 transition"
              >
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-ys-mint-tint)] font-bold text-xs text-[var(--color-ys-emerald)]">
                      {emp.fullName.split(" ").map((w) => w[0]).join("")}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--color-ys-deep-pine)]">{emp.fullName}</div>
                      <div className="text-[11px] text-[var(--color-ys-ink-subtle)]">{emp.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-xs font-semibold">{emp.email}</div>
                  <div className="text-[11px] text-[var(--color-ys-ink-muted)]">{emp.phone}</div>
                </td>
                <td className="p-3 font-semibold text-xs text-[var(--color-ys-emerald)]">
                  {emp.systemRole}
                </td>
                <td className="p-3 text-xs text-[var(--color-ys-ink-muted)]">{emp.department}</td>
                <td className="p-3 text-xs text-[var(--color-ys-ink-muted)]">{emp.createdAt}</td>
                <td className="p-3">
                  <Badge variant={emp.status === "active" ? "mint" : "danger"} dot>
                    {emp.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => openEdit(emp)}
                      className="rounded-md border border-[var(--color-ys-border)] p-1.5 text-xs text-[var(--color-ys-ink-muted)] hover:bg-white"
                      title="Edit Employee"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(emp.id)}
                      className={`rounded-md border px-2 py-1 text-xs font-bold ${
                        emp.status === "active"
                          ? "border-amber-300 text-amber-700 bg-amber-50"
                          : "border-emerald-300 text-emerald-700 bg-emerald-50"
                      }`}
                    >
                      {emp.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="rounded-md border border-red-200 p-1.5 text-xs text-red-600 hover:bg-red-50"
                      title="Delete Employee"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Create Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[var(--color-ys-deep-pine)] mb-4">Create System Employee</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sujan Shrestha"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="sujan@yatrasewa.com.np"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+977 98XXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">System Role</label>
                  <select
                    value={form.systemRole}
                    onChange={(e) => setForm({ ...form, systemRole: e.target.value as any })}
                    className="w-full h-10 rounded-lg border px-3 text-sm outline-none bg-white"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="System Employee">System Employee</option>
                    <option value="Support Lead">Support Lead</option>
                    <option value="Finance Admin">Finance Admin</option>
                    <option value="Compliance Officer">Compliance Officer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="font-bold">
                  Save Employee
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[var(--color-ys-deep-pine)] mb-4">
              Edit Employee Access
            </h2>
            <form onSubmit={handleEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">System Role</label>
                  <select
                    value={form.systemRole}
                    onChange={(e) => setForm({ ...form, systemRole: e.target.value as any })}
                    className="w-full h-10 rounded-lg border px-3 text-sm outline-none bg-white"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="System Employee">System Employee</option>
                    <option value="Support Lead">Support Lead</option>
                    <option value="Finance Admin">Finance Admin</option>
                    <option value="Compliance Officer">Compliance Officer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="font-bold">
                  Update Employee
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
