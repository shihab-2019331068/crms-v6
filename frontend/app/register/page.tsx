// register.tsx - Register page (to be implemented)

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import api from "@/services/api";
import { isValidEmail, isStrongPassword, isNonEmpty } from "@/utils/validators";

interface AxiosError {
  response?: { data?: { message?: string } };
}

interface Department {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const router = useRouter();

  useEffect(() => {
    api.get("/departments").then((res: { data: Department[] }) => setDepartments(res.data)).catch(() => setDepartments([]));
  }, []);

  async function handleRegister(data: { name: string; email: string; password: string; confirmPassword: string; role: string; department: string; session?: string }) {
    setError("");
    // Custom validation for super_admin: department not required, session required for student
    if (
      !isNonEmpty(data.name) ||
      !isNonEmpty(data.email) ||
      !isNonEmpty(data.password) ||
      !isNonEmpty(data.confirmPassword) ||
      !isNonEmpty(data.role) ||
      (data.role !== "super_admin" && !isNonEmpty(data.department)) ||
      (data.role === "student" && !isNonEmpty(data.session ?? ''))
    ) {
      setError("All fields are required.");
      return;
    }
    if (!isValidEmail(data.email)) {
      setError("Invalid email address.");
      return;
    }
    if (!isStrongPassword(data.password)) {
      setError("Password must be at least 6 characters and contain letters and numbers.");
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/signup", data);
      router.push("/login");
    } catch (err) {
      const axiosErr = err as AxiosError;
      setError(axiosErr?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="w-full max-w-lg p-8 rounded-lg shadow-lg bg-[#18181b] border border-[#27272a]">
        <AuthForm type="register" onSubmit={handleRegister} loading={loading} error={error} departments={departments} />
      </div>
    </div>
  );
}
