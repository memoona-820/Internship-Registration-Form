const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  cnic: { type: String, required: true, trim: true },
  program: { type: String, required: true },
  qualification: { type: String, required: true },
  institution: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
