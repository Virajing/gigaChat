const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB

module.exports = conn = mongoose.connect(process.env.MONGODB_CON)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));
