const express = require('express');
const app = express();

        app.use((req, res, next) => {
          res.setHeader("Access-Control-Allow-Origin", "https://d881654c7b89.ngrok-free.app");
          next();
        });
    
const env = require("dotenv").config();
const session = require("express-session");
const path = require("path");
const mongoose = require('mongoose');
const passport = require("./config/passport");
const nocache = require('nocache');

const errorHandler = require("./middlewares/errorHandling");

const db = require('./config/db');
const userRouter = require('./routes/userRouter'); 
const adminRouter = require('./routes/adminRouter');
const setUserLocals = require('./middlewares/setUserlocals');

app.use(nocache());




app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/Uploads', express.static(path.join(__dirname, 'Uploads'))); 
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/productImages', express.static(path.join(__dirname, 'public/productImages')));

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
app.use(errorHandler)

app.use((req,res)=>{
  res.status(404).render('user/page-404',{
    message:"Oops the page you are looking is does not exists",
    statusCode:404
  })
})
app.listen(1906, () => {
  console.log("Server is running on port 1906");
});

module.exports = app;