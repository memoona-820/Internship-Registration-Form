const mongoose = require('mongoose');

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Program name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Program name must be at least 2 characters'],
      maxlength: [60, 'Program name must not exceed 60 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description must not exceed 300 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true, // inactive programs are hidden from the public registration form
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Program', programSchema);
