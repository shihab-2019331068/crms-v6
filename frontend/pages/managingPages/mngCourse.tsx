import React, { useEffect, useState, useCallback } from 'react';
import api from "@/services/api";
import { Department } from "@/components/departmentList";
import { Button } from '@/components/ui/button';
import { useAuth } from "@/context/AuthContext";
import { FaArrowLeft } from 'react-icons/fa';
import { Loader2, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, MoreHorizontal, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const [courseCredits, setCourseCredits] =useState<number | "">("");
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
        params: { departmentId: deptId, isArchived: false },
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
      const res = await api.post("/add-courses-from-csv", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setSuccess(res.data.message || "Courses added successfully from CSV!");
      setCsvFile(null); 
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if(fileInput) fileInput.value = "";
      if (view === 'manage') fetchCourses();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errorDetails = apiErr.response?.data?.details;
      let errorMessage = apiErr.response?.data?.error ?? "Failed to upload CSV.";
      if (Array.isArray(errorDetails)) errorMessage += ` Details: ${errorDetails.join(', ')}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    setLoading(true);
    resetMessages();
    try {
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
      await api.patch("/archive-course", { courseId }, {
        withCredentials: true,
      });
      setSuccess("Course archived successfully!");
      fetchCourses();
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
    <div onClick={onClick} className="p-8 bg-card text-card-foreground rounded-lg shadow-md transition-transform transform hover:scale-105 cursor-pointer flex flex-col items-center justify-center border">
        <div className="items-center text-center">
            <span className="text-6xl mb-4">{icon}</span>
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-2">{description}</p>
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
                <form onSubmit={handleAddCourse} className="mb-6 max-w-2xl flex flex-col gap-6 p-4 border rounded-lg bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className='space-y-2'> <Label htmlFor="courseName">Course Name</Label> <Input id="courseName" placeholder="e.g., Introduction to Programming" value={courseName} onChange={e => setCourseName(e.target.value)} required disabled={loading} /> </div>
                        <div className='space-y-2'> <Label htmlFor="courseCode">Course Code</Label> <Input id="courseCode" placeholder="e.g., CS101" value={courseCode} onChange={e => setCourseCode(e.target.value)} required disabled={loading} /> </div>
                        <div className='space-y-2'> <Label htmlFor="courseCredits">Credits</Label> <Input id="courseCredits" type="number" placeholder="e.g., 3" value={courseCredits} onChange={e => setCourseCredits(e.target.value === '' ? '' : Number(e.target.value))} required disabled={loading} /> </div>
                        <div className='space-y-2'> <Label>Course Type</Label> <Select value={courseType} onValueChange={setCourseType} required> <SelectTrigger> <SelectValue placeholder="Select type" /> </SelectTrigger> <SelectContent> <SelectItem value="THEORY" className='hover:bg-gray-200'>Theory</SelectItem> <SelectItem className='hover:bg-gray-300' value="LAB">Lab</SelectItem> <SelectItem className='hover:bg-gray-400' value="PROJECT">Project</SelectItem> <SelectItem className='hover:bg-gray-500' value="THESIS">Thesis</SelectItem> </SelectContent> </Select> </div>
                    </div>
                    <div className="space-y-2">
                         <Label>Course Major Type</Label>
                         <RadioGroup defaultValue="major" onValueChange={(val) => setIsMajor(val === 'major')} className="flex gap-4 items-center">
                            <div className="flex items-center space-x-2"> <RadioGroupItem value="major" id="r1" /> <Label htmlFor="r1">Major Course</Label> </div>
                            <div className="flex items-center space-x-2"> <RadioGroupItem value="non-major" id="r2" /> <Label htmlFor="r2">Non-Major Course</Label> </div>
                         </RadioGroup>
                    </div>
                    {!isMajor && (
                        <div className='space-y-2'>
                           <Label>Offered To Department</Label>
                           <Select onValueChange={(val) => setSelectedForDept(Number(val))} required>
                                <SelectTrigger> <SelectValue placeholder="Select Department Offered To" /> </SelectTrigger>
                                <SelectContent className='bg-white'> {departments.filter((dep: Department) => dep.id !== (departmentId ?? selectedDepartmentId)).map((dep: Department) => <SelectItem className='hover:bg-gray-200' key={dep.id} value={String(dep.id)}>{dep.name} ({dep.acronym})</SelectItem>)} </SelectContent>
                           </Select>
                        </div>
                    )}
                    <Button type="submit" disabled={loading || (!isMajor && !selectedForDept)} className="mt-2 w-full sm:w-auto border hover:underline">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Course
                    </Button>
                </form>
            ) : (
                <form onSubmit={handleCsvUpload} className="mb-6 max-w-2xl flex flex-col gap-4 p-4 border rounded-lg bg-white">
                    <h3 className="text-xl font-bold">Upload Courses via CSV</h3>
                    <p className="text-sm text-muted-foreground">The CSV file must contain the following columns: <strong>name, code, credits, type, isMajor, forDeptAcronym</strong>.</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li><code>type</code> should be one of: THEORY, LAB, PROJECT, THESIS.</li>
                        <li><code>isMajor</code> should be 'true' or 'false'.</li>
                        <li><code>forDeptAcronym</code> is required for non-major courses. It's the acronym of the department the course is offered TO.</li>
                    </ul>
                    <div className='space-y-2'>
                        <Label htmlFor='csv-upload'>CSV File</Label>
                        <Input id='csv-upload' type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)} required disabled={loading} className='cursor-pointer text-gray-800' />
                    </div>
                    <Button type="submit" disabled={loading || !csvFile} className="mt-2 w-full sm:w-auto border hover:underline cursor-pointer">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Upload CSV
                    </Button>
                </form>
            )}
        </div>
    );
};

const ManageCourseView: React.FC<any> = ({ courses, departments, departmentId, selectedDepartmentId, user, loading, handleDeleteCourse, handleArchiveCourse }) => {
    const [courseFilter, setCourseFilter] = useState<'all' | 'major' | 'non-major' | 'offered'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
    const itemsPerPage = 10;

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

    const confirmDelete = (course: Course) => {
        setCourseToDelete(course);
        setIsDeleteDialogOpen(true);
    };

    const executeDelete = () => {
        if (courseToDelete) {
            handleDeleteCourse(courseToDelete.id);
        }
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Active Courses</h2>
            <div className="flex gap-2 mb-4 flex-wrap border-b pb-4">
                {(['all', 'major', 'non-major', 'offered'] as const).map(filter => (
                     <Button key={filter} variant={courseFilter === filter ? 'default' : 'outline'} size="sm" onClick={() => { setCourseFilter(filter); setCurrentPage(1); }}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')} Courses
                    </Button>
                ))}
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableCaption>A list of active courses. Page {currentPage} of {totalPages}.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-[120px] text-gray-800'>Code</TableHead>
                            <TableHead className='text-gray-800'>Name</TableHead>
                            <TableHead className='text-center text-gray-800'>Credits</TableHead>
                            <TableHead className='text-gray-800'>Type</TableHead>
                            <TableHead className='text-gray-800'>Owning Dept.</TableHead>
                            <TableHead className='text-gray-800'>Offered To</TableHead>
                            <TableHead className='text-right text-gray-800'>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedCourses.map((course: Course) => {
                             const departmentAcronym = course.department?.acronym || departments.find((dep: Department) => dep.id === course.departmentId)?.acronym || 'N/A';
                             const forDepartmentAcronym = course.forDepartment?.acronym || departments.find((dep: Department) => dep.id === course.forDept)?.acronym || 'N/A';
                             const canEdit = user?.role === 'super_admin' || (departmentId ?? selectedDepartmentId) === course.departmentId;

                            return (
                                <TableRow key={course.id}>
                                    <TableCell className='font-medium'>{course.code}</TableCell>
                                    <TableCell>{course.name}</TableCell>
                                    <TableCell className='text-center'>{course.credits}</TableCell>
                                    <TableCell>{course.type}</TableCell>
                                    <TableCell>{departmentAcronym}</TableCell>
                                    <TableCell>{forDepartmentAcronym}</TableCell>
                                    <TableCell className='text-right'>
                                        {canEdit && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleArchiveCourse(course.id)}>
                                                        <Archive className="mr-2 h-4 w-4" /> Archive
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => confirmDelete(course)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                 {loading && courses.length === 0 && <div className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>}
                 {!loading && displayedCourses.length === 0 && <div className="text-center p-8 text-muted-foreground">No courses match the current filter.</div>}
            </div>
            
            {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}> <ChevronLeft className="h-4 w-4" /> Previous </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}> Next <ChevronRight className="h-4 w-4" /> </Button>
                </div>
            )}

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the course "{courseToDelete?.name}" and all of its associated data from the servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null} Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
        setError(''); setSuccess('');
        try {
            const res = await api.get("/get-courses", { params: { departmentId, isArchived: true }, withCredentials: true });
            const sorted = res.data.sort((a: Course, b: Course) => a.code.localeCompare(b.code));
            setArchivedCourses(sorted);
        } catch (err) { setError("Failed to fetch archived courses."); } 
        finally { setLoading(false); }
    }, [departmentId]);
    
    useEffect(() => { fetchArchivedCourses(); }, [fetchArchivedCourses]);
    
    const handleUnarchiveCourse = async (courseId: number) => {
        setLoading(true);
        setError(''); setSuccess('');
        try {
            await api.patch("/unarchive-course", { courseId }, { withCredentials: true });
            setSuccess("Course has been unarchived successfully.");
            fetchArchivedCourses();
        } catch (err: unknown) {
            const apiErr = err as ApiError;
            setError(apiErr.response?.data?.error ?? "Failed to unarchive course.");
        } finally { setLoading(false); }
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Archived Courses</h2>
             {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
             {success && <Alert variant="default" className="mb-4 bg-green-50 border-green-200"><CheckCircle className="h-4 w-4 text-green-500" /><AlertTitle>Success</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}
            
            <div className='border rounded-lg'>
                <Table>
                    <TableCaption>A list of archived courses for this department.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead className='w-[100px] text-center'>Credits</TableHead>
                            <TableHead className='w-[150px]'>Type</TableHead>
                            <TableHead className='w-[150px] text-right'>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {archivedCourses.map(course => (
                            <TableRow key={course.id}>
                                <TableCell>
                                    <div className="font-medium">{course.name}</div>
                                    <div className="text-sm text-muted-foreground">{course.code}</div>
                                </TableCell>
                                <TableCell className='text-center'>{course.credits}</TableCell>
                                <TableCell>{course.type}</TableCell>
                                <TableCell className='text-right'>
                                    <Button size="sm" variant="outline" onClick={() => handleUnarchiveCourse(course.id)} disabled={loading}>
                                        <ArchiveRestore className="mr-2 h-4 w-4" /> Unarchive
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {loading && archivedCourses.length === 0 && <div className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>}
                {!loading && archivedCourses.length === 0 && <div className="text-center p-8 text-muted-foreground">No archived courses found for this department.</div>}
            </div>
        </div>
    );
};

export default ManageCoursesPage;