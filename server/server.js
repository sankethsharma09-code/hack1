require('dotenv').config();

// ─── Startup env-var validation ───────────────────────────────────────────────
// Fail fast: if any required variable is absent the server would start but
// every request would blow up with a cryptic error.  Catch it here instead.
const REQUIRED_ENV = [
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
];

const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(
    `[STARTUP ERROR] Missing required environment variables: ${missingEnv.join(', ')}\n` +
    'Server will not start. Please set them in your .env file.'
  );
  process.exit(1);
}

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const analysesRoutes = require('./routes/analyses');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Core middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', analysesRoutes);

// Health check (registered before the error handler, after all routes)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
// Catches requests to routes that don't exist and returns JSON, not HTML.
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// Express identifies this as an error handler because it has 4 parameters.
// Any next(err) call, or an error thrown inside a sync middleware, lands here.
// Async route handlers that throw will also reach here if they use next(err)
// — but all our async handlers have their own try/catch that catches first.
// This acts as the final safety net for anything that slips through.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'An unexpected error occurred. Please try again.',
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
