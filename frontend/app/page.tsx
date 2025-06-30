"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    api.get("/test")
      .then(res => setBackendStatus(res.data?.message || "Connected"))
      .catch(() => setBackendStatus("Not connected"));
  }, []);

  const checkBackend = () => {
    setChecking(true);
    setBackendStatus("Checking...");
    // Set box color to gray by using a temporary status
    setTimeout(() => {
      api.get("/test")
        .then(res => setBackendStatus(res.data?.message || "Connected"))
        .catch(() => setBackendStatus("Not connected"))
        .finally(() => setChecking(false));
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-2xl font-bold">Welcome to SUST-CRMS website.</h1>
      <div className="flex gap-4">
        <Link href="/login" className="btn btn-primary">
          Login
        </Link>
        <Link href="/register" className="btn btn-secondary">
          Register
        </Link>
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <div
          className={
            "px-4 py-2 rounded text-white font-medium transition-colors duration-200 " +
            (checking
              ? "bg-gray-400"
              : backendStatus === "Backend is connected!"
              ? "bg-green-600"
              : backendStatus === "Not connected"
              ? "bg-red-600"
              : "bg-gray-400")
          }
        >
          <span className="text-sm">Backend status: </span>
          <span>
            {checking ? "Checking..." : backendStatus || "Checking..."}
          </span>
        </div>
        <button
          className="btn btn-outline btn-sm mt-2 cursor-pointer"
          onClick={checkBackend}
          disabled={checking}
          style={{ cursor: checking ? 'not-allowed' : 'pointer' }}
        >
          {checking ? "Checking..." : "Check Connection"}
        </button>
      </div>
    </div>
  );
}
