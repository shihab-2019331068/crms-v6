require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const deptAdminRoutes = require('./routes/deptAdminRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const generalRoutes = require('./routes/generalRoutes');
const routineRoutes = require('./routes/routineRoutes');
const labRoutes = require('./routes/labRoutes');
const roomRoutes = require('./routes/roomRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const accessRoutes = require('./routes/accessRoutes');
const courseRoutes = require('./routes/courseRoutes');
const errorHandler = require('./middleware/errorHandler');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use('/api', authRoutes);
app.use('/api', studentRoutes);
app.use('/api', teacherRoutes);
app.use('/api', deptAdminRoutes);
app.use('/api', superAdminRoutes);
app.use('/api', generalRoutes);
app.use('/api', routineRoutes);
app.use('/api', accessRoutes);
app.use('/api', roomRoutes);
app.use('/api', labRoutes);
app.use('/api', courseRoutes);
app.use('/api', semesterRoutes);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
