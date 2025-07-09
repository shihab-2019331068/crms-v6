"use client";
import React, { useState, useMemo, useEffect } from "react";
import api from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, X, Filter } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner"; // Using sonner for notifications

// --- INTERFACES & TYPES ---
interface RoutineEntry {
  id: number;
  semesterId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  courseId: number | null;
  roomId: number | null;
  labId: number | null;
  teacherId: number | null;
  isBreak: boolean;
  breakName?: string;
  CANCELED: boolean; // Added to see canceled status
  course?: { code: string; name: string };
  teacher?: { name: string };
  room?: { roomNumber: string };
  lab?: { labNumber: string };
  semester?: { shortname: string };
}
interface Semester { id: number; name: string; session?: string; shortname?: string; }
interface Teacher { id: number; name: string; departmentId: number; }
interface Room { id: number; roomNumber: string; }
interface Lab { id: number; labNumber: string; }
// Added Department interface, referencing mngDept.tsx
interface Department {
  id: number;
  name: string;
  acronym: string;
}
type DayOfWeek = "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY";

const daysOfWeek: DayOfWeek[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];
const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

// --- PROPS FOR THE MAIN PAGE ---
interface ViewRoutinePageProps {
  departmentId?: number;
  studentId?: number;
}

// --- MAIN ROUTER COMPONENT ---
export default function ViewRoutinePage({ departmentId, studentId }: ViewRoutinePageProps) {
  // The DepartmentRoutineView is now smart enough to handle both cases
  return <DepartmentRoutineView departmentId={departmentId} />;
}

// --- STUDENT-SPECIFIC VIEW ---
const StudentRoutineView = ({ studentId }: { studentId: number }) => {
  const [routine, setRoutine] = useState<RoutineEntry[]>([]);
  const [studentName, setStudentName] = useState('');
  const [semesterName, setSemesterName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentRoutine = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/routine/student/${studentId}`);
        setRoutine(res.data.routine || []);
        setStudentName(res.data.student?.name || '');
        setSemesterName(res.data.semester ? `${res.data.semester.name} (${res.data.semester.session})` : 'Current Semester');
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch your routine.");
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchStudentRoutine();
  }, [studentId]);

  const routineGrid = useMemo(() => {
    const grid: { [key: string]: RoutineEntry[] } = {};
    routine.forEach(entry => {
      const key = `${entry.dayOfWeek}|${entry.startTime}`;
      if (!grid[key]) grid[key] = [];
      grid[key].push(entry);
    });
    return grid;
  }, [routine]);

  if (loading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Loading your routine...</span></div>;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-card">
        <h1 className="text-xl font-bold">Class Routine for {studentName}</h1>
        <p className="text-muted-foreground">{semesterName}</p>
      </div>
      {routine.length === 0 && !loading && (
        <Alert><AlertCircle className="h-4 w-4" /><AlertTitle>No Schedule Found</AlertTitle><AlertDescription>There are no classes scheduled for you in the current semester.</AlertDescription></Alert>
      )}
      <RoutineGridDisplay routineGrid={routineGrid} />
    </div>
  );
};

// --- DEPARTMENT-WIDE VIEW (READ-ONLY) ---
const DepartmentRoutineView = ({ departmentId }: { departmentId?: number }) => {
  // State for data
  const [routine, setRoutine] = useState<RoutineEntry[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);

  // State for UI and selection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ type: string; value: string }>({ type: '', value: '' });
  
  // New state for department selection
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [isDeptListLoading, setIsDeptListLoading] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | undefined>(departmentId?.toString());


  // Effect to fetch all departments for the selector, if needed
  useEffect(() => {
    if (!departmentId) { // Only fetch if it's a general view, not a department-specific one
      const fetchAllDepartments = async () => {
        setIsDeptListLoading(true);
        try {
          const res = await api.get('/departments');
          setAllDepartments(res.data || []);
        } catch (err: any) {
          toast.error(err.response?.data?.error || "Could not load department list.");
        } finally {
          setIsDeptListLoading(false);
        }
      };
      fetchAllDepartments();
    }
  }, [departmentId]);


  // Effect to fetch routine data when a department is selected
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setRoutine([]); // Clear previous routine
      try {
        const [routineRes, semRes, teachRes, roomRes, labRes] = await Promise.all([
          api.get("/routine/final", { params: { departmentId: selectedDeptId } }),
          api.get("/semesters", { params: { departmentId: selectedDeptId } }),
          api.get("/teachers", { params: { departmentId: selectedDeptId } }),
          api.get("/rooms", { params: { departmentId: selectedDeptId } }),
          api.get("/labs", { params: { departmentId: selectedDeptId } }),
        ]);
        setRoutine(routineRes.data.routine || []);
        setSemesters(semRes.data);
        setTeachers(teachRes.data);
        setRooms(roomRes.data);
        setLabs(labRes.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch department routine data.");
      } finally {
        setLoading(false);
      }
    };
    if (selectedDeptId) {
      fetchData();
    }
  }, [selectedDeptId]);

  const handleDepartmentSelect = (deptId: string) => {
    setSelectedDeptId(deptId);
    setFilter({ type: '', value: '' }); // Reset other filters
  };

  const filteredRoutine = useMemo(() => {
    if (!filter.type || !filter.value) return routine;
    return routine.filter(entry => {
      switch (filter.type) {
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
  
  return (
    <div className="space-y-4">
       <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-card items-center">
            {/* Show department selector only if it's a general view */}
            {(
              <Select value={selectedDeptId} onValueChange={handleDepartmentSelect} disabled={isDeptListLoading}>
                  <SelectTrigger className="w-full sm:w-[220px] font-semibold">
                      <SelectValue placeholder="Select a Department" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                      {allDepartments.map(d => <SelectItem key={d.id} value={String(d.id)} className="hover:bg-gray-400">{d.name} ({d.acronym})</SelectItem>)}
                  </SelectContent>
              </Select>
            )}
            <h3 className="text-lg font-semibold flex items-center gap-2 w-full sm:w-auto"><Filter className="h-4 w-4" /> Filters</h3>
            <Select value={filter.type === 'semester' ? filter.value : ''} onValueChange={v => setFilter({type: 'semester', value: v})} disabled={!selectedDeptId}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Semester" /></SelectTrigger>
                <SelectContent>{semesters.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.shortname || s.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filter.type === 'teacher' ? filter.value : ''} onValueChange={v => setFilter({type: 'teacher', value: v})} disabled={!selectedDeptId}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Teacher" /></SelectTrigger>
                <SelectContent>{teachers.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filter.type === 'room' ? filter.value : ''} onValueChange={v => setFilter({type: 'room', value: v})} disabled={!selectedDeptId}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Room" /></SelectTrigger>
                <SelectContent>{rooms.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.roomNumber}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filter.type === 'lab' ? filter.value : ''} onValueChange={v => setFilter({type: 'lab', value: v})} disabled={!selectedDeptId}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Lab" /></SelectTrigger>
                <SelectContent>{labs.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.labNumber}</SelectItem>)}</SelectContent>
            </Select>
            {filter.type && <Button variant="ghost" size="icon" onClick={() => setFilter({type: '', value: ''})}><X className="h-4 w-4"/></Button>}
        </div>

      {loading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      
      {!loading && !error && selectedDeptId && <RoutineGridDisplay routineGrid={routineGrid} />}
      
      {!selectedDeptId && !departmentId && (
         <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Department Selected</AlertTitle>
            <AlertDescription>Please choose a department from the dropdown above to view its class routine.</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// --- SHARED UI COMPONENTS ---
const RoutineGridDisplay = ({ routineGrid }: { routineGrid: { [key: string]: RoutineEntry[] } }) => (
  <div className="overflow-x-auto">
    <div className="grid gap-px bg-border" style={{ gridTemplateColumns: `auto repeat(${timeSlots.length}, minmax(180px, 1fr))` }}>
      <div className="p-2 font-semibold bg-card sticky left-0 z-10">Day</div>
      {timeSlots.map(time => (
        <div key={time} className="p-2 font-semibold bg-card text-center">
          {`${time} - ${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}:00`}
        </div>
      ))}
      {daysOfWeek.map(day => (
        <React.Fragment key={day}>
          <div className="p-2 font-semibold bg-card sticky left-0 z-10 flex items-center justify-center">
            {day.charAt(0) + day.slice(1).toLowerCase()}
          </div>
          {timeSlots.map(time => {
            const key = `${day}|${time}`;
            const entries = routineGrid[key] || [];
            return (
              <div key={key} className="p-2 bg-card space-y-2 min-h-[100px]">
                {entries.map(entry => <ReadOnlyRoutineCard key={entry.id} entry={entry} />)}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const ReadOnlyRoutineCard = ({ entry }: { entry: RoutineEntry }) => {
  const isBreak = entry.isBreak;
  
  let cardColor = 'routine-theory dark:bg-blue-900 border-blue-400';
  if (isBreak) {
    cardColor = 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400';
  } else if (entry.labId) {
    cardColor = 'routine-lab dark:bg-green-900 border-green-400';
  }

  if (entry.CANCELED) {
    cardColor = 'bg-gray-200 dark:bg-gray-800 border-gray-400 text-gray-500 dark:text-gray-400';
  }

  return (
    <div className={`p-2 rounded-md border text-xs relative group transition-all ${cardColor}`}>
      {entry.CANCELED && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-md">
            <span className="font-bold text-white text-sm bg-red-600 px-2 py-1 rounded">CANCELED</span>
        </div>
      )}
      {isBreak ? (
        <p className="font-bold text-yellow-800 dark:text-yellow-200">{entry.breakName}</p>
      ) : (
        <>
          <p className="font-bold truncate">{entry.course?.name} ({entry.course?.code})</p>
          <p>T: {entry.teacher?.name || 'N/A'}</p>
          <p>R: {entry.room?.roomNumber || entry.lab?.labNumber || 'N/A'}</p>
          {entry.semester?.shortname && <p>S: {entry.semester.shortname}</p>}
        </>
      )}
    </div>
  );
};