import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { Badge, Button, Card, Input } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { formatNpr } from "../../lib/api";
import { DEFAULT_CANCEL_POLICY, DEFAULT_PAYMENT_METHODS } from "@yatrasewa/shared-types";

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const [params] = useSearchParams();
  const seats = (params.get("seats") ?? "A1,A2").split(",");
  const [selectedMethod, setSelectedMethod] = useState("esewa");
  const [agree, setAgree] = useState(true);
  const [countdown] = useState({ minutes: 9, seconds: 42 });
  const fare = 2900;
  const convenienceFee = 40;
  const yatraDiscount = -54; // 2% intro discount
  const total = fare * seats.length + convenienceFee + yatraDiscount;

  function handlePay() {
    // Simulate successful payment after a beat
    setTimeout(() => {
      window.location.href = `/payment/success?pnr=YS-GR3N-POKBKK&method=${selectedMethod}`;
    }, 200);
  }

  return (
    <div className="min-h-screen bg-[var(--color-ys-canvas)] pb-10">
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        {/* Top bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ys-ink-subtle)]">Fare summary</div>
            <h1 className="text-2xl font-bold text-[var(--color-ys-deep-pine)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Confirm booking</h1>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--color-ys-mint-tint)] px-3 py-2 text-sm font-semibold text-[var(--color-ys-emerald)]">
            <Icons.ClockIcon size={16} /> Hold for {String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {/* Trip snapshot */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]"><Icons.BusIcon size={22} /></div>
                <div className="flex-1">
                  <div className="font-bold">Greenline Travels · AC Deluxe Express</div>
                  <div className="text-xs text-[var(--color-ys-ink-muted)]">Kathmandu → Pokhara · 14 Sep, 07:00 AM - 01:30 PM · {seats.length} passengers</div>
                </div>
                <Badge variant="mint" dot>LIVE</Badge>
              </div>
              <div className="mt-3 rounded-md bg-[var(--color-ys-canvas)] p-3 text-xs text-[var(--color-ys-ink-muted)]">
                <div className="flex justify-between"><span>Seats {seats.sort().join(", ")}</span><span className="font-semibold text-[var(--color-ys-ink)]">{formatNpr(fare * seats.length)}</span></div>
                <div className="mt-1 text-[10px]">Sorakhutte Pickup · 06:45 AM</div>
              </div>
            </Card>

            {/* Passenger details */}
            <Card className="p-5">
              <div className="mb-3 text-sm font-bold">Passenger details</div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Contact phone *" leadingIcon={<Icons.PhoneIcon size={16} />} defaultValue="9841000007" />
                <Input label="Email (optional)" leadingIcon={<span className="text-sm">✉️</span>} placeholder="you@example.com" />
                {seats.map((s, i) => (
                  <div key={s} className="md:col-span-2 rounded-lg border border-[var(--color-ys-border)] p-3">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--color-ys-emerald)]">Passenger {i + 1} · Seat {s}</span>
                    </div>
                    <div className="grid gap-2 md:grid-cols-3">
                      <Input label="Full name" defaultValue={i === 0 ? "Aayush Shrestha" : ""} />
                      <Input label="Age" defaultValue={i === 0 ? "28" : ""} />
                      <label className="block text-xs font-semibold text-[var(--color-ys-ink-muted)]">
                        Gender
                        <select className="mt-1.5 h-11 w-full rounded-[var(--radius-btn)] border border-[var(--color-ys-border)] bg-white px-3 text-sm">
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-md bg-[var(--color-ys-mint-tint)] p-2 text-[11px] text-[var(--color-ys-emerald)]">
                🎉 Coupon <b>FESTIVE2026</b> applied: {formatNpr(54)} saved
              </div>
            </Card>

            {/* Payment methods */}
            <Card className="p-5">
              <div className="mb-3 text-sm font-bold">Choose payment method</div>
              <div className="space-y-2">
                {DEFAULT_PAYMENT_METHODS.map((m) => {
                  const isSelected = selectedMethod === m.id;
                  return (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-btn)] border p-3 transition ${isSelected ? "border-[var(--color-ys-emerald)] bg-[var(--color-ys-mint-tint)]" : "border-[var(--color-ys-border)] bg-white hover:border-[var(--color-ys-mint)]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <PaymentIcon id={m.iconKey} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{m.name}</span>
                            {m.badge && <Badge variant="mint">{m.badge}</Badge>}
                          </div>
                          <div className="text-[11px] text-[var(--color-ys-ink-muted)]">{m.tagline}</div>
                        </div>
                      </div>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${isSelected ? "border-[var(--color-ys-emerald)] bg-[var(--color-ys-emerald)]" : "border-[var(--color-ys-border)]"}`}>
                        {isSelected && <Icons.CheckIcon size={12} className="text-white" />}
                      </span>
                      <input type="radio" name="method" value={m.id} checked={isSelected} onChange={() => setSelectedMethod(m.id)} className="hidden" />
                    </label>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-[var(--color-ys-ink-subtle)]">
                🔒 Your payment information is encrypted and processed securely by trusted Nepali payment gateways.
              </p>
            </Card>
          </div>

          {/* Right: total */}
          <div className="space-y-4">
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between text-sm font-bold">Price Breakdown</div>
              <div className="space-y-1.5 text-sm">
                <Row label={`Base fare (${seats.length} seats)`} val={formatNpr(fare * seats.length)} />
                <Row label="Convenience fee" val={formatNpr(convenienceFee)} />
                <Row label="YatraPoints discount" val={`- ${formatNpr(Math.abs(yatraDiscount))}`} accent />
                <Row label="Platform fee" val={formatNpr(0)} />
              </div>
              <div className="my-3 h-px bg-[var(--color-ys-border)]" />
              <div className="flex items-center justify-between text-base font-bold">
                <span>Total</span>
                <span className="tabular-npr text-[var(--color-ys-deep-pine)]">{formatNpr(total)}</span>
              </div>
              <label className="mt-3 flex items-start gap-2 text-[11px] text-[var(--color-ys-ink-muted)]">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-[var(--color-ys-emerald)]" />
                I agree to the cancellation policy and terms of service.
              </label>
              <Button size="xl" fullWidth className="mt-3" disabled={!agree} onClick={handlePay}>
                Pay {formatNpr(total)}
              </Button>
              <div className="mt-3 rounded-md bg-[var(--color-ys-canvas)] p-2 text-[11px] text-[var(--color-ys-ink-subtle)]">
                Instant confirmation via SMS to <b>9841000007</b>. QR e-ticket will be emailed.
              </div>
            </Card>

            <Card className="p-4 text-xs text-[var(--color-ys-ink-muted)]">
              <div className="mb-1 font-semibold text-[var(--color-ys-warning)]">⚠ Cancellation reminder</div>
              <p>{DEFAULT_CANCEL_POLICY[3]!.label}: no refund. See policy on trip page for full slabs.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, val, accent }: { label: string; val: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--color-ys-ink-muted)]">{label}</span>
      <span className={`tabular-npr ${accent ? "text-[var(--color-ys-emerald)]" : ""}`}>{val}</span>
    </div>
  );
}

function PaymentIcon({ id }: { id: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    esewa: { bg: "#08976B", text: "#fff", label: "eS" },
    khalti: { bg: "#5C2D91", text: "#fff", label: "K" },
    fonepay: { bg: "#D7282F", text: "#fff", label: "FP" },
    connectips: { bg: "#1E40AF", text: "#fff", label: "NCHL" },
  };
  const s = styles[id] ?? { bg: "#4A505C", text: "#fff", label: "?" };
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] font-bold text-sm" style={{ background: s.bg, color: s.text }}>{s.label}</div>
  );
}
