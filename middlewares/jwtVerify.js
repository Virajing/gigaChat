// middlewares/jwtVerify.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;  // Same key for signing and verifying tokens

const protectRoute = (req, res, next) => {
    try {
        const token = req.cookies.authToken; // Access token from cookie

        if (!token) {
            return res.status(401).redirect('/login');
        }

        const verifiedUser = jwt.verify(token, SECRET_KEY);  // Verify JWT
        req.user = verifiedUser;  // Attach user info to req.user if needed
        next();  // Pass control to the next middleware/route
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        res.status(403).redirect('/login')}
};

module.exports = protectRoute;
