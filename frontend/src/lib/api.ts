import axios from "axios";

const TOKEN_KEY = "yatrasewa_access_token";
const REFRESH_KEY = "yatrasewa_refresh_token";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";
export const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

export function getAccessToken() { return localStorage.getItem(TOKEN_KEY); }
export function setAccessToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
export function setRefreshToken(t: string) { localStorage.setItem(REFRESH_KEY, t); }
export function clearAuth() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_KEY); }

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const idem = config.headers["Idempotency-Key"];
  if (!idem && config.method === "post") config.headers["Idempotency-Key"] = crypto.randomUUID();
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      const refresh = localStorage.getItem(REFRESH_KEY);
      if (refresh) {
        err.config._retry = true;
        try {
          const { data } = await axios.post("/api/v1/auth/refresh", { refreshToken: refresh });
          setAccessToken(data.accessToken);
          setRefreshToken(data.refreshToken);
          err.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api.request(err.config);
        } catch {
          clearAuth();
          if (!location.pathname.startsWith("/auth")) location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(err);
  },
);

export function formatNpr(n?: number | string | null): string {
  if (n === undefined || n === null) return "Rs. 0";
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num)) return "Rs. 0";
  return `Rs. ${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatTime(d?: string | Date | null): string {
  if (!d) return "--:--";
  const date = typeof d === "string" ? new Date(d) : d;
  if (!date || isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function formatDuration(minutes: number): string {
  if (!minutes || isNaN(minutes)) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
