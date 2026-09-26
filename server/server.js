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
// Allow all origins with full CORS headers — prevents preflight failures
// that cause the browser to receive an empty response body.
app.use(cors({
  origin: true,           // reflect any request origin
  credentials: true,      // allow cookies / Authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('/{*path}', cors());  // handle all pre-flight OPTIONS requests
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', analysesRoutes);

// Health check (registered before the error handler, after all routes)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root endpoint: redirect browsers to frontend, or return API status JSON
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.redirect('http://localhost:5173');
  }
  res.json({
    name: 'SentinelText API Server',
    status: 'running',
    healthCheck: '/api/health',
    frontend: 'http://localhost:5173',
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
// Catches requests to routes that don't exist and returns JSON, not HTML.
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// Express identifies this as an error handler because it has 4 parameters.
// This is the final safety net for anything that slips through route handlers.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // body-parser sends malformed-JSON as a SyntaxError with type='entity.parse.failed'
  // If not handled in the route, catch it here and always return valid JSON.
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error('[UNHANDLED ERROR]', err);
  const status = err.status || err.statusCode || 500;
  // Guard: if headers already sent we can't send another response
  if (res.headersSent) return next(err);
  return res.status(status).json({
    error: err.message || 'An unexpected error occurred. Please try again.',
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
// Bind to 0.0.0.0 (all interfaces) so the server is reachable on both
// IPv4 (127.0.0.1) and IPv6 (::1), and from the local network.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
