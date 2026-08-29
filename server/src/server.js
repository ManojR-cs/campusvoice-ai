const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { PORT, CLIENT_URL } = require('./config/env');
const { initSocket } = require('./utils/socket');
const { initEscalationEngine } = require('./services/escalationService');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Init Socket.IO
initSocket(server, CLIENT_URL);

// Init Background Cron Engine
initEscalationEngine();

// Express Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusVoice AI API Server is active and healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 CampusVoice AI Server running on port ${PORT}`);
  console.log(`📡 Client origin: ${CLIENT_URL}`);
  console.log(`====================================================`);
});
