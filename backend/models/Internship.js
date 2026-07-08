const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Full name is required'], trim: true, minlength: [2, 'Name is too short'] },
  fatherName: { type: String, required: [true, "Father's name is required"], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^(\+92[0-9]{10}|0[0-9]{10})$/, 'Please provide a valid Pakistani phone number']
  },
  cnic: {
    type: String,
    required: [true, 'CNIC is required'],
    trim: true,
    match: [/^[0-9]{13}$|^[0-9]{5}-[0-9]{7}-[0-9]$/, 'Please provide a valid 13-digit CNIC']
  },
  program: { type: String, required: [true, 'Program selection is required'] },
  qualification: { type: String, required: [true, 'Qualification is required'] },
  institution: { type: String, required: [true, 'Institution name is required'], trim: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

// Prevent duplicate applications from the same CNIC + email combination
internshipSchema.index({ email: 1, cnic: 1 });

module.exports = mongoose.model('Internship', internshipSchema);
