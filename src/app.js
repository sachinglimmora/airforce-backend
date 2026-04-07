const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const moduleRoutes = require('./routes/modules');
const simulationRoutes = require('./routes/simulations');
const progressRoutes = require('./routes/progress');
const digitalTwinRoutes = require('./routes/digitalTwin');
const aiAssistantRoutes = require('./routes/aiAssistant');
const instructorRoutes = require('./routes/instructor');
const adminRoutes = require('./routes/admin');
const alertRoutes = require('./routes/alerts');
const analyticsRoutes = require('./routes/analytics');

const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const connectDB = require('./config/db');
const app = express();

const path = require('path');

// Trust proxy for Vercel/proxies (critical for rate limiting)
app.set('trust proxy', 1);

// ─── Middleware to Ensure Database Connection ──────────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(503).json({ error: 'Database connection failed. Please try again in 30 seconds.' });
  }
});

// Welcome message
app.get('/', (req, res) => {
  res.send('Welcome to the Airforce Training Platform API!');
});

// ─── Security & Middleware ──────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net", "https://fastly.picsum.photos"],
      connectSrc: ["'self'", "http://localhost:8000", "http://127.0.0.1:8000", "https://*"],
    },
  },
}));

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500, // Increased for training environment
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Increased for training environment
  message: { message: 'Too many login attempts, please try again later.' },
});

// ─── Serve API Docs ─────────────────────────────────────────────────────────
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// JSON endpoint for Swagger spec (Used by the static HTML doc)
app.get('/api/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Main Documentation Entry point
app.get('/api/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

// Fallback for static assets in public folder
app.use('/docs', express.static(path.join(__dirname, 'public')));
app.get('/docs', (req, res) => res.sendFile(path.join(__dirname, 'public', 'docs.html')));

// ─── Health Check ───────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check system health and operational status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Operational status of the IAF Training API
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'IAF Training Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/digital-twin', digitalTwinRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── Error Handling ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
