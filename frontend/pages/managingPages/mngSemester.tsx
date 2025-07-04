import React, { useEffect, useState } from 'react';
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaPlus, FaTasks, FaArchive, FaArrowLeft, FaEye, FaPlusCircle, FaCalendarAlt, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


// Helper function to get ordinal numbers (1st, 2nd, 3rd, 4th)
const getOrdinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Generate the list of semester names
const semesterNameOptions: string[] = [];
for (let year = 1; year <= 4; year++) {
  for (let semester = 1; semester <= 2; semester++) {
    semesterNameOptions.push(
      `${getOrdinal(year)} Year ${getOrdinal(semester)} Semester`
    );
  }
}


interface SemesterCourse {
  id: number;
  name: string;
  semesterCourseTeachers: {
    teacher: {
      name: string;
    };
  }[];
}

export interface Semester {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  session: string;
  departmentId: number;
}

interface mngSemesterProps {
  departmentId?: number;
}

export default function MngSemester({ departmentId }: mngSemesterProps) {
  // --- View Management State ---
  const [currentView, setCurrentView] = useState<'main' | 'add' | 'manage' | 'archived'>('main');

  // --- General State ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  
  // --- Add Semester State ---
  const [newSemesterName, setNewSemesterName] = useState("");
  const [newSemesterSession, setNewSemesterSession] = useState("");
  const [addSemesterLoading, setAddSemesterLoading] = useState(false);
  const [addSemesterError, setAddSemesterError] = useState("");
  const [addSemesterSuccess, setAddSemesterSuccess] = useState("");

  // --- Manage Semesters State ---
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [showAddCourseFormId, setShowAddCourseFormId] = useState<number | null>(null);
  const [showCoursesSemesterId, setShowCoursesSemesterId] = useState<number | null>(null);
  const [addCourseIds, setAddCourseIds] = useState<number[]>([]);
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  const [addCourseError, setAddCourseError] = useState("");
  const [addCourseSuccess, setAddCourseSuccess] = useState("");
  const [courses, setCourses] = useState<{ id: number; name: string; semesterId?: number | null }[]>([]);
  // === START OF UPDATED PART ===
  const [semesterCourses, setSemesterCourses] = useState<{ [semesterId: number]: SemesterCourse[] }>({});
  // === END OF UPDATED PART ===
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState("");
  const [sessionInput, setSessionInput] = useState("");
  const [setSessionLoading, setSetSessionLoading] = useState(false);
  const [setSessionError, setSetSessionError] = useState("");
  const [setSessionSuccess, setSetSessionSuccess] = useState("");
  const [removeCourseLoading, setRemoveCourseLoading] = useState(false);
  const [removeCourseError, setRemoveCourseError] = useState("");
  const [removeCourseSuccess, setRemoveCourseSuccess] = useState("");
  // === START OF UPDATED PART ===
  // --- Teacher Assignment State ---
  const [teachers, setTeachers] = useState<{ id: number; name: string }[]>([]);
  const [assigningTeacherToCourseId, setAssigningTeacherToCourseId] = useState<number | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [assignTeacherLoading, setAssignTeacherLoading] = useState(false);
  const [assignTeacherError, setAssignTeacherError] = useState("");
  const [assignTeacherSuccess, setAssignTeacherSuccess] = useState("");
  // === END OF UPDATED PART ===

  // --- Data Fetching ---

  const fetchSemesters = async () => {
    if (!departmentId) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/dashboard/department-admin/semesters", {
        params: { departmentId },
        withCredentials: true,
      });
      const sortedSemesters = res.data.sort((a: Semester, b: Semester) => a.name.localeCompare(b.name));
      setSemesters(sortedSemesters);
    } catch {
      setError("Failed to fetch semesters");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    if (!departmentId) return;
    try {
      const res = await api.get("/courses", {
        params: { departmentId },
        withCredentials: true,
      });
      // Assuming 'forDept' is a valid field on your course model
      const filteredCourses = res.data.filter((course: { forDept: number }) => course.forDept === departmentId);
      setCourses(filteredCourses);
      console.log("Filtered Courses:", filteredCourses);
    } catch {
      setCourses([]);
    }
  };
  
  const fetchSemesterCourses = async (semesterId: number) => {
    setCoursesLoading(true);
    setCoursesError("");
    try {
      // Assumes the API returns course objects with an optional teacher object: { id, name, teacher: { name } | null }
      const res = await api.get(`/get-semester-courses/${semesterId}`, { withCredentials: true });
      setSemesterCourses(prev => ({ ...prev, [semesterId]: res.data }));
    } catch {
      setCoursesError("Failed to fetch courses for this semester");
    } finally {
      setCoursesLoading(false);
    }
  };

  // === START OF UPDATED PART ===
  const fetchTeachers = async () => {
    if (!departmentId) return;
    try {
      // Assuming an endpoint to fetch teachers by department
      const res = await api.get(`/dashboard/department-admin/teachers`, {
        params: { departmentId },
        withCredentials: true,
      });
      setTeachers(res.data);
    } catch {
      setAssignTeacherError("Failed to fetch teachers.");
      setTeachers([]);
    }
  };
  // === END OF UPDATED PART ===
  
  useEffect(() => {
    if (currentView === 'manage') {
      fetchSemesters();
    }
  }, [currentView, departmentId]);

  useEffect(() => {
    if (showAddCourseFormId !== null) {
      fetchCourses();
    }
  }, [showAddCourseFormId]);

  // --- Handlers ---
  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSemesterLoading(true);
    setAddSemesterError("");
    setAddSemesterSuccess("");
    try {
      await api.post('/add-semester', {
        name: newSemesterName,
        session: newSemesterSession,
        departmentId: departmentId,
      }, { withCredentials: true });
      setAddSemesterSuccess("Semester added successfully!");
      setNewSemesterName("");
      setNewSemesterSession("");
      // refetch semesters for manage view
      fetchSemesters();
    } catch (err: any) {
      setAddSemesterError(err.response?.data?.error || "Failed to add semester.");
    } finally {
      setAddSemesterLoading(false);
    }
  };

  const handleAddCourseToSemester = async (e: React.FormEvent, semesterId: number) => {
    e.preventDefault();
    setAddCourseLoading(true);
    setAddCourseError("");
    setAddCourseSuccess("");
    try {
      await api.post("/dashboard/department-admin/semester/course", {
        semesterId: Number(semesterId),
        courseIds: addCourseIds,
      }, { withCredentials: true });
      setAddCourseSuccess("Courses added successfully!");
      setAddCourseIds([]);
      setShowAddCourseFormId(null);
      // Refresh courses in case user wants to see them
      fetchSemesterCourses(semesterId);
    } catch (err: any) {
      setAddCourseError(err.response?.data?.error || "Failed to add courses.");
    } finally {
      setAddCourseLoading(false);
    }
  };
  
  const handleSetSession = async (semesterId: number) => {
    setSetSessionLoading(true);
    setSetSessionError("");
    setSetSessionSuccess("");
    try {
      await api.post("/dashboard/department-admin/semester/set-session", {
        semesterId,
        session: sessionInput,
      }, { withCredentials: true });
      setSetSessionSuccess("Session updated!");
      setSessionInput("");
      fetchSemesters(); // Refresh the list
    } catch (err: any) {
      setSetSessionError(err.response?.data?.error || "Failed to set session.");
    } finally {
      setSetSessionLoading(false);
    }
  };
  
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
    } catch (err: any) {
      setRemoveCourseError(err.response?.data?.error || "Failed to remove course.");
    } finally {
      setRemoveCourseLoading(false);
    }
  };

  // === START OF UPDATED PART ===
  const handleAssignTeacherToCourse = async (semesterId: number, courseId: number) => {
    if (!selectedTeacherId) {
      setAssignTeacherError("Please select a teacher.");
      return;
    }
    setAssignTeacherLoading(true);
    setAssignTeacherError("");
    setAssignTeacherSuccess("");
    try {
      // This uses the route provided in semesterRoutes.js
      await api.post("/add-semesterCourseTeacher", {
        semesterId,
        courseId,
        teacherId: selectedTeacherId,
      }, { withCredentials: true });
      setAssignTeacherSuccess("Teacher assigned successfully!");
      // Reset state and refresh course list
      setAssigningTeacherToCourseId(null);
      setSelectedTeacherId(null);
      fetchSemesterCourses(semesterId); // Refresh the list to show the new teacher
    } catch (err: any) {
      setAssignTeacherError(err.response?.data?.error || "Failed to assign teacher.");
    } finally {
      setAssignTeacherLoading(false);
      setTimeout(() => setAssignTeacherSuccess(""), 4000);
    }
  };
  // === END OF UPDATED PART ===

  // --- Render Functions for Views ---

  const renderMainView = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-8">Semester Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => setCurrentView('add')} className="p-8 rounded-lg shadow-md transition-transform transform hover:scale-105 semester-btn flex flex-col items-center justify-center">
          <FaPlusCircle className="text-4xl mb-4 text-blue-500" />
          <span className="text-xl font-semibold">Add Semester</span>
        </button>
        <button onClick={() => setCurrentView('manage')} className="p-8 rounded-lg shadow-md transition-transform transform hover:scale-105 semester-btn flex flex-col items-center justify-center">
          <FaTasks className="text-4xl mb-4 text-green-500" />
          <span className="text-xl font-semibold">Manage Semesters</span>
        </button>
        <button onClick={() => setCurrentView('archived')} className="p-8 rounded-lg shadow-md transition-transform transform hover:scale-105 semester-btn flex flex-col items-center justify-center">
          <FaArchive className="text-4xl mb-4 text-gray-500" />
          <span className="text-xl font-semibold">Archived Semesters</span>
        </button>
      </div>
    </div>
  );

    const renderAddSemesterView = () => (
    <div>
      <Button variant="outline" onClick={() => setCurrentView('main')} className="mb-6">
        <FaArrowLeft className="mr-2" /> Back
      </Button>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create a New Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSemester} className="space-y-4">
            <div>
              <label htmlFor="semesterName" className="block text-sm font-medium mb-1">Semester Name</label>
              <Select
                onValueChange={(value) => setNewSemesterName(value)}
                value={newSemesterName}
              >
                <SelectTrigger id="semesterName">
                  <SelectValue placeholder="Select a semester" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-black text-white"
                >
                  {semesterNameOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="session" className="block text-sm font-medium mb-1">Session</label>
              <Input
                id="session"
                type="text"
                value={newSemesterSession}
                onChange={(e) => setNewSemesterSession(e.target.value)}
                placeholder="e.g., 2023-2024"
                pattern="\d{4}-\d{4}"
                title="Session must be in YYYY-YYYY format"
                required
              />
            </div>
            <Button type="submit" disabled={addSemesterLoading || !newSemesterName || !newSemesterSession} className="w-full border">
              {addSemesterLoading ? "Creating..." : "Create Semester"}
            </Button>
            {addSemesterSuccess && <p className="text-green-600 text-sm mt-2">{addSemesterSuccess}</p>}
            {addSemesterError && <p className="text-red-500 text-sm mt-2">{addSemesterError}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderManageSemestersView = () => (
    <div>
      <Button variant="outline" onClick={() => setCurrentView('main')} className="mb-6 semester-btn">
        <FaArrowLeft className="mr-2" /> Back
      </Button>
      <h2 className="text-xl font-bold mb-4">Manage Semesters</h2>
      {loading && <p>Loading semesters...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {semesters.map((semester) => (
          <Card 
            key={semester.id} 
            className={`transition-all duration-300 ease-in-out semester-btn hover:shadow-lg ${expandedCardId === semester.id ? 'shadow-xl' : ''}`}
            onClick={() => setExpandedCardId(expandedCardId === semester.id ? null : semester.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{semester.name}</CardTitle>
                <Popover onOpenChange={(open) => !open && setSetSessionError("")}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      <FaEllipsisV />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Set Session</p>
                      <Input
                        type="text"
                        placeholder="YYYY-YYYY"
                        defaultValue={semester.session}
                        onChange={(e) => setSessionInput(e.target.value)}
                        className="input-sm"
                      />
                      <Button size="sm" onClick={() => handleSetSession(semester.id)} disabled={setSessionLoading}>
                        {setSessionLoading ? 'Saving...' : 'Save'}
                      </Button>
                      {setSessionError && <p className="text-red-500 text-xs">{setSessionError}</p>}
                      {setSessionSuccess && <p className="text-green-500 text-xs">{setSessionSuccess}</p>}
                    </div>
                  </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{semester.session || "No session set"}</p>
              {expandedCardId === semester.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div className="flex gap-2">
                     <Button variant="outline" className="semester-btn" size="sm" onClick={(e) => { e.stopPropagation(); setShowCoursesSemesterId(showCoursesSemesterId === semester.id ? null : semester.id); fetchSemesterCourses(semester.id); setShowAddCourseFormId(null); }}>
                        <FaEye className="mr-2"/>{showCoursesSemesterId === semester.id ? "Hide" : "Show"} Courses
                     </Button>
                     <Button variant="outline" className="semester-btn" size="sm" onClick={(e) => { e.stopPropagation(); setShowAddCourseFormId(showAddCourseFormId === semester.id ? null : semester.id); setShowCoursesSemesterId(null); }}>
                        <FaPlus className="mr-2"/>{showAddCourseFormId === semester.id ? "Cancel" : "Add"} Courses
                     </Button>
                  </div>
                  
                  {/* === START OF UPDATED PART: SHOW COURSES VIEW === */}
                  {showCoursesSemesterId === semester.id && (
                    <div onClick={(e) => e.stopPropagation()} className="p-2 border rounded-md bg-background min-w-[450px]">
                      <h4 className="font-semibold mb-2 text-md">Courses in Semester</h4>
                      {coursesLoading ? <p className="text-sm">Loading...</p> : coursesError ? <p className="text-red-500 text-xs">{coursesError}</p> : (
                        <div className="space-y-2">
                          {(semesterCourses[semester.id] || []).length > 0 && (
                            <div className="grid grid-cols-10 gap-2 font-bold text-sm text-muted-foreground pb-1 border-b">
                              <span className="col-span-4">Course</span>
                              <span className="col-span-3">Teacher</span>
                              <span className="col-span-3">Actions</span>
                            </div>
                          )}
                          {(semesterCourses[semester.id] || []).length === 0 ? <div className="text-xs text-center py-2">No courses assigned.</div> :
                            semesterCourses[semester.id].map(course => (
                              <div key={course.id}>
                                <div className="grid grid-cols-10 gap-2 items-center text-sm pt-2">
                                  {assigningTeacherToCourseId === course.id ? (
                                    <>
                                      <span className="col-span-4 truncate" title={course.name}>{course.name}</span>
                                      <div className="col-span-6 flex items-center gap-1">
                                        <Select onValueChange={(value) => setSelectedTeacherId(Number(value))}>
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Select Teacher" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-black text-white">
                                            {teachers.length > 0 ? teachers.map(teacher => (
                                              <SelectItem key={teacher.id} value={String(teacher.id)} className="hover:bg-gray-800">
                                                {teacher.name}
                                              </SelectItem>
                                            )) : <SelectItem value="no-teachers" disabled>No teachers</SelectItem>}
                                          </SelectContent>
                                        </Select>
                                        <Button size="sm" onClick={() => handleAssignTeacherToCourse(semester.id, course.id)} disabled={assignTeacherLoading || !selectedTeacherId} className="h-8 cursor-pointer hover:underline">
                                          {assignTeacherLoading ? '...' : 'Save'}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => { setAssigningTeacherToCourseId(null); setSelectedTeacherId(null); setAssignTeacherError(""); }} className="h-8 cursor-pointer hover:underline">
                                          Cancel
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <span className="col-span-4 truncate" title={course.name}>{course.name}</span>
                                      <span className="col-span-3 truncate">
                                        {course.semesterCourseTeachers?.[0]?.teacher?.name || <span className="text-muted-foreground italic">Unassigned</span>}
                                      </span>
                                      <div className="col-span-3 flex items-center">
                                        {/* This is the key change for the button text */}
                                        <Button variant="outline" size="sm" onClick={() => { setAssigningTeacherToCourseId(course.id); setAssignTeacherError(""); setAssignTeacherSuccess(""); setSelectedTeacherId(null); fetchTeachers(); }} className="text-xs h-8">
                                          {course.semesterCourseTeachers?.length > 0 ? 'Change' : 'Assign'}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveCourseFromSemester(semester.id, course.id)} disabled={removeCourseLoading} className="ml-1 h-8 w-8 hover:bg-red-100 group">
                                            <FaTrash className="text-red-500 h-3.5 w-3.5"/>
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                                {assigningTeacherToCourseId === course.id && assignTeacherError && <p className="text-red-500 text-xs mt-1 col-start-5 col-span-6">{assignTeacherError}</p>}
                              </div>
                            ))
                          }
                          {assignTeacherSuccess && <p className="text-green-600 text-xs mt-2">{assignTeacherSuccess}</p>}
                          {removeCourseSuccess && <p className="text-green-600 text-xs mt-2">{removeCourseSuccess}</p>}
                          {removeCourseError && <p className="text-red-500 text-xs mt-2">{removeCourseError}</p>}
                        </div>
                      )}
                    </div>
                  )}
                  {/* === END OF UPDATED PART === */}

                  {/* --- Add Course Form --- */}
                  {showAddCourseFormId === semester.id && (
                    <form onClick={(e) => e.stopPropagation()} className="p-2 border rounded-md bg-background space-y-2" onSubmit={(e) => handleAddCourseToSemester(e, semester.id)}>
                      <div className="max-h-48 overflow-y-auto space-y-1 p-2 border rounded">
                        {courses.filter(c => c.semesterId == null).length === 0 ? <div className="text-xs">No courses available.</div> :
                         courses.filter(c => c.semesterId == null).map(c => (
                           <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm">
                             <input type="checkbox" value={c.id} checked={addCourseIds.includes(c.id)} onChange={e => e.target.checked ? setAddCourseIds(prev => [...prev, c.id]) : setAddCourseIds(prev => prev.filter(id => id !== c.id))} className="checkbox checkbox-xs" />
                             <span>{c.name}</span>
                           </label>
                         ))}
                      </div>
                      <Button type="submit" size="sm" className="w-full border cursor-pointer" disabled={addCourseLoading || addCourseIds.length === 0}>
                        {addCourseLoading ? "Adding..." : "Add Selected"}
                      </Button>
                      {addCourseSuccess && <p className="text-green-600 text-xs mt-2">{addCourseSuccess}</p>}
                      {addCourseError && <p className="text-red-500 text-xs mt-2">{addCourseError}</p>}
                    </form>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderArchivedView = () => (
    <div>
      <Button variant="outline" onClick={() => setCurrentView('main')} className="mb-6 semester-btn">
        <FaArrowLeft className="mr-2" /> Back
      </Button>
      <div className="text-center p-10 border-2 border-dashed rounded-lg">
        <h2 className="text-xl font-bold mb-2">Archived Semesters</h2>
        <p className="text-muted-foreground">This feature is not yet available. Previously completed semesters will be shown here.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'add':
        return renderAddSemesterView();
      case 'manage':
        return renderManageSemestersView();
      case 'archived':
        return renderArchivedView();
      case 'main':
      default:
        return renderMainView();
    }
  };

  return <div className="p-4">{renderContent()}</div>;
}