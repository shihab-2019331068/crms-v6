export interface Department {
  id: number;
  name: string;
  acronym: string;
}

export interface SemesterCourseTeacher {
  teacher: {
    id: number;
    name: string;
  };
}

export interface SemesterCourse {
  id: number;
  code: string;
  name: string;
  credits: number;
  forDept: number;
  forDepartment?: { acronym: string };
  semesterCourseTeachers: SemesterCourseTeacher[];
}

export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  forDept: number;
  forDepartment?: { acronym: string };
  semesterId?: number | null;
}

export interface Semester {
  id: number;
  name: string;
  shortname: string;
  departmentId: number;
  isArchived: boolean;
  session: string | null;
}

export type ViewType = 'main' | 'add' | 'manage' | 'archived';