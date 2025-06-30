import React, { useEffect, useState } from 'react';
import api from "@/services/api";

export interface Semester {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  session: string;
  departmentId: number;
}

interface SemesterListProps {
  departmentId?: number;
}

const SemesterList: React.FC<SemesterListProps> = ({ departmentId }) => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  // Add state for add course form
  const [showAddCourseFormId, setShowAddCourseFormId] = useState<number | null>(null);
  const [addCourseIds, setAddCourseIds] = useState<number[]>([]); // Change addCourseId to addCourseIds for multiple selection
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  const [addCourseError, setAddCourseError] = useState("");
  const [addCourseSuccess, setAddCourseSuccess] = useState("");
  // Extend the course type to include semesterId
  const [courses, setCourses] = useState<{ id: number; name: string; semesterId?: number | null }[]>([]);
  // State for showing courses per semester
  const [showCoursesSemesterId, setShowCoursesSemesterId] = useState<number | null>(null);
  const [semesterCourses, setSemesterCourses] = useState<{ [semesterId: number]: { id: number; name: string }[] }>({});
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState("");
  // State for set session form
  const [showSetSessionId, setShowSetSessionId] = useState<number | null>(null);
  const [sessionInput, setSessionInput] = useState("");
  const [setSessionLoading, setSetSessionLoading] = useState(false);
  const [setSessionError, setSetSessionError] = useState("");
  const [setSessionSuccess, setSetSessionSuccess] = useState("");
  const [removeCourseLoading, setRemoveCourseLoading] = useState(false);
  const [removeCourseError, setRemoveCourseError] = useState("");
  const [removeCourseSuccess, setRemoveCourseSuccess] = useState("");

  
  const [tableWidth, setTableWidth] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      setTableWidth (window.innerWidth - 300);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Log initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRemoveCourseFromSemester = async (semesterId: number, courseId: number) => {
    setRemoveCourseLoading(true);
    setRemoveCourseError("");
    setRemoveCourseSuccess("");
    try {
      await api.delete(`/dashboard/department-admin/semester/${semesterId}/course/${courseId}`, {
        withCredentials: true,
      });
      setRemoveCourseSuccess("Course removed successfully!");
      fetchSemesterCourses(semesterId); // Refresh the list
    } catch (err: unknown) {
      let errorMsg = "Failed to remove course";
      if (err && typeof err === 'object' && 'response' in err &&
          err.response && typeof err.response === 'object' &&
          'data' in err.response && err.response.data &&
          typeof err.response.data === 'object' &&
          'error' in err.response.data) {
        errorMsg = String(err.response.data.error);
      }
      setRemoveCourseError(errorMsg);
    } finally {
      setRemoveCourseLoading(false);
    }
  };

  const fetchSemesters = async () => {
    setLoading(true);
    setError("");
    try {
      const deptId = departmentId;
      const res = await api.get("/dashboard/department-admin/semesters", {
        params: { departmentId: deptId },
        withCredentials: true,
      });
      const sortedSemesters = res.data.sort((a: Semester, b: Semester) => a.name.localeCompare(b.name));
      setSemesters(sortedSemesters);
      setSuccess("");
    } catch {
      setError("Failed to fetch semesters");
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses for dropdown (replace with your API endpoint)
  const fetchCourses = async () => {
    try {
      const deptId = departmentId;
      const res = await api.get("/dashboard/department-admin/courses", {
        params: { departmentId: deptId },
        withCredentials: true,
      });
      const filteredCourses = res.data.filter((course: { id: number; name: string; semesterId?: number | null; forDept: number }) => course.forDept === departmentId);
      setCourses(filteredCourses);
    } catch {
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, [departmentId]);

  // Fetch courses when add course form is shown
  useEffect(() => {
    if (showAddCourseFormId !== null) {
      fetchCourses();
    }
  }, [showAddCourseFormId]);

  // Handler for adding course to semester (moved from main page and deptAdminHandlers)
  const handleAddCourseToSemester = async (
    e: React.FormEvent,
    semesterId: number
  ) => {
    e.preventDefault();
    setAddCourseLoading(true);
    setAddCourseError("");
    setAddCourseSuccess("");
    try {
      await api.post(
        "/dashboard/department-admin/semester/course",
        {
          semesterId: Number(semesterId),
          courseIds: addCourseIds, // send array
        },
        { withCredentials: true }
      );
      setAddCourseSuccess("Courses added to semester!");
      setAddCourseIds([]);
      setShowAddCourseFormId(null);
      fetchSemesters();
    } catch (err: unknown) {
      let errorMsg = "Failed to add courses to semester";
      if (err && typeof err === 'object' && 'response' in err && 
          err.response && typeof err.response === 'object' && 
          'data' in err.response && err.response.data && 
          typeof err.response.data === 'object' && 
          'error' in err.response.data) {
        errorMsg = String(err.response.data.error);
      }
      setAddCourseError(errorMsg);
    } finally {
      setAddCourseLoading(false);
    }
  };

  // Fetch courses for a specific semester
  const fetchSemesterCourses = async (semesterId: number) => {
    setCoursesLoading(true);
    setCoursesError("");
    try {
      const res = await api.get(`/dashboard/department-admin/semester/${semesterId}/courses`, { withCredentials: true });
      setSemesterCourses(prev => ({ ...prev, [semesterId]: res.data }));
    } catch {
      setCoursesError("Failed to fetch courses for this semester");
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleSetSession = async (e: React.FormEvent, semesterId: number) => {
    e.preventDefault();
    setSetSessionLoading(true);
    setSetSessionError("");
    setSetSessionSuccess("");
    try {
      console.log("Setting session for semester:", semesterId, "with input:", sessionInput);
      await api.post(
        "/dashboard/department-admin/semester/set-session",
        { semesterId, session: sessionInput },
        { withCredentials: true }
      );
      setSetSessionSuccess("Session set successfully!");
      setShowSetSessionId(null);
      setSessionInput("");
      fetchSemesters();
    } catch (err: unknown) {
      let errorMsg = "Failed to set session";
      if (err && typeof err === 'object' && 'response' in err && 
          err.response && typeof err.response === 'object' && 
          'data' in err.response && err.response.data && 
          typeof err.response.data === 'object' && 
          'error' in err.response.data) {
        errorMsg = String(err.response.data.error);
      }
      setSetSessionError(errorMsg);
    } finally {
      setSetSessionLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Semester List</h2>
      {loading && <div className="text-red-500 text-center mb-2">{loading}</div>}
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      {success && <div className="text-green-600 text-center mb-2">{success}</div>}
      <table className="border" style={{ width: tableWidth }}>
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Session</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {semesters.map((semester) => (
            <React.Fragment key={semester.id}>
              <tr>
                <td className="border px-4 py-2">{semester.name}</td>
                <td className="border px-4 py-2">{semester.session}</td>
                <td className="border px-4 py-2 flex gap-2">
                  <button
                    className="btn btn-outline btn-xs custom-bordered-btn  cursor-pointer"
                    onClick={() => {
                      setShowAddCourseFormId(semester.id);
                      setAddCourseIds([]);
                      setAddCourseError("");
                      setAddCourseSuccess("");
                    }}
                  >
                    Add Course
                  </button>
                  <button
                    className="btn btn-outline btn-xs custom-bordered-btn cursor-pointer"
                    onClick={() => {
                      if (showCoursesSemesterId === semester.id) {
                        setShowCoursesSemesterId(null);
                        setRemoveCourseSuccess("");
                      } else {
                        setShowCoursesSemesterId(semester.id);
                        fetchSemesterCourses(semester.id);
                      }
                    }}
                  >
                    {showCoursesSemesterId === semester.id ? "Hide Courses" : "Show Courses"}
                  </button>
                  <button
                    className="btn btn-outline btn-xs custom-bordered-btn cursor-pointer"
                    onClick={() => {
                      setShowSetSessionId(semester.id);
                      setSessionInput("");
                      setSetSessionError("");
                      setSetSessionSuccess("");
                    }}
                  >
                    Set Session
                  </button>
                </td>
              </tr>
              {showAddCourseFormId === semester.id && (
                <tr>
                  <td colSpan={1} className="border px-4 py-2 bg-dark"></td>
                  <td colSpan={1} className="border px-4 py-2 bg-dark"></td>
                  <td colSpan={1} className="border px-4 py-2 bg-gray-50 dark:bg-gray-900">
                    <form
                      onSubmit={e => handleAddCourseToSemester(e, semester.id)}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto border rounded p-2 bg-dark">
                        {courses.filter((c) => c.semesterId == null).length === 0 && <div>No courses available.</div>}
                        {courses.filter((c) => c.semesterId == null).map(c => (
                          <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value={c.id}
                              checked={addCourseIds.includes(c.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setAddCourseIds(prev => [...prev, c.id]);
                                } else {
                                  setAddCourseIds(prev => prev.filter(id => id !== c.id));
                                }
                              }}
                              className="checkbox checkbox-xs"
                            />
                            <span>{c.name}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="btn btn-outline btn-xs custom-bordered-btn cursor-pointer"
                          disabled={addCourseLoading || addCourseIds.length === 0}
                        >
                          {addCourseLoading ? "Adding..." : "Add Courses"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs custom-bordered-btn cursor-pointer"
                          onClick={() => setShowAddCourseFormId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                      {addCourseError && <div className="text-red-500 text-xs">{addCourseError}</div>}
                      {addCourseSuccess && <div className="text-green-600 text-xs">{addCourseSuccess}</div>}
                    </form>
                  </td>
                </tr>
              )}
              {showCoursesSemesterId === semester.id && (
                <tr>
                  <td colSpan={1} className="border px-4 py-2 bg-dark"></td>
                  <td colSpan={1} className="border px-4 py-2 bg-dark"></td>
                  <td colSpan={1} className="border px-4 py-2 bg-dark">
                    {coursesLoading ? (
                      <div>Loading courses...</div>
                    ) : coursesError ? (
                      <div className="text-red-500 text-xs">{coursesError}</div>
                    ) : (
                      <ul className="list-disc pl-5">
                        {(semesterCourses[semester.id] || []).length === 0 ? (
                          <li>No courses found for this semester.</li>
                        ) : (
                          semesterCourses[semester.id].map(course => (
                            <li key={course.id} className="flex items-center justify-between">
                              <span>{course.name}</span>
                              <button
                                className="btn btn-outline btn-xs custom-bordered-btn cursor-pointer"
                                onClick={() => handleRemoveCourseFromSemester(semester.id, course.id)}
                                disabled={removeCourseLoading}
                              >
                                {removeCourseLoading ? "Removing..." : "Remove Course"}
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                    {removeCourseError && (<div className="text-red-500 text-xs">{removeCourseError}</div>)}
                    {removeCourseSuccess && (<div className="text-green-600 text-xs">{removeCourseSuccess}</div>)}
                  </td>
                </tr>
              )}
              {showSetSessionId === semester.id && (
                <tr>
                  <td colSpan={1} className="border px-4 py-2 bg-dark"></td>
                  <td colSpan={1} className="border px-4 py-2 bg-dark"></td>
                  <td colSpan={1} className="border px-4 py-2 bg-dark">
                    <form onSubmit={e => handleSetSession(e, semester.id)} className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={sessionInput}
                        onChange={e => setSessionInput(e.target.value)}
                        placeholder="YYYY-YYYY"
                        className="input input-xs input-bordered custom-bordered-button w-40"
                        pattern="\d{4}-\d{4}"
                        required
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="btn btn-outline btn-xs custom-bordered-btn"
                          disabled={setSessionLoading || !/^\d{4}-\d{4}$/.test(sessionInput)}
                        >
                          {setSessionLoading ? "Setting..." : "Set Session"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs custom-bordered-btn"
                          onClick={() => setShowSetSessionId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                      {setSessionError && <div className="text-red-500 text-xs">{setSessionError}</div>}
                      {setSessionSuccess && <div className="text-green-600 text-xs">{setSessionSuccess}</div>}
                    </form>
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

export default SemesterList;
