// middlewares/jwtVerify.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.SECRET_KEY;  // Same key for signing and verifying tokens

// In verify middleware:
const verify = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    // Instead of rendering HTML, send a JSON error
    console.log('frontend req recieved');
    return res.status(401).json({ error: 'Unauthorized' });
    
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });

    req.user = decoded;
    next();
  });
};


module.exports = verify;
