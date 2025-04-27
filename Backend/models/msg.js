const mongoose = require('mongoose');

// Define Message schema
const msgSchema = new mongoose.Schema({
  sender: {
    type: String, // Save the username directly
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: { 
    type: [String],
    default: [] },
  }, { timestamps: true });

// Create and export the Post model
const Post = mongoose.model('Post', msgSchema);
module.exports = Post;
