require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const analysesRoutes = require('./routes/analyses');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Configure origin properly in production
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', analysesRoutes); // mounts /analyze, /analyses, etc.

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
