import React, { useState, useEffect } from 'react';
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaPlus, FaArchive, FaEye, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Semester, Department } from './types';
import ShowCoursesOfSemester from './showCoursesOfSemester';
import AddCourseToSemester from './addCourseToSemester';

interface SemesterCardProps {
  semester: Semester;
  onUpdate: () => void;
}

export function SemesterCard({ semester, onUpdate }: SemesterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  
  const [departments, setDepartments] = useState<Department[]>([]);

  const [sessionInput, setSessionInput] = useState(semester.session || "");
  const [setSessionLoading, setSetSessionLoading] = useState(false);
  const [setSessionError, setSetSessionError] = useState("");
  const [setSessionSuccess, setSetSessionSuccess] = useState("");
  const [archiveSemesterLoading, setArchiveSemesterLoading] = useState(false);
  const [archiveSemesterError, setArchiveSemesterError] = useState("");
  const [deleteSemesterLoading, setDeleteSemesterLoading] = useState(false);
  const [deleteSemesterError, setDeleteSemesterError] = useState("");

  const fetchDepartments = async () => {
    try {
      const res = await api.get<Department[]>("/departments", { withCredentials: true });
      setDepartments(res.data);
    } catch {
      // Errors in child components will indicate failure
    }
  };

  useEffect(() => {
    if (isExpanded && showCourses) {
      fetchDepartments();
    }
  }, [isExpanded, showCourses]);

  const handleSetSession = async () => {
    setSetSessionLoading(true);
    setSetSessionError("");
    setSetSessionSuccess("");
    try {
      await api.post("/dashboard/department-admin/semester/set-session", { semesterId: semester.id, session: sessionInput }, { withCredentials: true });
      setSetSessionSuccess("Session updated!");
      onUpdate();
    } catch (err: any) {
      setSetSessionError(err.response?.data?.error || "Failed to set session.");
    } finally {
      setSetSessionLoading(false);
    }
  };

  const handleArchiveSemester = async (archive: boolean) => {
    setArchiveSemesterLoading(true);
    setArchiveSemesterError("");
    const endpoint = archive ? `/archive-semester/${semester.id}` : `/unarchive-semester/${semester.id}`;
    try {
      await api.post(endpoint, {}, { withCredentials: true });
      onUpdate();
    } catch (err: any) {
      setArchiveSemesterError(err.response?.data?.error || `Failed to ${archive ? 'archive' : 'unarchive'} semester.`);
    } finally {
      setArchiveSemesterLoading(false);
    }
  };

  const handleDeleteSemester = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this semester? This action cannot be undone.")) return;
    setDeleteSemesterLoading(true);
    setDeleteSemesterError("");
    try {
      await api.delete(`/delete-semester/${semester.id}`, { withCredentials: true });
      onUpdate();
    } catch (err: any) {
      setDeleteSemesterError(err.response?.data?.error || "Failed to delete semester.");
    } finally {
      setDeleteSemesterLoading(false);
    }
  };

  const handleCoursesAdded = () => {
    setShowAddCourseForm(false);
    setShowCourses(true);
  };
  
  return (
    <Card
      className={`transition-all duration-300 ease-in-out semester-btn hover:shadow-lg ${semester.isArchived ? 'opacity-70 hover:opacity-100' : ''} ${isExpanded ? 'shadow-xl' : ''}`}
      onClick={() => !semester.isArchived && setIsExpanded(!isExpanded)}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{semester.name}</CardTitle>
        <Popover onOpenChange={(open) => !open && (setSetSessionError(""), setArchiveSemesterError(""), setDeleteSemesterError(""))}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
              <FaEllipsisV />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 bg-black text-white" onClick={(e) => e.stopPropagation()}>
            {!semester.isArchived && (
              <>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Set Session</p>
                  <Input type="text" placeholder="YYYY-YYYY" defaultValue={semester.session} onChange={(e) => setSessionInput(e.target.value)} className="input-sm" />
                  <Button size="sm" onClick={handleSetSession} disabled={setSessionLoading} className='w-full hover:underline cursor-pointer'>
                    {setSessionLoading ? 'Saving...' : 'Save'}
                  </Button>
                  {setSessionError && <p className="text-red-500 text-xs">{setSessionError}</p>}
                  {setSessionSuccess && <p className="text-green-500 text-xs">{setSessionSuccess}</p>}
                </div>
                <Separator className="my-2" />
              </>
            )}
            <div className="flex flex-col space-y-1">
              <Button variant="ghost" className="w-full justify-start font-normal text-sm hover:bg-gray-800" size="sm" onClick={() => handleArchiveSemester(!semester.isArchived)} disabled={archiveSemesterLoading}>
                <FaArchive className="mr-2 h-3.5 w-3.5" /> {archiveSemesterLoading ? (semester.isArchived ? 'Unarchiving...' : 'Archiving...') : (semester.isArchived ? 'Unarchive' : 'Archive')}
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal text-sm text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" size="sm" onClick={handleDeleteSemester} disabled={deleteSemesterLoading}>
                <FaTrash className="mr-2 h-3.5 w-3.5" /> {deleteSemesterLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
            {(archiveSemesterError || deleteSemesterError) && (
              <p className="text-red-500 text-xs mt-2">{archiveSemesterError || deleteSemesterError}</p>
            )}
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{semester.shortname} | {semester.session || "No session set"}</p>
        {isExpanded && !semester.isArchived && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" className="semester-btn" size="sm" onClick={(e) => { e.stopPropagation(); setShowCourses(!showCourses); setShowAddCourseForm(false); }}>
                <FaEye className="mr-2" />{showCourses ? "Hide" : "Show"} Courses
              </Button>
              <Button variant="outline" className="semester-btn" size="sm" onClick={(e) => { e.stopPropagation(); setShowAddCourseForm(!showAddCourseForm); setShowCourses(false); }}>
                <FaPlus className="mr-2" />{showAddCourseForm ? "Cancel" : "Add"} Courses
              </Button>
            </div>
            
            {showCourses && <ShowCoursesOfSemester semester={semester} departments={departments} />}
            
            {showAddCourseForm && <AddCourseToSemester semester={semester} onCoursesAdded={handleCoursesAdded} />}
            
          </div>
        )}
      </CardContent>
    </Card>
  );
}