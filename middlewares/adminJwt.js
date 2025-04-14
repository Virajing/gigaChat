const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.ADMIN_SECRET_KEY; 
module.exports = (req, res, next) => {
  const token = req.cookies.admintoken;

  if (!token) {
    return res.status(401).redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Decoded Token:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(403).send('Invalid Token');
  }
};
