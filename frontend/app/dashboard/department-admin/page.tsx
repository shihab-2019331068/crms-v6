"use client";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import DepartmentList from "@/components/departmentList";
import SlidingPage from "@/pages/slidingPage";
import ManagingPage from "@/pages/managingPage";
import SideBar from "@/components/sideBar";
import { useEffect } from "react";

export default function DepartmentAdminDashboard() {
  const [loading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeForm, setActiveForm] = useState("showManagingPage");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-background text-black">
      {/* Sidebar will have a fixed width and is a flex item */}
      <SideBar
        activeForm={activeForm}
        setActiveForm={setActiveForm}
        loading={loading}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setError={setError}
        setSuccess={setSuccess}
      />
      
      {/* Main Content will grow to fill the remaining space */}
      <main className="flex-1 overflow-y-auto">
        <div className="w-full">
          {error && activeForm && <div className="text-red-500 text-center p-4">{error}</div>}
          {success && activeForm && <div className="text-green-600 text-center p-4">{success}</div>}
          
          {/* Note: The sidebarOpen prop is removed from the pages below */}
          {activeForm === "showSlidingPage" && (
            <SlidingPage />
          )}
          {activeForm === "showManagingPage" && (
            <ManagingPage />
          )}
        </div>
      </main>
    </div>
  );
}