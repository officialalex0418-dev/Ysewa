import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@yatrasewa/ui";
import { Icons } from "@yatrasewa/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [tab, setTab] = useState<"signin" | "signup">(initialMode);

  // Login sub-modes
  const [loginIdentType, setLoginIdentType] = useState<"number" | "email">("number");
  const [numberAuthMode, setNumberAuthMode] = useState<"password" | "otp">("password");

  // Form inputs - Login
  const [loginNumber, setLoginNumber] = useState("9841000008");
  const [loginEmail, setLoginEmail] = useState("user@yatrasewa.com.np");
  const [loginPassword, setLoginPassword] = useState("A@S@user##234");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Form inputs - Sign Up
  const [signupName, setSignupName] = useState("");
  const [signupNumber, setSignupNumber] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (loginIdentType === "number" && numberAuthMode === "otp" && !otpSent) {
        const phone = loginNumber.replace(/\D/g, "").slice(-10);
        if (phone.length !== 10) { setError("Please enter a valid 10-digit mobile number"); setLoading(false); return; }
        await api.post("/auth/send-otp", { phone, purpose: "login" });
        setOtpSent(true);
        setLoading(false);
        return;
      }

      if (loginIdentType === "number" && numberAuthMode === "otp" && otpSent) {
        const phone = loginNumber.replace(/\D/g, "").slice(-10);
        const { data } = await api.post("/auth/verify-otp", { phone, otp: otpCode });
        setAuth(data);
        redirectByRole(data.user.role);
        return;
      }

      const payload = loginIdentType === "number"
        ? { phone: loginNumber.replace(/\D/g, "").slice(-10), password: loginPassword }
        : { email: loginEmail, password: loginPassword };

      const { data } = await api.post("/auth/login", payload);
      setAuth(data);
      redirectByRole(data.user.role);
    } catch (err: any) {
      // Graceful demo fallback
      if (!err.response || err.code === "ERR_NETWORK") {
        const emailLower = loginEmail.toLowerCase();
        const isSuperAdmin =
          (loginIdentType === "email" && (emailLower.includes("admin") || emailLower.includes("sadmin"))) ||
          (loginIdentType === "number" && (loginNumber.endsWith("00001") || loginNumber === "9841000001"));

        const isOperator =
          (loginIdentType === "email" && emailLower.includes("operator")) ||
          (loginIdentType === "number" && (loginNumber.endsWith("00002") || loginNumber === "9841000002"));

        const isBookie =
          (loginIdentType === "email" && emailLower.includes("bookie")) ||
          (loginIdentType === "number" && (loginNumber.endsWith("00003") || loginNumber === "9841000003"));

        const role = isSuperAdmin
          ? "SUPER_ADMIN"
          : isOperator
          ? "OPERATOR_OWNER"
          : isBookie
          ? "BOOKIE_COUNTER"
          : "CUSTOMER";

        const mockUser = {
          id: isSuperAdmin ? "admin-id" : "demo-user-id",
          fullName: isSuperAdmin
            ? "YatraSewa Super Admin"
            : loginIdentType === "email"
            ? loginEmail.split("@")[0]
            : "Demo User",
          phone: loginIdentType === "number" ? loginNumber : null,
          email: loginIdentType === "email" ? loginEmail : null,
          role,
          operatorId: isOperator ? "op-1" : null,
          counterId: isBookie ? "c-1" : null,
        };

        setAuth({
          accessToken: "mock-jwt-token",
          refreshToken: "mock-refresh-token",
          user: mockUser,
        });
        redirectByRole(role);
        return;
      }
      setError(err?.response?.data?.title ?? err?.response?.data?.message ?? "Authentication failed");
    }
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const phone = signupNumber ? signupNumber.replace(/\D/g, "").slice(-10) : undefined;
      const { data } = await api.post("/auth/register", {
        fullName: signupName,
        phone,
        email: signupEmail || undefined,
        password: signupPassword,
      });
      setAuth(data);
      navigate("/");
    } catch (err: any) {
      if (!err.response || err.code === "ERR_NETWORK") {
        setAuth({
          accessToken: "mock-jwt-token",
          refreshToken: "mock-refresh-token",
          user: {
            id: "demo-user-id",
            fullName: signupName || "New User",
            phone: signupNumber || null,
            email: signupEmail || null,
            role: "CUSTOMER",
            operatorId: null,
            counterId: null,
          },
        });
        navigate("/");
        return;
      }
      setError(err?.response?.data?.title ?? err?.response?.data?.message ?? "Registration failed");
    }
    setLoading(false);
  }

  function redirectByRole(role: string) {
    if (role === "SUPER_ADMIN" || role === "SYSTEM_EMPLOYEE") navigate("/admin/dashboard");
    else if (role === "OPERATOR_OWNER" || role === "OPERATOR_STAFF" || role === "DRIVER" || role === "CONDUCTOR") navigate("/operator/dashboard");
    else if (role === "BOOKIE_COUNTER") navigate("/bookie/pos");
    else navigate("/");
  }

  function handleGoogleAuth() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuth({
        accessToken: "mock-google-token",
        refreshToken: "mock-refresh-token",
        user: {
          id: "google-user-id",
          fullName: "Google Traveler",
          phone: null,
          email: "traveler@gmail.com",
          role: "CUSTOMER",
          operatorId: null,
          counterId: null,
        },
      });
      navigate("/");
    }, 800);
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Hero Banner */}
      <div className="relative hidden flex-1 overflow-hidden md:block" style={{ background: "linear-gradient(135deg, #0B2B44 0%, #175C49 60%, #08976B 100%)" }}>
        <div className="absolute inset-0 p-12 text-white flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Icons.BusIcon width={24} height={24} />
            </div>
            <div>
              <div className="text-lg font-bold">YatraSewa</div>
              <div className="text-[10px] text-white/60">Seamless transit across Nepal</div>
            </div>
          </div>
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Book smart.<br />Travel confidently.
            </h2>
            <p className="mt-3 text-white/80">From Kathmandu to Kakarbhitta, eSewa to ConnectIPS — YatraSewa brings verified operators, live GPS tracking and instant refunds to every Nepali highway.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs text-white/80 pb-4">
            <div><div className="text-2xl font-bold text-white">4.8★</div>Trusted by 2M+ travelers</div>
            <div><div className="text-2xl font-bold text-white">1200+</div>Verified operators</div>
            <div><div className="text-2xl font-bold text-white">75</div>Highway corridors</div>
          </div>
        </div>
      </div>

      {/* Right: Auth Form matching exact wireframe */}
      <div className="flex flex-1 items-center justify-center bg-[var(--color-ys-canvas)] p-6">
        <Card className="w-full max-w-md p-8 shadow-[var(--shadow-modal)]">

          {/* Top Sign In / Sign Up Tabs */}
          <div className="mb-6 flex rounded-xl border border-[var(--color-ys-border)] bg-[var(--color-ys-canvas)] p-1">
            <button
              onClick={() => { setTab("signin"); setError(null); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${tab === "signin" ? "bg-white text-[var(--color-ys-emerald)] shadow-sm" : "text-[var(--color-ys-ink-muted)] hover:text-black"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("signup"); setError(null); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${tab === "signup" ? "bg-white text-[var(--color-ys-emerald)] shadow-sm" : "text-[var(--color-ys-ink-muted)] hover:text-black"}`}
            >
              Sign Up
            </button>
          </div>

          {tab === "signup" ? (
            /* 1. Sign Up Form */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-ys-deep-pine)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Create a Account</h1>
                <p className="text-xs text-[var(--color-ys-ink-muted)] mt-0.5">Join YatraSewa for instant bookings & GPS tracking</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-ys-ink-subtle)] mb-1">FULL NAME</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-[var(--color-ys-border)] bg-gray-200/70 px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-ys-ink-subtle)] mb-1">NUMBER</label>
                <div className="flex h-11 items-center gap-2 rounded-lg border border-[var(--color-ys-border)] bg-gray-200/70 px-3 focus-within:border-[var(--color-ys-emerald)] focus-within:bg-white">
                  <span className="text-sm font-semibold text-[var(--color-ys-ink-muted)]">+977</span>
                  <input
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={signupNumber}
                    onChange={(e) => setSignupNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="flex-1 bg-transparent text-sm font-semibold outline-none tabular-npr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-ys-ink-subtle)] mb-1">EMAIL</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[var(--color-ys-border)] bg-gray-200/70 px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-ys-ink-subtle)] mb-1">PASSWORD</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-[var(--color-ys-border)] bg-gray-200/70 px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-ys-ink-subtle)] mb-1">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-[var(--color-ys-border)] bg-gray-200/70 px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:bg-white"
                />
              </div>

              {error && <div className="rounded-md bg-[#FCE8E8] p-2 text-xs text-[var(--color-ys-danger)]">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-lg bg-[#76E447] text-sm font-bold text-black shadow-sm hover:bg-[#68d13b] transition flex items-center justify-center cursor-pointer"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>

              <div className="text-center text-xs text-[var(--color-ys-ink-muted)] pt-2">
                Already have an account.{" "}
                <button type="button" onClick={() => { setTab("signin"); setError(null); }} className="font-bold text-blue-600 hover:underline">
                  Sign-In
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[var(--color-ys-border)]"></div>
                <span className="flex-shrink mx-4 text-xs text-[var(--color-ys-ink-subtle)]">Or</span>
                <div className="flex-grow border-t border-[var(--color-ys-border)]"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                className="h-11 w-full rounded-lg border border-[var(--color-ys-border)] bg-white text-sm font-semibold text-[var(--color-ys-ink)] shadow-sm hover:bg-[var(--color-ys-canvas)] transition"
              >
                Continue With Google
              </button>
            </form>
          ) : (
            /* 2. Sign In Form with Number / Email selector */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-ys-deep-pine)] text-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Login</h1>
              </div>

              {/* Number | Email segment toggle */}
              <div className="flex rounded-lg bg-gray-300/70 p-1">
                <button
                  type="button"
                  onClick={() => { setLoginIdentType("number"); setNumberAuthMode("password"); setOtpSent(false); setError(null); }}
                  className={`flex-1 rounded-md py-1.5 text-xs font-bold transition ${loginIdentType === "number" ? "bg-amber-300 text-black shadow-xs" : "text-gray-700"}`}
                >
                  Number
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginIdentType("email"); setOtpSent(false); setError(null); }}
                  className={`flex-1 rounded-md py-1.5 text-xs font-bold transition ${loginIdentType === "email" ? "bg-amber-300 text-black shadow-xs" : "text-gray-700"}`}
                >
                  Email
                </button>
              </div>

              {loginIdentType === "number" ? (
                /* Number Login Fields */
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-ys-ink-subtle)] mb-1">NUMBER</label>
                    <div className="flex h-11 items-center gap-2 rounded-lg border border-[var(--color-ys-border)] bg-gray-200/70 px-3 focus-within:border-[var(--color-ys-emerald)] focus-within:bg-white">
                      <span className="text-sm font-semibold text-[var(--color-ys-ink-muted)]">+977</span>
                      <input
                        type="tel"
                        placeholder="98XXXXXXXX"
                        value={loginNumber}
                        onChange={(e) => setLoginNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        required
                        className="flex-1 bg-transparent text-sm font-semibold outline-none tabular-npr"
                      />
                    </div>
                  </div>

                  {numberAuthMode === "password" ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-ys-ink-subtle)] mb-1">PASSWORD</label>
                      <input
                        type="password"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="h-11 w-full rounded-lg border border-[var(--color-ys-border)] bg-gray-200/70 px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:bg-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-ys-ink-subtle)] mb-1">{otpSent ? "ENTER OTP" : "REQUEST OTP"}</label>
                      {otpSent ? (
                        <input
                          type="text"
                          placeholder="6-digit OTP"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          required
                          className="h-11 w-full rounded-lg border border-[var(--color-ys-border)] bg-gray-200/70 px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:bg-white font-mono tracking-widest text-center text-lg"
                        />
                      ) : (
                        <div className="text-xs text-[var(--color-ys-ink-muted)] py-1">Click below to receive a 6-digit verification code on your mobile.</div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-lg bg-[#76E447] text-sm font-bold text-black shadow-sm hover:bg-[#68d13b] transition flex items-center justify-center cursor-pointer mt-2"
                  >
                    {loading ? "Please wait..." : (numberAuthMode === "otp" && !otpSent ? "Request OTP" : "Login")}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => { setNumberAuthMode(numberAuthMode === "password" ? "otp" : "password"); setOtpSent(false); setError(null); }}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      {numberAuthMode === "password" ? "Login Using OTP" : "Login Using Password"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Email Login Fields */
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-ys-ink-subtle)] mb-1">EMAIL</label>
                    <input
                      type="email"
                      placeholder="Email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="h-11 w-full rounded-lg border border-[var(--color-ys-border)] bg-gray-200/70 px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-ys-ink-subtle)] mb-1">PASSWORD</label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="h-11 w-full rounded-lg border border-[var(--color-ys-border)] bg-gray-200/70 px-3 text-sm outline-none focus:border-[var(--color-ys-emerald)] focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-lg bg-[#76E447] text-sm font-bold text-black shadow-sm hover:bg-[#68d13b] transition flex items-center justify-center cursor-pointer mt-2"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </div>
              )}

              {error && <div className="rounded-md bg-[#FCE8E8] p-2 text-xs text-[var(--color-ys-danger)]">{error}</div>}

              <div className="text-center text-xs text-[var(--color-ys-ink-muted)] pt-2">
                New to YatraSewa ?{" "}
                <button type="button" onClick={() => { setTab("signup"); setError(null); }} className="font-bold text-blue-600 hover:underline">
                  Create an account
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[var(--color-ys-border)]"></div>
                <span className="flex-shrink mx-4 text-xs text-[var(--color-ys-ink-subtle)]">Or</span>
                <div className="flex-grow border-t border-[var(--color-ys-border)]"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                className="h-11 w-full rounded-lg border border-[var(--color-ys-border)] bg-white text-sm font-semibold text-[var(--color-ys-ink)] shadow-sm hover:bg-[var(--color-ys-canvas)] transition"
              >
                Continue With Google
              </button>

              <div className="mt-4 pt-4 border-t border-[var(--color-ys-border)]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ys-ink-subtle)] mb-2 text-center">
                  Quick Role Login Demo
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentType("email");
                      setLoginEmail("sadmin@yatrasewa.com.np");
                      setLoginPassword("Admin@123");
                      setAuth({
                        accessToken: "mock-admin-token",
                        refreshToken: "mock-refresh-token",
                        user: {
                          id: "admin-1",
                          fullName: "YatraSewa Super Admin",
                          phone: "9841000001",
                          email: "sadmin@yatrasewa.com.np",
                          role: "SUPER_ADMIN",
                          operatorId: null,
                          counterId: null,
                        },
                      });
                      navigate("/admin/dashboard");
                    }}
                    className="rounded-lg bg-[var(--color-ys-deep-pine)] py-2 text-xs font-bold text-white hover:brightness-125 transition"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentType("email");
                      setLoginEmail("operator@yatrasewa.com.np");
                      setLoginPassword("Operator@123");
                      setAuth({
                        accessToken: "mock-operator-token",
                        refreshToken: "mock-refresh-token",
                        user: {
                          id: "op-1",
                          fullName: "Greenline Operator",
                          phone: "9841000002",
                          email: "operator@yatrasewa.com.np",
                          role: "OPERATOR_OWNER",
                          operatorId: "op-1",
                          counterId: null,
                        },
                      });
                      navigate("/operator/dashboard");
                    }}
                    className="rounded-lg bg-[var(--color-ys-emerald)] py-2 text-xs font-bold text-white hover:brightness-110 transition"
                  >
                    Operator
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentType("email");
                      setLoginEmail("user@yatrasewa.com.np");
                      setLoginPassword("User@123");
                      setAuth({
                        accessToken: "mock-user-token",
                        refreshToken: "mock-refresh-token",
                        user: {
                          id: "user-1",
                          fullName: "Traveler User",
                          phone: "9841000008",
                          email: "user@yatrasewa.com.np",
                          role: "CUSTOMER",
                          operatorId: null,
                          counterId: null,
                        },
                      });
                      navigate("/");
                    }}
                    className="rounded-lg bg-gray-200 py-2 text-xs font-bold text-gray-800 hover:bg-gray-300 transition"
                  >
                    Customer
                  </button>
                </div>
              </div>
            </form>
          )}

        </Card>
      </div>
    </div>
  );
}
