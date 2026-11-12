import { useState } from "react";
import { Badge, Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { formatNpr } from "../../lib/api";

export default function BookiePosPage() {
  const [route, setRoute] = useState("KTM-PKR");
  const [seats, setSeats] = useState<string[]>(["B1"]);
  const [passenger, setPassenger] = useState({ name: "Bikash Adhikari", phone: "9841000006", gender: "male", age: 32 });
  const floatBalance = 24810;
  const fare = 2900 * seats.length;
  const commission = Math.round(fare * 0.10);
  const net = fare - commission;

  function issue() {
    alert(`Ticket issued from counter. Printing 80mm thermal receipt... \n${seats.join(", ")} - ${formatNpr(fare)}`);
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-ys-canvas)]">
      <aside className="hidden w-56 border-r border-[var(--color-ys-border)] bg-white p-3 md:block">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-ys-deep-pine)] text-white"><Icons.PrinterIcon size={18} /></div>
          <div>
            <div className="text-sm font-bold">Bookie POS</div>
            <div className="text-[10px] text-[var(--color-ys-ink-muted)]">BKI-KTM-001 · New Buspark</div>
          </div>
        </div>
        <nav className="space-y-1 text-xs">
          {[
            { k: "pos", label: "New Booking", icon: Icons.TicketIcon, hotkey: "F2", active: true },
            { k: "tickets", label: "Today's Tickets", icon: Icons.BookmarkIcon, hotkey: "F4" },
            { k: "reprint", label: "Reprint Last", icon: Icons.PrinterIcon, hotkey: "F8" },
            { k: "cancel", label: "Cancel Booking", icon: Icons.XIcon, hotkey: "F9" },
            { k: "float", label: "Float Passbook", icon: Icons.WalletIcon },
            { k: "reports", label: "End of Day", icon: Icons.ChartIcon },
          ].map((n: any) => {
            const I = n.icon;
            return (
              <a key={n.k} href="#" className={`flex items-center justify-between rounded-md px-3 py-2 ${n.active ? "bg-[var(--color-ys-mint-tint)] font-bold text-[var(--color-ys-emerald)]" : "text-[var(--color-ys-ink-muted)]"}`}>
                <span className="flex items-center gap-2"><I size={14} />{n.label}</span>
                {n.hotkey && <kbd className="rounded bg-[var(--color-ys-canvas)] px-1 py-0.5 text-[10px] font-mono">{n.hotkey}</kbd>}
              </a>
            );
          })}
        </nav>
        <div className="mt-6 rounded-lg bg-[var(--color-ys-mint-tint)] p-3 text-xs">
          <div className="flex items-center gap-1 font-bold text-[var(--color-ys-emerald)]"><Icons.WalletIcon size={12} /> Float balance</div>
          <div className="mt-1 text-xl font-bold tabular-npr">{formatNpr(floatBalance)}</div>
          <div className="mt-1 text-[10px] text-[var(--color-ys-ink-muted)]">Limit: Rs.1,00,000 · Low balance alert at 20%</div>
        </div>
      </aside>

      <main className="flex-1 p-5">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-ys-deep-pine)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-ys-emerald)]" /> Counter POS</span>
            </h1>
            <div className="text-xs text-[var(--color-ys-ink-muted)]">High-speed booking · 80mm thermal ESC/POS · F2 new · F4 list · F8 reprint · F9 cancel</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="mint" dot>PRINTER ONLINE</Badge>
            <Badge variant="mint" dot>SYNCED</Badge>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Card className="p-4">
              <div className="mb-3 grid grid-cols-3 gap-3 text-sm">
                <label>
                  <span className="text-[10px] font-bold uppercase text-[var(--color-ys-ink-subtle)]">Route</span>
                  <select value={route} onChange={(e) => setRoute(e.target.value)} className="mt-1 h-10 w-full rounded-[var(--radius-btn)] border border-[var(--color-ys-border)] px-2 font-semibold">
                    <option value="KTM-PKR">Kathmandu → Pokhara · 07:00</option>
                    <option value="KTM-CTW">Kathmandu → Chitwan · 08:30</option>
                    <option value="PKR-KTM">Pokhara → Kathmandu · 10:00</option>
                    <option value="KTM-JKR">Kathmandu → Janakpur · 06:30</option>
                  </select>
                </label>
                <label>
                  <span className="text-[10px] font-bold uppercase text-[var(--color-ys-ink-subtle)]">Travel date</span>
                  <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1 h-10 w-full rounded-[var(--radius-btn)] border border-[var(--color-ys-border)] px-2 font-semibold" />
                </label>
                <label>
                  <span className="text-[10px] font-bold uppercase text-[var(--color-ys-ink-subtle)]">Bus</span>
                  <select className="mt-1 h-10 w-full rounded-[var(--radius-btn)] border border-[var(--color-ys-border)] px-2 font-semibold">
                    <option>Greenline · BA 2 KHA 4512 · 38/40</option>
                    <option>Sajha · NA 2 KHA 1105 · 18/30</option>
                  </select>
                </label>
              </div>
              {/* Seat grid for counter (simplified) */}
              <div className="rounded-lg border border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] p-3">
                <div className="mb-2 flex items-center justify-between text-[11px] text-[var(--color-ys-ink-muted)]">
                  <span className="font-semibold">Tap seats to select (hotkeys 1-40 in POS mode)</span>
                  <span className="flex gap-2"><Legend c="#fff" s="#E2E7ED" l="Available"/><Legend c="#E8FFEE" s="#08976B" l="Selected"/><Legend c="#F1F3F6" s="#C92D30" l="Sold"/></span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {"DRV A1 A2 A3 A4 B1 B2 B3 B4 C1 C2 C3 C4 D1 D2 D3 D4 E1 E2 E3 E4".split(" ").map((l, i) => {
                    const booked = ["A3", "A4", "C3", "B2", "D1"].includes(l);
                    const isDriver = l === "DRV";
                    const selected = seats.includes(l);
                    return (
                      <button key={l} disabled={isDriver || booked}
                        onClick={() => setSeats((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l])}
                        className={`h-8 rounded text-[10px] font-bold tabular-npr transition ${
                          isDriver ? "bg-[#F1F3F6] text-[var(--color-ys-ink-subtle)]" :
                          booked ? "cursor-not-allowed bg-[#F1F3F6] text-[var(--color-ys-danger)] line-through" :
                          selected ? "bg-[var(--color-ys-emerald)] text-white ring-2 ring-[var(--color-ys-emerald)]/30" :
                          "bg-white border border-[var(--color-ys-border)] text-[var(--color-ys-ink-muted)] hover:border-[var(--color-ys-emerald)]"
                        }`}
                      >{l}</button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="mb-3 text-sm font-bold">Passenger details</div>
              <div className="grid gap-3 md:grid-cols-2">
                <PosField label="Full name *" value={passenger.name} onChange={(v) => setPassenger({ ...passenger, name: v })} />
                <PosField label="Mobile *" value={passenger.phone} onChange={(v) => setPassenger({ ...passenger, phone: v })} />
                <label className="block">
                  <span className="text-[10px] font-bold uppercase text-[var(--color-ys-ink-subtle)]">Gender</span>
                  <div className="mt-1 flex gap-1">
                    {["male", "female", "other"].map((g) => (
                      <button key={g} onClick={() => setPassenger({ ...passenger, gender: g })} className={`flex-1 h-10 rounded-[var(--radius-btn)] text-sm font-semibold capitalize ${passenger.gender === g ? "bg-[var(--color-ys-emerald)] text-white" : "border border-[var(--color-ys-border)] bg-white text-[var(--color-ys-ink-muted)]"}`}>{g}</button>
                    ))}
                  </div>
                </label>
                <PosField label="Age" value={String(passenger.age)} onChange={(v) => setPassenger({ ...passenger, age: parseInt(v) || 0 })} />
              </div>
            </Card>
          </div>

          {/* Right: cart */}
          <div className="space-y-3">
            <Card className="bg-[var(--color-ys-deep-pine)] p-5 text-white">
              <div className="flex items-center justify-between text-xs">
                <span>Total payable</span>
                <Badge variant="mint">CASH · FLOAT</Badge>
              </div>
              <div className="mt-1 text-4xl font-bold tabular-npr">{formatNpr(fare)}</div>
              <div className="mt-3 space-y-1 text-xs text-white/70">
                <Row l={`${seats.length} seat(s) @ Rs.2,900`} v={formatNpr(fare)} />
                <Row l={`Counter commission 10% (earned)`} v={`+ ${formatNpr(commission)}`} pos />
                <Row l={`Float deducted (net)`} v={`- ${formatNpr(net)}`} />
              </div>
              <Button size="xl" fullWidth className="mt-4 bg-white text-[var(--color-ys-deep-pine)] hover:bg-white/90" onClick={issue}>
                F2 · Issue & Print <Icons.PrinterIcon size={16} />
              </Button>
              <div className="mt-2 text-center text-[10px] text-white/50">
                <Icons.WalletIcon size={10} className="inline" /> After sale float balance: {formatNpr(floatBalance - net)}
              </div>
            </Card>

            <Card className="p-4 text-xs">
              <div className="mb-2 font-bold flex items-center gap-1 text-[var(--color-ys-info)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ys-info)]" /> ESC/POS 80mm ready
              </div>
              <div className="rounded-md border border-dashed border-[var(--color-ys-border)] p-3 font-mono text-[10px] leading-relaxed text-[var(--color-ys-ink-muted)]">
                <div className="text-center font-bold">YatraSewa · BKI-KTM-001</div>
                <div className="text-center">New Buspark, Kathmandu</div>
                <div className="my-1 border-t border-dashed" />
                <div>PNR: YS-XXXX-XXXXXX</div>
                <div>KTM → PKR · Greenline BA2KHA4512</div>
                <div>14 Sep · 07:00 · Seat B1</div>
                <div>Passenger: Bikash Adhikari</div>
                <div>Phone: 9841000006</div>
                <div className="my-1 border-t border-dashed" />
                <div className="flex justify-between"><span>Total:</span><b>{formatNpr(2900)}</b></div>
                <div className="text-center mt-1 text-[8px]">** Thank you for booking with YatraSewa **</div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function PosField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase text-[var(--color-ys-ink-subtle)]">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-10 w-full rounded-[var(--radius-btn)] border border-[var(--color-ys-border)] bg-white px-3 text-sm font-semibold outline-none focus:border-[var(--color-ys-emerald)]" />
    </label>
  );
}

function Row({ l, v, pos }: { l: string; v: string; pos?: boolean }) {
  return (
    <div className="flex justify-between">
      <span>{l}</span>
      <span className={`tabular-npr ${pos ? "text-[var(--color-ys-mint)]" : ""}`}>{v}</span>
    </div>
  );
}

function Legend({ c, s, l }: { c: string; s: string; l: string }) {
  return <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm border" style={{ background: c, borderColor: s }} />{l}</span>;
}
