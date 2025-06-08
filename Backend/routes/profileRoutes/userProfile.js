const express = require('express');
const router = express.Router();
const Post = require('../../models/msg');  // Import Post model
const User = require('../../models/user'); // Import User model
const verify = require('../../middlewares/jwtVerify');
const mongoose = require('mongoose');  // Import mongoose

// Route to create a post
router.post('/create-post', verify, async (req, res) => {
  const { content, userId: username } = req.body;  // Rename for clarity

  try {
      const user = await User.findOne({ username });

      if (!user) {
          return res.status(404).json({error: "User not found"});
      }

      const newPost = new Post({
          sender: user.username,  
          content,
      });

      await newPost.save();
      res.json({ success: true });  
  } catch (error) {
      console.error('Error creating post:', error);
      res.json({ error: 'Error saving post, try again later...' });
  }
});

router.post("/delete-post", async (req, res) => {
  try {
      const { postId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
          return res.status(400).json({error: "Invalid ID format"});
      }

      const deletedPost = await Post.findByIdAndDelete(postId); // Use "Post" (capital P)

      if (!deletedPost) {
          return res.status(404).json({error:"Post not found"});
      }

      res.json({ success: true }); // Redirect after deletion
  } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({error: "Internal Server Error"});
  }
});
router.post("/like-post", verify, async (req, res) => {
  try {
      const { postId } = req.body;
      const username = req.user.username; // Get the username from the logged-in user

      const post = await Post.findById(postId);

      if (!post) {
          return res.status(404).json({ error: "Post not found" });
      }

      const userLiked = post.likedBy.includes(username);

      if (userLiked) {
          // User already liked → remove like
          post.likes -= 1;
          post.likedBy = post.likedBy.filter(user => user !== username);
      } else {
          // User has not liked → add like
          post.likes += 1;
          post.likedBy.push(username);
      }

      await post.save();
      res.json({ success: true, likes: post.likes, liked: !userLiked });

  } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
