import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button, Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export default function OtpPage() {
  const [params] = useSearchParams();
  const phone = params.get("phone") ?? "";
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(42);
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  async function resend() {
    setCountdown(42); setError(null);
    await api.post("/auth/send-otp", { phone, purpose: "login" });
  }

  async function submit() {
    const otp = digits.join("");
    if (otp.length !== 6) return;
    setLoading(true); setError(null);
    try {
      const { data } = await api.post("/auth/verify-otp", { phone, otp });
      setAuth(data);
      const role = data.user?.role;
      if (role === "SUPER_ADMIN" || role === "SYSTEM_EMPLOYEE") navigate("/admin/dashboard");
      else if (role?.startsWith("OPERATOR") || role === "DRIVER" || role === "CONDUCTOR") navigate("/operator/dashboard");
      else if (role === "BOOKIE_COUNTER") navigate("/bookie/pos");
      else navigate("/");
    } catch (e: any) { setError(e?.response?.data?.title ?? "Invalid OTP"); }
    setLoading(false);
  }

  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = d; setDigits(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
    if (next.every((x) => x !== "")) setTimeout(submit, 100);
  }
  function onKey(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-ys-emerald)] p-6">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]"><Icons.PhoneIcon size={26} /></div>
          <h1 className="mt-3 text-2xl font-bold text-[var(--color-ys-deep-pine)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Verify your number</h1>
          <p className="mt-1 text-sm text-[var(--color-ys-ink-muted)]">Code sent to <b>+977 {phone}</b></p>
        </div>

        <div className="mb-2 rounded-lg bg-[var(--color-ys-mint-tint)] p-2 text-center text-[11px] text-[var(--color-ys-emerald)]">
          ✉ Standard SMS rates may apply
        </div>

        <div className="my-5 flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-12 rounded-[8px] border-2 border-[var(--color-ys-border)] bg-white text-center text-2xl font-bold tabular-npr outline-none focus:border-[var(--color-ys-emerald)] focus:ring-2 focus:ring-[var(--color-ys-emerald)]/20"
            />
          ))}
        </div>

        {error && <div className="mb-3 rounded-md bg-[#FCE8E8] p-2 text-xs text-[var(--color-ys-danger)]">{error}</div>}

        <Button size="xl" fullWidth loading={loading} onClick={submit} disabled={digits.some((d) => !d)}>Verify and continue</Button>

        <p className="mt-4 text-center text-xs text-[var(--color-ys-ink-muted)]">
          {countdown > 0 ? (
            <>Resend code in <b className="text-[var(--color-ys-deep-pine)] tabular-npr">0:{String(countdown).padStart(2, "0")}</b></>
          ) : (
            <button onClick={resend} className="font-semibold text-[var(--color-ys-emerald)] hover:underline">Resend OTP</button>
          )}
        </p>

        <button onClick={() => history.back()} className="mt-2 block w-full text-center text-xs text-[var(--color-ys-ink-subtle)] hover:underline">← Change number</button>
      </Card>
    </div>
  );
}
