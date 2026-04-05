import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { authAPI } from "../services/api";

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "regular" | "professional";
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  preferredLanguage: "en" | "es";
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
    preferredLanguage?: "en" | "es";
  }) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateLanguagePreference: (language: "en" | "es") => Promise<void>;
  updateUser: (data: {
    displayName?: string;
    avatarUrl?: string;
  }) => Promise<void>;
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
      preferredLanguage?: "en" | "es";
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
          avatarUrl: response.user.avatarUrl || null,
          role: response.user.role as "regular" | "professional",
          latitude: response.user.latitude,
          longitude: response.user.longitude,
          locationName: response.user.locationName,
          preferredLanguage: response.user.preferredLanguage || "en",
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
    async (username: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authAPI.login({ username, password });
        storeAuth(response.token, {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          displayName: response.user.displayName,
          avatarUrl: response.user.avatarUrl || null,
          role: response.user.role as "regular" | "professional",
          latitude: response.user.latitude,
          longitude: response.user.longitude,
          locationName: response.user.locationName,
          preferredLanguage: response.user.preferredLanguage || "en",
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

  const updateLanguagePreference = useCallback(
    async (language: "en" | "es") => {
      setLoading(true);
      setError(null);
      try {
        await authAPI.updateLanguagePreference(language);
        if (user) {
          const updatedUser: User = {
            ...user,
            preferredLanguage: language,
          };
          storeAuth(localStorage.getItem("token") || "", updatedUser);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update language preference";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, storeAuth]
  );

  const updateProfileUser = useCallback(
    async (data: { displayName?: string; avatarUrl?: string }) => {
      setLoading(true);
      setError(null);
      try {
        await authAPI.updateUser(data);
        if (user) {
          const updatedUser: User = {
            ...user,
            displayName: data.displayName ?? user.displayName,
            avatarUrl: data.avatarUrl ?? user.avatarUrl,
          };
          storeAuth(localStorage.getItem("token") || "", updatedUser);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update profile";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, storeAuth]
  );

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
        updateLanguagePreference,
        updateUser: updateProfileUser,
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
