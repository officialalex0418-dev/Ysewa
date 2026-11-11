import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, clearAuth, getAccessToken, setAccessToken, setRefreshToken } from "./api";

interface AuthUser {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  role: string;
  operatorId: string | null;
  counterId: string | null;
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  setAuth: (tokens: { accessToken: string; refreshToken: string; user: AuthUser }) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const USER_KEY = "yatrasewa_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      localStorage.removeItem(USER_KEY);
      setLoading(false);
      return;
    }

    if (token.startsWith("mock-")) {
      setLoading(false);
      return;
    }

    api.get("/me")
      .then((r) => {
        setUser(r.data);
        localStorage.setItem(USER_KEY, JSON.stringify(r.data));
      })
      .catch(() => {
        // Keep cached user session to prevent forced logout on minor network errors
      })
      .finally(() => setLoading(false));
  }, []);

  function setAuth(r: { accessToken: string; refreshToken: string; user: AuthUser }) {
    setAccessToken(r.accessToken);
    setRefreshToken(r.refreshToken);
    setUser(r.user);
    localStorage.setItem(USER_KEY, JSON.stringify(r.user));
  }

  function logout() {
    clearAuth();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, setAuth, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
