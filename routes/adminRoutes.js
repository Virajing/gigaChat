const express = require('express');
const router = express.Router();
const admin = require('../models/admin');
const adminVerify = require('../middlewares/adminJwt');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Post = require('../models/msg');
const { getPostsByTime } = require('../middlewares/postControll');
const User = require('../models/user');
require('dotenv').config();


const realuniPass = process.env.UNI_PASS;
const SECRET_KEY = process.env.ADMIN_SECRET_KEY;

// Helper function to generate token and set cookie
function generateTokenAndSetCookie(res, payload) {
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' });

    res.cookie('admintoken', token, {
                    httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', // only secure in production
                    sameSite: 'Strict', 
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });
}
// Helper function to get the month names
function getMonthName(monthNumber) {
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return monthNames[monthNumber - 1];  // monthNumber is 1-based (1-12)
}

// Function to get post counts grouped by month or year
// Helper function to get post counts grouped by month or year
// async function getPostsByTime(type, num) {
//     if (!['month', 'year'].includes(type)) throw new Error('Invalid type');
    
//     const now = new Date();
//     let startDate;
    
//     if (type === 'month') {
//       startDate = new Date(now.getFullYear(), now.getMonth() - (num - 1), 1);
//     } else {
//       startDate = new Date(now.getFullYear() - (num - 1), 0, 1);
//     }
    
//     const groupBy = type === 'month'
//       ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
//       : { year: { $year: '$createdAt' } };
    
//     const results = await Post.aggregate([
//       { $match: { createdAt: { $gte: startDate } } },
//       { $group: {
//         _id: groupBy,
//         count: { $sum: 1 }
//       }},
//       { $sort: { '_id.year': 1, '_id.month': 1 } }
//     ]);
    
//     // Format the results into a usable format for the chart
//     const data = results.map(item => {
//       if (type === 'month') {
//         const monthName = new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' });
//         return { label: `${monthName} ${item._id.year}`, count: item.count };
//       } else {
//         return { label: `${item._id.year}`, count: item.count };
//       }
//     });
    
//     return data;
//   }
  router.get('/home', adminVerify, async (req, res) => {
    const period = req.query.period || 'year';
    const num = parseInt(req.query.num) || 12;
  
    try {
      const postData = await getPostsByTime(period, num);
      const labels = postData.map(item => item.label);
      const data = postData.map(item => item.count);
  
      res.render('admin/dashboard', { labels, data, period, num });
    } catch (err) {
      console.error('Error fetching chart data:', err);
      res.render('admin/dashboard', { labels: [], data: [], period, num });
    }
  });
  
  // POST Chart Route (for future dynamic loading if needed)
  router.post('/chart', adminVerify, async (req, res) => {
    const { period, num } = req.body;
  
    try {
      if (!period || !['month', 'year'].includes(period) || !num || isNaN(num)) {
        return res.status(400).send("Invalid period or number.");
      }
  
      const postData = await getPostsByTime(period, parseInt(num));
      const labels = postData.map(item => item.label);
      const data = postData.map(item => item.count);
  
      res.render('admin/dashboard', { labels, data, period, num });
    } catch (err) {
      console.error("Error fetching post data:", err);
      res.status(500).send("Error fetching post data.");
    }
  });
// Render Login/Register Page with messages
router.get('/login', (req, res) => {
  const msg = req.query.msg || null;  // Grab it from query
  res.render("./admin/login", { msg }); // Pass it to EJS
    console.log("Incoming cookies:", req.cookies);
console.log("admintoken:", req.cookies.admintoken);

});


// Admin Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await admin.findOne({ username });

        if (!existingUser) {
            return res.redirect('/admin/login?msg=incorrectDetails');
        }

        const validPassword = await bcrypt.compare(password, existingUser.password);

        if (validPassword) {
            const payload = { name: existingUser.name, username: existingUser.username };
            generateTokenAndSetCookie(res, payload);
            return res.redirect('/admin/home');
        } else {
            return res.redirect('/admin/login?msg=incorrectDetails');
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send('Server error during login');
    }
});

// Admin Logout
router.get('/logout', (req, res) => {
    res.clearCookie('admintoken');
    res.redirect('/admin/login');
});
router.get('/delete-users', adminVerify, (req, res) => {
  // Render the delete-users.ejs page
  res.render('./admin/delete-users'); 
});
router.get('/search-users', adminVerify, async (req, res) => {
  const query = req.query.query; // Get the search query from the request

  if (!query) {
    return res.json([]); // If no query, return an empty array
  }

  try {
    // Search for users that match the query (case-insensitive)
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);  // Limit results to 10

    res.json(users);
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).send('Error searching users');
  }
});

// Delete user route
router.delete('/delete-user/:id', adminVerify, async (req, res) => {
    const userId = req.params.id;

    try {
        // Find the user by ID and delete them
        const user = await User.findByIdAndDelete(userId);

        if (user) {
            // Clear the user's cookies if they are logged in
            res.clearCookie('authToken'); // Clear the auth token cookie
            res.status(200).send('User deleted successfully');
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Error deleting user');
    }
});
// GET: Render Create Admin Form
router.get('/create-admin', adminVerify, (req, res) => {
  res.render('./admin/register', { msg: null }); // Optionally pass a message
});
// Admin Registration
router.post('/create-admin', async (req, res) => {
  try {
      const { name, username, password, uni_pass } = req.body;
      const existingUser = await admin.findOne({ username });

      if (existingUser) {
          return res.redirect('/admin/create-admin?msg=User+already+exists&formType=register');
      }

      if (uni_pass !== realuniPass) {
          return res.redirect('/admin/create-admin?msg=Invalid+credentials&formType=register');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new admin({ name, username, password: hashedPassword });
      await newUser.save();


      return res.redirect('/admin/home');
  } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).send('Server error during registration');
  }
});


module.exports = router;
