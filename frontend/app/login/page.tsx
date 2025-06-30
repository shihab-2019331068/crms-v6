// login.tsx - Login page (to be implemented)

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import api from "@/services/api";
import { isValidEmail, isNonEmpty } from "@/utils/validators";
import { useAuth } from "@/context/AuthContext";

interface AxiosError {
  response?: { data?: { message?: string } };
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  async function handleLogin(data: { email: string; password: string }) {
    setError("");
    if (!isNonEmpty(data.email) || !isNonEmpty(data.password)) {
      setError("All fields are required.");
      return;
    }
    if (!isValidEmail(data.email)) {
      setError("Invalid email address.");
      return;
    }
    setLoading(true);
    try {
      // Send credentials (cookies) with the request
      const res = await api.post("/login", data, { withCredentials: true });
      const { role, email } = res.data;
      login({ role, email }); // Only pass role and email

      if (role === "student") router.push("/dashboard/student");
      else if (role === "teacher") router.push("/dashboard/teacher");
      else if (role === "department_admin") router.push("/dashboard/department-admin");
      else if (role === "super_admin") router.push("/dashboard/super-admin");
      else router.push("/");
    } catch (err) {
      const axiosErr = err as AxiosError;
      setError(axiosErr?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="w-full max-w-lg p-8 rounded-lg shadow-lg bg-[#18181b] border border-[#27272a]">
        <AuthForm type="login" onSubmit={handleLogin} loading={loading} error={error} />
      </div>
    </div>
  );
}
