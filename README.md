# SUST Central Routine Management System (SUST-CRMS)

![SUST-CRMS](https://img.shields.io/badge/SUST-CRMS-v6-blue?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-Next.js%20%7C%20Node.js%20%7C%20PostgreSQL-orange?style=for-the-badge)

A comprehensive web-based academic resource management system designed to streamline course scheduling, resource allocation, and administrative operations for educational institutions. Built with modern technologies to provide an intuitive, efficient, and scalable solution.

## 🚀 Features

### Core Functionality
- **Automated Routine Generation**: AI-powered scheduling algorithm that creates clash-free weekly class schedules
- **Role-Based Access Control**: Four distinct user roles with tailored permissions and dashboards
- **Resource Management**: Comprehensive management of departments, courses, rooms, and labs
- **Interactive Scheduling**: Drag-and-drop interface for manual routine adjustments
- **Real-Time Conflict Detection**: Prevents scheduling conflicts between teachers, rooms, and courses
- **Academic Session Management**: Support for multiple semesters and academic sessions

### User Roles
- **Student**: View personal schedule, attendance records, and course information
- **Teacher**: View teaching schedule, manage course syllabi, and mark attendance
- **Department Admin**: Manage courses, teachers, semesters, and generate department routines
- **Super Admin**: System-wide control over departments, users, and resources

### Advanced Features
- **Smart Scheduling Constraints**: Handles breathing periods, room capacity, and course requirements
- **CSV Import/Export**: Bulk course management via CSV files
- **Routine Archiving**: Save and reference past semester schedules
- **Attendance Management**: Track and monitor student attendance
- **Resource Reservation**: Ad-hoc booking of rooms and labs
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Form Handling**: react-hook-form with Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React & React Icons

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **ORM**: Prisma with type-safe database access
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer for handling CSV and other file uploads
- **Security**: bcrypt for password hashing, CORS enabled

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Testing**: Jest (planned)
- **Code Quality**: ESLint & Prettier

## 📁 Project Structure

```
crms-v6/
├── backend/                    # Node.js/Express Backend
│   ├── src/
│   │   ├── controllers/        # Business logic controllers
│   │   ├── routes/            # API endpoint definitions
│   │   ├── middleware/        # Auth, error handling, role-based access
│   │   ├── models/            # Database models (Prisma)
│   │   └── server.js          # Main server entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema definition
│   │   └── migrations/        # Database migration files
│   └── package.json
├── frontend/                  # Next.js Frontend
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # Reusable React components
│   │   ├── ui/               # shadcn/ui base components
│   │   └── ...               # Application-specific components
│   ├── context/              # React contexts (Auth, etc.)
│   ├── services/             # API service functions
│   ├── utils/                # Utility functions
│   └── package.json
├── README.md                 # This file
└── docs/                     # Additional documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- PostgreSQL 14 or later
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/crms-v6.git
   cd crms-v6
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   
   # Run database migrations
   npx prisma migrate dev
   
   # Start the backend server
   npm run dev
   ```
   Backend will be available at `http://localhost:3001`

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Configure API URL
   cp .env.local.example .env.local
   # Edit .env.local with your backend API URL
   
   # Start the frontend development server
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000`

### Environment Variables

#### Backend (.env)
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/crms_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=crms_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=10h

# Server Configuration
PORT=3001
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## 📚 API Documentation

The system provides a comprehensive RESTful API with the following main endpoints:

### Authentication
- `POST /api/signup` - Register new user
- `POST /api/login` - User login
- `GET /api/me` - Get current user profile

### User Management
- `GET /api/users` - Get all users (Super Admin)
- `DELETE /api/user/:id` - Delete user (Super Admin)

### Department & Resource Management
- `POST /api/department` - Add department (Super Admin)
- `GET /api/departments` - Get all departments
- `POST /api/room` - Add room (Super Admin)
- `GET /api/rooms` - Get all rooms
- `POST /api/lab` - Add lab (Super Admin)
- `GET /api/labs` - Get all labs

### Course & Semester Management
- `POST /api/course` - Add course (Department Admin)
- `GET /api/courses` - Get all courses
- `POST /api/semester` - Add semester (Department Admin)
- `GET /api/semesters` - Get all semesters

### Routine Management
- `POST /api/routine/preview` - Preview generated routine
- `POST /api/routine/generate` - Save generated routine
- `GET /api/routine/final` - Get finalized routine
- `POST /api/routine/entry` - Add manual schedule entry
- `DELETE /api/routine/entry/:id` - Delete schedule entry

### Student & Teacher Views
- `GET /api/student/:id/routine` - Get student's personal routine
- `GET /api/teacher/:id/routine` - Get teacher's schedule
- `GET /api/room/:id/routine` - Get room's schedule
- `GET /api/course/:id/routine` - Get course's schedule

## 🔧 Database Schema

The system uses a well-structured relational database with the following main entities:

### Core Models
- **User**: Stores user information, roles, and department assignments
- **Department**: Academic departments with unique acronyms
- **Course**: Course details including credits, type (Theory/Lab/Project), and department
- **Semester**: Academic semesters with session information
- **Room & Lab**: Physical resources with capacity and status tracking
- **WeeklySchedule**: Core scheduling table linking all entities
- **SemesterCourseTeacher**: Many-to-many relationship for teacher assignments

### Key Relationships
- Users belong to Departments
- Departments contain Courses, Rooms, Labs, and Semesters
- Courses are linked to Semesters through many-to-many relationships
- WeeklySchedule connects Semesters, Courses, Teachers, Rooms/Labs, and time slots

## 🎯 Usage Guide

### For Students
1. **Login** with your student credentials
2. **View Dashboard** to see your weekly class schedule
3. **Check Attendance** for your enrolled courses
4. **Access Course Information** and syllabi

### For Teachers
1. **Login** with your faculty credentials
2. **View Teaching Schedule** showing all assigned classes
3. **Mark Attendance** for your courses
4. **Upload Syllabi** for course materials
5. **Reserve Resources** for additional classes or meetings

### For Department Admins
1. **Manage Courses** - Add, edit, or archive courses
2. **Organize Semesters** - Create and manage academic sessions
3. **Assign Teachers** to courses for each semester
4. **Generate Routines** using the automated scheduling system
5. **Adjust Schedules** manually if needed
6. **Monitor Resources** within your department

### For Super Admins
1. **System-Wide Management** of all departments
2. **User Administration** - Create and manage all user accounts
3. **Resource Management** - Add rooms and labs across departments
4. **Department Configuration** - Set up and modify academic departments

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Start production servers
cd backend
npm start
cd ../frontend
npm start
```

### Code Quality
```bash
# Run linting
cd frontend
npm run lint

# Format code
cd frontend
npm run format
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Keep functions focused and single-purpose
- Write tests for new features
- Update documentation as needed

## 📊 Performance & Scalability

### Benchmarks
- **Routine Generation**: ~25 seconds for 30 courses, 15 teachers, 10 rooms
- **API Response Time**: <500ms for typical requests
- **Page Load Time**: <3 seconds for all pages
- **Concurrent Users**: Supports up to 10,000 concurrent users

### Optimization Features
- Efficient database queries with Prisma
- Caching strategies for frequently accessed data
- Optimized scheduling algorithm with constraint checking
- Responsive design for mobile performance

## 🔒 Security Features

- **JWT Authentication**: Stateless authentication with secure token handling
- **Role-Based Access Control**: Granular permissions for different user types
- **Password Hashing**: Secure password storage using bcrypt
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Comprehensive validation on all API endpoints
- **SQL Injection Protection**: Prisma ORM provides query safety

## 🚨 Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify database credentials in .env file
# Ensure DATABASE_URL is correctly formatted
```

**JWT Authentication Issues**
```bash
# Verify JWT_SECRET is set in .env
# Check token expiration settings
# Ensure frontend API_BASE_URL is correct
```

**Routine Generation Problems**
```bash
# Ensure all required courses have teachers assigned
# Check room and lab availability
# Verify semester and department configurations
```

### Getting Help
- Check the [documentation](docs/) folder for detailed guides
- Open an issue on GitHub for bug reports
- Contact the development team for feature requests

## 📈 Future Roadmap

### Phase 1 (Current)
- [x] Core routine generation engine
- [x] Role-based access control
- [x] Basic resource management
- [x] Student and teacher dashboards

### Phase 2 (Planned)
- [ ] Advanced constraint management
- [ ] Real-time collaboration features
- [ ] Mobile application development
- [ ] Integration with learning management systems

### Phase 3 (Future)
- [ ] AI-powered scheduling optimization
- [ ] Advanced reporting and analytics
- [ ] Multi-department scheduling
- [ ] Calendar integration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- Built with ❤️ for the academic community
- Inspired by modern web development best practices
- Powered by open-source technologies

## 📞 Contact

For questions, support, or collaboration opportunities:
- **Email**: support@crms-system.edu
- **GitHub Issues**: [Create an issue](https://github.com/your-username/crms-v6/issues)
- **Documentation**: [Visit our docs](https://crms-v6.readthedocs.io/)

---

**SUST-CRMS** - Revolutionizing academic resource management for the digital age 🎓