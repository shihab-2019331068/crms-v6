// Overwrite the entire contents of viewRoutine.tsx with the following code:

"use client";
import React, { useState, useMemo, useEffect } from "react";
import api from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, X, Filter } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  if (studentId) {
    return <StudentRoutineView studentId={studentId} />;
  }
  if (departmentId) {
    return <DepartmentRoutineView departmentId={departmentId} />;
  }
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Could not determine context. No student or department specified.</AlertDescription>
    </Alert>
  );
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
const DepartmentRoutineView = ({ departmentId }: { departmentId: number }) => {
  const [routine, setRoutine] = useState<RoutineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [filter, setFilter] = useState<{ type: string; value: string }>({ type: '', value: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [routineRes, semRes, teachRes, roomRes, labRes] = await Promise.all([
          api.get("/routine/final", { params: { departmentId } }),
          api.get("/semesters", { params: { departmentId } }),
          api.get("/teachers", { params: { departmentId } }),
          api.get("/rooms", { params: { departmentId } }),
          api.get("/labs", { params: { departmentId } }),
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
    if (departmentId) fetchData();
  }, [departmentId]);

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

  if (loading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-4">
       <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-card items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2 w-full sm:w-auto"><Filter className="h-4 w-4" /> Filters</h3>
            <Select value={filter.type === 'semester' ? filter.value : ''} onValueChange={v => setFilter({type: 'semester', value: v})}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Semester" /></SelectTrigger>
                <SelectContent className="bg-black text-white">{semesters.map(s => <SelectItem className="hover:bg-gray-800" key={s.id} value={String(s.id)}>{s.shortname || s.name}</SelectItem>)}</SelectContent>
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
      <RoutineGridDisplay routineGrid={routineGrid} />
    </div>
  );
};

// --- SHARED UI COMPONENTS ---

const RoutineGridDisplay = ({ routineGrid }: { routineGrid: { [key: string]: RoutineEntry[] } }) => (
  <div className="overflow-x-auto">
    <div className="grid gap-px bg-border" style={{ gridTemplateColumns: `auto repeat(${timeSlots.length}, minmax(180px, 1fr))` }}>
      {/* Time Headers */}
      <div className="p-2 font-semibold bg-card sticky left-0 z-10">Day</div>
      {timeSlots.map(time => (
        <div key={time} className="p-2 font-semibold bg-card text-center">
          {`${time} - ${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}:00`}
        </div>
      ))}

      {/* Rows for each day */}
      {daysOfWeek.map(day => (
        <React.Fragment key={day}>
          {/* Day Header Cell */}
          <div className="p-2 font-semibold bg-card sticky left-0 z-10 flex items-center justify-center">
            {day.charAt(0) + day.slice(1).toLowerCase()}
          </div>

          {/* Cells for each time slot */}
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
  const cardColor = isBreak ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400'
                    : entry.labId ? 'routine-lab dark:bg-green-900 border-green-400'
                    : 'routine-theory dark:bg-blue-900 border-blue-400';

  return (
    <div className={`p-2 rounded-md border text-xs ${cardColor}`}>
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
