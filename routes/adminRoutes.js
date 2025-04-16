const express = require('express');
const router = express.Router();
const admin = require('../models/admin');
const adminVerify = require('../middlewares/adminJwt');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Post = require('../models/msg');
const { getPostsByTime } = require('../middlewares/postControll');

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
    const { msg = "", formType = "login" } = req.query;
    res.render("admin/login", { msg, formType });
    console.log("Incoming cookies:", req.cookies);
console.log("admintoken:", req.cookies.admintoken);

});

// Admin Registration
router.post('/register', async (req, res) => {
    try {
        const { name, username, password, unipass } = req.body;
        const existingUser = await admin.findOne({ username });

        if (existingUser) {
            return res.redirect('/admin/login?msg=User+already+exists&formType=register');
        }

        if (unipass !== realuniPass) {
            return res.redirect('/admin/login?msg=Invalid+credentials&formType=register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new admin({ name, username, password: hashedPassword });
        await newUser.save();

        const payload = { name, username };
        generateTokenAndSetCookie(res, payload);

        return res.redirect('/admin/home');
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).send('Server error during registration');
    }
});

// Admin Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await admin.findOne({ username });

        if (!existingUser) {
            return res.redirect('/admin/login?msg=Incorrect+credentials&formType=login');
        }

        const validPassword = await bcrypt.compare(password, existingUser.password);

        if (validPassword) {
            const payload = { name: existingUser.name, username: existingUser.username };
            generateTokenAndSetCookie(res, payload);
            return res.redirect('/admin/home');
        } else {
            return res.redirect('/admin/login?msg=Incorrect+credentials&formType=login');
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

router.get('/delete-user', adminVerify, (req, res) => {
  res.render('./admin/delete-users');
})


module.exports = router;
