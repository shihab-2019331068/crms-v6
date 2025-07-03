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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="min-h-screen bg-background text-black flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="sticky top-10">
          <SideBar
            activeForm={activeForm}
            setActiveForm={setActiveForm}
            loading={loading}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            setError={setError}
            setSuccess={setSuccess}
          />
        </div>
        {/* Main Content */}
        <div className="">
          <div className="w-full">
            {error && activeForm && <div className="text-red-500 text-center">{error}</div>}
            {success && activeForm && <div className="text-green-600 text-center">{success}</div>}
            {activeForm === "showSlidingPage" && (
              <div className="mt-6">
                <SlidingPage sidebarOpen={sidebarOpen} />
              </div>
            )}
            {activeForm === "showManagingPage" && (
              <div className="mt-6">
                <ManagingPage sidebarOpen={sidebarOpen} />
              </div>
            )}
            {activeForm === "showRooms" && (
              <div className="mt-6">
                <RoomList sidebarOpen={sidebarOpen} />
              </div>
            )}
            {activeForm === "showUsers" && (
              <div className="mt-6">
                <UserList sidebarOpen={sidebarOpen} />
              </div>
            )}
            {activeForm === "showLabs" && (
              <div className="mt-6">
                <LabList sidebarOpen={sidebarOpen} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}