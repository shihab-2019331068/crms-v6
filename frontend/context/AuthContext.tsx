"use client";

// AuthContext.tsx - user authentication context (to be implemented)

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  email: string;
  role: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: Omit<User, "token">) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("crms_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (user: Omit<User, "token">) => {
    setUser({ ...user, token: "" }); // token is not used anymore
    localStorage.setItem("crms_user", JSON.stringify({ ...user, token: "" }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crms_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Update AuthContextType and User type
declare module "@/context/AuthContext" {
  interface User {
    email: string;
    role: string;
    token?: string;
  }
  interface AuthContextType {
    user: User | null;
    login: (user: Omit<User, "token">) => void;
    logout: () => void;
  }
}
