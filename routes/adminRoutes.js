const express = require('express');
const router = express.Router();
const admin = require('../models/admin');
const adminVerify = require('../middlewares/adminJwt');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

// Redirect to home
router.get('/adminGiga', (req, res) => {
    res.redirect('/admin/home');
});

// Admin Dashboard (protected)
router.get('/home', adminVerify, async (req, res) => {
    // Example static data
    const labels = ['Jan', 'Feb', 'Mar', 'Apr'];
    const data = [12, 19, 3, 5]; // fetch from DB if needed
  
    res.render('./admin/dashboard', { labels, data });
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

module.exports = router;
