"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/services/api";
import GenerateRoutine from "./generateRoutine";

// Interfaces
interface RoutineEntry {
  semesterId: number | null;
  dayOfWeek: string | null;
  startTime: string | null;
  endTime: string | null;
  courseId: number | null;
  roomId: number | null;
  labId: number | null; // Added labId
  teacherId: number | null;
  isBreak: boolean;
  note?: string;
}

interface Semester {
  id: number;
  name: string;
  shortname?: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
  teacherId: number;
  isLab: boolean; // Added isLab
}

interface Room {
  id: number;
  roomNumber: string;
}

interface Lab { // New Lab interface
  id: number;
  labNumber: string;
}

interface Teacher {
  id: number;
  name: string;
}

interface FinalRoutineProps {
  departmentId?: number;
}

export default function FinalRoutine({ departmentId }: FinalRoutineProps) {
  const [routine, setRoutine] = useState<RoutineEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGenerateRoutine, setShowGenerateRoutine] = useState(false);

  // Filter states
  const [filterType, setFilterType] = useState<"room" | "lab" | "semester" | "course" | "teacher" | "">("");
  const [filterValue, setFilterValue] = useState<number | null>(null);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [teacherCourses, setTeacherCourses] = useState<number[]>([]);

  // Data states for lookups
  const [allSemesters, setAllSemesters] = useState<Semester[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [allLabs, setAllLabs] = useState<Lab[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Fetch final routine
  useEffect(() => {
    if (!departmentId) return;
    const fetchRoutine = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/routine/final?departmentId=${departmentId}`);
        setRoutine(res.data.routine);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error?.response?.data?.error || "Failed to fetch final routine.");
      }
      setLoading(false);
    };
    fetchRoutine();
  }, [departmentId]);

  // Fetch supporting data for lookups
  useEffect(() => {
    if (!departmentId) return;
    const fetchAllData = async () => {
      try {
        const [semestersRes, coursesRes, roomsRes, teachersRes, labsRes] = await Promise.all([
          api.get<Semester[]>("/semesters", { params: { departmentId }, withCredentials: true }),
          api.get<Course[]>("/courses", { params: { departmentId }, withCredentials: true }),
          api.get<Room[]>("/rooms", { params: { departmentId }, withCredentials: true }),
          api.get<Teacher[]>("/teachers", { params: { departmentId }, withCredentials: true }),
          api.get<Lab[]>("/labs", { params: { departmentId }, withCredentials: true }),
        ]);
        setAllSemesters(semestersRes.data);
        setAllCourses(coursesRes.data);
        setAllRooms(roomsRes.data);
        setTeachers(teachersRes.data || []);
        setAllLabs(labsRes.data);
      } catch (err) {
        console.error("Failed to fetch supporting data:", err);
        setError("Failed to load routine metadata. Some information may be missing.");
      }
    };
    fetchAllData();
  }, [departmentId]);

  // When a teacher is selected, find their courses
  useEffect(() => {
    if (teacherId) {
      const courses = allCourses
        .filter((c) => c.teacherId === teacherId)
        .map((c) => c.id);
      setTeacherCourses(courses);
    } else {
      setTeacherCourses([]);
    }
  }, [teacherId, allCourses]);

  // Create lookup maps
  const semesterMap = useMemo(() => new Map(allSemesters.map(s => [s.id, s.shortname || s.name])), [allSemesters]);
  const courseMap = useMemo(() => new Map(allCourses.map(c => [c.id, { name: c.name, isLab: c.isLab }])), [allCourses]);
  const courseTeacher = useMemo(() => new Map(allCourses.map(c => [c.id, c.teacherId])), [allCourses]);
  const roomMap = useMemo(() => new Map(allRooms.map(r => [r.id, r.roomNumber])), [allRooms]);
  const labMap = useMemo(() => new Map(allLabs.map(l => [l.id, l.labNumber])), [allLabs]);
  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

  // Extract unique rooms, semesters, and courses from preview
  const uniqueRooms = useMemo(() => {
    if (!routine) return [];
    const ids = Array.from(new Set(routine.map(e => e.roomId).filter(Boolean)));
    return ids as number[];
  }, [routine]);
  const uniqueLabs = useMemo(() => {
    if (!routine) return [];
    const ids = Array.from(new Set(routine.map(e => e.labId).filter(Boolean)));
    return ids as number[];
  }, [routine]);
  const uniqueSemesters = useMemo(() => {
    if (!routine) return [];
    const ids = Array.from(new Set(routine.map(e => e.semesterId).filter(Boolean)));
    return ids as number[];
  }, [routine]);
  const uniqueCourses = useMemo(() => {
    if (!routine) return [];
    const ids = Array.from(new Set(routine.map(e => e.courseId).filter(Boolean)));
    return ids as number[];
  }, [routine]);
  const uniqueTeachers = useMemo(() => {
    if (!routine) return [];
    const ids = Array.from(new Set(routine.map(e => e.teacherId).filter(Boolean)));
    return ids as number[];
  }, [routine]);

  // Filtered routine
  const filteredRoutine = useMemo(() => {
    if (!routine) return null;
    if (!filterType) return routine;

    if (filterType === "room") {
      if (!filterValue) return routine;
      return routine.filter((e) => e.roomId === filterValue);
    }
    if (filterType === "lab") {
      if (!filterValue) return routine;
      return routine.filter((e) => e.labId === filterValue);
    }
    if (filterType === "semester") {
      if (!filterValue) return routine;
      return routine.filter((e) => e.semesterId === filterValue);
    }
    if (filterType === "course") {
      if (!filterValue) return routine;
      return routine.filter((e) => e.courseId === filterValue);
    }
    if (filterType === "teacher") {
      if (!teacherId) return routine;
      return routine.filter((e) => teacherCourses.includes(Number(e.courseId)));
    }
    return routine;
  }, [routine, filterType, filterValue, teacherId, teacherCourses]);

  // Helpers
  const fixedTimeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const formatTime12Hour = (time: string) => {
    if (!time) return "";
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour.toString().padStart(2, "0")}:${minute} ${ampm}`;
  };
  const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const getCellEntries = (entries: RoutineEntry[], day: string, time: string) => {
    return entries.filter((r) => r.dayOfWeek?.toUpperCase() === day.toUpperCase() && r.startTime === time);
  };

  return (
    <div className="rounded p-8 shadow-2xl bg-dark">
      <h2 className="font-bold mb-4 text-lg">
        Final Routine
        <button
          className="btn btn-xs btn-outline ml-2 cursor-pointer custom-bordered-btn"
          onClick={() => setShowGenerateRoutine(prev => !prev)}
        >
          {showGenerateRoutine ? "Hide Editor" : "Edit Routine"}
        </button>
      </h2>
      {showGenerateRoutine && (
        <div className="mb-4">
          <GenerateRoutine departmentId={departmentId} />
        </div>
      )}
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}
      {routine && (
        <>
          {/* Filter Controls */}
          <div className="flex gap-4 mb-4">
            <select
              className="input input-bordered bg-gray-700 text-white"
              value={filterType}
              onChange={e => {
                setFilterType(e.target.value as "room" | "semester" | "course" | "teacher" | "lab" | "");
                setFilterValue(null);
                setTeacherId(null);
              }}
            >
              <option value="">Filter By</option>
              <option value="room">Room</option>
              <option value="lab">Lab</option>
              <option value="semester">Semester</option>
              <option value="course">Course</option>
              <option value="teacher">Teacher</option>
            </select>

            {filterType === "room" && (
              <select
                className="input input-bordered bg-gray-700 text-white"
                value={filterValue ?? ""}
                onChange={e => setFilterValue(Number(e.target.value) || null)}
              >
                <option value="">Select Room</option>
                {uniqueRooms.map(id => (
                  <option key={id} value={id}>{roomMap.get(id || 0)}</option>
                ))}
              </select>
            )}
            {filterType === "lab" && (
              <select
                className="input input-bordered bg-gray-700 text-white"
                value={filterValue ?? ""}
                onChange={e => setFilterValue(Number(e.target.value) || null)}
              >
                <option value="">Select Lab</option>
                {uniqueLabs.map(id => (
                  <option key={id} value={id}>{labMap.get(id || 0)}</option>
                ))}
              </select>
            )}
            {filterType === "semester" && (
              <select
                className="input input-bordered bg-gray-700 text-white"
                value={filterValue ?? ""}
                onChange={e => setFilterValue(Number(e.target.value) || null)}
              >
                <option value="">Select Semester</option>
                {uniqueSemesters.map(id => (
                  <option key={id} value={id}>{semesterMap.get(id || 0)}</option>
                ))}
              </select>
            )}
            {filterType === "course" && (
              <select
                className="input input-bordered bg-gray-700 text-white"
                value={filterValue ?? ""}
                onChange={e => setFilterValue(Number(e.target.value) || null)}
              >
                <option value="">Select Course</option>
                {uniqueCourses.map(id => (
                  <option key={id} value={id}>{courseMap.get(id || 0)?.name || "Unknown Course"}</option>
                ))}
              </select>
            )}
            {filterType === "teacher" && (
              <select
                className="input input-bordered bg-gray-700 text-white"
                value={teacherId ?? ""}
                onChange={e => setTeacherId(Number(e.target.value) || null)}
              >
                <option value="">Select Teacher</option>
                {uniqueTeachers.map(id => (
                  <option key={id} value={id}>{teacherMap.get(id || 0) || "Unknown Teacher"}</option>
                ))}
              </select>
            )}

            {(filterType && (filterValue || teacherId)) && (
              <button className="btn btn-xs btn-outline ml-2 cursor-pointer custom-bordered-btn" onClick={() => { setFilterType(""); setFilterValue(null); setTeacherId(null); }}>
                Clear Filter
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full text-lg bg-dark" style={{ minWidth: '1500px' }}>
              <thead>
                <tr>
                  <th className="bg-dark text-white sticky left-0 z-10">Time</th>
                  {daysOfWeek.map((day) => <th key={day} className="bg-dark text-white">{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {fixedTimeSlots.map((time) => (
                  <tr key={time}>
                    <td className="font-semibold bg-dark text-white sticky left-0 z-10">{formatTime12Hour(time)}</td>
                    {daysOfWeek.map((day) => {
                      const cellEntries = getCellEntries(filteredRoutine || [], day, time);
                      return (
                        <td key={day} className="align-top min-w-[140px] border border-gray-200 bg-dark">
                          <div style={{ minHeight: 40 }}>
                            {cellEntries.length === 0 ? (
                              <span className="text-gray-300">--</span>
                            ) : (
                              cellEntries.map((r, idx) => (
                                <div key={idx} className={`mb-2 rounded shadow ${r.note ? "bg-yellow-100" : "bg-blue-50"}`}>
                                  <div className="font-bold text-xs truncate bg-gray-700">
                                    Semester: {semesterMap.get(r.semesterId || 0) || "N/A"}
                                  </div>
                                  <div className="text-xs bg-gray-700">
                                    Course: {courseMap.get(r.courseId || 0)?.name || "N/A"} <br />
                                    {r.labId ? `Lab: ${labMap.get(r.labId || 0) || "N/A"}` : `Room: ${roomMap.get(r.roomId || 0) || "N/A"}`} <br />
                                    Teacher: {teacherMap.get(courseTeacher.get(r.courseId || 0) || 0) || "N/A"}
                                  </div>
                                  {r.note && <div className="text-s text-yellow-700">{r.note}</div>}
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
