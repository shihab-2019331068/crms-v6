"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/services/api";

interface RoutineEntry {
  semesterId: number | null;
  dayOfWeek: string | null;
  startTime: string | null;
  endTime: string | null;
  courseId: number | null;
  roomId: number | null;
  isBreak: boolean;
  note?: string;
}

interface FinalRoutineProps {
  departmentId?: number;
  studentId?: number; // Added studentId prop
}

export default function FinalRoutine({ departmentId, studentId }: FinalRoutineProps) {
  const [routine, setRoutine] = useState<RoutineEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<"room" | "semester" | "course" | "myCourses" | "">("");
  const [filterValue, setFilterValue] = useState<number | null>(null);
  const [studentCourses, setstudentCourses] = useState<number[]>([]); // Store student's course IDs

  useEffect(() => {
    if (!departmentId) return;
    const fetchRoutine = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/routine/final?departmentId=${departmentId}`);
        setRoutine(res.data.routine);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response) {
          const responseData = err.response.data as { error?: string };
          setError(responseData.error || "Failed to fetch final routine.");
        } else {
          setError("Failed to fetch final routine.");
        }
      }
      setLoading(false);
    };
    fetchRoutine();
  }, [departmentId]);

  // Fetch student's courses if studentId and myCourses filter is selected
  useEffect(() => {
    if (filterType !== "myCourses" || !studentId) return;
    const fetchCourses = async () => {
      try {
        const res = await api.get(`/student/${studentId}/courses`, { withCredentials: true });
        setstudentCourses((res.data.courses || []).map((c: { id: string | number }) => Number(c.id)));
      } catch {
        setstudentCourses([]);
      }
    };
    fetchCourses();
  }, [filterType, studentId]);

  const getTimeSlots = (entries: RoutineEntry[]) => {
    const times = new Set<string>();
    entries.forEach((r) => {
      if (r.startTime) times.add(r.startTime);
    });
    return Array.from(times).sort();
  };

  const daysOfWeek = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", ];
  
  // Helper: format time to 12-hour format
  const formatTime12Hour = (time: string) => {
    if (!time) return "";
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour.toString().padStart(2, "0")}:${minute} ${ampm}`;
  };

  const getCellEntries = (
    entries: RoutineEntry[],
    day: string,
    time: string
  ) => {
    return entries.filter(
      (r) => r.dayOfWeek?.toUpperCase() === day.toUpperCase() && r.startTime === time
    );
  };

  // Extract unique rooms, semesters, and courses from routine
  const uniqueRooms = useMemo(() => {
    if (!routine) return [];
    const ids = Array.from(new Set(routine.map(e => e.roomId).filter(Boolean)));
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

  // Filtered routine
  const filteredRoutine = useMemo(() => {
    if (!routine) return null;
    if (!filterType) return routine;
    if (filterType === "myCourses") return routine.filter(e => studentCourses.includes(Number(e.courseId)));
    if (!filterValue) return routine;
    if (filterType === "room") return routine.filter(e => e.roomId === filterValue);
    if (filterType === "semester") return routine.filter(e => e.semesterId === filterValue);
    if (filterType === "course") return routine.filter(e => e.courseId === filterValue);
    return routine;
  }, [routine, filterType, filterValue, studentCourses]);

  return (
    <div className="rounded p-8 max-h-[90vh] min-h-[70vh] min-w-[1200px] overflow-auto shadow-2xl bg-dark">
      <h2 className="font-bold mb-4 text-lg">Final Routine</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {routine && (
        <>
          {/* Filter Controls */}
          <div className="flex gap-4 mb-4">
            <select
              className="input input-bordered bg-gray-700 text-white"
              value={filterType}
              onChange={e => {
                setFilterType(e.target.value as "room" | "semester" | "course" | "myCourses" | "");
                setFilterValue(null);
              }}
            >
              <option value="">Filter By</option>
              <option value="room">Room</option>
              <option value="semester">Semester</option>
              <option value="course">Course</option>
              <option value="myCourses">My Courses</option> {/* New filter option */}
            </select>
            {(filterType === "room") && (
              <select
                className="input input-bordered bg-gray-700 text-white"
                value={filterValue ?? ""}
                onChange={e => setFilterValue(Number(e.target.value) || null)}
              >
                <option value="">Select Room</option>
                {uniqueRooms.map(id => (
                  <option key={id} value={id}>Room {id}</option>
                ))}
              </select>
            )}
            {(filterType === "semester") && (
              <select
                className="input input-bordered bg-gray-700 text-white"
                value={filterValue ?? ""}
                onChange={e => setFilterValue(Number(e.target.value) || null)}
              >
                <option value="">Select Semester</option>
                {uniqueSemesters.map(id => (
                  <option key={id} value={id}>Semester {id}</option>
                ))}
              </select>
            )}
            {(filterType === "course") && (
              <select
                className="input input-bordered bg-gray-700 text-white"
                value={filterValue ?? ""}
                onChange={e => setFilterValue(Number(e.target.value) || null)}
              >
                <option value="">Select Course</option>
                {uniqueCourses.map(id => (
                  <option key={id} value={id}>Course {id}</option>
                ))}
              </select>
            )}
            {(filterType && (filterValue || filterType === "myCourses")) && (
              <button className="btn btn-xs btn-outline ml-2 cursor-pointer custom-bordered-btn" onClick={() => { setFilterType(""); setFilterValue(null); setstudentCourses([]); }}>Clear Filter</button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full text-lg bg-dark">
              <thead>
                <tr>
                  <th className="bg-dark text-white sticky left-0 z-10">Time</th>
                  {daysOfWeek.map((day) => (
                    <th key={day} className="bg-dark text-white">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(filteredRoutine ? getTimeSlots(filteredRoutine) : []).map((time) => (
                  <tr key={time}>
                    <td className="font-semibold bg-dark text-white sticky left-0 z-10">{formatTime12Hour(time)}</td>
                    {daysOfWeek.map((day) => {
                      const cellEntries = getCellEntries(filteredRoutine || [], day, time);
                      return (
                        <td key={day} className="align-top min-w-[140px] border border-gray-200 bg-dark">
                          <div style={{ minHeight: 40 }}>
                            {cellEntries.length === 0 ? (
                              <span className="text-gray-300">-</span>
                            ) : (
                              cellEntries.map((r, idx) => (
                                <div
                                  key={idx}
                                  className={`mb-2 rounded shadow ${r.note ? "bg-yellow-100" : "bg-blue-50"}`}
                                >
                                  <div className="font-bold text-m truncate bg-gray-700">
                                    Semester: {r.semesterId}
                                  </div>
                                  <div className="text-s bg-gray-700">
                                    Course: {r.courseId} <br />
                                    Room: {r.roomId}
                                  </div>
                                  {r.note && (
                                    <div className="text-s text-yellow-700">{r.note}</div>
                                  )}
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
