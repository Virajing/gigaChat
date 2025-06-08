// middlewares/redirectIfLoggedIn.js
const jwt = require('jsonwebtoken');

const redirectIfLoggedIn = (req, res, next) => {
  const token = req.cookies.token; // Assuming you're using cookies

  if (!token) return next(); // No token? Let them access login/signup

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Already logged in
    return res.status(302).json({ redirect: '/dashboard' });
  } catch (err) {
    return next(); // Invalid token? Just let them proceed
  }
};

module.exports = redirectIfLoggedIn;
