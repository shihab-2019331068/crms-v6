"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

import CourseList from "@/components/CourseList";
import SemesterList from "@/components/SemesterList";
import RoomList from "@/components/RoomList";
import TeacherList from "@/components/TeacherList";
import GenerateRoutine from "@/components/generateRoutine";
import FinalRoutine from "@/components/finalRoutine";

export default function DepartmentAdminDashboard() {
  const { user } = useAuth();
  const [activeForm, setActiveForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);

  // Fetch user details and set departmentId
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.email) return;
      try {
        setLoading(true);
        const res = await api.get(`/user/${encodeURIComponent(user.email)}`);
        setLoading(false);
        if (res.data && res.data.role === "department_admin") {
          setDepartmentId(res.data.departmentId);
        } else {
          setDepartmentId(undefined);
        }
      } catch {
        setDepartmentId(undefined);
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [user?.email]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 h-screen flex-shrink-0 flex flex-col justify-between sidebar-dark shadow-lg p-4 sticky top-0">
        <div className="space-y-4 mt-8">
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showCourses"); setError(""); setSuccess(""); }} disabled={loading}>Show All Courses</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showSemesters"); setError(""); setSuccess(""); }} disabled={loading}>Show All Semesters</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showRooms"); setError(""); setSuccess(""); }} disabled={loading}>Show All Rooms</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showTeachers"); setError(""); setSuccess(""); }} disabled={loading}>Show All Teachers</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("generateRoutine"); setError(""); setSuccess(""); }} disabled={loading}>Generate Routine</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("viewFinalRoutine"); setError(""); setSuccess(""); }} disabled={loading}>View Final Routine</button>
        </div>
        <div>
          <button className="btn btn-error btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { window.location.href = '/login'; }}>Logout</button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
        <h1 className="text-2xl font-bold mb-6">Welcome to SUST-CRMS, Mr. Department Admin</h1>
        <div className="w-full space-y-8">
          {error && <div className="text-red-500 text-center">{error}</div>}
          {success && <div className="text-green-600 text-center">{success}</div>}
          {/* Lists */}
          {activeForm === "showCourses" && (
            <div className="mt-6">
              <CourseList departmentId={departmentId} />
            </div>
          )}
          {activeForm === "showSemesters" && (
            <div className="mt-6">
              <SemesterList departmentId={departmentId} />
            </div>
          )}
          {activeForm === "showRooms" && (
            <div className="mt-6">
              <RoomList departmentId={departmentId} />
            </div>
          )}
          {activeForm === "showTeachers" && (
            <div className="mt-6">
              <TeacherList departmentId={departmentId} />
            </div>
          )}
          {activeForm === "generateRoutine" && (
            <div className="mt-6">
              <GenerateRoutine departmentId={departmentId} onSuccess={setSuccess} onError={setError} />
            </div>
          )}
          {activeForm === "viewFinalRoutine" && (
            <div className="mt-6">
              <FinalRoutine departmentId={departmentId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
