const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/internships', require('./routes/internships'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/programs', require('./routes/programs'));

// 404 handler — any unmatched API route
app.use('/api', (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Centralized error handler — catches errors passed via next(err) and
// anything thrown inside async route handlers wrapped by express 5-style rejection.
// Kept last so it only fires when a route above didn't already send a response.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with these details already exists' });
  }

  res.status(err.status || 500).json({ message: err.message || 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/internship_db';

mongoose.connection.on('error', err => console.error('MongoDB runtime error:', err.message));
mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
