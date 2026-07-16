import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, tokenStore } from '../lib/api';
import type { AuthResponse, AuthUser, RegisterInput } from '../types/api';

interface AuthState {
  user: AuthUser | null;
  /** True while restoring a session from a stored token on first load. */
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from a stored token on first load.
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: AuthUser }>('/api/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string): Promise<AuthUser> {
    const res = await api.post<AuthResponse>('/api/auth/login', { email, password });
    tokenStore.set(res.token);
    setUser(res.user);
    return res.user;
  }

  async function register(input: RegisterInput): Promise<AuthUser> {
    const res = await api.post<AuthResponse>('/api/auth/register', input);
    tokenStore.set(res.token);
    setUser(res.user);
    return res.user;
  }

  function logout() {
    tokenStore.clear();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
