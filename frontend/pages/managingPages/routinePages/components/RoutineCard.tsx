// src/app/dashboard/department-admin/routines/components/RoutineCard.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { FaTrash } from "react-icons/fa";
import { RoutineEntry } from "../types";

interface RoutineCardProps {
    entry: RoutineEntry;
    onDelete: (id: number) => void;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({ entry, onDelete }) => {
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
             {entry.id && (
                <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 cursor-pointer" onClick={() => onDelete(entry.id!)}>
                    <FaTrash className="h-3 w-3 text-red-500" />
                </Button>
             )}
        </div>
    );
};