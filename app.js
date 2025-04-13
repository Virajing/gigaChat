const express = require('express');
const app = express();
const connect = require('./db/mongodb');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cookieParser = require('cookie-parser');
const profileRoutes = require('./routes/profileRoutes/userProfile');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Import routes
app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/profile', profileRoutes);

module.exports = app;