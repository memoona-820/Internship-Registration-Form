const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const protect = require('../middleware/auth');

// Public: active programs
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find({ isActive: true });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: all programs
router.get('/all', protect, async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: add program
router.post('/', protect, async (req, res) => {
  try {
    const program = new Program(req.body);
    await program.save();
    res.status(201).json(program);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: update program
router.patch('/:id', protect, async (req, res) => {
  try {
    const updated = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Program not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: delete program
router.delete('/:id', protect, async (req, res) => {
  try {
    await Program.findByIdAndDelete(req.params.id);
    res.json({ message: 'Program deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
