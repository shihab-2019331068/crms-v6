// app/(auth)/login/page.tsx

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/AuthForm";
import api from "@/services/api";

// 1. Define the validation schema with Zod
const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

// Infer the TypeScript type from the schema
export type LoginSchemaType = z.infer<typeof LoginSchema>;

interface AxiosError {
  response?: { data?: { message?: string } };
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  // 2. Setup react-hook-form
  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  // 3. The submission handler receives validated data
  async function handleLogin(data: LoginSchemaType) {
    setServerError("");
    setLoading(true);
    try {
      const res = await api.post("/login", data, { withCredentials: true });
      const { role, email } = res.data;
      login({ role, email });

      // Use a switch statement for cleaner redirection
      switch (role) {
        case "student":
          router.push("/dashboard/student");
          break;
        case "teacher":
          router.push("/dashboard/teacher");
          break;
        case "department_admin":
          router.push("/dashboard/department-admin");
          break;
        case "super_admin":
          router.push("/dashboard/super-admin");
          break;
        default:
          router.push("/");
          break;
      }
    } catch (err) {
      const axiosErr = err as AxiosError;
      setServerError(axiosErr?.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-gray-100">
      <AuthForm
        type="login"
        form={form}
        loading={loading}
        serverError={serverError}
        onSubmit={form.handleSubmit(handleLogin)}
      />
    </div>
  );
}