const express = require('express');
const router = express.Router();
const admin = require('../models/admin');
const verify = require('../middlewares/jwtVerify');
const adminVerify = require('../middlewares/adminJwt');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const realuniPass = process.env.UNI_PASS;
const SECRET_KEY = process.env.SECRET_KEY || 'your_default_secret';

// Helper function to generate token and set cookie
function generateTokenAndSetCookie(res, payload) {
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '90d' });

    res.cookie('admintoken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });
}

// Routes
router.get('/adminGiga', (req, res) => {
    res.redirect('/home');
});

router.get('/home', adminVerify, (req, res) => {
    res.send('admin page');
});

router.get('/login', (req, res) => {
    res.render("admin/login", { msg: "Invalid credentials", formType: "login" }); // For login errors
res.render("admin/login", { msg: "Registration failed", formType: "register" }); // For register errors
});

// Admin Registration
router.post('/register', async (req, res) => {
    try {
        const { name, username, password, unipass } = req.body;
        const existingUser = await admin.findOne({ username });

        if (existingUser) {
            return res.render('./admin/login', { msg: 'User already exists' });
        }

        if (unipass !== realuniPass) {
            return res.render('./admin/login', { msg: 'Invalid credentials' });
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
            return res.render('./admin/login', { msg: 'Incorrect credentials' });
        }

        const validPassword = await bcrypt.compare(password, existingUser.password);

        if (validPassword) {
            const payload = { name: existingUser.name, username: existingUser.username };
            generateTokenAndSetCookie(res, payload);
            return res.redirect('/admin/home');
        } else {
            return res.render('./admin/login', { msg: 'Incorrect credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send('Server error during login');
    }
});

module.exports = router;
