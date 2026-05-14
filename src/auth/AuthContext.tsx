import bcrypt from 'bcryptjs';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { addBreadcrumb } from '@/lib/sentry';

const SESSION_KEY = 'revert-dashboard-session';

export interface AuthContextValue {
  authenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem(SESSION_KEY);
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          setAuthenticated(true);
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (password: string) => {
    const hash = import.meta.env.VITE_DASHBOARD_PASSWORD_HASH;
    if (!hash) {
      console.error('VITE_DASHBOARD_PASSWORD_HASH não configurado');
      return false;
    }
    const ok = await bcrypt.compare(password, hash);
    if (ok) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          issuedAt: Date.now(),
          expiresAt: Date.now() + 12 * 60 * 60 * 1000,
          nonce: crypto.randomUUID(),
        })
      );
      setAuthenticated(true);
      addBreadcrumb({ category: 'auth', message: 'login_ok' });
    } else {
      addBreadcrumb({ category: 'auth', message: 'login_failed', level: 'warning' });
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
    addBreadcrumb({ category: 'auth', message: 'logout' });
  }, []);

  const value = useMemo(() => ({ authenticated, login, logout, loading }), [authenticated, login, logout, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
