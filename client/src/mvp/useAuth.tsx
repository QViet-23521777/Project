import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";
import type { User } from "./models";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "se113_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        setState({ user, token, loading: false });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setState((s) => ({ ...s, loading: false }));
      }
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  // Fetch current user if we have a token
  useEffect(() => {
    if (state.token && !state.user) {
      api
        .me()
        .then((res) => {
          setState((s) => ({ ...s, user: res.user }));
        })
        .catch(() => {
          // Token invalid, clear it
          localStorage.removeItem(STORAGE_KEY);
          setState({ user: null, token: null, loading: false });
        });
    }
  }, [state.token, state.user]);

  const login = async (username: string, password: string) => {
    const res = await api.login(username, password);
    const { user, token } = res;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    setState({ user, token, loading: false });
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, token: null, loading: false });
  };

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}