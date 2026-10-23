const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');
const assignmentRoutes = require('./routes/assignments');
const testRoutes = require('./routes/tests');
const leaderboardRoutes = require('./routes/leaderboards');
const aiRoutes = require('./routes/ai');
const billingRoutes = require('./routes/billing');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'StudySync – AI Interactive Classroom Backend',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend in production build if present
const fs = require('fs');
const clientDist = path.join(__dirname, '../client/dist');
const rootDist = path.join(__dirname, '../dist');
const distDir = fs.existsSync(clientDist) ? clientDist : rootDist;

app.use(express.static(distDir));
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api/')) return next();
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) {
      res.json({ message: 'StudySync API Server is running. Start the client dev server to view the frontend.' });
    }
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 StudySync AI Classroom Server running on port ${PORT}`);
    console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
