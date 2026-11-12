import { useSearchParams } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { Button, Card, Badge } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { QRCodeSVG } from "qrcode.react";

export default function BookingSuccessPage() {
  const [params] = useSearchParams();
  const pnr = params.get("pnr") ?? "YS-GR3N-POKBKK";
  const method = params.get("method") ?? "esewa";
  return (
    <div className="min-h-screen bg-[var(--color-ys-canvas)]">
      <TopNav />
      <div className="mx-auto max-w-xl px-4 py-10 md:px-6">
        <Card className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l4.5 4.5L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-ys-deep-pine)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Booking confirmed</h1>
          <p className="mt-1 text-sm text-[var(--color-ys-ink-muted)]">Your ticket has been booked successfully. An SMS with the PNR has been sent to your phone.</p>

          <div className="mt-5 rounded-xl border border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] p-5 text-left">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]"><Icons.BusIcon size={18} /></div>
                <div>
                  <div className="text-sm font-bold">Greenline Travels</div>
                  <div className="text-[11px] text-[var(--color-ys-ink-muted)]">AC Deluxe · BA 2 KHA 4512</div>
                </div>
              </div>
              <Badge variant="mint" dot>CONFIRMED</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold tabular-npr">07:00 AM</div>
                <div className="text-[11px] text-[var(--color-ys-ink-muted)]">Kathmandu</div>
              </div>
              <div className="flex flex-col items-center justify-center text-[var(--color-ys-ink-subtle)]">
                <span className="text-[10px]">6h 30m</span>
                <Icons.ArrowRightIcon size={14} />
              </div>
              <div>
                <div className="text-lg font-bold tabular-npr">01:30 PM</div>
                <div className="text-[11px] text-[var(--color-ys-ink-muted)]">Pokhara</div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-[var(--color-ys-border)]">
                <QRCodeSVG value={`yatrasewa://verify/${pnr}`} size={140} bgColor="#fff" fgColor="#08976B" />
              </div>
            </div>
            <div className="mt-2 text-center">
              <div className="text-[11px] text-[var(--color-ys-ink-subtle)]">PNR</div>
              <div className="font-bold tracking-wider tabular-npr" style={{ fontFamily: "'Inter', monospace" }}>{pnr}</div>
              <div className="mt-1 text-[11px] text-[var(--color-ys-ink-muted)]">Seats <b>A1, A2</b> · Boarding <b>Sorakhutte</b> · Platform <b>3B</b></div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 text-left text-xs text-[var(--color-ys-ink-muted)]">
            <p className="flex items-start gap-2">
              <Icons.TicketIcon size={14} className="mt-0.5 text-[var(--color-ys-emerald)]" />
              Show this QR at the bus gate. The conductor will scan it to verify your ticket.
            </p>
            <p className="flex items-start gap-2">
              <Icons.BellIcon size={14} className="mt-0.5 text-[var(--color-ys-emerald)]" />
              You'll receive an SMS alert when your bus is 1.5 km from your pickup point.
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[var(--color-ys-warning)]">💳</span>
              Paid via <b className="uppercase">{method}</b>. Refunds process within 24 hours to source.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button size="lg" fullWidth variant="outline" className="gap-1"><Icons.PrinterIcon size={16} /> View digital ticket</Button>
            <a className="flex-1" href="/"><Button size="lg" fullWidth className="gap-1">Back to home <Icons.ArrowRightIcon size={16} /></Button></a>
          </div>
        </Card>
      </div>
    </div>
  );
}
