const User = require("../model/userSchema");

const userAuth = (req,res,next)=>{
    if(req.session.user){
        User.findById(req.session.user)
        .then(data=>{
            if(data&&!data.isBlocked){
                next()
            }else{
                res.redirect("/login")
            }
        }).catch(error=>{
            console.log("Error in userAuth middleware");
            res.status(500).send("Internal Server Error")
        })
    }else{
        res.redirect("/login")
    }
}
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

const adminAuth = (req, res, next) => {
    User.findOne({ isAdmin: true })
        .then(data => {
            if (data) {
                next(); // proceed if admin is found
            } else {
                res.redirect("/admin/login"); // redirect if not found
            }
        })
        .catch(error => {
            console.log("Error in adminAuth:", error);
            res.redirect("/admin/adminLogin"); // optionally redirect on DB error
        });
};








   


module.exports = {
    userAuth,
    adminAuth,
   
};