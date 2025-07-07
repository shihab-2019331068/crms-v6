// src/app/dashboard/department-admin/routines/components/AddSlotModal.tsx
"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { SlotInfo, Semester, Teacher, Room, Lab, CourseWithTeacher, RoutineEntry } from "../types";

interface AddSlotModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    slotInfo: SlotInfo;
    departmentId: number;
    onSaveSuccess: () => void;
    setSuccess: (msg: string) => void;
    setError: (msg: string) => void;
}

export const AddSlotModal: React.FC<AddSlotModalProps> = ({ isOpen, setIsOpen, slotInfo, departmentId, onSaveSuccess, setSuccess, setError }) => {
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
    
    const [allData, setAllData] = useState<{ semesters: Semester[], teachers: Teacher[], rooms: Room[], labs: Lab[] }>({ semesters: [], teachers: [], rooms: [], labs: [] });

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
                setAllData({ semesters: semRes.data, teachers: teachRes.data, rooms: roomRes.data, labs: labRes.data });
            } catch { setError("Failed to load data for modal."); }
        };
        fetchPrerequisites();
    }, [isOpen, departmentId, setError]);

    useEffect(() => {
        if (!selectedSemester) {
            setSemesterCourses([]); setSelectedCourseId(""); setSelectedTeacher(""); return;
        }
        const fetchCoursesForSemester = async () => {
            setCourseLoading(true); setSelectedCourseId(""); setSelectedTeacher("");
            try {
                const res = await api.get(`/get-semester-courses/${selectedSemester}`);
                setSemesterCourses(res.data);
            } catch (err) {
                setError("Failed to fetch courses for the selected semester."); setSemesterCourses([]);
            } finally { setCourseLoading(false); }
        };
        fetchCoursesForSemester();
    }, [selectedSemester, setError]);
    
    const handleCourseChange = (courseId: string) => {
        setSelectedCourseId(courseId);
        const course = semesterCourses.find(c => c.id === Number(courseId));
        const assignment = course?.semesterCourseTeachers?.[0];
        setSelectedTeacher(assignment?.teacherId ? String(assignment.teacherId) : "");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess('');

        const payload: Partial<RoutineEntry> = {
            departmentId,
            dayOfWeek: slotInfo.day,
            startTime: slotInfo.time,
            endTime: `${String(Number(slotInfo.time.slice(0, 2)) + 1).padStart(2, "0")}:00`,
            isBreak,
            semesterId: Number(selectedSemester),
        };

        if (isBreak) {
            if (!breakName || !selectedSemester) { setError("Semester and Break Name are required."); setLoading(false); return; }
            payload.breakName = breakName;
        } else {
            if (!selectedSemester || !selectedCourseId || !selectedTeacher || (!selectedRoom && !selectedLab)) {
                setError("All fields (Semester, Course, Teacher, and Room/Lab) are required."); setLoading(false); return;
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
        } catch (err: any) { setError(err.response?.data?.error || "Failed to add slot."); } 
        finally { setLoading(false); }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Schedule Slot</DialogTitle>
                    <p className="text-sm text-muted-foreground">{slotInfo.day} at {slotInfo.time}</p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="flex items-center space-x-2"><Switch id="is-break" checked={isBreak} onCheckedChange={setIsBreak} /><Label htmlFor="is-break">Is this a break?</Label></div>
                    <div>
                        <Label>Semester *</Label>
                        <Select onValueChange={setSelectedSemester} value={selectedSemester} required><SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger><SelectContent className="bg-black text-white">{allData.semesters.map(s => <SelectItem className="hover:bg-gray-800" key={s.id} value={String(s.id)}>{s.name} ({s.session})</SelectItem>)}</SelectContent></Select>
                    </div>
                    {isBreak ? (
                        <div><Label htmlFor="break-name">Break Name *</Label><Input id="break-name" value={breakName} onChange={e => setBreakName(e.target.value)} placeholder="e.g., Lunch Break" /></div>
                    ) : (
                        <>
                            <div>
                                <Label>Course *</Label>
                                <Select onValueChange={handleCourseChange} value={selectedCourseId} required disabled={!selectedSemester || courseLoading}><SelectTrigger><SelectValue placeholder={courseLoading ? "Loading courses..." : "Select Course"} /></SelectTrigger><SelectContent className="bg-black text-white">{semesterCourses.map(c => <SelectItem className="hover:bg-gray-800" key={c.id} value={String(c.id)}>{c.name} ({c.code})</SelectItem>)}</SelectContent></Select>
                            </div>
                            <div>
                                <Label>Teacher *</Label>
                                <Select onValueChange={setSelectedTeacher} value={selectedTeacher} required disabled={!!semesterCourses.find(c => c.id === Number(selectedCourseId))?.semesterCourseTeachers?.length}><SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger><SelectContent className="bg-black text-white">{allData.teachers.map(t => <SelectItem className="hover:bg-gray-800" key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent></Select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1"><Label>Room</Label><Select onValueChange={setSelectedRoom} value={selectedRoom} disabled={!!selectedLab}><SelectTrigger><SelectValue placeholder="Select Room" /></SelectTrigger><SelectContent className="bg-black text-white">{allData.rooms.map(r => <SelectItem className="hover:bg-gray-800" key={r.id} value={String(r.id)}>{r.roomNumber}</SelectItem>)}</SelectContent></Select></div>
                                <div className="flex-1"><Label>Lab</Label><Select onValueChange={setSelectedLab} value={selectedLab} disabled={!!selectedRoom}><SelectTrigger><SelectValue placeholder="Select Lab" /></SelectTrigger><SelectContent className="bg-black text-white">{allData.labs.map(l => <SelectItem className="hover:bg-gray-800" key={l.id} value={String(l.id)}>{l.labNumber}</SelectItem>)}</SelectContent></Select></div>
                            </div>
                        </>
                    )}
                    <DialogFooter><Button type="submit" disabled={loading} className="border hover:underline cursor-pointer">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Slot</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}