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

// Admin: Get status summary counts, program breakdown & 14-day trend (independent of pagination)
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      Internship.countDocuments({}),
      Internship.countDocuments({ status: 'pending' }),
      Internship.countDocuments({ status: 'approved' }),
      Internship.countDocuments({ status: 'rejected' }),
    ]);

    const byProgramAgg = await Internship.aggregate([
      { $group: { _id: '$program', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const byProgram = byProgramAgg.map(p => ({ program: p._id || 'Unspecified', count: p.count }));

    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);
    const trendAgg = await Internship.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }
    ]);
    const trendMap = Object.fromEntries(trendAgg.map(t => [t._id, t.count]));
    const trend = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      trend.push({ date: key, count: trendMap[key] || 0 });
    }

    res.json({ total, pending, approved, rejected, byProgram, trend });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Bulk update status for multiple records
router.patch('/bulk/status', protect, async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'No records selected' });
    if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const result = await Internship.updateMany({ _id: { $in: ids } }, { status });
    res.json({ message: `${result.modifiedCount} record(s) updated`, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: Bulk delete multiple records
router.post('/bulk/delete', protect, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'No records selected' });
    const result = await Internship.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${result.deletedCount} record(s) deleted`, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: Get all applicants with search, filter & pagination
router.get('/', protect, async (req, res) => {
  try {
    const { search, status, program, exportAll } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

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

    const total = await Internship.countDocuments(query);

    if (exportAll === 'true') {
      const all = await Internship.find(query).sort({ createdAt: -1 });
      return res.json({ data: all, total, page: 1, pages: 1, limit: total });
    }

    const pages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, pages);

    const internships = await Internship.find(query)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * limit)
      .limit(limit);

    res.json({ data: internships, total, page: safePage, pages, limit });
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
