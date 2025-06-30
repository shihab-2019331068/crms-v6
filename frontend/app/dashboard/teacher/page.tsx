"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

import FinalRoutine from "./finalRoutine";
import CourseList from "./CourseList";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeForm, setActiveForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [teacherId, setTeacherId] = useState<number | undefined>(undefined);

  // Fetch user details and set departmentId
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.email) return;
      try {
        setLoading(true);
        const res = await api.get(`/user/${encodeURIComponent(user.email)}`);
        setLoading(false);
        if (res.data && res.data.role === "teacher") {
          setDepartmentId(res.data.departmentId);
          setTeacherId(res.data.id);
        } else {
          setDepartmentId(undefined);
          setTeacherId(undefined);
        }
      } catch {
        setDepartmentId(undefined);
        setTeacherId(undefined);
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
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showCourses"); setError(""); setSuccess(""); }} disabled={loading}>Show My Courses</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("viewFinalRoutine"); setError(""); setSuccess(""); }} disabled={loading}>View Dept Routine</button>
        </div>
        <div>
          <button className="btn btn-error btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { window.location.href = '/login'; }}>Logout</button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
        <h1 className="text-2xl font-bold mb-6">Welcome to SUST-CRMS, Mr. Teacher</h1>
        <div className="w-full max-w-xl space-y-8">
          {error && <div className="text-red-500 text-center">{error}</div>}
          {success && <div className="text-green-600 text-center">{success}</div>}
          {/* Lists */}
          {activeForm === "showCourses" && (
            <div className="mt-6">
              <CourseList teacherId={teacherId} />
            </div>
          )}
          {activeForm === "viewFinalRoutine" && (
            <div className="mt-6">
              <FinalRoutine departmentId={departmentId} teacherId={teacherId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
