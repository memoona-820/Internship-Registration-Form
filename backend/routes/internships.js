const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const { protect } = require('../middleware/auth');

// POST /api/internships — Register a new applicant (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, technology, phone, cnic, fatherName } = req.body;

    // Check for duplicate email
    const existing = await Internship.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An application with this email already exists.',
      });
    }

    // Check for duplicate CNIC
    const existingCnic = await Internship.findOne({ cnic });
    if (existingCnic) {
      return res.status(409).json({
        success: false,
        message: 'An application with this CNIC already exists.',
      });
    }

    const internship = new Internship({ name, email, technology, phone, cnic, fatherName });
    const saved = await internship.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: saved,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/internships — Fetch all registered applicants (admin only)
router.get('/', protect, async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: internships.length,
      data: internships,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// PATCH /api/internships/:id/status — Update applicant status (admin only)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const updated = await Internship.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully.',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// DELETE /api/internships/:id — Remove an applicant record (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await Internship.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }
    res.status(200).json({ success: true, message: 'Record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
