// src/app/dashboard/department-admin/routines/types.ts

export interface RoutineEntry {
  id?: number;
  semesterId: number;
  departmentId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  courseId: number | null;
  roomId: number | null;
  labId: number | null;
  teacherId: number | null;
  isBreak: boolean;
  breakName?: string;
  // --- Populated data from backend
  course?: { code: string; name: string };
  teacher?: { name: string };
  room?: { roomNumber: string };
  lab?: { labNumber: string };
  semester?: { shortname: string };
}

export interface Semester {
  id: number;
  name: string;
  shortname?: string;
  session?: string;
}
export interface Course {
  id: number;
  name: string;
  code: string;
}

export interface CourseWithTeacher extends Course {
  semesterCourseTeachers?: {
    teacherId: number;
    teacher: { name: string };
  }[];
}
export interface Teacher {
  id: number;
  name: string;
}
export interface Room {
  id: number;
  roomNumber: string;
}
export interface Lab {
  id: number;
  labNumber: string;
}
export type DayOfWeek =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export type View = "main" | "generate" | "view_edit";
export type SlotInfo = { day: DayOfWeek; time: string };