"use client";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import DepartmentList from "@/components/departmentList";
import SlidingPage from "@/components/slidingPage";
import RoomList from "@/components/RoomList";
import LabList from "@/components/LabList";
import UserList from "@/components/userList";
import SideBar from "@/components/sideBar";
import Navbar from "@/components/navBar";

export default function SuperAdminDashboard() {
  const [loading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeForm, setActiveForm] = useState("showSlidingPage");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background text-black flex flex-col">
      {/* Fixed Navbar at the top */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* Add padding-top to offset the fixed navbar height (adjust if needed) */}
      <div className="flex flex-1 pt-10">
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
        <div className="flex-1 flex flex-col p-4" style={{ minWidth: '1500px' }}>
          <div className="w-full space-y-8">
            {error && activeForm && <div className="text-red-500 text-center">{error}</div>}
            {success && activeForm && <div className="text-green-600 text-center">{success}</div>}
            {activeForm === "showSlidingPage" && (
              <div className="mt-6">
                <SlidingPage sidebarOpen={sidebarOpen} />
              </div>
            )}
            {activeForm === "showDepartments" && (
              <div className="mt-6">
                <DepartmentList sidebarOpen={sidebarOpen} />
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