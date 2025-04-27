const express = require('express');
require('dotenv').config();
const router = express.Router();
const user = require('../models/user');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const verify = require('../middlewares/jwtVerify');  // Middleware import
const profileRoutes = require('./profileRoutes/userProfile');
const post = require('../models/msg');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// // Set up multer for file storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public/uploads/proPic'); // Specify the directory to save uploaded files
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
//     }
// });

// const upload = multer({ storage: storage });

router.get('/', function (req, res) {
    res.redirect('/dashboard');
})
// User login route
router.get('/login', (req, res) => {
    res.render('./user/login', { msg: '', username: '', formType: 'login' });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await user.findOne({ email });
        const validPassword = await bcrypt.compare(password, existingUser.password);
        if (existingUser && existingUser.password === validPassword) {
            const payload = {
                name: existingUser.name, 
                username: existingUser.username,
                email: existingUser.email,
            };

            // Correct expiresIn value for 3 months (90 days)
            const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '90d' });

            res.cookie('authToken', token, { 
                httpOnly: true, 
                secure: true,  // Ensures the cookie is only sent over HTTPS
                sameSite: 'Strict', 
                maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days in milliseconds
            });
            return res.redirect('/dashboard');
        } else {
            res.render('./user/login', { msg: 'Incorrect credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Server error');
    }
});

router.get('/logout', function(req, res) {
    res.clearCookie('authToken');
    res.redirect('/');
});

// User registration route
router.post('/register', async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        const existingUser = await user.findOne({ email });

        if (existingUser) {
            return res.render('./user/login', { msg: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new user({ name, email, username, password: hashedPassword });
        await newUser.save();

        const payload = { name, username, email };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '90d' });

        res.cookie('authToken', token, { 
            httpOnly: true, 
            secure: true,  // Ensures the cookie is only sent over HTTPS
            sameSite: 'Strict', 
            maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days in milliseconds
        });
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).send('Server error');
    }
});

// Protected dashboard route
router.get('/dashboard', verify, async (req, res) => {
    try {
        const messages = await post.find({});
        const users = await user.find({}); // Fetch all users to map their profile pictures

        // Create a map of usernames to profile pictures
        const userMap = {};
        users.forEach(u => {
            userMap[u.username] = u.profilePic; // Map username to profile picture URL
        });

        res.render('./user/dashboard', { posts: messages, userMap }); // Pass userMap to the view
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).send('Server error');
    }
});


router.get('/profile', verify, async (req, res) => {
    const token = req.cookies.authToken;
    const userdata = jwt.verify(token, SECRET_KEY);
    // const username = userdata.username;
    // console.log("User Data:", userdata);
// console.log("Searching for posts by username:", userdata.username);
const existingUserPosts = await post.find({ sender: userdata.username });
// console.log("Found Posts:", existingUserPosts);

    // console.log(existingUser)
// const allPosts = await post.find({});
// console.log("All Posts in DB:", allPosts);

    res.render('./user/profile', { user: req.user, posts: existingUserPosts });
    
});

// // Route to upload profile picture
// router.post('/upload-profile-pic', verify, upload.single('profilePic'), async (req, res) => {
//     try {
//         const token = req.cookies.authToken;
//         const userdata = jwt.verify(token, SECRET_KEY);
//         const userId = userdata.username; // Assuming username is unique

//         // Update user profile picture URL
//         await user.findOneAndUpdate(
//             { username: userId },
//             { profilePic: req.file.path } // Save the file path in the database
//         );

//         res.redirect('/profile'); // Redirect to profile page
//     } catch (error) {
//         console.error('Error uploading profile picture:', error);
//         res.status(500).send('Error uploading profile picture');
//     }
// });

module.exports = router;
