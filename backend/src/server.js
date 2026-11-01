const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check and root route
app.get('/', (req, res) => {
  res.json({
    project: 'EdTech CRM & Inquiry System API',
    status: 'online',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth (login, register, me)',
      inquiries: '/api/inquiries (submit public form, get filtered list, stats, update status)'
    }
  });
});

app.get('/api/health', async (req, res) => {
  const dbStatus = await db.testConnection();
  res.status(dbStatus.connected ? 200 : 503).json({
    status: dbStatus.connected ? 'healthy' : 'database_disconnected',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`===============================================`);
    console.log(` EdTech CRM Server running on port ${PORT}`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(` Database: Supabase PostgreSQL`);
    console.log(` Authentication: Custom JWT (Bypassing Supabase Auth)`);
    console.log(`===============================================`);

    // Verify DB on boot
    const test = await db.testConnection();
    if (test.connected) {
      console.log(`✓ Supabase DB connected successfully: ${test.database}`);
    } else {
      console.warn(`! Supabase DB connection check: ${test.error}`);
      console.warn(`  Please ensure your DATABASE_URL in .env is configured.`);
    }
  });
}

module.exports = app;
