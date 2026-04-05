import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { authAPI } from "../services/api";

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  role: "regular" | "professional";
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (data: {
    username: string;
    email: string;
    password: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => Boolean(localStorage.getItem("token"))
  );
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeAuth = useCallback((token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    setError(null);
  }, []);

  const register = useCallback(
    async (data: {
      username: string;
      email: string;
      password: string;
      latitude?: number;
      longitude?: number;
      locationName?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authAPI.register(data);
        storeAuth(response.token, {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          displayName: response.user.displayName,
          role: response.user.role as "regular" | "professional",
          latitude: response.user.latitude,
          longitude: response.user.longitude,
          locationName: response.user.locationName,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeAuth]
  );

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authAPI.login({ email, password });
        storeAuth(response.token, {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          displayName: response.user.displayName,
          role: response.user.role as "regular" | "professional",
          latitude: response.user.latitude,
          longitude: response.user.longitude,
          locationName: response.user.locationName,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeAuth]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        register,
        login: handleLogin,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
