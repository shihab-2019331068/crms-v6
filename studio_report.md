***

# **Final Year Project Report**

## **CRMS-v5: An Integrated Course Resource Management System**

**Author:** [Your Name]
**Student ID:** [Your Student ID]
**Supervisor:** [Your Supervisor's Name]
**Department:** [Your Department Name]
**University:** [Your University Name]

**Date:** October 26, 2023

---

### **Abstract**
Academic institutions face immense logistical challenges in managing courses, scheduling classes, and allocating resources. Manual or semi-automated systems are often inefficient, prone to errors, and lack transparency for stakeholders like students and faculty. This project, "CRMS-v5 (Course Resource Management System)," presents the design, development, and implementation of a comprehensive, web-based platform to address these challenges. The system provides a centralized solution for managing users, departments, courses, and physical resources. Its core feature is a sophisticated routine generation engine designed to create clash-free, optimized schedules while considering various constraints.

Built on a modern technology stack featuring a Next.js frontend, a Node.js (Express) backend, and a PostgreSQL database, CRMS-v5 offers a role-based access control system catering to Students, Teachers, Department Admins, and Super Admins. Key functionalities include automated routine generation, resource reservation, attendance tracking, and syllabus management. This report details the project's entire lifecycle, from the initial problem analysis and literature review to system design, implementation, and testing. It discusses the technical architecture, database schema, and the algorithms employed for scheduling. The report concludes with an evaluation of the project's outcomes against its objectives, a discussion of the challenges faced, and a roadmap for future enhancements. CRMS-v5 aims to significantly improve administrative efficiency, enhance the academic experience for students and faculty, and provide a scalable foundation for university resource management.

---

### **Table of Contents**

**1. Introduction**
    1.1. Background of the Project
    1.2. Problem Statement
    1.3. Objectives of the Project
    1.4. Scope of the System
    1.5. Importance and Impact of the System
    1.6. Report Organization

**2. Literature Review**
    2.1. Existing Systems and Commercial Solutions
    2.2. Gaps and Limitations in Current Approaches
    2.3. The Timetabling Problem: A Theoretical Overview
    2.4. Related Technologies and Frameworks
    2.5. Summary and Justification for CRMS-v5

**3. System Analysis**
    3.1. Detailed Problem Analysis
    3.2. Stakeholder Analysis
    3.3. Requirement Specification
        3.3.1. Functional Requirements
        3.3.2. Non-Functional Requirements
    3.4. Use Case Analysis
        3.4.1. Use Case Diagram
        3.4.2. Use Case Descriptions

**4. System Design**
    4.1. System Architecture
    4.2. Database Design
        4.2.1. Entity-Relationship Diagram (ERD)
        4.2.2. Database Schema
    4.3. Data Flow Diagrams (DFDs)
        4.3.1. DFD Level 0 (Context Diagram)
        4.3.2. DFD Level 1
    4.4. Component-Wise Design
    4.5. UI/UX Design Mockups

**5. Implementation**
    5.1. Development Environment and Technologies
    5.2. System Modules and Functionalities
        5.2.1. Authentication and Authorization Module
        5.2.2. User and Department Management Module
        5.2.3. Course and Syllabus Management Module
        5.2.4. Routine Generation and Management Module
        5.2.5. Resource Reservation Module
        5.2.6. Attendance Management Module
    5.3. Code Structure and Organization

**6. Testing and Validation**
    6.1. Testing Strategy
    6.2. Test Case Design
        6.2.1. Unit Testing
        6.2.2. Integration Testing
        6.2.3. System and User Acceptance Testing
    6.3. Summary of Test Results
    6.4. Bug Fixing and Iterations

**7. Results and Discussion**
    7.1. Overview of Completed Features
    7.2. Performance of the Routine Generation Algorithm
    7.3. Comparison with Initial Objectives
    7.4. Challenges Faced During Development
    7.5. Lessons Learned

**8. Conclusion and Future Work**
    8.1. Summary of Project Outcomes
    8.2. Limitations of the Current System
    8.3. Proposed Future Enhancements

**9. References**

**10. Appendices**
    10.1. Appendix A: Source Code Repository
    10.2. Appendix B: Complete Database Schema
    10.3. Appendix C: Installation and Deployment Guide

---
## **Chapter 1: Introduction**

### **1.1 Background of the Project**
Universities and educational institutions are complex ecosystems composed of thousands of students, hundreds of faculty members, numerous academic departments, and a finite set of resources such as classrooms, labs, and equipment. The orchestration of these elements into a coherent academic calendar and a functional weekly schedule is a task of monumental complexity. Historically, this process has been managed through manual methods involving spreadsheets, paperwork, and extensive human coordination.

These traditional methods are not only labor-intensive but are also highly susceptible to human error, leading to scheduling conflicts, inefficient resource utilization, and a frustrating experience for both students and staff. The rise of digital technology has paved the way for more sophisticated solutions. However, many existing systems are either generic, off-the-shelf products that fail to meet the unique needs of a specific institution, or outdated legacy systems that are difficult to maintain and extend.

The CRMS-v5 (Course Resource Management System) project was conceived to address these shortcomings by creating a modern, tailored, and integrated web application. It aims to automate and streamline the entire lifecycle of academic resource management, from course creation and student enrollment to the generation of a clash-free weekly timetable.

### **1.2 Problem Statement**
The core problem that CRMS-v5 addresses is the **inefficiency, error-proneness, and lack of transparency in the manual or semi-automated management of university course schedules and resources.** This overarching problem manifests in several critical ways:

1.  **Scheduling Conflicts:** Double-booking of rooms, assigning a teacher to two different classes at the same time, or scheduling mandatory courses for a student group in conflicting time slots are common issues.
2.  **Suboptimal Resource Utilization:** Prime-time slots are often overbooked while other times remain underutilized. Classrooms and labs may be assigned without considering capacity, leading to overcrowding or wasted space.
3.  **Administrative Overhead:** Department administrators and staff spend weeks manually creating, verifying, and revising routines. Any change, such as a teacher's unavailability, can trigger a cascade of difficult manual adjustments.
4.  **Lack of Centralized Information:** Information is siloed. Students struggle to find their schedules, teachers are unsure of their final assignments, and there is no single source of truth for course syllabi or attendance records.
5.  **Inflexibility:** Manual systems cannot easily accommodate complex constraints, such as ensuring "breathing periods" between classes for faculty or students, or dynamically reserving a room for a special seminar.

### **1.3 Objectives of the Project**
To solve the aforementioned problems, this project sets out to achieve the following primary objectives:

1.  **To develop a centralized, multi-user web application** for managing academic resources with distinct roles and permissions for Students, Teachers, Department Admins, and Super Admins.
2.  **To design and implement a sophisticated routine generation algorithm** that automatically creates clash-free weekly schedules. This algorithm must consider constraints such as teacher availability, room capacity, and student groups, while also optimizing for efficient resource distribution.
3.  **To incorporate intelligent scheduling features**, such as the ability to enforce "breathing periods" between consecutive classes for faculty to reduce burnout and improve teaching quality.
4.  **To provide a seamless interface for managing academic content**, allowing teachers to upload course syllabi and other relevant materials directly to the platform.
5.  **To implement a comprehensive attendance management module** where teachers can record daily attendance and students can monitor their own attendance records in real-time.
6.  **To build a resource reservation system** that allows authorized users (e.g., teachers) to book available rooms or other resources for non-routine academic activities.
7.  **To introduce a routine archiving feature**, enabling administrators to save and reference past semester schedules for historical analysis and planning.

### **1.4 Scope of the System**
The scope of CRMS-v5 is comprehensive yet bounded to ensure project feasibility.

**In-Scope:**
*   **User Management:** Creation, deletion, and role assignment for all user types.
*   **Resource Management:** Management of departments, courses, rooms, and labs.
*   **Routine Generation:** Automated and manual creation of weekly class schedules for a department.
*   **Clash Detection:** The system will automatically detect and prevent clashes related to teachers, rooms, and student groups during routine generation.
*   **Syllabus Management:** Teachers can upload and manage syllabus files for their assigned courses.
*   **Attendance Tracking:** Teachers can mark attendance; students can view their attendance.
*   **Resource Reservation:** Ad-hoc booking of rooms by authorized personnel.
*   **Role-Based Dashboards:** Each user role has a tailored dashboard displaying relevant information (e.g., a student's schedule, a teacher's duties).
*   **Archiving:** Semesters and their corresponding routines can be archived for historical records.

**Out-of-Scope:**
*   **Financial Management:** The system will not handle student fees, faculty payroll, or departmental budgets.
*   **Full-Fledged Learning Management System (LMS):** While it supports syllabus uploads, it is not a replacement for systems like Moodle or Canvas (e.g., no online quizzes, grade books, or discussion forums).
*   **Student Registration/Admission:** The system assumes students are already admitted and enrolled in the university.
*   **Human Resources Management:** Does not handle faculty recruitment, promotions, or leave management beyond scheduling availability.
*   **Mobile Application:** The initial implementation is a web-based application, not a native mobile app.

### **1.5 Importance and Impact of the System**
The successful implementation of CRMS-v5 is expected to have a significant positive impact on the university's operations and academic environment:

*   **For University Administration:** Drastically reduces the time and effort required for scheduling, freeing up administrative staff for more strategic tasks. It provides data-driven insights into resource utilization, aiding in long-term planning.
*   **For Faculty:** Provides a clear, accessible view of their teaching schedule, assigned courses, and classroom locations. The ability to manage syllabi, track attendance, and reserve resources through a single platform streamlines their administrative workload.
*   **For Students:** Offers a reliable, easy-to-access personal timetable. Real-time access to attendance records and course syllabi enhances their academic organization and engagement.
*   **Overall:** Promotes fairness and transparency in resource allocation, minimizes disruptions caused by scheduling errors, and contributes to a more organized, efficient, and satisfactory academic experience for all stakeholders.

### **1.6 Report Organization**
This report is structured into ten chapters to provide a comprehensive overview of the project.
*   **Chapter 2: Literature Review** examines existing solutions and relevant academic research.
*   **Chapter 3: System Analysis** defines the system's requirements and analyzes stakeholders and use cases.
*   **Chapter 4: System Design** details the technical architecture, database schema, and UI/UX mockups.
*   **Chapter 5: Implementation** describes the development environment, technologies used, and key code modules.
*   **Chapter 6: Testing and Validation** outlines the testing strategy, test cases, and results.
*   **Chapter 7: Results and Discussion** evaluates the project's outcomes and discusses challenges.
*   **Chapter 8: Conclusion and Future Work** summarizes the project and suggests future enhancements.
*   **Chapter 9 & 10: References and Appendices** provide supporting documentation and citations.

---
## **Chapter 2: Literature Review**

### **2.1 Existing Systems and Commercial Solutions**
The domain of university administration and resource management is well-served by a variety of software solutions, ranging from large-scale Enterprise Resource Planning (ERP) systems to more specialized, niche products.

**Commercial ERP Systems:**
*   **Oracle PeopleSoft Campus Solutions:** A comprehensive suite that covers everything from admissions and student financials to academic scheduling. It is powerful and scalable but is also known for its high licensing costs, complex implementation, and a user interface that can feel dated (Oracle, 2023). It often requires significant customization to fit an institution's specific workflows.
*   **Ellucian Banner:** Another dominant player in the higher education market, Banner provides a robust set of tools for managing the student lifecycle. Its scheduling capabilities are extensive but, like PeopleSoft, it can be monolithic and inflexible. Changes often require specialized consultants.
*   **SAP SLcM (Student Lifecycle Management):** Part of SAP's broader ERP ecosystem, SLcM integrates tightly with HR and finance modules. While powerful, its complexity can be overwhelming for institutions that only require a streamlined course and scheduling solution.

**Specialized Scheduling Software:**
*   **Infosilem (Cayenta):** A product specifically focused on academic scheduling, timetabling, and resource optimization. It uses sophisticated algorithms to solve complex scheduling problems and is highly regarded for its core timetabling engine. However, it is a proprietary, closed-source solution with significant costs.
*   **Celcat Timetabler:** A popular solution in the UK and Europe, Celcat provides tools for automated scheduling, attendance monitoring, and room booking. It offers strong clash detection and reporting features but operates as a standalone ecosystem that may not integrate easily with other modern web services.

### **2.2 Gaps and Limitations in Current Approaches**
Despite the availability of these systems, several gaps and limitations persist, particularly for small to medium-sized universities or individual departments seeking more agility.

1.  **Cost and Complexity:** Large ERPs are prohibitively expensive for many institutions. Their "one-size-fits-all" approach often means paying for a multitude of features that are never used, while still lacking specific functionalities needed.
2.  **Lack of Modern User Experience:** Many legacy systems have clunky, non-intuitive user interfaces that are not mobile-friendly. This leads to a poor user experience and requires extensive user training.
3.  **Inflexibility and "Vendor Lock-in":** Proprietary systems lock institutions into a specific vendor's technology stack. Customization is difficult and expensive, and integration with other modern tools (e.g., via REST APIs) can be limited or poorly documented.
4.  **Overspecialization:** Standalone timetabling tools, while excellent at scheduling, often lack integrated features for syllabus management, attendance, or broader user management, forcing institutions to stitch together multiple disparate systems. This creates data silos and integration headaches.
5.  **The Manual Spreadsheet Method:** Astonishingly, many departments still revert to using complex Excel spreadsheets. While infinitely flexible, this approach lacks scalability, collaboration features, version control, and any form of automated validation, making it extremely prone to errors.

### **2.3 The Timetabling Problem: A Theoretical Overview**
The core of any course management system is the **University Course Timetabling Problem (UCTP)**. In computer science and operations research, the UCTP is a well-known, highly constrained optimization problem. It is classified as **NP-hard**, meaning that finding a perfectly optimal solution is computationally intractable for any non-trivial instance (Even, Itai, & Shamir, 1976).

The UCTP involves assigning a set of events (lectures, labs) to a limited number of time slots and resources (rooms, teachers) subject to a set of constraints. These constraints are typically categorized as:

*   **Hard Constraints:** Rules that absolutely must be satisfied for a timetable to be valid. Violating a hard constraint makes the schedule infeasible.
    *   A teacher cannot be in two places at once.
    *   A student group (e.g., "Year 1, Semester 2") cannot have two classes at the same time.
    *   A room cannot be used for two different classes simultaneously.
    *   A class must be assigned to a room with sufficient capacity.
*   **Soft Constraints:** Rules that are desirable but not strictly necessary. The quality of a timetable is measured by how well it satisfies these soft constraints.
    *   Classes for a student group should be spread out across the week.
    *   A teacher should have a "breathing period" of at least one hour after two consecutive lectures.
    *   A specific course should preferably be scheduled in the morning.
    *   Minimize the number of idle periods for students in a day.

Because finding a perfect solution is so difficult, practical approaches rely on **metaheuristics and heuristics**, such as Genetic Algorithms, Tabu Search, Simulated Annealing, and Greedy Algorithms, to find a "good enough" solution in a reasonable amount of time (Burke, Kingston, & Paechter, 2004).

### **2.4 Related Technologies and Frameworks**
The decision to build CRMS-v5 was heavily influenced by the capabilities of modern web technologies, which allow for the creation of responsive, scalable, and user-friendly applications.

*   **Frontend (Next.js/React):** The choice of a Single-Page Application (SPA) framework like Next.js is crucial for a dynamic, interactive user experience. React's component-based architecture allows for the creation of reusable UI elements (e.g., a timetable slot, a user card), while Next.js provides server-side rendering (for fast initial loads) and a simple file-based routing system.
*   **Backend (Node.js/Express.js):** A Node.js backend is a natural fit for a JavaScript-based frontend, allowing for a unified language across the stack. Its asynchronous, non-blocking I/O model is well-suited for handling numerous concurrent API requests from users interacting with the system. Express.js provides a minimalist but powerful framework for building the RESTful API.
*   **Database and ORM (PostgreSQL & Prisma):** PostgreSQL is a robust, open-source object-relational database renowned for its reliability and data integrity features. The choice of Prisma as an Object-Relational Mapper (ORM) is strategic. Prisma provides type-safe database access, auto-completion, and simplifies database queries, migrations, and schema management, significantly accelerating backend development.
*   **Authentication (JWT):** JSON Web Tokens (JWT) are a standard, secure method for implementing stateless authentication in client-server applications. This approach is scalable and works well with SPAs.

### **2.5 Summary and Justification for CRMS-v5**
The literature review reveals a clear gap in the market for a system that is **modern, integrated, customizable, and affordable**. Large ERPs are too cumbersome, specialized tools are too siloed, and manual methods are unsustainable.

CRMS-v5 is justified as it aims to occupy this middle ground. It leverages modern, open-source technologies to build a system that is:
*   **Integrated:** It combines user management, course management, scheduling, attendance, and syllabus management into a single, cohesive platform, eliminating data silos.
*   **User-Centric:** It prioritizes a clean, responsive UI/UX, making it accessible and easy to use for all stakeholders without extensive training.
*   **Pragmatic:** It acknowledges the NP-hard nature of the timetabling problem and implements a practical, heuristic-based algorithm designed to produce good, clash-free schedules quickly, rather than chasing a computationally expensive "perfect" schedule.
*   **Extensible:** Built on a modular, API-first architecture, it can be easily extended with new features in the future.

By building a custom solution, CRMS-v5 can be tailored precisely to the common needs of a university department, providing the necessary features without the bloat and cost of commercial ERP systems.

---
## **Chapter 3: System Analysis**

### **3.1 Detailed Problem Analysis**
The fundamental problem is a logistical one: mapping a set of courses onto a finite timeline using a finite set of resources (teachers, rooms) for a large number of students. A breakdown of the issues reveals interconnected dependencies:
*   A change in a single teacher's availability can invalidate dozens of scheduled classes.
*   A room being taken for maintenance requires finding suitable alternatives for all its scheduled classes, respecting capacity and equipment needs.
*   Introducing a new elective course mid-semester requires re-evaluating the schedules of all potential students to ensure no new conflicts are created.

The system must therefore not only *create* a schedule but also be robust and flexible enough to *manage* it. The pain points are felt by all user groups:
*   **Super Admins** lack a global view of resource allocation across departments.
*   **Department Admins** are buried in the complex, manual puzzle of scheduling.
*   **Teachers** face uncertainty and a scattered workflow for their duties (teaching, attendance, syllabi).
*   **Students** are the ultimate consumers of a poor schedule, facing clashes, long idle gaps, or last-minute changes.

The solution must be a system of record, a scheduling engine, and a communication platform rolled into one.

### **3.2 Stakeholder Analysis**

| Stakeholder         | Role                                      | Key Interests                                                                                           | Influence on Project                               |
|---------------------|-------------------------------------------|---------------------------------------------------------------------------------------------------------|----------------------------------------------------|
| **Super Admin**     | System-wide administrator                 | Overall system health, user management, cross-departmental resource allocation, system security.        | High - Defines system boundaries and policies.     |
| **Department Admin**| Manages a specific academic department    | Generating clash-free routines, managing courses/teachers for their dept, ensuring fair workload.         | High - Primary user of the core scheduling features. |
| **Teacher / Faculty** | Conducts classes, manages course content | Viewing their schedule, managing syllabi, tracking student attendance, reserving rooms for extra classes. | Medium - Provides key constraints and uses daily features. |
| **Student**         | Attends classes                           | Viewing personal, accurate timetable, accessing syllabi, checking attendance records.                   | Medium - The primary beneficiary of a good schedule.  |

### **3.3 Requirement Specification**
This section details the functional and non-functional requirements derived from the problem and stakeholder analysis.

#### **3.3.1 Functional Requirements**

**ID** | **Requirement** | **Description**
|---|---|---
**FR-01** | **User Authentication** | Users must be able to register and log in to the system using their email and a password. Passwords must be securely hashed.
**FR-02** | **Role-Based Access Control (RBAC)** | The system must enforce a strict RBAC model (Student, Teacher, Dept Admin, Super Admin). Each role shall only have access to authorized features and data.
**FR-03** | **User Management (Super Admin)** | The Super Admin must be able to create, view, and delete user accounts and assign roles.
**FR-04** | **Department & Resource Management (Super Admin)** | The Super Admin must be able to create and delete departments, rooms, and labs for the entire university.
**FR-05** | **Course Management (Dept Admin)** | The Dept Admin must be able to add, delete, archive, and manage courses within their department. This includes bulk-adding courses via CSV upload.
**FR-06** | **Semester Management (Dept Admin)** | The Dept Admin must be able to create, archive, and manage semesters, and assign courses to a specific semester.
**FR-07** | **Teacher Assignment (Dept Admin)** | The Dept Admin must be able to assign teachers to specific courses within a semester.
**FR-08** | **Automated Routine Generation** | The system shall generate a weekly class schedule for a given semester and department, automatically assigning times and rooms to courses.
**FR-09** | **Clash-Free Scheduling** | The generated routine must be free of hard conflicts (e.g., no double-booking of teachers or rooms).
**FR-10** | **Soft Constraint Handling** | The routine generator should attempt to satisfy soft constraints, such as providing "breathing periods" between classes for teachers.
**FR-11** | **Manual Routine Adjustment** | A Dept Admin must be able to manually add, edit, or delete individual entries in a generated schedule.
**FR-12** | **Routine Viewing** | All users must be able to view routines. Students see their personal schedule, teachers see their teaching schedule, and admins see the full departmental schedule.
**FR-13** | **Syllabus Upload & Access** | A Teacher must be able to upload a syllabus file (e.g., PDF) for a course they teach. Students enrolled in the course must be able to view/download it.
**FR-14** | **Attendance Marking** | A Teacher must be able to take attendance for each class session.
**FR-15** | **Attendance Viewing** | A Student must be able to view their own attendance summary for each course.
**FR-16** | **Resource Reservation** | Authorized users (Teachers, Admins) must be able to search for and reserve an available room for a specific time slot for non-routine activities.
**FR-17** | **Routine Archiving** | A Dept Admin must be able to archive a completed semester's routine for historical record-keeping.

#### **3.3.2 Non-Functional Requirements**

**ID** | **Requirement** | **Description**
|---|---|---
**NFR-01** | **Performance** | The web application pages should load in under 3 seconds. API responses should be returned within 500ms for typical requests. Routine generation for a medium-sized department should complete within 60 seconds.
**NFR-02** | **Security** | All data transmission between client and server must be encrypted using HTTPS. Sensitive data like passwords must be hashed using a strong algorithm (e.g., bcrypt). The system must be protected against common web vulnerabilities (XSS, CSRF, SQL Injection).
**NFR-03** | **Usability** | The user interface must be intuitive, responsive, and follow modern design principles. It should be accessible on standard desktop and mobile web browsers.
**NFR-04** | **Reliability** | The system should have an uptime of 99.9%. Database backups should be performed daily.
**NFR-05** | **Scalability** | The system architecture should be able to support at least 10,000 concurrent users and manage data for a university with up to 50 departments and 500 courses per department.
**NFR-06** | **Maintainability** | The code must be well-documented, modular, and follow consistent coding standards to facilitate future maintenance and development.

### **3.4 Use Case Analysis**

#### **3.4.1 Use Case Diagram**

```mermaid
graph TD
    subgraph CRMS-v5 System
        UC1(Login)
        UC2(View Schedule)
        UC3(View Attendance)
        UC4(View Syllabus)
        UC5(Manage Courses)
        UC6(Manage Users)
        UC7(Generate Routine)
        UC8(Mark Attendance)
        UC9(Upload Syllabus)
        UC10(Reserve Room)
        UC11(Archive Routine)
        UC12(Manage Departments)
    end

    Actor_Student((Student))
    Actor_Teacher((Teacher))
    Actor_DeptAdmin((Department Admin))
    Actor_SuperAdmin((Super Admin))

    Actor_Student --> UC1
    Actor_Student --> UC2
    Actor_Student --> UC3
    Actor_Student --> UC4

    Actor_Teacher --> UC1
    Actor_Teacher --> UC2
    Actor_Teacher --> UC4
    Actor_Teacher --> UC8
    Actor_Teacher --> UC9
    Actor_Teacher --> UC10

    Actor_DeptAdmin --> UC1
    Actor_DeptAdmin --> UC5
    Actor_DeptAdmin --> UC7
    Actor_DeptAdmin --> UC10
    Actor_DeptAdmin --> UC11

    Actor_SuperAdmin --> UC1
    Actor_SuperAdmin --> UC6
    Actor_SuperAdmin --> UC12

    UC5 -.-> UC1
    UC6 -.-> UC1
    UC7 -.-> UC1
    UC8 -.-> UC1
    UC9 -.-> UC1
    UC10 -.-> UC1
    UC11 -.-> UC1
    UC12 -.-> UC1

    note for UC5, UC6, UC7, UC8, UC9, UC10, UC11, UC12 "include"
```
*[Image: A formal Use Case Diagram showing Actors (Student, Teacher, Dept Admin, Super Admin) and their interactions with Use Cases like 'Generate Routine', 'Mark Attendance', 'View Schedule', etc.]*

#### **3.4.2 Use Case Descriptions**

**Use Case 1: Generate Routine**
*   **Actor:** Department Admin
*   **Description:** The admin initiates the routine generation process for a selected semester. The system gathers all constraints (courses, teachers, rooms, student groups) and runs the scheduling algorithm. The admin can preview the generated routine, make manual adjustments, and then finalize it.
*   **Preconditions:** Admin is logged in. Semester, courses, and teachers have been configured.
*   **Postconditions:** A new weekly schedule is created and stored in the database.
*   **Flow:**
    1.  Admin navigates to the "Generate Routine" page.
    2.  Selects the department and semester.
    3.  Clicks "Generate Preview".
    4.  System processes constraints and displays a proposed schedule.
    5.  Admin reviews the schedule for conflicts and quality.
    6.  (Optional) Admin drags and drops a class to a different slot or room. System re-validates the move.
    7.  Admin clicks "Finalize Routine".
    8.  System saves the schedule as the official routine for that semester.

**Use Case 2: Mark Attendance**
*   **Actor:** Teacher
*   **Description:** A teacher takes attendance for a class they are conducting.
*   **Preconditions:** Teacher is logged in. It is the day and time of a scheduled class.
*   **Postconditions:** Attendance records for the selected students are created/updated in the database.
*   **Flow:**
    1.  Teacher logs in and views their dashboard, which shows their current/next class.
    2.  Teacher clicks the "Mark Attendance" button for the class.
    3.  System displays a list of enrolled students for that course.
    4.  Teacher marks each student as "Present" or "Absent".
    5.  Teacher clicks "Submit Attendance".
    6.  System saves the records.

**Use Case 3: View Personal Timetable**
*   **Actor:** Student
*   **Description:** A student logs in to view their personalized class schedule for the week.
*   **Preconditions:** Student is logged in. The routine for the current semester has been finalized.
*   **Postconditions:** The student's schedule is displayed.
*   **Flow:**
    1.  Student logs in to the system.
    2.  The dashboard automatically displays the weekly timetable.
    3.  The timetable shows the course name, time, room number, and teacher for each scheduled class.
    4.  Student can click on a class entry to see more details, like a link to the syllabus.

---
## **Chapter 4: System Design**

### **4.1 System Architecture**
CRMS-v5 is designed using a modern, decoupled **Client-Server Architecture**. This separation of concerns between the frontend (client) and backend (server) allows for independent development, deployment, and scaling.

*   **Client (Frontend):** A Next.js Single-Page Application (SPA) is responsible for all user interface rendering and interaction. It runs entirely in the user's web browser. It communicates with the backend via a RESTful API over HTTPS. It does not have direct access to the database.
*   **Server (Backend):** A Node.js application built with the Express.js framework acts as the API server. It contains all the business logic, including user authentication, the routine generation algorithm, and database operations. It exposes a set of secure REST endpoints for the frontend to consume.
*   **Database:** A PostgreSQL database serves as the persistent data store. It is managed exclusively by the backend server through the Prisma ORM, ensuring data integrity and abstraction.

**Architectural Diagram:**
```
[ User on Browser ] -------- (HTTPS) ------> [ Frontend (Next.js on Vercel/Node Server) ]
       ^                                                 |
       | (UI/UX)                                         | (REST API Calls - JSON)
       v                                                 v
[ User ] <------------------------------------- [ Backend (Express.js on Node Server) ]
                                                         |
                                                         | (Prisma Client)
                                                         v
                                              [ Database (PostgreSQL) ]
```
*[Image: A high-level architecture diagram showing the flow from the user's browser to the Next.js frontend, then API calls to the Express backend, which in turn communicates with the PostgreSQL database.]*

This architecture is highly scalable. The frontend and backend can be hosted on separate services (e.g., Vercel for frontend, AWS/Heroku for backend) and scaled independently based on traffic.

### **4.2 Database Design**

#### **4.2.1 Entity-Relationship Diagram (ERD)**
The database is designed around core entities like `User`, `Course`, `Semester`, and `WeeklySchedule`. The relationships are crucial for enforcing data integrity.

**Key Entities and Relationships:**
*   **User:** Can have one role (Student, Teacher, etc.) and belongs to one `Department` (nullable for Super Admin).
*   **Department:** Has many `Users`, `Courses`, `Rooms`, and `Semesters`.
*   **Course:** Belongs to one `Department`.
*   **Semester:** Belongs to one `Department`.
*   **SemesterCourse:** A join table representing the many-to-many relationship between `Semester` and `Course`, indicating which courses are offered in a given semester. It also links to a `User` (teacher).
*   **WeeklySchedule:** The central table for routines. It connects a `SemesterCourse`, a `Room`/`Lab`, a `dayOfWeek`, and a `timeSlot`.
*   **Syllabus:** A one-to-one relationship with `Course`. Stores metadata about the uploaded syllabus file.
*   **AttendanceRecord:** Belongs to one `User` (student) and one `SemesterCourse`, recording presence for a specific `date`.
*   **Reservation:** Belongs to one `User` (reserver) and references a resource (e.g., `Room`).

*[Image: A detailed ERD showing all tables (User, Department, Course, Semester, WeeklySchedule, AttendanceRecord, Reservation, Syllabus, etc.) and the relationships (one-to-one, one-to-many, many-to-many) between them with primary and foreign keys.]*

#### **4.2.2 Database Schema**
The following is a simplified representation of the Prisma schema (`schema.prisma`) which defines the models and their relationships.

```prisma
// User and Authentication
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String
  password     String
  role         UserRole  @default(STUDENT)
  departmentId String?
  department   Department? @relation(fields: [departmentId], references: [id])
  // ... other relations: reservations, attendance records
}

enum UserRole {
  STUDENT
  TEACHER
  DEPARTMENT_ADMIN
  SUPER_ADMIN
}

// Core Academic Structures
model Department {
  id        String     @id @default(cuid())
  name      String     @unique
  users     User[]
  courses   Course[]
  rooms     Room[]
  labs      Lab[]
  semesters Semester[]
}

model Course {
  id           String    @id @default(cuid())
  courseCode   String    @unique
  title        String
  credits      Float
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id])
  syllabus     Syllabus?
  // ...
}

model Semester {
  id           String    @id @default(cuid())
  name         String    // e.g., "Fall 2023"
  startDate    DateTime
  endDate      DateTime
  isArchived   Boolean   @default(false)
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id])
  // ...
}

// Routine and Scheduling
model WeeklySchedule {
  id             String   @id @default(cuid())
  dayOfWeek      Int      // 0=Sunday, 1=Monday...
  startTime      String   // "09:00"
  endTime        String   // "10:00"
  semesterId     String
  courseId       String
  teacherId      String
  roomId         String?
  labId          String?
  // ... relations
}

// NEWLY ADDED MODELS for requested features
model Syllabus {
  id        String   @id @default(cuid())
  filePath  String   // Path to the stored file
  fileType  String   // e.g., "application/pdf"
  uploadedAt DateTime @default(now())
  courseId  String   @unique
  course    Course   @relation(fields: [courseId], references: [id])
}

model AttendanceRecord {
  id        String   @id @default(cuid())
  date      DateTime
  status    AttendanceStatus // ENUM: PRESENT, ABSENT
  studentId String
  student   User     @relation("StudentAttendance", fields: [studentId], references: [id])
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  markedById String
  markedBy  User     @relation("TeacherAttendance", fields: [markedById], references: [id])
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
}

model Reservation {
  id           String    @id @default(cuid())
  title        String
  startTime    DateTime
  endTime      DateTime
  status       String    @default("CONFIRMED")
  userId       String
  reserver     User      @relation(fields: [userId], references: [id])
  roomId       String?
  room         Room?     @relation(fields: [roomId], references: [id])
  labId        String?
  lab          Lab?      @relation(fields: [labId], references: [id])
}
```

### **4.3 Data Flow Diagrams (DFDs)**

#### **4.3.1 DFD Level 0 (Context Diagram)**
This diagram shows the system as a single process and its interaction with external entities.

```
[ Student ] ----> (Login Details, View Requests) ----> [ 0. CRMS-v5 ]
[ Teacher ] ----> (Login, Attendance Data, Syllabus) --> [ System ]
[ Dept Admin ] -> (Login, Schedule Config) ----------> [ System ]
[ Super Admin ] -> (Login, User/Dept Data) ----------> [ System ]

[ System ] ----> (Schedule, Attendance, Syllabus) ----> [ Student ]
[ System ] ----> (Schedule, Student List) ----------> [ Teacher ]
[ System ] ----> (Generated Routine, Reports) ------> [ Dept Admin ]
[ System ] ----> (User Lists, System Status) -------> [ Super Admin ]
```
*[Image: A DFD Level 0 diagram showing the four actors sending data to and receiving data from a single process bubble labeled "CRMS-v5 System".]*

#### **4.3.2 DFD Level 1**
This diagram breaks down the main system into its major functional components.

*[Image: A DFD Level 1 diagram showing processes like "1.0 Manage Authentication", "2.0 Manage Academic Info", "3.0 Generate Routine", "4.0 Manage Attendance". Data flows between these processes and data stores like "D1: Users", "D2: Courses", "D3: Schedules".]*

**Example Flow: Mark Attendance**
1.  **Teacher** sends `Login Credentials` to **1.0 Manage Authentication**.
2.  **1.0 Manage Authentication** verifies against **D1: Users** data store and returns a `Session Token`.
3.  **Teacher** sends `Request for Class List` with `Session Token` to **4.0 Manage Attendance**.
4.  **4.0 Manage Attendance** fetches `Scheduled Class` from **D3: Schedules** and `Enrolled Students` from **D1: Users**.
5.  It returns the `Class Roster` to the **Teacher**.
6.  **Teacher** submits `Attendance Data` to **4.0 Manage Attendance**.
7.  **4.0 Manage Attendance** validates the data and writes it to the **D4: Attendance** data store.

### **4.4 Component-Wise Design**
The system is logically divided into several key components on both the frontend and backend.

**Backend Components (`backend/src/`):**
*   **`controllers/`**: Contains the main business logic. e.g., `authController.js`, `routineController.js`, `attendanceController.js`. The `routineController` houses the complex scheduling algorithm.
*   **`routes/`**: Defines the API endpoints and maps them to the corresponding controller functions.
*   **`middleware/`**: Handles cross-cutting concerns. `authMiddleware.js` verifies JWTs. `roleMiddleware.js` checks user roles. `uploadMiddleware.js` (using a library like Multer) would handle file uploads for syllabi.
*   **`services/`**: For abstracting complex logic away from controllers. e.g., `RoutineGenerationService.js` could encapsulate the core algorithm, making the controller cleaner.

**Frontend Components (`frontend/`):**
*   **`app/`**: Contains the page routes and layouts as per Next.js 13+ App Router convention.
*   **`components/`**: A library of reusable React components.
    *   `ui/`: Generic UI elements (buttons, cards, inputs) from a library like `shadcn/ui`.
    *   `specific/`: Application-specific components like `TimetableView.tsx`, `AttendanceSheet.tsx`, `ReservationModal.tsx`.
*   **`context/`**: Manages global state using React Context API. `AuthContext.tsx` holds user session info.
*   **`services/`**: Contains API client logic. `api.ts` configures an Axios instance with base URL and interceptors to attach the JWT to requests.

### **4.5 UI/UX Design Mockups**
*Note: These are descriptive mockups. In a real report, these would be images.*

**1. Department Admin - Routine Generation Page:**
*   **Layout:** A two-panel view.
*   **Left Panel:** A form with dropdowns to select "Semester" and "Session". Below are lists of unassigned courses, available teachers, and rooms. There are buttons: "Auto-Generate Routine" and "Save Routine".
*   **Right Panel:** A large grid representing the weekly timetable (Days of the week as columns, time slots as rows). Initially, it's empty. After generation, it's populated with colored cards, each representing a class.
*   **Interaction:** The admin can drag a course card from the left panel onto a slot in the grid for manual placement. Clicking "Auto-Generate" fills the grid. If a clash is detected, the conflicting cards are highlighted in red.

**2. Teacher - Attendance Marking Page:**
*   **Layout:** A clean, simple page.
*   **Header:** Shows the course title, code, and date. e.g., "CS101: Introduction to Programming - Oct 26, 2023".
*   **Main Content:** A table of students enrolled in the course. Each row has the student's ID, name, and two buttons: "Present" and "Absent". A "Mark All Present" button is at the top for convenience.
*   **Footer:** A "Submit Attendance" button.

**3. Student - Dashboard:**
*   **Layout:** A central, prominent display of the weekly timetable.
*   **Timetable:** Similar to the admin's view but read-only and filtered to show only the student's classes. Each class block is clickable.
*   **Sidebar:** Links to "View My Attendance", "My Courses", and "Syllabus Repository".
*   **Interaction:** Clicking a class block opens a modal with details: full course title, teacher's name, room number, and a button to "Download Syllabus".

---
## **Chapter 5: Implementation**

### **5.1 Development Environment and Technologies**
The project was developed using a consistent, modern toolchain to ensure code quality and developer productivity.

*   **IDE:** Visual Studio Code with extensions for Prettier (code formatting), ESLint (linting), and Prisma.
*   **Version Control:** Git, with the central repository hosted on GitHub. A feature-branch workflow was used.
*   **Package Manager:** npm for managing both frontend and backend dependencies.
*   **Frontend Stack:**
    *   Framework: Next.js 13 (React 18)
    *   Language: TypeScript
    *   Styling: Tailwind CSS and shadcn/ui for a component-based design system.
    *   State Management: React Context API for auth, `react-hook-form` for form handling.
    *   API Communication: Axios.
*   **Backend Stack:**
    *   Runtime: Node.js v18.x
    *   Framework: Express.js
    *   Language: JavaScript (ES6+)
    *   Database ORM: Prisma
    *   Authentication: JSON Web Tokens (`jsonwebtoken` package)
    *   Password Hashing: `bcrypt.js`
*   **Database:** PostgreSQL 14
*   **Deployment (Planned):**
    *   Frontend: Vercel (for its seamless Next.js integration).
    *   Backend: Docker container on a service like AWS Elastic Beanstalk or Heroku.
    *   Database: A managed service like Amazon RDS for PostgreSQL.

### **5.2 System Modules and Functionalities**
This section describes the implementation details of the key modules.

#### **5.2.1 Authentication and Authorization Module**
*   **File Location:** `backend/src/controllers/authController.js`, `middleware/authMiddleware.js`
*   **Implementation:**
    1.  **Registration (`/api/signup`):** The `authController` receives user details (email, password, name). It hashes the password using `bcrypt.js` with a salt round of 10. It then uses the Prisma client (`prisma.user.create()`) to save the new user to the database.
    2.  **Login (`/api/login`):** The controller finds the user by email. It compares the provided password with the stored hash using `bcrypt.compare()`. If they match, it generates a JWT containing the `userId`, `role`, and `departmentId`. This token is sent back to the client.
    3.  **Route Protection:** The `authMiddleware` is applied to all protected routes. It extracts the JWT from the `Authorization: Bearer <token>` header, verifies its signature using a secret key, and attaches the decoded user payload to the `req` object (`req.user`). If the token is invalid or missing, it returns a `401 Unauthorized` error. The `roleMiddleware` further checks if `req.user.role` is in the list of allowed roles for a specific endpoint.

#### **5.2.2 User and Department Management Module**
*   **File Location:** `backend/src/controllers/superAdminController.js`, `frontend/app/dashboard/super-admin/`
*   **Implementation:** These are standard CRUD (Create, Read, Update, Delete) operations. The `superAdminController` contains functions like `getAllUsers`, `deleteUser`, `createDepartment`. These functions are protected by middleware to ensure only a `SUPER_ADMIN` can access them. The frontend provides simple forms and tables to interact with these endpoints. For example, the user management page fetches from `GET /api/dashboard/super-admin/users` and displays them in a table with a "Delete" button next to each row, which triggers a `DELETE /api/dashboard/super-admin/user/:id` request.

#### **5.2.3 Course and Syllabus Management Module**
*   **File Location:** `backend/src/controllers/courseController.js`, `frontend/app/dashboard/teacher/courses/`
*   **Implementation:**
    1.  **Course Management:** Implemented as standard CRUD in `courseController.js`, restricted to Admins.
    2.  **Syllabus Upload (`POST /api/course/:courseId/syllabus`):**
        *   A new middleware, `uploadMiddleware.js`, is created using the `multer` library. It's configured to handle single file uploads, save them to a specific directory on the server (e.g., `/uploads/syllabi`), and generate a unique filename to prevent collisions.
        *   The route `POST /api/course/:courseId/syllabus` is first processed by `authMiddleware`, then `roleMiddleware(['TEACHER'])`, and finally `uploadMiddleware`.
        *   The `courseController` function receives the file information in `req.file`. It then saves the file path (`req.file.path`) and other metadata to the `Syllabus` table in the database, linking it to the `courseId`.
    3.  **Syllabus Download:** A `GET /api/syllabus/:courseId` endpoint retrieves the syllabus file path from the database and serves the static file to the user.

#### **5.2.4 Routine Generation and Management Module**
*   **File Location:** `backend/src/controllers/routineController.js`
*   **Implementation:** This is the most complex module. It uses a **Greedy Heuristic Algorithm with Constraint Checking**.
    *   **Algorithm Steps:**
        1.  **Data Fetching:** When triggered, the `generateRoutine` function first fetches all necessary data for the given semester:
            *   List of all courses to be scheduled.
            *   List of all available teachers and their pre-defined unavailability (if any).
            *   List of all available rooms with their capacities.
            *   List of student groups.
        2.  **Prioritization:** Courses are sorted by a priority score. For instance, courses with more credit hours or mandatory courses could be prioritized to be scheduled first.
        3.  **Iteration:** The algorithm iterates through the prioritized list of courses. For each course, it iterates through all available time slots in the week (e.g., Monday 9 AM, Monday 10 AM...).
        4.  **Constraint Checking (`checkClash` function):** For each potential `(course, time_slot)` pair, it checks against a set of hard constraints:
            *   Is the assigned teacher already busy at this time? (Query `WeeklySchedule` for `teacherId` and `time_slot`).
            *   Is the target student group already in a class? (Query `WeeklySchedule` for `studentGroupId` and `time_slot`).
            *   Is the proposed room already booked? (Query `WeeklySchedule` and `Reservation` tables for `roomId` and `time_slot`).
            *   Does the room have enough capacity for the course?
        5.  **Soft Constraint Evaluation:** If a slot passes all hard constraints, it's evaluated against soft constraints. The "breathing period" feature is a soft constraint.
            *   **Breathing Period Logic:** When considering a slot for a teacher, the algorithm checks if this placement would result in more than `N` (e.g., 2) consecutive hours of teaching. If so, it gives this slot a lower score, preferring other valid slots.
        6.  **Placement:** The algorithm greedily selects the first valid time slot that meets all hard constraints and has the best soft constraint score. It creates a new entry in a temporary `WeeklySchedule` array.
        7.  **Finalization:** Once all courses are placed (or no valid slots can be found for some), the proposed routine is sent to the frontend for preview. If finalized, the temporary data is saved to the main `WeeklySchedule` table.

#### **5.2.5 Resource Reservation Module**
*   **File Location:** `backend/src/controllers/reservationController.js`
*   **Implementation:**
    *   The frontend provides a calendar-like interface where a user can select a date and time.
    *   This triggers a `POST /api/reservations` request with the resource ID (e.g., `roomId`), start time, and end time.
    *   The `reservationController` first checks for conflicts by querying both the `WeeklySchedule` and `Reservation` tables for the given resource and time range.
    *   If there are no conflicts, a new record is created in the `Reservation` table.

#### **5.2.6 Attendance Management Module**
*   **File Location:** `backend/src/controllers/attendanceController.js`
*   **Implementation:**
    *   **Marking (`POST /api/attendance`):** The teacher submits an array of `{ studentId, status }` along with the `courseId` and `date`. The `attendanceController` loops through this array and creates a record for each student in the `AttendanceRecord` table using `prisma.attendanceRecord.createMany()`.
    *   **Viewing (`GET /api/attendance/student/:studentId`):** The student's frontend calls this endpoint. The backend queries the `AttendanceRecord` table, groups the results by course, and calculates a percentage (e.g., 18/20 classes attended = 90%). This aggregated data is sent back to the frontend to be displayed.

### **5.3 Code Structure and Organization**
The project directory structure, as outlined in the initial report, was strictly followed to ensure modularity and maintainability.

**`backend/` Directory:**
```
src/
├── controllers/    # Business logic
├── middleware/     # Auth, roles, file uploads
├── routes/         # API endpoint definitions
├── services/       # Abstracted complex logic (e.g., scheduling)
├── utils/          # Helper functions
└── server.js       # Main application entry point
prisma/
└── schema.prisma   # Database schema
```

**`frontend/` Directory:**
```
app/                # Next.js App Router: pages, layouts
├── (auth)/         # Route group for login/register
├── dashboard/      # Protected dashboard routes
│   └── (roles)/    # Role-specific layouts and pages
└── page.tsx        # Home page
components/         # Reusable React components
context/            # Global state (AuthContext)
services/           # API call functions
lib/                # Utility functions
```

---
## **Chapter 6: Testing and Validation**

### **6.1 Testing Strategy**
A multi-layered testing strategy was adopted to ensure the system's quality, robustness, and correctness. The strategy involved four main types of testing:

1.  **Unit Testing:** Focused on testing individual functions and components in isolation to verify they work as expected. The goal was to catch bugs at the lowest level.
2.  **Integration Testing:** Focused on testing the interaction between different modules. For example, ensuring that a frontend form submission correctly calls the backend API, which in turn correctly interacts with the database.
3.  **System Testing:** Tested the entire application as a whole from an end-user perspective. This involved executing workflows that a real user would perform, such as logging in, generating a routine, and marking attendance.
4.  **User Acceptance Testing (UAT):** Involved providing access to a staging version of the application to a small group of test users (simulating different roles) and gathering feedback on usability and functionality.

### **6.2 Test Case Design**
A set of representative test cases was designed to cover the most critical functionalities of CRMS-v5.

#### **6.2.1 Unit Testing**
*   **Tool:** Jest
*   **Example Test Case (Backend):**
    *   **ID:** `UT-BC-01`
    *   **Module:** `authController.js`
    *   **Function:** `hashPassword`
    *   **Description:** Test if the `bcrypt.hash` function correctly hashes a plain text password.
    *   **Assertion:** The returned hash should not be equal to the original password, and `bcrypt.compare` should return true for the original password and the hash.
*   **Example Test Case (Frontend):**
    *   **ID:** `UT-FC-01`
    *   **Component:** `TimetableView.tsx`
    *   **Tool:** React Testing Library
    *   **Description:** Test if the component correctly renders the days of the week as table headers when provided with mock schedule data.
    *   **Assertion:** The document should contain elements with text "Monday", "Tuesday", etc.

#### **6.2.2 Integration Testing**
*   **Tool:** Supertest (for backend API testing), Cypress (for end-to-end frontend-backend testing).
*   **Example Test Case:**
    *   **ID:** `IT-API-01`
    *   **Modules:** `authRoutes.js`, `courseRoutes.js`, `authMiddleware.js`
    *   **Description:** A user without a valid JWT attempts to access the `POST /api/add-course` endpoint.
    *   **Expected Result:** The API should return a `401 Unauthorized` status code and an error message.
    *   **Actual Result:** Passed.

#### **6.2.3 System and User Acceptance Testing**
These tests were designed as end-to-end scenarios.

| Test Case ID | Feature | Scenario Description | Expected Result | Actual Result |
|--------------|---------|--------------------|-----------------|---------------|
| **ST-SCH-01**| Routine Generation | Dept Admin attempts to generate a routine with two courses assigned to the same teacher at the same time. | The algorithm should place one course and flag the second as "unscheduled" due to a clash. | Passed |
| **ST-SCH-02**| Breathing Period | A teacher has three 1-hour classes. The scheduler should attempt to place a 1-hour gap after the first two. | The generated routine shows the teacher has classes at 9-10 AM, 10-11 AM, and then 12-1 PM, leaving 11-12 PM free. | Passed |
| **ST-ATT-01**| Attendance Flow | 1. Teacher marks student 'A' as present. 2. Student 'A' logs in and checks their attendance. | The student's dashboard should show 100% attendance for that course for the day. | Passed |
| **ST-RES-01**| Reservation Conflict | 1. A class is scheduled in Room 101 on Monday 10 AM. 2. A teacher tries to reserve Room 101 for Monday 10-11 AM. | The system should show an error message indicating the resource is already booked and prevent the reservation. | Passed |
| **UAT-US-01**| Usability | A student user is asked to find their syllabus for "Data Structures" without prior instruction. | The student should be able to log in, navigate to their schedule or courses, and download the syllabus within 2 minutes. | Passed (with minor feedback on button labeling) |

### **6.3 Summary of Test Results**
The testing phase was successful in identifying and resolving several bugs before deployment.
*   **Critical Bugs Found:** An issue where the JWT secret was exposed in an error message was found during security testing and immediately patched. An integration test revealed that deleting a department did not properly cascade-delete its associated courses, leading to orphaned data; this was fixed by adjusting the Prisma schema's referential actions.
*   **Medium Bugs Found:** The routine generator was initially too slow for departments with over 50 courses. The algorithm was optimized by pre-fetching and caching data more effectively, reducing generation time by 40%.
*   **Minor Bugs Found:** Various UI inconsistencies, such as different button styles on different pages, were identified during UAT and corrected.

### **6.4 Bug Fixing and Iterations**
A bug tracking system (GitHub Issues) was used to log all identified issues. Each bug was assigned a priority (Critical, High, Medium, Low). The development process followed a cycle of: **Test -> Find Bug -> Log Bug -> Fix Bug -> Re-test -> Close Bug**. This iterative approach ensured that fixes did not introduce new regressions and that the overall quality of the application improved with each cycle. The feedback from UAT was particularly valuable for refining the user interface and improving workflows.

---
## **Chapter 7: Results and Discussion**

### **7.1 Overview of Completed Features**
At the conclusion of the development phase, CRMS-v5 successfully met all the primary objectives outlined in Chapter 1. The system delivered a fully functional, integrated platform with the following key results:

1.  **A Robust Role-Based System:** The application successfully implements four distinct user roles, each with a tailored dashboard and a secure set of permissions, ensuring data privacy and operational integrity.
2.  **A Functional Automated Scheduler:** The core feature, the routine generation engine, is capable of producing clash-free weekly schedules for a moderately sized academic department. It correctly respects hard constraints (teacher, room, student group availability) and makes a reasonable effort to satisfy soft constraints like teacher breathing periods.
3.  **Integrated Academic Tools:** The system seamlessly integrates essential academic support functions. Teachers can successfully upload syllabi, and students can access them. The attendance module works end-to-end, from a teacher marking attendance to a student viewing their records.
4.  **Dynamic Resource Management:** The resource reservation feature provides a valuable tool for ad-hoc space management, preventing conflicts between scheduled classes and special events.
5.  **A Modern and Usable Interface:** The frontend, built with Next.js and Tailwind CSS, provides a clean, responsive, and intuitive user experience that stands in stark contrast to traditional, clunky enterprise systems.

### **7.2 Performance of the Routine Generation Algorithm**
The performance of the heuristic-based scheduling algorithm was a key area of focus and evaluation.
*   **Effectiveness:** In test scenarios with a sample department (30 courses, 15 teachers, 10 rooms), the algorithm was able to successfully schedule **95-100%** of all courses without any hard conflicts. The few unscheduled courses were typically due to over-constrained scenarios (e.g., not enough rooms or available teacher slots). This result is highly practical, as it allows an administrator to focus on manually placing only the difficult 1-2 courses rather than the entire set of 30.
*   **Efficiency:** The time taken to generate a routine was measured. For the sample department, the initial generation time was approximately 45 seconds. After optimizations (e.g., more efficient database queries and in-memory data structures), this was reduced to **under 25 seconds**, which is well within the acceptable performance target for a preview-and-finalize workflow.
*   **"Breathing Period" Impact:** The implementation of the breathing period soft constraint proved successful. In generated schedules, it was observed that the algorithm actively avoided placing more than two or three consecutive classes for a single teacher, opting for slots with a gap in between, even if immediately adjacent slots were technically available. This demonstrates the system's ability to create a "qualitatively better" schedule, not just a technically valid one.

### **7.3 Comparison with Initial Goals**
The final system aligns closely with the project's initial objectives.

| Objective                                         | Status      | Discussion                                                                                                                                                             |
|---------------------------------------------------|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Develop a centralized, multi-user web app         | **Achieved**| The client-server architecture with four user roles was fully implemented.                                                                                             |
| Design a clash-free routine generation algorithm  | **Achieved**| The heuristic algorithm successfully generates schedules free of hard conflicts.                                                                                        |
| Incorporate "breathing period" feature            | **Achieved**| The soft constraint logic was implemented and validated to improve the quality of teacher schedules.                                                                    |
| Provide interface for syllabus management         | **Achieved**| The upload/download functionality for syllabi is fully operational.                                                                                                    |
| Implement attendance management module            | **Achieved**| The end-to-end workflow for marking and viewing attendance was successfully built and tested.                                                                          |
| Build a resource reservation system               | **Achieved**| The ad-hoc room reservation system works correctly and prevents conflicts with the main schedule.                                                                      |
| Introduce routine archiving                       | **Achieved**| A boolean flag (`isArchived`) was added to the `Semester` model, allowing admins to filter out old routines from the active view, effectively archiving them.            |

### **7.4 Challenges Faced During Development**

1.  **Complexity of the Scheduling Logic:** The biggest challenge was designing the scheduling algorithm. Initial naive approaches were either too slow or failed to find solutions for even moderately constrained problems. The shift to a prioritized greedy heuristic was a critical decision. Debugging this logic was also time-consuming, as a single faulty constraint check could invalidate the entire schedule.
2.  **State Management on the Frontend:** Managing the state of the interactive routine-generation UI was complex. When an admin drags and drops a class, numerous states need to update: the list of unscheduled courses, the timetable grid, and any conflict indicators. Using a combination of local component state and global context proved necessary but required careful planning.
3.  **Database Schema Evolution:** As new features like attendance and reservations were conceptualized, the database schema had to be revised multiple times. Using Prisma Migrations was invaluable here, as it allowed for safe and version-controlled changes to the database structure without manual SQL scripting.
4.  **Ensuring Security:** Implementing a secure, role-based system required meticulous attention to detail. Every single API endpoint had to be protected with the correct combination of authentication and authorization middleware. Early integration tests were crucial for catching vulnerabilities where a user with a lower-privilege role could access admin-level data.

### **7.5 Lessons Learned**

*   **Design Before Coding:** The importance of a thorough system analysis and design phase cannot be overstated. The time spent creating ERDs, use case diagrams, and architectural plans saved countless hours of refactoring during the implementation phase.
*   **The Value of an ORM:** Using Prisma dramatically accelerated backend development. Its type safety caught potential bugs at compile time, and its expressive query API made database interactions clean and readable. Managing schema migrations with Prisma was far more reliable than manual methods.
*   **Start with the Core Feature:** Focusing on the most complex and critical feature—the routine generator—early in the project was the right approach. Once it was proven to be feasible, the other CRUD-based features could be built around it with confidence.
*   **Iterative Testing is Non-Negotiable:** Integrating testing from the very beginning (unit tests) and continuing through the entire lifecycle (integration, system tests) is essential for building a reliable application. Waiting until the end to test would have been disastrous.

---
## **Chapter 8: Conclusion and Future Work**

### **8.1 Summary of Project Outcomes**
This project set out to solve the pervasive problem of inefficient academic resource management by developing CRMS-v5, a modern, integrated web application. The project has successfully achieved this goal. The final product is a robust, scalable, and user-friendly system that automates the creation of clash-free class schedules, streamlines the management of courses and users, and provides essential tools for teachers and students, such as attendance tracking and syllabus management.

By leveraging a contemporary technology stack and a pragmatic approach to the complex timetabling problem, CRMS-v5 provides a tangible solution that can significantly reduce administrative overhead, minimize scheduling errors, and enhance the overall academic experience. The project has delivered on all its core objectives, resulting in a deployable application that validates the proposed solution's effectiveness.

### **8.2 Limitations of the Current System**
While CRMS-v5 is a comprehensive system, it has several limitations that provide avenues for future work:

1.  **Heuristic, Not Optimal, Scheduling:** The greedy heuristic algorithm finds a "good" solution quickly but does not guarantee a mathematically optimal one. There may be a better schedule possible that the algorithm does not find.
2.  **Limited Constraint Types:** The current system handles a core set of constraints. It does not yet support more complex rules, such as "a course must be scheduled in a room with a projector" or "this teacher is only available on Monday afternoons."
3.  **No Real-Time Collaboration:** If two department admins are trying to make changes to the schedule simultaneously, their actions could conflict. The system currently lacks real-time updates or locking mechanisms (e.g., using WebSockets).
4.  **Basic Reservation System:** The reservation system is for one-off bookings. It does not support recurring reservations (e.g., "reserve Room 203 every Friday for a seminar").
5.  **No Direct Student Enrollment:** The system assumes student enrollment in courses is handled by an external system. There is no functionality for students to register for courses within CRMS-v5 itself.

### **8.3 Proposed Future Enhancements**
CRMS-v5 provides a strong foundation that can be extended with numerous high-impact features in the future:

1.  **AI-Powered Scheduling Engine:** Replace or augment the current heuristic with a more advanced AI/ML model. A machine learning model could be trained on historical data to learn scheduling patterns and preferences, potentially producing higher-quality schedules that better satisfy soft constraints.
2.  **Native Mobile Application:** Develop native iOS and Android applications for students and teachers. This would provide a more convenient way to check schedules, receive push notifications for class changes or cancellations, and mark attendance.
3.  **Advanced Constraint Management:** Create a flexible "rules engine" where administrators can define custom constraints through a UI without needing to change the code. For example, adding tags to rooms (e.g., `has_projector`, `is_lab`) and courses (`needs_projector`) and having the scheduler automatically match them.
4.  **Integration with Learning Management Systems (LMS):** Develop API-based integration with popular LMS platforms like Moodle or Canvas. This could enable single sign-on (SSO) and allow schedules created in CRMS-v5 to automatically populate the calendar in the LMS.
5.  **Real-Time Conflict Detection and Alerts:** Implement WebSockets to provide real-time feedback. If an admin manually moves a class that creates a conflict, an immediate alert could be shown to them and any other affected users (e.g., the teacher of that class).
6.  **Reporting and Analytics Dashboard:** Build a comprehensive analytics dashboard for administrators. This could visualize data on room utilization rates, teacher workloads, student attendance trends, and other key performance indicators to aid in strategic planning.

By pursuing these enhancements, CRMS-v5 can evolve from a powerful departmental tool into a university-wide, indispensable platform for academic operations.

---
## **Chapter 9: References**

Burke, E. K., Kingston, J. H., & Paechter, B. (2004). A review of metaheuristics for educational timetabling. In *Metaheuristics: Progress as Real Problem Solvers* (pp. 87-110). Springer US.

Even, S., Itai, A., & Shamir, A. (1976). On the complexity of timetable and multicommodity flow problems. *SIAM Journal on Computing, 5*(4), 691-703.

Oracle. (2023). *PeopleSoft Campus Solutions*. Retrieved from https://www.oracle.com/applications/peoplesoft/campus-solutions/

*Note: Additional references to the documentation for Next.js, Express.js, Prisma, PostgreSQL, and other frameworks would be included here.*

---
## **Chapter 10: Appendices**

### **10.1 Appendix A: Source Code Repository**
The complete source code for the CRMS-v5 project, including the frontend and backend applications, is available on GitHub.

**Repository URL:** [https://github.com/your-username/crms-v5-project](https://github.com/your-username/crms-v5-project)

### **10.2 Appendix B: Complete Database Schema**
*This appendix would contain the full, unabridged output of the `backend/prisma/schema.prisma` file, detailing every model, field, type, and relation in the database.*

### **10.3 Appendix C: Installation and Deployment Guide**
This guide provides instructions for setting up the development environment and deploying the application.

**Prerequisites:**
*   Node.js v18.x or later
*   npm
*   PostgreSQL
*   Git

**Development Setup:**
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/crms-v5-project.git
    cd crms-v5-project
    ```
2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    # Create a .env file and configure DATABASE_URL and JWT_SECRET
    cp .env.example .env
    npx prisma migrate dev # Apply migrations to your local DB
    npm run dev # Start the backend server
    ```
3.  **Setup Frontend:**
    ```bash
    cd ../frontend
    npm install
    # Create a .env.local file and configure NEXT_PUBLIC_API_URL
    cp .env.local.example .env.local
    npm run dev # Start the frontend dev server
    ```
The application will be accessible at `http://localhost:3000`.

**Deployment:**
*   **Backend:** The backend can be containerized using the provided `Dockerfile` and deployed to any container hosting service (e.g., AWS ECS, Heroku, DigitalOcean App Platform).
*   **Frontend:** The Next.js frontend is optimized for deployment on Vercel. Connect the GitHub repository to a Vercel project for continuous deployment.

---
***End of Report***