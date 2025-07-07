// src/app/dashboard/department-admin/routines/components/FullRoutineView.tsx
"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import api from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FaPlus, FaFilter } from "react-icons/fa";
import { Loader2, X } from "lucide-react";
import { RoutineEntry, Semester, Teacher, Room, Lab, SlotInfo } from "../types";
import { daysOfWeek, timeSlots } from "../constants";
import { RoutineCard } from "./RoutineCard";
import { AddSlotModal } from "./AddSlotModal";

interface FullRoutineViewProps {
  departmentId: number;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

export const FullRoutineView: React.FC<FullRoutineViewProps> = ({ departmentId, setSuccess, setError }) => {
    const [routine, setRoutine] = useState<RoutineEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalSlot, setModalSlot] = useState<SlotInfo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        } catch { setError("Failed to fetch routine data."); } 
        finally { setLoading(false); }
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
                setSemesters(semRes.data); setTeachers(teachRes.data); setRooms(roomRes.data); setLabs(labRes.data);
            } catch { setError("Failed to load filter options."); }
        };
        fetchRoutineData();
        fetchFiltersData();
    }, [departmentId, fetchRoutineData, setError]);
    
    const handleAddSlot = (slotInfo: SlotInfo) => { setModalSlot(slotInfo); setIsModalOpen(true); };

    const handleDelete = async (entryId: number) => {
        try {
            await api.delete(`/routine/entry/${entryId}`);
            setSuccess("Entry deleted successfully.");
            fetchRoutineData();
        } catch (err: any) { setError(err.response?.data?.error || "Failed to delete entry."); }
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
            <Select value={filter.type === 'semester' ? filter.value : ''} onValueChange={v => setFilter({type: 'semester', value: v})}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Semester" /></SelectTrigger><SelectContent className="bg-black text-white">{semesters.map(s => <SelectItem className="hover:bg-gray-800" key={s.id} value={String(s.id)}>{s.shortname || s.name}</SelectItem>)}</SelectContent></Select>
            <Select value={filter.type === 'teacher' ? filter.value : ''} onValueChange={v => setFilter({type: 'teacher', value: v})}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Teacher" /></SelectTrigger><SelectContent className="bg-black text-white">{teachers.map(t => <SelectItem className="hover:bg-gray-800" key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent></Select>
            <Select value={filter.type === 'room' ? filter.value : ''} onValueChange={v => setFilter({type: 'room', value: v})}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Room" /></SelectTrigger><SelectContent className="bg-black text-white">{rooms.map(r => <SelectItem className="hover:bg-gray-800" key={r.id} value={String(r.id)}>{r.roomNumber}</SelectItem>)}</SelectContent></Select>
            <Select value={filter.type === 'lab' ? filter.value : ''} onValueChange={v => setFilter({type: 'lab', value: v})}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Lab" /></SelectTrigger><SelectContent className="bg-black text-white">{labs.map(l => <SelectItem className="hover:bg-gray-800" key={l.id} value={String(l.id)}>{l.labNumber}</SelectItem>)}</SelectContent></Select>
            {filter.type && <Button variant="ghost" size="icon" onClick={() => setFilter({type: '', value: ''})}><X className="h-4 w-4"/></Button>}
        </div>

        <div className="overflow-x-auto">
            <div className="grid gap-px bg-border" style={{ gridTemplateColumns: `auto repeat(${timeSlots.length}, minmax(180px, 1fr))` }}>
                <div className="p-2 font-semibold bg-background sticky left-0 z-10">Day</div>
                {timeSlots.map(time => <div key={time} className="p-2 font-semibold bg-background text-center">{`${time} - ${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}:00`}</div>)}

                {daysOfWeek.map(day => (
                    <React.Fragment key={day}>
                        <div className="p-2 font-semibold bg-background sticky left-0 z-10 flex items-center justify-center">{day}</div>
                        {timeSlots.map(time => {
                            const key = `${day}|${time}`;
                            const entries = routineGrid[key] || [];
                            return (
                                <div key={key} className="p-2 bg-card space-y-2 min-h-[120px] flex flex-col">
                                    {entries.map(entry => <RoutineCard key={entry.id} entry={entry} onDelete={handleDelete} />)}
                                    <div className="flex-grow"></div>
                                    <Button variant="ghost" size="sm" className="w-full mt-auto cursor-pointer hover:underline" onClick={() => handleAddSlot({ day, time })}><FaPlus className="mr-2 h-3 w-3" /> Add</Button>
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