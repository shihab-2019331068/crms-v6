// app/(auth)/register/page.tsx

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AuthForm from "@/components/AuthForm";
import api from "@/services/api";

// 1. Define the complex validation schema with Zod
const RegisterSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
    role: z.enum(["student", "teacher", "department_admin", "super_admin"], {
        errorMap: () => ({ message: "Please select a valid role." }),
    }),
    session: z.string().optional(),
    departmentId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // Show error on the confirm password field
  })
  .refine((data) => data.role !== "student" || !!data.session, {
      message: "Session is required for students.",
      path: ["session"],
  })
  .refine((data) => data.role === "super_admin" || !!data.departmentId, {
      message: "Department is required for this role.",
      path: ["departmentId"],
  });

// Infer the TypeScript type from the schema
export type RegisterSchemaType = z.infer<typeof RegisterSchema>;

interface AxiosError {
  response?: { data?: { message?: string } };
}

interface Department {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const router = useRouter();

  // 2. Setup react-hook-form
  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: undefined, departmentId: "", session: "" },
  });

  // Watch the 'role' field to conditionally render other fields
  const role = form.watch("role");

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await api.get("/departments");
        setDepartments(res.data);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        setDepartments([]);
      }
    }
    fetchDepartments();
  }, []);
  
  // 3. The submission handler receives validated data
  async function handleRegister(data: RegisterSchemaType) {
    setServerError("");
    setLoading(true);
    try {
      // The data is already validated by Zod, no need for extra checks here.
      console.log("data: ", data);
      await api.post("/signup", data);
      // Optionally, show a success message before redirecting
      router.push("/login?status=registered");
    } catch (err) {
      const axiosErr = err as AxiosError;
      setServerError(axiosErr?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-gray-100 py-12">
      <AuthForm
        type="register"
        form={form}
        loading={loading}
        serverError={serverError}
        departments={departments}
        role={role} // Pass the watched role to the form
        onSubmit={form.handleSubmit(handleRegister)}
      />
    </div>
  );
}