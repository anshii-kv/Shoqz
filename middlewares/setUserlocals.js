const User = require('../model/userSchema'); 

const setUserLocals = async (req, res, next) => {
  try {

    if (req.session.email) {
      const user = await User.findOne({ email: req.session.email });

      res.locals.isLoggedIn = true;
      res.locals.user = user; 
    } else {
      res.locals.isLoggedIn = false;
      res.locals.user = null;
    }

    next();
  } catch (error) {
    console.error('Error in setUserLocals middleware:', error);
    next();
  }
};

module.exports = setUserLocals;
