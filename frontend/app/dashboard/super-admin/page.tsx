"use client";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import DepartmentList from "@/components/departmentList";
import SlidingPage from "@/pages/slidingPage";
import ManagingPage from "@/pages/managingPage";
import RoomList from "@/components/RoomList";
import LabList from "@/components/LabList";
import UserList from "@/components/userList";
import SideBar from "@/components/sideBar";
import { useEffect } from "react";

export default function SuperAdminDashboard() {
  const [loading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeForm, setActiveForm] = useState("showManagingPage");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-background text-black">
      {/* Sidebar */}
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
          {error && activeForm && <div className="p-4 text-red-500 text-center">{error}</div>}
          {success && activeForm && <div className="p-4 text-green-600 text-center">{success}</div>}
          
          {activeForm === "showSlidingPage" && (
            <SlidingPage />
          )}
          {activeForm === "showManagingPage" && (
            <ManagingPage />
          )}
          {/* Note: sidebarOpen prop is removed from these components as well */}
          {activeForm === "showRooms" && (
            <RoomList />
          )}
          {activeForm === "showUsers" && (
            <UserList />
          )}
          {activeForm === "showLabs" && (
            <LabList />
          )}
        </div>
      </main>
    </div>
  );
}