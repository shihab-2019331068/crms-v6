// AuthForm.tsx - shared form logic for login/register (to be implemented)
import React, { useState } from "react";
import Link from "next/link";
import { isNonEmpty } from "@/utils/validators";

interface LoginProps {
  type: "login";
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  loading: boolean;
  error: string;
}

interface RegisterProps {
  type: "register";
  onSubmit: (data: { name: string; email: string; password: string; confirmPassword: string; role: string; department: string }) => Promise<void>;
  loading: boolean;
  error: string;
  departments: { id: string; name: string }[];
}

type AuthFormProps = LoginProps | RegisterProps;

type LoginFormState = { email: string; password: string };
type RegisterFormState = { name: string; email: string; password: string; confirmPassword: string; role: string; department: string; session: string };

export default function AuthForm(props: AuthFormProps) {
  const [loginForm, setLoginForm] = useState<LoginFormState>({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState<RegisterFormState>({ name: "", email: "", password: "", confirmPassword: "", role: "", department: "", session: "" });
  // const [error, setError] = useState(""); // Removed local error state

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    if (props.type === "login") {
      setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    } else {
      setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (props.type === "login") {
      await props.onSubmit(loginForm);
    } else {
      // Custom validation for super_admin: department not required, session required for student
      if (
        !isNonEmpty(registerForm.name) ||
        !isNonEmpty(registerForm.email) ||
        !isNonEmpty(registerForm.password) ||
        !isNonEmpty(registerForm.confirmPassword) ||
        !isNonEmpty(registerForm.role) ||
        (registerForm.role !== "super_admin" && !isNonEmpty(registerForm.department)) ||
        (registerForm.role === "student" && !isNonEmpty(registerForm.session))
      ) {
        return;
      }
      await props.onSubmit(registerForm);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-3 bg-dark">
      {props.type === "register" && (
        <input name="name" type="text" placeholder="Full Name" value={registerForm.name} onChange={handleChange} className="input input-bordered w-full" required />
      )}
      <input name="email" type="email" placeholder="Email" value={props.type === "login" ? loginForm.email : registerForm.email} onChange={handleChange} className="input input-bordered w-full" required />
      <input name="password" type="password" placeholder="Password" value={props.type === "login" ? loginForm.password : registerForm.password} onChange={handleChange} className="input input-bordered w-full" required />
      {props.type === "register" && (
        <>
          <input name="confirmPassword" type="password" placeholder="Confirm Password" value={registerForm.confirmPassword} onChange={handleChange} className="input input-bordered w-full" required />
          <select name="role" value={registerForm.role} onChange={handleChange} className="input input-bordered w-full bg-gray-800 text-white" required>
            <option value="">Select Role</option>
            <option value="super_admin">Super Admin</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="department_admin">Department Admin</option>
          </select>
          <select name="department" value={registerForm.department} onChange={handleChange} className="input input-bordered w-full bg-gray-800 text-white" required={registerForm.role !== "super_admin"} disabled={registerForm.role === "super_admin"}>
            <option value="">Select Department</option>
            {props.type === "register" && props.departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {registerForm.role === "student" && (
            <input name="session" type="text" placeholder="Session (e.g. 2019-2020)" value={registerForm.session} onChange={handleChange} className="input input-bordered w-full" required />
          )}
        </>
      )}
      {props.error && <div className="text-red-500 text-center mb-2">{props.error}</div>}
      <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn w-full" disabled={props.loading}>
        {props.loading ? "Loading..." : props.type === "login" ? "Login" : "Register"}
      </button>
      <div className="text-center text-sm text-gray-400 mt-2">
        {props.type === "login" ? (
          <span>Don&apos;t have an account? <Link href="/register" className="text-blue-400 hover:underline">Sign Up</Link></span>
        ) : (
          <span>Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Login</Link></span>
        )}
      </div>
    </form>
  );
}
