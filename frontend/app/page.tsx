"use client";

import React from "react";
import Link from "next/link";

// Changed component name from "Home" to "Page" to align with Next.js conventions.
export default function Page() {
  return (
    // The main container is a full-screen hero section.
    // It uses a dark, professional gradient background.
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* A subtle background pattern for visual depth */}
      <div
        className="absolute inset-0 bg-grid-slate-800/[0.2]"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
        }}
      ></div>

      {/* A radial gradient overlay to focus light on the center */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>

      {/* The z-10 class ensures this content appears on top of the background layers. */}
      <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight">
          SUST Central Routine Management System
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Welcome to <span className="font-semibold">SUST-CRMS</span>, the centralized platform to manage, track, and
          resolve campus-related issues efficiently. Join us in creating a more
          responsive and connected university community.
        </p>

        {/* The Call to Action buttons are prominent and clear. */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link href="/register" className="btn btn-primary btn-lg px-8">
            Get Started
          </Link>
          <Link href="/login" className="btn btn-secondary btn-outline btn-lg px-8">
            Sign In
          </Link>
        </div>
      </div>

      {/* A simple footer to add a professional touch */}
      <footer className="absolute bottom-4 text-gray-500 text-sm z-10">
        © {new Date().getFullYear()} SUST-CRMS. All Rights Reserved.
      </footer>
    </main>
  );
}