// src/app/dashboard/department-admin/routines/components/GenerateRoutineView.tsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Semester, RoutineEntry, Teacher, Room, Lab, Course } from "../types";
import { daysOfWeek, timeSlots } from "../constants";

interface GenerateRoutineViewProps {
  departmentId: number;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

// Full list of possible time slots for UI selection
const allPossibleSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const breakTimeOptions = ["11:00", "12:00", "13:00", "14:00"];


export const GenerateRoutineView: React.FC<GenerateRoutineViewProps> = ({ departmentId, setSuccess, setError }) => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<RoutineEntry[] | null>(null);
  const [unassigned, setUnassigned] = useState<{ name: string, code: string }[] | null>(null);
  
  // New states for generator options
  const [preferredBreakTime, setPreferredBreakTime] = useState<string>("13:00");
  const [nonMajorSlots, setNonMajorSlots] = useState<{ [day: string]: string[] }>({});

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const [semRes, teachRes, roomRes, labRes, courseRes] = await Promise.all([
          api.get<Semester[]>("/dashboard/department-admin/semesters", { params: { departmentId }, withCredentials: true }),
          api.get<Teacher[]>("/teachers", { params: { departmentId } }),
          api.get<Room[]>("/rooms", { params: { departmentId } }),
          api.get<Lab[]>("/labs", { params: { departmentId } }),
          api.get<Course[]>("/courses", { params: { departmentId } })
        ]);

        const activeSemesters = semRes.data.filter(sem => !sem.isArchived);
        setSemesters(activeSemesters);
        setTeachers(teachRes.data);
        setRooms(roomRes.data);
        setLabs(labRes.data);
        setCourses(courseRes.data);
      } catch {
        setError("Failed to fetch necessary data for routine generation.");
      }
    };
    fetchPrerequisites();
  }, [departmentId, setError]);
  
  const handleNonMajorSlotToggle = (day: string, time: string) => {
    setNonMajorSlots(prev => {
        const newSlots = { ...prev };
        if (!newSlots[day]) {
            newSlots[day] = [];
        }
        const daySlots = newSlots[day];
        const index = daySlots.indexOf(time);
        if (index > -1) {
            daySlots.splice(index, 1);
        } else {
            daySlots.push(time);
        }
        return newSlots;
    });
  };

  const handlePreview = async () => {
    if (semesters.length === 0) {
      setError("No active semesters found to generate a routine for.");
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
        semesterIds: semesters.map(s => s.id),
        preferredBreakTime,
        nonMajorCourseSlots: nonMajorSlots
      });
      setPreview(res.data.routine);
      setUnassigned(res.data.unassigned);
      setSuccess(`Preview generated with ${res.data.routine.length} classes scheduled.`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate preview.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preview) {
      setError("No routine to save. Please generate a preview first.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/routine/generate", {
        routine: preview,
        semesterIds: semesters.map(s => s.id),
        departmentId,
      });
      setSuccess(res.data.message || "Routine saved successfully!");
      setPreview(null);
      setUnassigned(null);
    } catch (err: any)      {
      setError(err.response?.data?.error || "Failed to save routine.");
    } finally {
      setLoading(false);
    }
  };
  
  const hydratedPreview = useMemo(() => {
    if (!preview || !courses.length || !teachers.length || !semesters.length) {
      return null;
    }

    return preview.map(entry => ({
      ...entry,
      course: courses.find(c => c.id === entry.courseId),
      semester: semesters.find(s => s.id === entry.semesterId),
      teacher: teachers.find(t => t.id === entry.teacherId),
      room: entry.roomId ? rooms.find(r => r.id === entry.roomId) : null,
      lab: entry.labId ? labs.find(l => l.id === entry.labId) : null,
    }));
  }, [preview, courses, teachers, semesters, rooms, labs]);

  const previewGrid = useMemo(() => {
    if (!hydratedPreview) return null;
    const grid: { [key: string]: any[] } = {};
    hydratedPreview.forEach(entry => {
        const key = `${entry.dayOfWeek}|${entry.startTime}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(entry);
    });
    return grid;
  }, [hydratedPreview]);

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>Generate Routine for Major Courses</CardTitle>
        <CardDescription>
          This tool will attempt to schedule all major courses for all active semesters. You can set a preferred break time and reserve slots for non-major courses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Included Semesters</Label>
          <div className="p-3 border rounded-md max-h-40 overflow-y-auto space-y-2 mt-1">
            {semesters.length > 0 ? semesters.map((sem) => (
              <p key={sem.id} className="text-sm">
                {sem.name} ({sem.session})
              </p>
            )) : <p className="text-sm text-muted-foreground">No active semesters found.</p>}
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Generator Options</CardTitle>
            <CardDescription>Configure constraints for the routine generator.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <Label htmlFor="break-time">Preferred Break Time</Label>
                <Select value={preferredBreakTime} onValueChange={setPreferredBreakTime}>
                  <SelectTrigger id="break-time" className="w-[180px] mt-1">
                    <SelectValue placeholder="Select break time" />
                  </SelectTrigger>
                  <SelectContent>
                    {breakTimeOptions.map(time => (
                      <SelectItem className="bg-white" key={time} value={time}>{`${time} - ${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}:00`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
             <div>
                <Label>Reserve Slots for Non-Major Courses</Label>
                <p className="text-sm text-muted-foreground">The generator will not place any major courses in the checked slots.</p>
                <div className="border rounded-lg p-4 mt-2 overflow-x-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-6">
                    {daysOfWeek.map(day => (
                      <div key={day}>
                        <h4 className="font-semibold mb-2 border-b pb-1">{day}</h4>
                        <div className="space-y-2 mt-2">
                          {allPossibleSlots.map(time => (
                            <div key={`${day}-${time}`} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${day}-${time}`}
                                checked={nonMajorSlots[day]?.includes(time) || false}
                                onCheckedChange={() => handleNonMajorSlotToggle(day.toUpperCase(), time)}
                              />
                              <Label htmlFor={`${day}-${time}`} className="text-sm font-normal cursor-pointer">
                                {time}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </CardContent>
        </Card>

        <Button onClick={handlePreview} disabled={loading || semesters.length === 0} className="w-full md:w-auto border cursor-pointer hover:underline">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Preview
        </Button>

        {preview && (
          <div className="border p-4 rounded-md space-y-4">
            <h3 className="font-semibold">Generation Result</h3>
            <p>Successfully scheduled: <span className="font-bold text-green-600">{preview.length} class slots</span></p>
            {unassigned && unassigned.length > 0 && (
              <div>
                <p>Failed to schedule: <span className="font-bold text-red-600">{unassigned.length} courses</span></p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                  {unassigned.map((course, idx) => <li key={idx}>{course.name} ({course.code})</li>)}
                </ul>
              </div>
            )}

            {previewGrid && (
              <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-2">Preview Grid</h3>
                  <div className="overflow-x-auto overflow-y-auto border rounded-lg">
                      <div className="grid gap-px bg-border" style={{ gridTemplateColumns: `auto repeat(${timeSlots.length}, minmax(180px, 1fr))` }}>
                          <div className="p-2 font-semibold bg-background sticky left-0 z-10">Day</div>
                          {timeSlots.map(time => <div key={time} className="p-2 font-semibold bg-background text-center">{`${time} - ${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}:00`}</div>)}

                          {daysOfWeek.map(day => (
                              <React.Fragment key={day}>
                                  <div className="p-2 font-semibold bg-background sticky left-0 z-10 flex items-center justify-center">{day}</div>
                                  {timeSlots.map(time => {
                                      const key = `${day.toUpperCase()}|${time}`;
                                      const entries = previewGrid[key] || [];
                                      return (
                                          <div key={key} className="p-2 bg-card space-y-2 min-h-[100px]">
                                              {entries.map((entry, idx) => (
                                                  <div key={`${entry.courseId}-${idx}`} className="bg-muted p-2 rounded-md text-sm">
                                                      <p className="font-bold">{entry.course?.name || 'Unknown Course'} ({entry.semester?.name || 'Unknown Sem'})</p>
                                                      <p className="text-xs text-muted-foreground">{entry.course?.code || 'N/A'}</p>
                                                      <p className="text-xs mt-1">{entry.teacher?.name || 'Unassigned Teacher'}</p>
                                                      <p className="text-xs font-medium">
                                                        {entry.room ? `Room: ${entry.room?.roomNumber}` : (entry.lab ? `Lab: ${entry.lab?.labNumber}` : null)}
                                                      </p>
                                                  </div>
                                              ))}
                                          </div>
                                      );
                                  })}
                              </React.Fragment>
                          ))}
                      </div>
                  </div>
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