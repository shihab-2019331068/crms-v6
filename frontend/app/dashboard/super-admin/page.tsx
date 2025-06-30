"use client";
import { useState } from "react";


import DepartmentList from "@/components/departmentList";
import RoomList from "@/components/RoomList";
import LabList from "@/components/LabList";
import UserList from "@/components/userList";

export default function SuperAdminDashboard() {
  const [loading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeForm, setActiveForm] = useState(""); // Track active form or list
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-64 h-screen flex-shrink-0 flex flex-col justify-between sidebar-dark shadow-lg p-4 sticky top-0">
          {/* Top Section */}
          <div className="space-y-4">
            <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showDepartments"); setError(""); setSuccess(""); }} disabled={loading}>Show All Departments</button>
            <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showRooms"); setError(""); setSuccess(""); }} disabled={loading}>Show All Rooms</button>
            <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showUsers"); setError(""); setSuccess(""); }} disabled={loading}>Show All Users</button>
            <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showLabs"); setError(""); setSuccess(""); }} disabled={loading}>Show All Labs</button>
          </div>
          {/* Bottom Section */}
          <div>
            <button
              className="btn btn-error btn-sm w-full cursor-pointer custom-bordered-btn"
              onClick={() => {
                window.location.href = '/login';
              }}
            >
              Logout
            </button>
          </div>
        </aside>
      )}
      {/* Main Content */}
      <div className={`flex-1 flex flex-col p-4 ${sidebarOpen ? 'ml-0' : 'ml-0'}`} style={{ minWidth: '1500px' }}>
        <button
          className="btn btn-outline btn-sm w-32 cursor-pointer custom-bordered-btn mb-4"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        </button>
        <h1 className="text-2xl font-bold mb-6">Welcome to SUST-CRMS, Mr. Super Admin</h1>
        <div className="w-full space-y-8">
          {error && activeForm && <div className="text-red-500 text-center">{error}</div>}
          {success && activeForm && <div className="text-green-600 text-center">{success}</div>}
          {activeForm === "showDepartments" && (
            <div className="mt-6">
              <DepartmentList />
            </div>
          )}
          {activeForm === "showRooms" && (
            <div className="mt-6">
              <RoomList />
            </div>
          )}
          {activeForm === "showUsers" && (
            <div className="mt-6">
              <UserList />
            </div>
          )}
          {activeForm === "showLabs" && (
            <div className="mt-6">
              <LabList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}