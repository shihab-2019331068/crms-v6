import React, { useEffect, useState, useRef } from 'react';
import api from "@/services/api";
import { Department } from "./departmentList";
import { useAuth } from "@/context/AuthContext";

export interface Course {
  id: number;
  name: string;
  code: string;
  credits: number;
  departmentId: number;
  teacherName?: string;
  department?: { acronym: string };
  forDept?: number;
  forDepartment?: { acronym: string };
  type?: string;
}

interface TeacherCoursesProps {
  teacherId: number;
}

const TeacherCourses: React.FC<TeacherCoursesProps> = ({ teacherId }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [tableWidth, setTableWidth] = useState(1);
    useEffect(() => {
      const handleResize = () => {
        setTableWidth (window.innerWidth - 300);
      };
  
      window.addEventListener('resize', handleResize);
      handleResize(); // Log initial size
  
      return () => window.removeEventListener('resize', handleResize);
    }, []);

  // Fetch courses
  const fetchCourses = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/teacher/${teacherId}/courses`, {
        withCredentials: true,
      });
      const sortedCourses = res.data.sort((a: Course, b: Course) => a.code.localeCompare(b.code));
      setCourses(sortedCourses);
    } catch {
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get<Department[]>("/departments", { withCredentials: true });
        setDepartments(res.data);
      } catch {
        setError("Failed to fetch departments");
      }
    };
    fetchCourses();
    fetchDepartments();
  }, [fetchCourses]);

  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedCourses = courses.slice(startIndex, endIndex);
  
  return (
    <div>
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      <div className="text-xl font-bold mb-4"> {"Teacher's Courses"} </div>
      <div>
        <table className="border" style={{ width: tableWidth }}>
          <thead>
            <tr>
              <th className="px-2 py-1">ID</th>
              <th className="px-2 py-1">Name</th>
              <th className="px-2 py-1">Code</th>
              <th className="px-2 py-1">Credits</th>
              <th className="px-2 py-1">Course Type</th>
              <th className="px-2 py-1">Department</th>
              <th className="px-2 py-1">Offered To</th>
            </tr>
          </thead>
          <tbody>
            {displayedCourses.map((course) => {
              const departmentAcronym = course.department?.acronym || departments.find(dep => dep.id === course.departmentId)?.acronym || '';
              const forDepartmentAcronym = course.forDepartment?.acronym || departments.find(dep => dep.id === course.forDept)?.acronym || '';
              return (
                <tr key={course.id} className="border">
                  <td className="px-2 py-1">{course.id}</td>
                  <td className="px-2 py-1">{course.name}</td>
                  <td className="px-2 py-1">{course.code}</td>
                  <td className="px-2 py-1">{course.credits}</td>
                  <td className="px-2 py-1">{course.type}</td>
                  <td className="px-2 py-1">{departmentAcronym}</td>
                  <td className="px-2 py-1">{forDepartmentAcronym}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="mt-4 space-x-2">
        <button
          className="btn btn-outline btn-sm mb-4 cursor-pointer custom-bordered-btn"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            className={`btn btn-outline btn-sm mb-4 cursor-pointer custom-bordered-btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="btn btn-outline btn-sm mb-4 cursor-pointer custom-bordered-btn"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TeacherCourses;
