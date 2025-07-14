const User = require("../model/userSchema");


const userAuth = async (req, res, next) => {
    if (req.session.user) {
        try {
            const user = await User.findById(req.session.user);
            if (user && !user.isBlocked) {
                next();
            } else {
                res.redirect("/login");
            }
        } catch (error) {
            console.log("Error in user auth middleware");
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.redirect("/login");
    }
};

const adminAuth = (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        res.redirect("/admin/login");
    }
};



// const userAuth = async (req, res, next) => {
//   try {
//     if (req.session.user) {
//       const user = await userModel.findById(req.session.user);
//       if (!user) {
//         req.session.user = null;
//         return res.redirect('/login');
//       }
//       if (user.isBlocked) {
//         req.session.user = null;
//         return res.redirect('/login?error=user-blocked');
//       }
//       req.user = user; 
//       next();
//     } else {
//       res.redirect('/login');
//     }
//   } catch (error) {
//     console.error('Error in userAuth middleware:', error);
//     res.redirect('/pageNotFound');
//   }
// };



   


module.exports = {
    userAuth,
    adminAuth,
   
};