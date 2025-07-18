const express = require('express');
const app = express();
const env = require("dotenv").config();
const session = require("express-session");
const path = require("path");
const mongoose = require('mongoose');
const passport = require("./config/passport");
const nocache = require('nocache');




const db = require('./config/db');
const userRouter = require('./routes/userRouter'); 
const adminRouter = require('./routes/adminRouter');
const setUserLocals = require('./middlewares/setUserlocals');

app.use(nocache());

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


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/Uploads', express.static(path.join(__dirname, 'Uploads'))); 
app.use(express.static(path.join(__dirname, 'public')));


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


app.use(passport.initialize());
app.use(passport.session());


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(setUserLocals);

app.use('/', userRouter);
app.use('/admin', adminRouter);

app.listen(1906, () => {
  console.log("Server is running on port 1906");
});

module.exports = app;