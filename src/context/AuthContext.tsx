"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export interface User {
  id: number;
  name: string;
  username: string;
  email: string | null;
  store_id: number | null;
  status: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Auth State from localStorage
  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = localStorage.getItem("pos_auth_token");
        const storedUserJson = localStorage.getItem("pos_auth_user");

        if (storedToken && storedUserJson) {
          setToken(storedToken);
          setUser(JSON.parse(storedUserJson));

          // Verify token status against Laravel backend
          const res = await apiFetch("/v1/auth/me");
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            localStorage.setItem("pos_auth_user", JSON.stringify(data.user));
          } else {
            // Token is invalid/expired
            clearAuth();
          }
        }
      } catch (err) {
        console.error("Failed to restore auth session:", err);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("pos_auth_token");
    localStorage.removeItem("pos_auth_user");
  };

  const login = async (username: string, password: string) => {
    try {
      const res = await apiFetch("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem("pos_auth_token", data.access_token);
        localStorage.setItem("pos_auth_user", JSON.stringify(data.user));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || "Gagal masuk." };
      }
    } catch (err) {
      console.error("Login request error:", err);
      return { success: false, message: "Koneksi ke server gagal. Pastikan backend aktif." };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await apiFetch("/v1/auth/logout", { method: "POST" });
      }
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    // Admins always have access to everything
    if (user.roles.includes("admin")) return true;
    return user.roles.includes(role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // Admins always bypass permission checking
    if (user.roles.includes("admin")) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
