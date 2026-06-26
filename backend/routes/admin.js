const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Register (one-time)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const exists = await Admin.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Admin already exists' });
    const admin = new Admin({ username, password });
    await admin.save();
    res.status(201).json({ message: 'Admin created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await admin.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '7d' });
    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
