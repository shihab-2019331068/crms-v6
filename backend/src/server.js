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
const errorHandler = require('./middleware/errorHandler');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
