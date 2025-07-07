// --- START OF FILE mngRoutine.tsx ---
"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import api from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FaRobot,
  FaCalendarAlt,
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaFilter,
} from "react-icons/fa";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

// --- INTERFACES & TYPES ---
interface RoutineEntry {
  id?: number;
  semesterId: number;
  departmentId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  courseId: number | null;
  roomId: number | null;
  labId: number | null;
  teacherId: number | null;
  isBreak: boolean;
  breakName?: string;
  // --- Populated data from backend
  course?: { code: string; name: string };
  teacher?: { name: string };
  room?: { roomNumber: string };
  lab?: { labNumber: string };
  semester?: { shortname: string };
}

interface Semester {
  id: number;
  name: string;
  shortname?: string;
  session?: string;
}
interface Course {
  id: number;
  name: string;
  code: string;
}
// NEW: Extended Course interface for modal
interface CourseWithTeacher extends Course {
  semesterCourseTeachers?: {
    teacherId: number;
    teacher: { name: string };
  }[];
}
interface Teacher {
  id: number;
  name: string;
}
interface Room {
  id: number;
  roomNumber: string;
}
interface Lab {
  id: number;
  labNumber: string;
}
type DayOfWeek =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

type View = "main" | "generate" | "view_edit";
type SlotInfo = { day: DayOfWeek; time: string };

const daysOfWeek: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
];
const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

// --- MAIN COMPONENT ---
export default function ManageRoutinePage({ departmentId }: { departmentId?: number }) {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState<View>("main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };
  const goBackToMain = () => {
    setView("main");
    resetMessages();
  };

  // --- VIEW RENDERING LOGIC ---
  const renderView = () => {
    if (!departmentId)
      return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>Department not selected. Please select a department first.</AlertDescription></Alert>;

    switch (view) {
      case "generate":
        return (
          <GenerateRoutineView
            departmentId={departmentId}
            onBack={goBackToMain}
            setSuccess={setSuccess}
            setError={setError}
          />
        );
      case "view_edit":
        return (
          <FullRoutineView
            departmentId={departmentId}
            onBack={goBackToMain}
            setSuccess={setSuccess}
            setError={setError}
          />
        );
      case "main":
      default:
        return <MainDashboard setView={setView} />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {view !== "main" && (
        <Button variant="outline" onClick={goBackToMain}>
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
        <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {renderView()}
    </div>
  );
}

// --- SUB-COMPONENTS ---

const MainDashboard: React.FC<{ setView: (view: View) => void }> = ({
  setView,
}) => (
  <div className="text-center">
    <h1 className="text-3xl md:text-4xl font-bold mb-8">Routine Management</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
      <Card
        onClick={() => setView("generate")}
        className="cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg"
      >
        <CardHeader className="items-center text-center">
          <FaRobot className="h-16 w-16 text-blue-500 mb-4" />
          <CardTitle className="text-2xl">Generate Routine</CardTitle>
          <CardDescription>
            Automatically create a routine for major courses of selected
            semesters.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card
        onClick={() => setView("view_edit")}
        className="cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg"
      >
        <CardHeader className="items-center text-center">
          <FaCalendarAlt className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl">View & Edit Routine</CardTitle>
          <CardDescription>
            View the full schedule, filter, and manually add or modify class
            slots.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  </div>
);

const GenerateRoutineView: React.FC<{
  departmentId: number;
  onBack: () => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}> = ({ departmentId, setSuccess, setError }) => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterIds, setSelectedSemesterIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<RoutineEntry[] | null>(null);
  const [unassigned, setUnassigned] = useState<{ name: string, code: string }[] | null>(null);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await api.get<Semester[]>("/dashboard/department-admin/semesters", {
          params: { departmentId },
          withCredentials: true,
        });
        setSemesters(res.data); // Only active semesters
      } catch {
        setError("Failed to fetch active semesters.");
      }
    };
    fetchSemesters();
  }, [departmentId, setError]);
  
  const handleSemesterToggle = (semesterId: number) => {
    setSelectedSemesterIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(semesterId)) {
            newSet.delete(semesterId);
        } else {
            newSet.add(semesterId);
        }
        return newSet;
    });
  };

  const handlePreview = async () => {
    if (selectedSemesterIds.size === 0) {
      setError("Please select at least one semester to generate the routine for.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    setPreview(null);
    setUnassigned(null);
    try {
      const res = await api.post("/routine/preview", {
        departmentId,
        semesterIds: Array.from(selectedSemesterIds),
      });
      setPreview(res.data.routine);
      setUnassigned(res.data.unassigned);
      setSuccess(
        `Preview generated with ${res.data.routine.length} classes scheduled.`
      );
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate preview.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preview || preview.length === 0) {
      setError("No routine to save.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/routine/generate", {
        routine: preview,
        semesterIds: Array.from(selectedSemesterIds),
        departmentId,
      });
      setSuccess(res.data.message || "Routine saved successfully!");
      setPreview(null);
      setUnassigned(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save routine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Generate Routine for Major Courses</CardTitle>
        <CardDescription>
          This tool will attempt to schedule all major courses for the selected
          semesters. Non-major courses or special classes must be added manually.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          <div className="flex-grow w-full">
            <Label>Select Semesters</Label>
            <div className="p-3 border rounded-md max-h-40 overflow-y-auto space-y-2 mt-1">
              {semesters.length > 0 ? semesters.map((sem) => (
                <div key={sem.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sem-${sem.id}`}
                    checked={selectedSemesterIds.has(sem.id)}
                    onCheckedChange={() => handleSemesterToggle(sem.id)}
                  />
                  <Label htmlFor={`sem-${sem.id}`} className="font-normal cursor-pointer">
                    {sem.name} ({sem.session})
                  </Label>
                </div>
              )) : <p className="text-sm text-muted-foreground">No active semesters found.</p>}
            </div>
          </div>
          <Button onClick={handlePreview} disabled={loading || selectedSemesterIds.size === 0} className="w-full md:w-auto border cursor-pointer hover:underline">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Preview
          </Button>
        </div>

        {preview && (
          <div className="border p-4 rounded-md space-y-4">
            <h3 className="font-semibold">Generation Result</h3>
            <p>
              Successfully scheduled:{" "}
              <span className="font-bold text-green-600">
                {preview.length} class slots
              </span>
            </p>
            {unassigned && unassigned.length > 0 && (
              <div>
                <p>
                  Failed to schedule:{" "}
                  <span className="font-bold text-red-600">
                    {unassigned.length} courses
                  </span>
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                  {unassigned.map((course, idx) => (
                    <li key={idx}>
                      {course.name} ({course.code})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button onClick={handleSave} disabled={loading} className="w-full border cursor-pointer hover:underline">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save This Routine
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FullRoutineView: React.FC<{
  departmentId: number;
  onBack: () => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}> = ({ departmentId, setSuccess, setError }) => {
    const [routine, setRoutine] = useState<RoutineEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalSlot, setModalSlot] = useState<SlotInfo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter states
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [labs, setLabs] = useState<Lab[]>([]);
    const [filter, setFilter] = useState<{ type: string, value: string }>({ type: '', value: '' });

    const fetchRoutineData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/routine/final", { params: { departmentId } });
            setRoutine(res.data.routine || []);
        } catch {
            setError("Failed to fetch routine data.");
        } finally {
            setLoading(false);
        }
    }, [departmentId, setError]);

    useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const [semRes, teachRes, roomRes, labRes] = await Promise.all([
                    api.get("/semesters", { params: { departmentId } }),
                    api.get("/teachers", { params: { departmentId } }),
                    api.get("/rooms", { params: { departmentId } }),
                    api.get("/labs", { params: { departmentId } }),
                ]);
                setSemesters(semRes.data);
                setTeachers(teachRes.data);
                setRooms(roomRes.data);
                setLabs(labRes.data);
            } catch {
                setError("Failed to load filter options.");
            }
        };

        fetchRoutineData();
        fetchFiltersData();
    }, [departmentId, fetchRoutineData, setError]);
    
    const handleAddSlot = (slotInfo: SlotInfo) => {
        setModalSlot(slotInfo);
        setIsModalOpen(true);
    };

    const handleDelete = async (entryId: number) => {
        // if (!window.confirm("Are you sure you want to delete this schedule entry?")) return;
        try {
            await api.delete(`/routine/entry/${entryId}`);
            setSuccess("Entry deleted successfully.");
            fetchRoutineData(); // Refresh data
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to delete entry.");
        }
    };

    const filteredRoutine = useMemo(() => {
        if (!filter.type || !filter.value) return routine;
        
        return routine.filter(entry => {
            switch(filter.type) {
                case 'semester': return entry.semesterId === Number(filter.value);
                case 'teacher': return entry.teacherId === Number(filter.value);
                case 'room': return entry.roomId === Number(filter.value);
                case 'lab': return entry.labId === Number(filter.value);
                default: return true;
            }
        });
    }, [routine, filter]);
    
    const routineGrid = useMemo(() => {
        const grid: { [key: string]: RoutineEntry[] } = {};
        filteredRoutine.forEach(entry => {
            const key = `${entry.dayOfWeek}|${entry.startTime}`;
            if (!grid[key]) grid[key] = [];
            grid[key].push(entry);
        });
        return grid;
    }, [filteredRoutine]);
    
    if (loading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>

    return (
    <div>
        <div className="flex flex-wrap gap-4 mb-4 p-4 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold flex items-center gap-2 w-full sm:w-auto"><FaFilter /> Filters</h3>
            <Select value={filter.type === 'semester' ? filter.value : ''} onValueChange={v => setFilter({type: 'semester', value: v})}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Semester" /></SelectTrigger>
                <SelectContent  className="bg-black text-white">{semesters.map(s => <SelectItem className="hover:bg-gray-800" key={s.id} value={String(s.id)}>{s.shortname || s.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filter.type === 'teacher' ? filter.value : ''} onValueChange={v => setFilter({type: 'teacher', value: v})}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Teacher" /></SelectTrigger>
                <SelectContent className="bg-black text-white">{teachers.map(t => <SelectItem className="hover:bg-gray-800" key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filter.type === 'room' ? filter.value : ''} onValueChange={v => setFilter({type: 'room', value: v})}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Room" /></SelectTrigger>
                <SelectContent className="bg-black text-white">{rooms.map(r => <SelectItem className="hover:bg-gray-800" key={r.id} value={String(r.id)}>{r.roomNumber}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filter.type === 'lab' ? filter.value : ''} onValueChange={v => setFilter({type: 'lab', value: v})}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Lab" /></SelectTrigger>
                <SelectContent className="bg-black text-white">{labs.map(l => <SelectItem className="hover:bg-gray-800" key={l.id} value={String(l.id)}>{l.labNumber}</SelectItem>)}</SelectContent>
            </Select>
            {filter.type && <Button variant="ghost" size="icon" onClick={() => setFilter({type: '', value: ''})}><X className="h-4 w-4"/></Button>}
        </div>

        <div className="overflow-x-auto">
            <div className="grid gap-px bg-border" style={{ gridTemplateColumns: `auto repeat(${timeSlots.length}, minmax(180px, 1fr))` }}>
                <div className="p-2 font-semibold bg-background sticky left-0 z-10">Day</div>
                {timeSlots.map(time => (
                    <div key={time} className="p-2 font-semibold bg-background text-center">
                        {`${time} - ${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}:00`}
                    </div>
                ))}

                {daysOfWeek.map(day => (
                    <React.Fragment key={day}>
                        <div className="p-2 font-semibold bg-background sticky left-0 z-10 flex items-center justify-center">
                            {day}
                        </div>
                        {timeSlots.map(time => {
                            const key = `${day}|${time}`;
                            const entries = routineGrid[key] || [];
                            return (
                                <div key={key} className="p-2 bg-card space-y-2 min-h-[120px] flex flex-col">
                                    {entries.map(entry => (
                                        <RoutineCard key={entry.id} entry={entry} onDelete={handleDelete}  />
                                    ))}
                                    <div className="flex-grow"></div>
                                    <Button variant="ghost" size="sm" className="w-full mt-auto cursor-pointer hover:underline" onClick={() => handleAddSlot({ day, time })}>
                                        <FaPlus className="mr-2 h-3 w-3" /> Add
                                    </Button>
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
        {modalSlot && <AddSlotModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} slotInfo={modalSlot} departmentId={departmentId} onSaveSuccess={fetchRoutineData} setSuccess={setSuccess} setError={setError} />}
    </div>
    );
};

const RoutineCard: React.FC<{ entry: RoutineEntry, onDelete: (id: number) => void }> = ({ entry, onDelete }) => {
    const isBreak = entry.isBreak;
    const cardColor = isBreak ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400' : 
                      entry.labId ? 'routine-lab border-indigo-400' : 
                      'routine-theory border-green-400';

    return (
        <div className={`p-2 rounded-md border text-xs ${cardColor} relative group`}>
            {isBreak ? (
                <p className="font-bold text-yellow-800 dark:text-yellow-200">{entry.breakName}</p>
            ) : (
                <>
                    <p className="font-bold truncate">{entry.course?.name} ({entry.course?.code})</p>
                    <p>T: {entry.teacher?.name || 'N/A'}</p>
                    <p>R: {entry.room?.roomNumber || entry.lab?.labNumber || 'N/A'}</p>
                    <p>S: {entry.semester?.shortname || 'N/A'}</p>
                </>
            )}
             <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 cursor-pointer" onClick={() => entry.id && onDelete(entry.id)}>
                <FaTrash className="h-3 w-3 text-red-500" />
            </Button>
        </div>
    );
};

const AddSlotModal: React.FC<{
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    slotInfo: SlotInfo;
    departmentId: number;
    onSaveSuccess: () => void;
    setSuccess: (msg: string) => void;
    setError: (msg: string) => void;
}> = ({ isOpen, setIsOpen, slotInfo, departmentId, onSaveSuccess, setSuccess, setError }) => {
    const [loading, setLoading] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [breakName, setBreakName] = useState("");
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    
    const [semesterCourses, setSemesterCourses] = useState<CourseWithTeacher[]>([]);
    const [courseLoading, setCourseLoading] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");

    const [selectedTeacher, setSelectedTeacher] = useState<string>("");
    const [selectedRoom, setSelectedRoom] = useState<string>("");
    const [selectedLab, setSelectedLab] = useState<string>("");
    
    const [allData, setAllData] = useState<{
        semesters: Semester[], teachers: Teacher[], rooms: Room[], labs: Lab[]
    }>({ semesters: [], teachers: [], rooms: [], labs: [] });

    useEffect(() => {
        const fetchPrerequisites = async () => {
             if(!isOpen) return;
             try {
                const [semRes, teachRes, roomRes, labRes] = await Promise.all([
                    api.get("/semesters", { params: { departmentId } }),
                    api.get("/teachers", { params: { departmentId } }),
                    api.get("/rooms", { params: { departmentId } }),
                    api.get("/labs", { params: { departmentId } }),
                ]);
                setAllData({
                    semesters: semRes.data,
                    teachers: teachRes.data,
                    rooms: roomRes.data,
                    labs: labRes.data,
                });
            } catch {
                setError("Failed to load data for modal.");
            }
        };
        fetchPrerequisites();
    }, [isOpen, departmentId, setError]);

    useEffect(() => {
        if (!selectedSemester) {
            setSemesterCourses([]);
            setSelectedCourseId("");
            setSelectedTeacher("");
            return;
        }

        const fetchCoursesForSemester = async () => {
            setCourseLoading(true);
            setSelectedCourseId("");
            setSelectedTeacher("");
            try {
                const res = await api.get(`/get-semester-courses/${selectedSemester}`);
                setSemesterCourses(res.data);
            } catch (err) {
                setError("Failed to fetch courses for the selected semester.");
                setSemesterCourses([]);
            } finally {
                setCourseLoading(false);
            }
        };

        fetchCoursesForSemester();
    }, [selectedSemester, setError]);
    
    const handleCourseChange = (courseId: string) => {
        setSelectedCourseId(courseId);
        const course = semesterCourses.find(c => c.id === Number(courseId));
        const assignment = course?.semesterCourseTeachers?.[0];

        if (assignment?.teacherId) {
            setSelectedTeacher(String(assignment.teacherId));
        } else {
            setSelectedTeacher("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(''); setSuccess('');

        const payload: Partial<RoutineEntry> = {
            departmentId,
            dayOfWeek: slotInfo.day,
            startTime: slotInfo.time,
            endTime: `${String(Number(slotInfo.time.slice(0, 2)) + 1).padStart(2, "0")}:00`,
            isBreak,
            semesterId: Number(selectedSemester),
        };

        if (isBreak) {
            if (!breakName) { setError("Break name is required."); setLoading(false); return; }
            if (!selectedSemester) { setError("Semester is required for breaks too."); setLoading(false); return; }
            payload.breakName = breakName;
        } else {
            if (!selectedSemester || !selectedCourseId || !selectedTeacher || (!selectedRoom && !selectedLab)) {
                setError("All fields (Semester, Course, Teacher, and Room/Lab) are required.");
                setLoading(false);
                return;
            }
            payload.courseId = Number(selectedCourseId);
            payload.teacherId = Number(selectedTeacher);
            payload.roomId = selectedRoom ? Number(selectedRoom) : null;
            payload.labId = selectedLab ? Number(selectedLab) : null;
        }

        try {
            await api.post('/routine/entry', payload);
            setSuccess("Schedule slot added successfully!");
            onSaveSuccess();
            setIsOpen(false);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to add slot.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Schedule Slot</DialogTitle>
                    <p className="text-sm text-muted-foreground">{slotInfo.day} at {slotInfo.time}</p>

                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="flex items-center space-x-2">
                        <Switch id="is-break" checked={isBreak} onCheckedChange={setIsBreak} />
                        <Label htmlFor="is-break">Is this a break?</Label>
                    </div>
                    <div>
                        <Label>Semester *</Label>
                        <Select onValueChange={setSelectedSemester} value={selectedSemester} required>
                            <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                            <SelectContent className="bg-black text-white">{allData.semesters.map(s => <SelectItem className="hover:bg-gray-800" key={s.id} value={String(s.id)}>{s.name} ({s.session})</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    {isBreak ? (
                        <div>
                            <Label htmlFor="break-name">Break Name *</Label>
                            <Input id="break-name" value={breakName} onChange={e => setBreakName(e.target.value)} placeholder="e.g., Lunch Break" />
                        </div>
                    ) : (
                        <>
                            <div>
                                <Label>Course *</Label>
                                <Select onValueChange={handleCourseChange} value={selectedCourseId} required disabled={!selectedSemester || courseLoading}>
                                    <SelectTrigger><SelectValue placeholder={courseLoading ? "Loading courses..." : "Select Course"} /></SelectTrigger>
                                    <SelectContent className="bg-black text-white">
                                      {semesterCourses.map(c => <SelectItem className="hover:bg-gray-800" key={c.id} value={String(c.id)}>{c.name} ({c.code})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Teacher *</Label>
                                <Select 
                                    onValueChange={setSelectedTeacher} 
                                    value={selectedTeacher} 
                                    required 
                                    disabled={!!semesterCourses.find(c => c.id === Number(selectedCourseId))?.semesterCourseTeachers?.length}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                                    <SelectContent className="bg-black text-white">{allData.teachers.map(t => <SelectItem className="hover:bg-gray-800" key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label>Room</Label>
                                    <Select onValueChange={setSelectedRoom} value={selectedRoom} disabled={!!selectedLab}>
                                        <SelectTrigger><SelectValue placeholder="Select Room" /></SelectTrigger>
                                        <SelectContent className="bg-black text-white">{allData.rooms.map(r => <SelectItem className="hover:bg-gray-800" key={r.id} value={String(r.id)}>{r.roomNumber}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <Label>Lab</Label>
                                    <Select onValueChange={setSelectedLab} value={selectedLab} disabled={!!selectedRoom}>
                                        <SelectTrigger><SelectValue placeholder="Select Lab" /></SelectTrigger>
                                        <SelectContent className="bg-black text-white">{allData.labs.map(l => <SelectItem className="hover:bg-gray-800" key={l.id} value={String(l.id)}>{l.labNumber}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </>
                    )}
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="border hover:underline cursor-pointer">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Slot
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}