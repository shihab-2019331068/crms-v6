## 1. Project Overview

**Project Name:** CRMS-v5 (Course Resource Management System)

**Purpose:** A web-based application designed to manage academic resources for a university, including courses, schedules, rooms, and personnel. It provides distinct functionalities for different user roles, from students to super administrators.

**High-level Architecture:** The system follows a client-server architecture with a distinct frontend and backend.
- **Frontend:** A Next.js single-page application (SPA) responsible for the user interface and user experience.
- **Backend:** A Node.js (Express) application that serves as a RESTful API, handling business logic and data persistence.
- **Database:** A PostgreSQL database managed with Prisma ORM.

**Tech Stack:**
- **Frontend:**
  - Framework: Next.js (React)
  - Language: TypeScript
  - Styling: Tailwind CSS, shadcn/ui
  - State Management: React Context API, `react-hook-form`
  - API Communication: Axios
- **Backend:**
  - Framework: Express.js
  - Language: JavaScript (Node.js)
  - Database: PostgreSQL
  - ORM: Prisma
  - Authentication: JWT (JSON Web Tokens)
- **Development:**
  - Package Managers: npm
  - Version Control: Git

## 2. Major Functional Modules

### 2.1. Authentication and Authorization
- **Description:** Handles user registration, login, and access control.
- **Related Files:**
  - `backend/src/controllers/authController.js`: Implements the logic for user signup and login.
  - `backend/src/routes/authRoutes.js`: Defines the API endpoints for authentication.
  - `backend/src/middleware/authMiddleware.js`: Verifies JWT tokens to protect routes.
  - `backend/src/middleware/roleMiddleware.js`: Enforces role-based access control.
  - `frontend/app/login/page.tsx`, `frontend/app/register/page.tsx`: UI for login and registration.
  - `frontend/context/AuthContext.tsx`: Manages user authentication state on the frontend.

### 2.2. User Management
- **Description:** Allows administrators to manage user accounts.
- **Related Files:**
  - `backend/src/controllers/superAdminController.js`: Contains logic for creating, deleting, and viewing users.
  - `backend/src/routes/superAdminRoutes.js`: Defines API endpoints for user management.
  - `frontend/pages/managingPages/mngUser.tsx`: UI for managing users.

### 2.3. Department and Resource Management
- **Description:** Enables super admins to manage departments, rooms, and labs.
- **Related Files:**
  - `backend/src/controllers/superAdminController.js`: Logic for adding and deleting departments, rooms, and labs.
  - `backend/src/routes/superAdminRoutes.js`: API endpoints for resource management.
  - `frontend/pages/managingPages/mngDept.tsx`, `frontend/pages/managingPages/mngRoom.tsx`, `frontend/pages/managingPages/mngLab.tsx`: UI for managing departments, rooms, and labs.

### 2.4. Course and Semester Management
- **Description:** Allows department admins to manage courses and semesters.
- **Related Files:**
  - `backend/src/controllers/courseController.js`, `backend/src/controllers/semesterController.js`: Logic for managing courses and semesters.
  - `backend/src/routes/courseRoutes.js`, `backend/src/routes/semesterRoutes.js`: API endpoints for course and semester management.
  - `frontend/pages/managingPages/mngCourse.tsx`, `frontend/pages/managingPages/mngSemester.tsx`: UI for managing courses and semesters.

### 2.5. Routine Generation and Management
- **Description:** The core functionality of the application, which involves generating and managing class schedules.
- **Related Files:**
  - `backend/src/controllers/routineController.js`: Implements the complex logic for generating and managing weekly schedules.
  - `backend/src/routes/routineRoutes.js`: Defines API endpoints for routine management.
  - `frontend/components/generateRoutine.tsx`, `frontend/components/finalRoutine.tsx`: UI components for generating and viewing routines.

## 3. API Endpoints

### 3.1. Authentication (`/api`)
- `POST /signup`: Register a new user.
- `POST /login`: Log in a user.
- `GET /me`: Get the details of the currently logged-in user.
- `GET /test`: Test the backend connection.

### 3.2. Student (`/api`)
- `GET /student/:studentId/courses`: Get all courses for a specific student.

### 3.3. Teacher (`/api`)
- `GET /teacher/:teacherId/courses`: Get all courses taught by a specific teacher.

### 3.4. Department Admin (`/api/dashboard/department-admin`)
- `POST /semester`: Add a new semester.
- `POST /semester/course`: Add a course to a semester.
- `GET /semesters`: Get all semesters for the department.
- `GET /rooms`: Get all rooms for the department.
- `GET /semester/:semesterId/courses`: Get all courses for a specific semester.
- `GET /teachers`: Get all teachers in the department.

### 3.5. Super Admin (`/api/dashboard/super-admin`)
- `POST /department`: Add a new department.
- `POST /room`: Add a new room.
- `POST /lab`: Add a new lab.
- `DELETE /department/:id`: Delete a department.
- `GET /users`: Get all users.
- `DELETE /user/:id`: Delete a user.

### 3.6. General (`/api`)
- `GET /users`: Get all users (for admins).
- `GET /department/:departmentId/users`: Get all users in a specific department.
- `GET /rooms`: Get all rooms.
- `GET /departments`: Get all departments.
- `GET /user/:email`: Get user details by email.
- `GET /department/:id`: Get department details by ID.
- `GET /labs`: Get all labs.
- `GET /semesters`: Get semesters, optionally filtered by department.
- `GET /courses`: Get courses, optionally filtered by department.
- `GET /teachers`: Get teachers, optionally filtered by department.

### 3.7. Routine (`/api/routine`)
- `GET /room/:roomId`: Get the weekly schedule for a specific room.
- `GET /semester/:semesterId`: Get the weekly schedule for a specific semester.
- `GET /teacher/:teacherId`: Get the weekly schedule for a specific teacher.
- `GET /course/:courseId`: Get the weekly schedule for a specific course.
- `POST /preview`: Preview a generated weekly routine.
- `POST /generate`: Generate and save a weekly routine.
- `GET /final`: Get the finalized routine for a department.
- `POST /entry`: Add a manual entry to the schedule.
- `DELETE /entry/:entryId`: Delete an entry from the schedule.
- `GET /student/:studentId`: Get the routine for a specific student.

### 3.8. Lab (`/api/lab`)
- `POST /:labId/status`: Update the status of a lab.
- `POST /:labId/capacity`: Update the capacity of a lab.

### 3.9. Room (`/api/room`)
- `POST /:roomId/status`: Update the status of a room.
- `POST /:roomId/capacity`: Update the capacity of a room.

### 3.10. Semester (`/api`)
- `POST /add-semester`: Add a new semester.
- `DELETE /delete-semester/:semesterId`: Delete a semester.
- `POST /archive-semester/:semesterId`: Archive a semester.
- `POST /unarchive-semester/:semesterId`: Unarchive a semester.
- `POST /add-semesterCourseTeacher`: Assign a teacher to a course in a semester.
- `GET /get-semester-courses/:semesterId`: Get all courses in a semester.
- `DELETE /semester/:semesterId/course/:courseId`: Remove a course from a semester.
- `POST /semester/set-session`: Set the session for a semester.

### 3.11. Access (`/api`)
- `POST /grant-access`: Grant access to a user.
- `POST /remove-access`: Remove access from a user.

### 3.12. Course (`/api`)
- `POST /add-course`: Add a new course.
- `POST /add-courses-from-csv`: Add multiple courses from a CSV file.
- `GET /get-courses`: Get all courses.
- `DELETE /delete-course`: Delete a course.
- `PATCH /archive-course`: Archive a course.
- `PATCH /unarchive-course`: Unarchive a course.

## 4. User Roles and Permissions

- **Student:**
  - View their own course schedule.
- **Teacher:**
  - View their own teaching schedule.
  - View courses they are assigned to.
- **Department Admin:**
  - Manage semesters, courses, and teachers for their department.
  - Generate and manage class routines for their department.
  - Manage rooms and labs within their department.
- **Super Admin:**
  - Has full control over the system.
  - Manage departments, users, rooms, and labs across the entire system.

## 5. UI Functionality

- **Login/Register:** Standard authentication forms.
- **Dashboard:** A central hub for each user role, providing access to relevant functionalities.
  - **Student Dashboard:** Displays the student's class schedule.
  - **Teacher Dashboard:** Displays the teacher's teaching schedule and assigned courses.
  - **Department Admin Dashboard:** Provides tools for managing semesters, courses, teachers, and routines.
  - **Super Admin Dashboard:** Provides tools for managing all aspects of the system.
- **Management Pages:** Various pages for creating, reading, updating, and deleting (CRUD) departments, courses, users, etc.
- **Routine Generation:** An interactive interface for generating and previewing class schedules.

## 6. Database Schema

The database schema is defined in `backend/prisma/schema.prisma` and includes the following key models:

- **User:** Stores user information, including their role, department, and personal details.
- **Department:** Represents an academic department.
- **Course:** Represents a course offered by a department.
- **Semester:** Represents an academic semester.
- **Room & Lab:** Represents physical locations for classes.
- **WeeklySchedule:** The core model for the class routine, storing information about each class session.
- **Schedule, Enrollment, Log:** Other important models for managing schedules, student enrollments, and system logs.

**Relationships:**
- A `User` belongs to one `Department`.
- A `Department` has many `User`s, `Course`s, `Room`s, `Lab`s, and `Semester`s.
- A `Course` belongs to a `Department` and can be in many `Semester`s (many-to-many with `Semester`).
- A `Semester` belongs to a `Department` and has many `Course`s.
- `WeeklySchedule` brings together `Semester`, `Department`, `Course`, `Room`/`Lab`, and `Teacher` to define a class session.

## 7. Other Relevant Functionality

- **File Uploads:** The system supports uploading CSV files to add multiple courses at once.
- **Authentication/Authorization:** JWT-based authentication and role-based authorization are implemented to secure the application.

## 8. Directory Structure Overview

- **`backend/`:** Contains the Node.js/Express.js backend application.
  - **`src/controllers/`:** Contains the business logic for each module.
  - **`src/routes/`:** Defines the API endpoints.
  - **`src/middleware/`:** Contains middleware for authentication and error handling.
  - **`prisma/`:** Contains the database schema and migration files.
- **`frontend/`:** Contains the Next.js frontend application.
  - **`app/`:** The main application directory for pages and layouts.
  - **`components/`:** Reusable React components.
  - **`context/`:** React context for managing global state.
  - **`services/`:** Contains the API service for communicating with the backend.
  - **`pages/`:** Contains additional pages for the application.
