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
  const [semesterCourses, setSemesterCourses] = useState<{ [semesterId: number]: { id: number; name: string }[] }>({});
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState("");
  const [sessionInput, setSessionInput] = useState("");
  const [setSessionLoading, setSetSessionLoading] = useState(false);
  const [setSessionError, setSetSessionError] = useState("");
  const [setSessionSuccess, setSetSessionSuccess] = useState("");
  const [removeCourseLoading, setRemoveCourseLoading] = useState(false);
  const [removeCourseError, setRemoveCourseError] = useState("");
  const [removeCourseSuccess, setRemoveCourseSuccess] = useState("");

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
      const res = await api.get("/dashboard/department-admin/courses", {
        params: { departmentId },
        withCredentials: true,
      });
      // Assuming 'forDept' is a valid field on your course model
      const filteredCourses = res.data.filter((course: { forDept: number }) => course.forDept === departmentId);
      setCourses(filteredCourses);
    } catch {
      setCourses([]);
    }
  };
  
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
                {/* === THIS IS THE UPDATED PART === */}
                <SelectContent 
                  className="bg-black text-white"
                >
                  {semesterNameOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
                {/* === END OF UPDATED PART === */}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  {/* --- Show Courses View --- */}
                  {showCoursesSemesterId === semester.id && (
                     <div onClick={(e) => e.stopPropagation()} className="p-2 border rounded-md bg-background">
                       {coursesLoading ? <p>Loading...</p> : coursesError ? <p className="text-red-500 text-xs">{coursesError}</p> : (
                         <ul className="space-y-2">
                           {(semesterCourses[semester.id] || []).length === 0 ? <li className="text-xs">No courses found.</li> :
                           semesterCourses[semester.id].map(course => (
                             <li key={course.id} className="flex items-center justify-between text-sm">
                               <span>{course.name}</span>
                               <Button variant="ghost" size="sm" onClick={() => handleRemoveCourseFromSemester(semester.id, course.id)} disabled={removeCourseLoading}>
                                 <FaTrash className="text-red-500"/>
                               </Button>
                             </li>
                           ))}
                         </ul>
                       )}
                       {removeCourseSuccess && <p className="text-green-600 text-xs mt-2">{removeCourseSuccess}</p>}
                       {removeCourseError && <p className="text-red-500 text-xs mt-2">{removeCourseError}</p>}
                     </div>
                  )}
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
                      <Button type="submit" size="sm" disabled={addCourseLoading || addCourseIds.length === 0}>
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