const User = require('../model/userSchema');

const userAuth = (req, res, next) => {
    if (req.session.user) {
        User.findById(req.session.user)
            .then(data => {
                if (data && !data.isBlocked) {
                    req.user = data;
                    next();
                } else {
                    req.session.user = null;
                    req.session.save((err) => {
                        if (err) console.log('Session save error:', err);
                        res.redirect('/user-login');
                    });
                }
            }).catch(error => {
                console.log('Error in user auth middleware', error);
                res.status(500).send("internal server error");
            });
    } else {
        res.redirect('/user-login');
    }
};

const adminAuth = async (req, res, next) => {
    try {
        if (!req.session.name || !req.session.admin || !req.session.adminEmail) {
            return res.redirect('/admin/adminLogin');
        }

        const admin = await User.findOne({
            _id: req.session.admin,
            isAdmin: true
        }).select('email isAdmin');

        if (!admin) {
            req.session.admin = null;
            return res.redirect('/admin/adminLogin');
        }

        req.session.admin = {
            _id: admin._id,
            email: admin.email,
            isAdmin: admin.isAdmin
        };

        req.session.save((err) => {
            if (err) {
                console.log('Session save error in adminAuth:', err);
                return res.redirect('/admin/admin-login');
            }
            next();
        });

    } catch (error) {
        console.log('Unexpected error in adminAuth:', error);
        req.session.admin = null;
        return res.redirect('/admin/admin-login');
    }
};





module.exports = {
    userAuth,
    adminAuth,
   
};

// / const User = require("../model/userSchema");


// const userAuth = async (req, res, next) => {
//     if (req.session.user) {
//         try {
//             const user = await User.findById(req.session.user);
//             if (user && !user.isBlocked) {
//                 next();
//             } else {
//                 res.redirect("/login");
//             }
//         } catch (error) {
//             console.log("Error in user auth middleware");
//             res.status(500).send("Internal Server Error");
//         }
//     } else {
//         res.redirect("/login");
//     }
// };

// const adminAuth = (req, res, next) => {
//     if (req.session.admin) {
//         next();
//     } else {
//         res.redirect("/admin/login");
//     }
// };



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




// const adminAuth = (req, res, next) => {
//   if (req.session.admin) {
//       return next(); 
//   } else {
//       return res.redirect('/admin/login'); 
//   }
// };
// // Optional: Middleware to check session expiration for both user and admin
// const checkSessionExpiry = (req, res, next) => {
//     try {
//         if (req.session && req.session.cookie) {
//             const now = new Date();
//             const sessionStart = new Date(req.session.cookie._expires || req.session.cookie.expires);
            
//             if (now > sessionStart) {
//                 // Session expired
//                 req.session.destroy((err) => {
//                     if (err) {
//                         console.error("Error destroying expired session:", err);
//                     }
//                 });
                
//                 // Determine redirect based on URL
//                 if (req.path.startsWith('/admin')) {
//                     return res.redirect('/admin/adminLogin');
//                 } else {
//                     return res.redirect('/login');
//                 }
//             }
//         }
//         next();
//     } catch (error) {
//         console.error("Error in session expiry check:", error);
//         next(); // Continue even if there's an error
//     }
// };

// // Enhanced session configuration helper
// const configureSession = (sessionStore) => {
//     return {
//         secret: process.env.SESSION_SECRET || 'your-secret-key-here',
//         resave: false,
//         saveUninitialized: false,
//         store: sessionStore, // Pass your session store here
//         cookie: {
//             secure: process.env.NODE_ENV === 'production', // HTTPS in production
//             httpOnly: true, // Prevent XSS attacks
//             maxAge: 24 * 60 * 60 * 1000, // Default 24 hours
//             sameSite: 'strict' // CSRF protection
//         },
//         rolling: true // Reset expiration on each request
//     };
// };

module.exports = {
    userAuth,
    adminAuth,
   
};