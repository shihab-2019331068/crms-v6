import React, { useEffect, useState, useCallback } from 'react';
import api from "@/services/api";
import { Department } from "@/components/departmentList";
import { Button } from '@/components/ui/button';
import { useAuth } from "@/context/AuthContext";
import { FaArrowLeft } from 'react-icons/fa';
import { Loader2, ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- INTERFACES & TYPES ---
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
  isArchived?: boolean;
}

interface ApiError {
  response?: { data?: { error?: string; details?: string[] }; };
}

interface ManageCoursesProps {
  departmentId?: number;
}

type View = 'main' | 'add' | 'manage' | 'archived';

// --- MAIN COMPONENT ---
const ManageCoursesPage: React.FC<ManageCoursesProps> = ({ departmentId }) => {
  // --- STATE MANAGEMENT ---
  const { user } = useAuth();
  const [view, setView] = useState<View>('main');
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseCredits, setCourseCredits] = useState("");
  const [courseType, setCourseType] = useState("THEORY");
  const [isMajor, setIsMajor] = useState(true);
  const [selectedForDept, setSelectedForDept] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(departmentId ?? null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // --- DATA FETCHING ---
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const deptId = departmentId ?? selectedDepartmentId;
      if (!deptId) return;
      const res = await api.get("/get-courses", {
        params: { departmentId: deptId, isArchived: false }, // Fetch active courses
        withCredentials: true,
      });
      const sortedCourses = res.data.sort((a: Course, b: Course) => a.code.localeCompare(b.code));
      setCourses(sortedCourses);
    } catch {
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }, [departmentId, selectedDepartmentId]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get<Department[]>("/departments", { withCredentials: true });
        setDepartments(res.data);
        if (!departmentId && res.data.length > 0 && !selectedDepartmentId) {
          setSelectedDepartmentId(res.data[0].id);
        }
      } catch {
        setError("Failed to fetch departments");
      }
    };
    fetchDepartments();
  }, [departmentId, selectedDepartmentId]);

  useEffect(() => {
    if (view === 'manage') {
      fetchCourses();
    }
  }, [view, fetchCourses]);
  
  const resetMessages = () => {
      setError("");
      setSuccess("");
  }
  
  const clearAddForm = () => {
      setCourseName("");
      setCourseCode("");
      setCourseCredits("");
      setCourseType("THEORY");
      setIsMajor(true);
      setSelectedForDept(null);
  }

  // --- API HANDLERS ---
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();
    let forDeptValue: number | null = isMajor ? (departmentId ?? selectedDepartmentId ?? null) : selectedForDept;
    
    try {
      await api.post("/add-course", {
        name: courseName,
        code: courseCode,
        credits: Number(courseCredits),
        departmentId: departmentId ?? selectedDepartmentId,
        type: courseType,
        isMajor,
        forDept: forDeptValue,
      }, { withCredentials: true });
      setSuccess("Course added successfully!");
      clearAddForm();
      fetchCourses();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.response?.data?.error ?? "Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      setError("Please select a CSV file to upload.");
      return;
    }
    setLoading(true);
    resetMessages();
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    formData.append('departmentId', String(departmentId ?? selectedDepartmentId));

    try {
      // FIX: Use the correct, nested endpoint
      const res = await api.post("/add-courses-from-csv", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setSuccess(res.data.message || "Courses added successfully from CSV!");
      setCsvFile(null); 
      // Clear the file input visually for the user
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if(fileInput) fileInput.value = "";

      if (view === 'manage') {
          fetchCourses();
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errorDetails = apiErr.response?.data?.details;
      let errorMessage = apiErr.response?.data?.error ?? "Failed to upload CSV.";
      if (Array.isArray(errorDetails)) {
        errorMessage += ` Details: ${errorDetails.join(', ')}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    setLoading(true);
    resetMessages();
    try {
      // FIX: Use the correct, nested endpoint
      await api.delete("/delete-course", {
        data: { courseId },
        withCredentials: true,
      });
      setSuccess("Course deleted successfully!");
      fetchCourses();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.response?.data?.error ?? "Failed to delete course");
    } finally {
      setLoading(false);
    }
  };
  
  const handleArchiveCourse = async (courseId: number) => {
    setLoading(true);
    resetMessages();
    try {
      // FIX: Use the correct, nested endpoint
      await api.patch("/archive-course", { courseId }, {
        withCredentials: true,
      });
      setSuccess("Course archived successfully!");
      fetchCourses(); // This will now correctly re-fetch the list of active courses
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.response?.data?.error ?? "Failed to archive course");
    } finally {
      setLoading(false);
    }
  };
  
  // --- VIEW RENDERING LOGIC ---
  const renderView = () => {
    switch (view) {
      case 'add':
        return <AddCourseView
                    departmentId={departmentId} selectedDepartmentId={selectedDepartmentId}
                    departments={departments} courseName={courseName} setCourseName={setCourseName}
                    courseCode={courseCode} setCourseCode={setCourseCode} courseCredits={courseCredits}
                    setCourseCredits={setCourseCredits} courseType={courseType} setCourseType={setCourseType}
                    isMajor={isMajor} setIsMajor={setIsMajor} selectedForDept={selectedForDept}
                    setSelectedForDept={setSelectedForDept} handleAddCourse={handleAddCourse} loading={loading}
                    handleCsvUpload={handleCsvUpload} setCsvFile={setCsvFile} csvFile={csvFile}
               />;
      case 'manage':
        return <ManageCourseView
                    courses={courses} departments={departments} departmentId={departmentId}
                    selectedDepartmentId={selectedDepartmentId} user={user} loading={loading}
                    handleDeleteCourse={handleDeleteCourse} handleArchiveCourse={handleArchiveCourse}
                />;
      case 'archived': return <ArchivedCoursesView departmentId={departmentId ?? selectedDepartmentId} />;
      case 'main':
      default: return <MainDashboard setView={setView} />;
    }
  };

  return (
      <div className="p-4 md:p-6">
        {view !== 'main' && (
          <Button variant="outline" onClick={() => { setView('main'); resetMessages(); }} className="mb-6">
            <FaArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        )}
        {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {success && (
            <Alert variant="default" className="mb-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
            </Alert>
        )}
        {renderView()}
      </div>
  );
};

// --- SUB-COMPONENTS ---

const MainDashboard: React.FC<{ setView: (view: View) => void }> = ({ setView }) => (
    <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Course Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <DashboardCard title="Add Course" description="Create a new course or upload a list of courses via CSV." icon="+" onClick={() => setView('add')} />
            <DashboardCard title="Manage Courses" description="View, edit, and delete existing active courses." icon="⚙️" onClick={() => setView('manage')} />
            <DashboardCard title="Archived Courses" description="View and restore courses from previous academic years." icon="🗄️" onClick={() => setView('archived')} />
        </div>
    </div>
);

const DashboardCard: React.FC<{ title: string; description: string; icon: string; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
    <div onClick={onClick} className="p-8 rounded-lg shadow-md transition-transform transform hover:scale-105 semester-btn flex flex-col items-center justify-center">
        <div className="card-body items-center text-center">
            <span className="text-6xl mb-4">{icon}</span>
            <h2 className="card-title text-2xl">{title}</h2>
            <p>{description}</p>
        </div>
    </div>
);

const AddCourseView: React.FC<any> = ({
    departmentId, selectedDepartmentId, departments,
    courseName, setCourseName, courseCode, setCourseCode,
    courseCredits, setCourseCredits, courseType, setCourseType,
    isMajor, setIsMajor, selectedForDept, setSelectedForDept,
    handleAddCourse, loading, handleCsvUpload, setCsvFile, csvFile
}) => {
    const [addOption, setAddOption] = useState<'single' | 'csv'>('single');

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Add a New Course</h2>
            <div className="flex gap-2 mb-4 border-b">
                <Button variant={addOption === 'single' ? 'ghost' : 'link'} className={`rounded-b-none ${addOption === 'single' && 'border-b-2 border-primary'}`} onClick={() => setAddOption('single')}>Add Single Course</Button>
                <Button variant={addOption === 'csv' ? 'ghost' : 'link'} className={`rounded-b-none ${addOption === 'csv' && 'border-b-2 border-primary'}`} onClick={() => setAddOption('csv')}>Upload CSV</Button>
            </div>
            {addOption === 'single' ? (
                <form onSubmit={handleAddCourse} className="mb-6 max-w-2xl flex flex-col gap-4 p-4 border rounded-lg bg-base-100">
                    <input type="text" placeholder="Course Name" value={courseName} onChange={e => setCourseName(e.target.value)} className="input input-bordered w-full" required disabled={loading} />
                    <input type="text" placeholder="Course Code" value={courseCode} onChange={e => setCourseCode(e.target.value)} className="input input-bordered w-full" required disabled={loading} />
                    <input type="number" placeholder="Credits" value={courseCredits} onChange={e => setCourseCredits(e.target.value)} className="input input-bordered w-full" required disabled={loading} />
                    <select className="select select-bordered w-full" value={courseType} onChange={e => setCourseType(e.target.value)} required>
                        <option value="THEORY">Theory</option>
                        <option value="LAB">Lab</option>
                        <option value="PROJECT">Project</option>
                        <option value="THESIS">Thesis</option>
                    </select>
                    <div className="flex gap-4 items-center">
                        <label className="label cursor-pointer gap-2"><span className="label-text">Major Course</span><input type="radio" name="majorType" checked={isMajor} onChange={() => setIsMajor(true)} className="radio radio-primary" /></label>
                        <label className="label cursor-pointer gap-2"><span className="label-text">Non-Major Course</span><input type="radio" name="majorType" checked={!isMajor} onChange={() => setIsMajor(false)} className="radio radio-primary" /></label>
                    </div>
                    {!isMajor && (
                        <select className="select select-bordered w-full" value={selectedForDept ?? ''} onChange={e => setSelectedForDept(Number(e.target.value))} required>
                            <option value="" disabled>Select Department Offered To</option>
                            {departments.filter((dep: Department) => dep.id !== (departmentId ?? selectedDepartmentId)).map((dep: Department) => <option key={dep.id} value={dep.id}>{dep.name} ({dep.acronym})</option>)}
                        </select>
                    )}
                    <Button type="submit" disabled={loading || (!isMajor && !selectedForDept)} className="mt-2 border cursor-pointer">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Course
                    </Button>
                </form>
            ) : (
                <form onSubmit={handleCsvUpload} className="mb-6 max-w-2xl flex flex-col gap-4 p-4 border rounded-lg bg-base-100">
                    <h3 className="text-xl font-bold">Upload Courses via CSV</h3>
                    <p className="text-sm">The CSV file must contain the following columns: <strong>name, code, credits, type, isMajor, forDeptAcronym</strong>.</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li><code>type</code> should be one of: THEORY, LAB, PROJECT, THESIS.</li>
                        <li><code>isMajor</code> should be 'true' or 'false'.</li>
                        <li><code>forDeptAcronym</code> is required for non-major courses. It's the acronym of the department the course is offered TO.</li>
                    </ul>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                        className="file-input file-input-bordered border w-full cursor-pointer"
                        required
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading || !csvFile} className="mt-2 border cursor-pointer">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload CSV
                    </Button>
                </form>
            )}
        </div>
    );
};

const ManageCourseView: React.FC<any> = ({ courses, departments, departmentId, selectedDepartmentId, user, loading, handleDeleteCourse, handleArchiveCourse }) => {
    const [courseFilter, setCourseFilter] = useState<'all' | 'major' | 'non-major' | 'offered'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const itemsPerPage = 9;

    const filteredCourses = courses.filter((course: Course) => {
        const currentDeptId = departmentId ?? selectedDepartmentId;
        if (!currentDeptId) return true;
        switch (courseFilter) {
            case 'major': return course.departmentId === currentDeptId && course.forDept === currentDeptId;
            case 'non-major': return course.forDept === currentDeptId && course.departmentId !== currentDeptId;
            case 'offered': return course.departmentId === currentDeptId && course.forDept !== currentDeptId;
            case 'all': default: return true;
        }
    });
    
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const displayedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Active Courses</h2>
            <div className="flex gap-2 mb-4 flex-wrap">
                {(['all', 'major', 'non-major', 'offered'] as const).map(filter => (
                     <Button key={filter} variant={courseFilter === filter ? 'default' : 'outline'} size="sm" onClick={() => { setCourseFilter(filter); setCurrentPage(1); }}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)} Courses
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedCourses.map((course: Course) => (
                    <CourseCard
                        key={course.id} course={course} departments={departments} user={user}
                        loading={loading} isExpanded={selectedCourseId === course.id}
                        onExpand={() => setSelectedCourseId(prevId => prevId === course.id ? null : course.id)}
                        handleDeleteCourse={handleDeleteCourse}
                        handleArchiveCourse={handleArchiveCourse}
                        currentDepartmentId={departmentId ?? selectedDepartmentId}
                    />
                ))}
            </div>
            
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}> <ChevronLeft className="h-4 w-4" /> </Button>
                    <span className="text-sm font-medium text-muted-foreground"> Page {currentPage} of {totalPages} </span>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}> <ChevronRight className="h-4 w-4" /> </Button>
                </div>
            )}
        </div>
    );
};

const CourseCard: React.FC<any> = ({ course, departments, user, loading, isExpanded, onExpand, handleDeleteCourse, handleArchiveCourse, currentDepartmentId }) => {
    const departmentAcronym = course.department?.acronym || departments.find((dep: Department) => dep.id === course.departmentId)?.acronym || '';
    const forDepartmentAcronym = course.forDepartment?.acronym || departments.find((dep: Department) => dep.id === course.forDept)?.acronym || '';
    const canEdit = user?.role === 'super_admin' || currentDepartmentId === course.departmentId;
    
    return (
        <div className="card bg-base-100 shadow-md transition-all duration-300 rounded-lg border">
            <div className="card-body p-4 cursor-pointer" onClick={onExpand}>
                <h3 className="card-title text-lg">{course.name} ({course.code})</h3>
                <p className="text-sm text-muted-foreground"><strong>Credits:</strong> {course.credits} | <strong>Type:</strong> {course.type}</p>
                <p className="text-sm text-muted-foreground"><strong>Department:</strong> {departmentAcronym}</p>
                <p className="text-sm text-muted-foreground"><strong>Offered To:</strong> {forDepartmentAcronym}</p>
            </div>
            {isExpanded && canEdit && (
                <div className="p-4 border-t">
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleArchiveCourse(course.id)} disabled={loading} className="cursor-pointer border">Archive</Button>
                        {/* FIX: Use destructive variant for delete button */}
                        <Button size="sm" variant="outline" color="red" onClick={() => handleDeleteCourse(course.id)} disabled={loading} className="cursor-pointer">Delete</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ArchivedCoursesView: React.FC<{ departmentId: number | null }> = ({ departmentId }) => {
    const [archivedCourses, setArchivedCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const fetchArchivedCourses = useCallback(async () => {
        if (!departmentId) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await api.get("/get-courses", {
                params: { departmentId, isArchived: true },
                withCredentials: true,
            });
            // log response data
            console.log("response data for archived courses:", res.data);

            const sorted = res.data.sort((a: Course, b: Course) => a.code.localeCompare(b.code));
            setArchivedCourses(sorted);
        } catch (err) {
            setError("Failed to fetch archived courses.");
        } finally {
            setLoading(false);
        }
    }, [departmentId]);
    
    useEffect(() => {
        fetchArchivedCourses();
    }, [fetchArchivedCourses]);
    
    const handleUnarchiveCourse = async (courseId: number) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            // FIX: Use the correct, nested endpoint
            await api.patch("/unarchive-course", { courseId }, { withCredentials: true });
            setSuccess("Course has been unarchived successfully.");
            fetchArchivedCourses(); // Refresh the list
        } catch (err: unknown) {
            const apiErr = err as ApiError;
            setError(apiErr.response?.data?.error ?? "Failed to unarchive course.");
        } finally {
            setLoading(false);
        }
    };
    
    if (loading && archivedCourses.length === 0) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Archived Courses</h2>
             {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {success && (
                <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-500" /> <AlertTitle>Success</AlertTitle> <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}
            {archivedCourses.length === 0 && !loading && (
                <div className="card bg-base-200 p-8 text-center">
                    <p>No archived courses found for this department.</p>
                </div>
            )}
            <div className="space-y-4">
                {archivedCourses.map(course => (
                    <div key={course.id} className="card bg-base-100 shadow-md rounded-lg border flex flex-row items-center justify-between p-4">
                        <div>
                            <h3 className="font-bold text-lg">{course.name} ({course.code})</h3>
                            <p className="text-sm text-muted-foreground">Credits: {course.credits} | Type: {course.type}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleUnarchiveCourse(course.id)} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Unarchive
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageCoursesPage;