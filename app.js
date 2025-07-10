const express = require('express');
const app = express();
const env = require("dotenv").config();
const session = require("express-session");
const path = require("path");
const mongoose = require('mongoose');
const passport = require("./config/passport");
const nocache = require('nocache');



// DB and Routers
const db = require('./config/db');
const userRouter = require('./routes/userRouter'); 
const adminRouter = require('./routes/adminRouter');
const setUserLocals = require('./middlewares/setUserlocals');

// Disable cache
app.use(nocache());

// Connect MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/Footwear');
    console.log("MongoDB connected");
  } catch (error) {
    console.log("Connection error:", error.message);
    process.exit(1);
  }
};
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // ✅ Serve image folder
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 72 * 60 * 60 * 1000
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Custom Middleware
app.use(setUserLocals);

// Routes
app.use('/', userRouter);
app.use('/admin', adminRouter);

// Start server
app.listen(1906, () => {
  console.log("Server is running on port 1906");
});

module.exports = app;