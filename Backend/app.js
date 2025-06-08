const express = require('express');
const app = express();
const connect = require('./db/mongodb');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cookieParser = require('cookie-parser');
const profileRoutes = require('./routes/profileRoutes/userProfile');
require('dotenv').config();
const port = process.env.PORT;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // allow only your frontend dev origin
    credentials: true // optional: if you use cookies or sessions
  }));
// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// Import routes
app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/profile', profileRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});