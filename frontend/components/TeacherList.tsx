import React, { useEffect, useState } from 'react';
import api from "@/services/api";

import { Course } from "./CourseList";

export interface Teacher {
  id: number;
  name: string;
  email: string;
  departmentId: number;
}

interface TeacherListProps {
  departmentId?: number;
}

const TeacherList: React.FC<TeacherListProps> = ({ departmentId }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedTeacherCourses, setSelectedTeacherCourses] = useState<{ [teacherId: number]: Course[] }>({});
  const [showCoursesFor, setShowCoursesFor] = useState<number | null>(null);

  const fetchTeachers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/dashboard/department-admin/teachers", { withCredentials: true });
      setTeachers(res.data);
      setSuccess("");
    } catch {
      setError("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleShowCourses = async (teacherId: number) => {
    if (showCoursesFor === teacherId) {
      setShowCoursesFor(null);
      return;
    }
    setShowCoursesFor(teacherId);
    if (!selectedTeacherCourses[teacherId]) {
      try {
        const res = await api.get(`/teacher/${teacherId}/courses`, { withCredentials: true });
        const courses: Course[] = res.data.courses || [];
        setSelectedTeacherCourses((prev) => ({ ...prev, [teacherId]: courses }));
      } catch (err) {
        console.error("Error fetching courses for teacher:", teacherId, err);
        setSelectedTeacherCourses((prev) => ({ ...prev, [teacherId]: [] }));
      }
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [departmentId]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Teacher List</h2>
      {loading && <div className="text-red-500 text-center mb-2">Loading...</div>}
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      {success && <div className="text-green-600 text-center mb-2">{success}</div>}
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <React.Fragment key={teacher.id}>
              <tr>
                <td className="border px-4 py-2">{teacher.name}</td>
                <td className="border px-4 py-2">
                  <button
                    className="text-white px-3 py-1 cursor-pointer custom-bordered-btn"
                    onClick={() => handleShowCourses(teacher.id)}
                  >
                    Show Courses
                  </button>
                </td>
              </tr>
              {showCoursesFor === teacher.id && (
                <tr>
                  <td colSpan={2} className="border px-4 py-2">
                    <div className="bg-gray-900 text-white rounded p-4">
                      <strong>Courses:</strong>
                      <ul className="list-disc ml-6">
                        {(selectedTeacherCourses[teacher.id] || []).map((course, idx) => (
                          <li key={idx}>{course.name}</li>
                        ))}
                      </ul>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherList;
