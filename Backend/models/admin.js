const mongoose = require('mongoose');

// Define User schema
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'moderator', 'datascientist'],
    default: 'admin',
  }
});

// Create User model
const User = mongoose.model('admins', adminSchema);

module.exports = User;
