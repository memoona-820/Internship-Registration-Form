const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const protect = require('../middleware/auth');

// Public: Submit registration
router.post('/', async (req, res) => {
  try {
    const internship = new Internship(req.body);
    await internship.save();
    res.status(201).json({ message: 'Registration submitted successfully!', data: internship });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Public: Lookup own record by email + CNIC
router.post('/lookup', async (req, res) => {
  try {
    const { email, cnic } = req.body;
    if (!email || !cnic) return res.status(400).json({ message: 'Email and CNIC required' });
    const record = await Internship.findOne({ email: email.toLowerCase(), cnic });
    if (!record) return res.status(404).json({ message: 'No record found with this email and CNIC' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: Update own record (verified by email + CNIC)
router.put('/my/:id', async (req, res) => {
  try {
    const { email, cnic } = req.body;
    const record = await Internship.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.email !== email.toLowerCase() || record.cnic !== cnic)
      return res.status(403).json({ message: 'Email or CNIC does not match' });
    const { email: _e, cnic: _c, status: _s, ...updateData } = req.body;
    const updated = await Internship.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ message: 'Record updated successfully!', data: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Public: Delete own record (verified by email + CNIC)
router.delete('/my/:id', async (req, res) => {
  try {
    const { email, cnic } = req.body;
    const record = await Internship.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.email !== email.toLowerCase() || record.cnic !== cnic)
      return res.status(403).json({ message: 'Email or CNIC does not match' });
    await Internship.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all applicants with search & filter
router.get('/', protect, async (req, res) => {
  try {
    const { search, status, program } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { cnic: { $regex: search, $options: 'i' } },
        { institution: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'all') query.status = status;
    if (program && program !== 'all') query.program = program;
    const internships = await Internship.find(query).sort({ createdAt: -1 });
    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get single applicant
router.get('/:id', protect, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Record not found' });
    res.json(internship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update full record
router.put('/:id', protect, async (req, res) => {
  try {
    const updated = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record updated successfully', data: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: Update status only
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Internship.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Status updated', data: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: Delete record
router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await Internship.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
