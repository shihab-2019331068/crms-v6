import React, { useState, useEffect } from 'react';
import api from "@/services/api";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaTrash } from 'react-icons/fa';
import { Semester, SemesterCourse, Department } from './types';

interface ShowCoursesOfSemesterProps {
  semester: Semester;
  departments: Department[];
}

export default function ShowCoursesOfSemester({ semester, departments }: ShowCoursesOfSemesterProps) {
    const [semesterCourses, setSemesterCourses] = useState<SemesterCourse[]>([]);
    const [teachers, setTeachers] = useState<{ id: number; name: string }[]>([]);

    const [coursesLoading, setCoursesLoading] = useState(false);
    const [coursesError, setCoursesError] = useState("");
    const [removeCourseLoading, setRemoveCourseLoading] = useState(false);
    const [removeCourseError, setRemoveCourseError] = useState("");
    const [removeCourseSuccess, setRemoveCourseSuccess] = useState("");
    const [assigningTeacherToCourseId, setAssigningTeacherToCourseId] = useState<number | null>(null);
    const [assignTeacherLoading, setAssignTeacherLoading] = useState(false);
    const [assignTeacherError, setAssignTeacherError] = useState("");
    const [assignTeacherSuccess, setAssignTeacherSuccess] = useState("");

    const fetchSemesterCourses = async () => {
        setCoursesLoading(true);
        setCoursesError("");
        try {
            const res = await api.get<SemesterCourse[]>(`/get-semester-courses/${semester.id}`, { withCredentials: true });
            const sortedCourses = res.data.sort((a, b) => a.code.localeCompare(b.code));
            setSemesterCourses(sortedCourses);
        } catch {
            setCoursesError("Failed to fetch courses for this semester");
        } finally {
            setCoursesLoading(false);
        }
    };

    const fetchTeachers = async () => {
        if (!semester.departmentId) return;
        try {
            const res = await api.get(`/dashboard/department-admin/teachers`, {
                params: { departmentId: semester.departmentId },
                withCredentials: true,
            });
            setTeachers(res.data);
        } catch {
            setAssignTeacherError("Failed to fetch teachers.");
            setTeachers([]);
        }
    };

    useEffect(() => {
        fetchSemesterCourses();
    }, [semester.id]);

    const handleRemoveCourseFromSemester = async (courseId: number) => {
        setRemoveCourseLoading(true);
        setRemoveCourseError("");
        setRemoveCourseSuccess("");
        try {
            await api.delete(`/semester/${semester.id}/course/${courseId}`, { withCredentials: true });
            setRemoveCourseSuccess("Course removed successfully!");
            fetchSemesterCourses();
        } catch (err: any) {
            setRemoveCourseError(err.response?.data?.error || "Failed to remove course.");
        } finally {
            setRemoveCourseLoading(false);
        }
    };

    const handleAssignTeacherToCourse = async (courseId: number, teacherId: number) => {
        if (!teacherId) {
            setAssignTeacherError("Invalid teacher selected.");
            return;
        }
        setAssignTeacherLoading(true);
        setAssignTeacherError("");
        setAssignTeacherSuccess("");
        try {
            await api.post("/add-semesterCourseTeacher", { semesterId: semester.id, courseId, teacherId }, { withCredentials: true });
            setAssignTeacherSuccess("Teacher assigned successfully!");
            setAssigningTeacherToCourseId(null);
            fetchSemesterCourses();
        } catch (err: any) {
            setAssignTeacherError(err.response?.data?.error || "Failed to assign teacher.");
        } finally {
            setAssignTeacherLoading(false);
            setTimeout(() => setAssignTeacherSuccess(""), 4000);
        }
    };

    if (coursesLoading) {
        return <p className="text-sm p-2 text-center">Loading courses...</p>;
    }
    if (coursesError) {
        return <p className="text-red-500 text-xs p-2 text-center">{coursesError}</p>;
    }

    return (
        <div onClick={(e) => e.stopPropagation()} className="p-2 border rounded-md bg-background min-w-[450px]">
            <h4 className="font-semibold mb-2 text-md">Courses in Semester</h4>
            <div className="space-y-2">
                {semesterCourses.length > 0 && (
                    <div className="grid grid-cols-12 gap-2 font-bold text-sm text-muted-foreground pb-1 border-b">
                        <span className="col-span-4">Course (Code)</span>
                        <span className="col-span-1 text-center">Credits</span>
                        <span className="col-span-2">Offered To</span>
                        <span className="col-span-3">Teacher</span>
                        <span className="col-span-2">Actions</span>
                    </div>
                )}
                {semesterCourses.length === 0 ? <div className="text-xs text-center py-2">No courses assigned.</div> :
                    semesterCourses.map(course => (
                        <div key={course.id}>
                            <div className="grid grid-cols-12 gap-2 items-center text-sm pt-2">
                                {assigningTeacherToCourseId === course.id ? (
                                   <>
                                    <span className="col-span-4 truncate" title={`${course.code}: ${course.name}`}>{course.code}: {course.name}</span>
                                    <span className="col-span-1 text-center">{course.credits}</span>
                                    <span className="col-span-2 truncate">for {course.forDepartment?.acronym || departments.find((dep: Department) => dep.id === course.forDept)?.acronym || course.forDept || '---'}</span>
                                    <div className="col-span-5 flex items-center gap-1">
                                        <Select
                                            onValueChange={(value) => handleAssignTeacherToCourse(course.id, Number(value))}
                                            disabled={assignTeacherLoading}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder={assignTeacherLoading ? "Assigning..." : "Select Teacher"} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-black text-white">
                                                {teachers.length > 0 ? teachers.map(teacher => (
                                                    <SelectItem key={teacher.id} value={String(teacher.id)} className="hover:bg-gray-800">{teacher.name}</SelectItem>
                                                )) : <SelectItem value="no-teachers" disabled>No teachers</SelectItem>}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { setAssigningTeacherToCourseId(null); setAssignTeacherError(""); }}
                                            disabled={assignTeacherLoading}
                                            className="h-8 cursor-pointer hover:underline"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                   </>
                                ) : (
                                   <>
                                    <span className="col-span-4 truncate" title={`${course.code}: ${course.name}`}>{course.code}: {course.name}</span>
                                    <span className="col-span-1 text-center">{course.credits}</span>
                                    <span className="col-span-2 truncate">{course.forDepartment?.acronym || departments.find((dep: Department) => dep.id === course.forDept)?.acronym || '---'}</span>
                                    <span className="col-span-3 truncate">{course.semesterCourseTeachers?.[0]?.teacher?.name || <span className="text-muted-foreground italic">Unassigned</span>}</span>
                                    <div className="col-span-2 flex items-center">
                                        <Button variant="outline" size="sm" onClick={() => { setAssigningTeacherToCourseId(course.id); setAssignTeacherError(""); setAssignTeacherSuccess(""); fetchTeachers(); }} className="text-xs h-8">
                                            {course.semesterCourseTeachers?.length > 0 ? 'Change' : 'Assign'}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveCourseFromSemester(course.id)} disabled={removeCourseLoading} className="ml-1 h-8 w-8 hover:bg-red-100 group">
                                            <FaTrash className="text-red-500 h-3.5 w-3.5"/>
                                        </Button>
                                    </div>
                                   </>
                                )}
                            </div>
                            {assigningTeacherToCourseId === course.id && assignTeacherError && <p className="text-red-500 text-xs mt-1 col-start-8 col-span-5">{assignTeacherError}</p>}
                        </div>
                    ))
                }
                {assignTeacherSuccess && <p className="text-green-600 text-xs mt-2">{assignTeacherSuccess}</p>}
                {removeCourseSuccess && <p className="text-green-600 text-xs mt-2">{removeCourseSuccess}</p>}
                {removeCourseError && <p className="text-red-500 text-xs mt-2">{removeCourseError}</p>}
            </div>
        </div>
    );
}