const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const { protect } = require('../middleware/auth');

// GET /api/programs — Public: list active programs (for registration form dropdown)
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/programs/all — Admin: list ALL programs including inactive
router.get('/all', protect, async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// POST /api/programs — Admin: create a new program
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Program name is required.' });
    }

    const existing = await Program.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A program with this name already exists.' });
    }

    const program = new Program({ name: name.trim(), description: description?.trim() || '' });
    const saved = await program.save();

    res.status(201).json({ success: true, message: 'Program added successfully!', data: saved });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// PATCH /api/programs/:id — Admin: edit a program (name, description, active status)
router.patch('/:id', protect, async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (description !== undefined) update.description = description.trim();
    if (isActive !== undefined) update.isActive = isActive;

    const updated = await Program.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Program not found.' });
    }

    res.status(200).json({ success: true, message: 'Program updated successfully.', data: updated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// DELETE /api/programs/:id — Admin: delete a program
router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await Program.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Program not found.' });
    }
    res.status(200).json({ success: true, message: 'Program deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
