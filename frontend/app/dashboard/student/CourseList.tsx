"use client";
import React, { useEffect, useState } from "react";
import api from "@/services/api";

interface Course {
  id: string;
  name: string;
  code: string;
}

interface CourseListProps {
  studentId: number | undefined;
}

export default function CourseList({ studentId }: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get(
          `/student/${studentId}/courses`,
          { withCredentials: true }
        );
        setCourses(res.data.courses || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [studentId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">My Courses</h2>
      <table className="min-w-full bg-dark border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Course Name</th>
            <th className="py-2 px-4 border-b">Course Code</th>
          </tr>
        </thead>
        <tbody>
          {courses.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="text-center py-4"
              >
                No courses found.
              </td>
            </tr>
          ) : (
            courses.map((course) => (
              <tr key={course.id}>
                <td className="py-2 px-4 border-b">{course.name}</td>
                <td className="py-2 px-4 border-b">{course.code}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
