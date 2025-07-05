// components/AuthForm.tsx

import React from "react";
import Link from "next/link";
import { UseFormReturn, FieldErrors } from "react-hook-form";
import { LoginSchemaType } from "@/app/login/page"; // Assuming login is in app/(auth)/login
import { RegisterSchemaType } from "@/app/register/page"; // Assuming register is in app/(auth)/register

interface Department {
  id: string;
  name: string;
}

// A generic Input component for reuse
const FormInput = ({ name, label, type = "text", register, errors, ...props }: any) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <input
      id={name}
      type={type}
      {...register(name)}
      {...props}
      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]?.message as string}</p>}
  </div>
);

// A generic Select component for reuse
const FormSelect = ({ name, label, register, errors, children, ...props }: any) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <select
      id={name}
      {...register(name)}
      {...props}
      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </select>
    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]?.message as string}</p>}
  </div>
);

interface CommonAuthProps {
  loading: boolean;
  serverError: string;
  onSubmit: (e: React.FormEvent) => void;
}

interface LoginAuthProps extends CommonAuthProps {
  type: "login";
  form: UseFormReturn<LoginSchemaType>;
}

interface RegisterAuthProps extends CommonAuthProps {
  type: "register";
  form: UseFormReturn<RegisterSchemaType>;
  departments: Department[];
  role: string;
}

type AuthFormProps = LoginAuthProps | RegisterAuthProps;

export default function AuthForm(props: AuthFormProps) {
  const { type, form, loading, serverError, onSubmit } = props;
  const { register, formState: { errors } } = form;

  const isRegister = type === "register";

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
      <div>
        <h2 className="text-center text-3xl font-extrabold text-white">
          {isRegister ? "Create an Account" : "SUST CRMS Login"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300">
                Sign in
              </Link>
            </>
          ) : (
            <>
              Or{' '}
              <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300">
                create a new account
              </Link>
            </>
          )}
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={onSubmit}>
        {isRegister && (
          <FormInput name="name" label="Full Name" register={register} errors={errors} placeholder="John Doe" />
        )}

        <FormInput name="email" label="Email Address" type="email" register={register} errors={errors} placeholder="user@university.edu" />
        <FormInput name="password" label="Password" type="password" register={register} errors={errors} placeholder="••••••••" />

        {isRegister && (
          <>
            <FormInput name="confirmPassword" label="Confirm Password" type="password" register={register} errors={errors} placeholder="••••••••" />

            <FormSelect name="role" label="Select Your Role" register={register} errors={errors}>
              <option value="">Select a role...</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="department_admin">Department Admin</option>
              <option value="super_admin">Super Admin</option>
            </FormSelect>

            {props.role === "student" && (
              <FormInput name="session" label="Session" register={register} errors={errors} placeholder="e.g., 2021-2025" />
            )}

            {props.role && props.role !== "super_admin" && (
              <FormSelect name="departmentId" label="Select Department" register={register} errors={errors} disabled={!props.role || props.role === "super_admin"}>
                <option value="">Select a department...</option>
                {props.departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </FormSelect>
            )}
          </>
        )}

        {serverError && <p className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded-md">{serverError}</p>}
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 disabled:bg-slate-500 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}