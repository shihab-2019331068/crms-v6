// src/app/dashboard/department-admin/routines/components/GenerateRoutineView.tsx
"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Semester, RoutineEntry } from "../types";

interface GenerateRoutineViewProps {
  departmentId: number;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

export const GenerateRoutineView: React.FC<GenerateRoutineViewProps> = ({ departmentId, setSuccess, setError }) => {
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
        setSemesters(res.data);
      } catch {
        setError("Failed to fetch active semesters.");
      }
    };
    fetchSemesters();
  }, [departmentId, setError]);
  
  const handleSemesterToggle = (semesterId: number) => {
    setSelectedSemesterIds(prev => {
        const newSet = new Set(prev);
        newSet.has(semesterId) ? newSet.delete(semesterId) : newSet.add(semesterId);
        return newSet;
    });
  };

  const handlePreview = async () => {
    if (selectedSemesterIds.size === 0) {
      setError("Please select at least one semester.");
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
        semesterIds: Array.from(selectedSemesterIds),
        departmentId,
      });
      setSuccess(res.data.message || "Routine saved successfully!");
      setPreview(null);
      setUnassigned(null);
      setSelectedSemesterIds(new Set());
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
          This tool will attempt to schedule all major courses for the selected semesters. Non-major courses must be added manually.
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
            <p>Successfully scheduled: <span className="font-bold text-green-600">{preview.length} class slots</span></p>
            {unassigned && unassigned.length > 0 && (
              <div>
                <p>Failed to schedule: <span className="font-bold text-red-600">{unassigned.length} courses</span></p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                  {unassigned.map((course, idx) => <li key={idx}>{course.name} ({course.code})</li>)}
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