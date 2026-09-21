"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/lib/api/auth";
import type { User } from "@/lib/types/auth";

const TOKEN_KEY = "execflow_token";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, inviteCode: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount: if a token is already in localStorage, validate it against
  // /users/me so a refresh doesn't silently trust an expired/tampered token.
  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .getCurrentUser()
      .then(setUser)
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    window.localStorage.setItem(TOKEN_KEY, response.token);
    setUser(response.user);
    router.push("/dashboard");
  }, [router]);

  const register = useCallback(
    async (email: string, password: string, fullName: string, inviteCode: string) => {
      const response = await authApi.register({ email, password, fullName, inviteCode });
      window.localStorage.setItem(TOKEN_KEY, response.token);
      setUser(response.user);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
