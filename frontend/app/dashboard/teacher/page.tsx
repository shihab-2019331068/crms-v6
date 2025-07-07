"use client";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import SlidingPage from "@/pages/slidingPage";
import ManagingPage from "@/pages/managingPage";
import ViewingPage from "@/pages/viewingPageT";
import SideBar from "@/components/sideBar";
import { useEffect } from "react";

export default function TeacherDashboard() {
  const [loading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeForm, setActiveForm] = useState("showViewingPage");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
            {activeForm === "showViewingPage" && (
              <div className="mt-6">
                <ViewingPage sidebarOpen={sidebarOpen} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}