const User = require('../model/userSchema')
exports.isUser = (req, res, next) => {
    if (req.session.email) {
        next();
    } else {
        res.redirect("/login");
    }
};

exports.User = (req, res, next) => {
    
    if (req.session.email) {
        res.redirect("/");
    } else {
        next();
    }
};


exports.toLogin=(req,res,next)=>{
    if(req.session.email){
         next()
    }else{
        res.redirect('/login')
    }
}

exports.isAdmin=(req,res,next)=>{
    if(req.session.adminEmail){
        next()
    }else{
        res.redirect('/admin/adminLogin')
    }
}

exports.admin=(req,res,next)=>{
    console.log(req.session.adminEmail,'dfdsfdf')
     if(req.session.adminEmail){
        res.redirect('/admin/')
     }else{
        next()
     }
}

exports.adminLogin=(req,res,next)=>{
    if(req.session.adminEmail){
        next()
    }else{
        res.redirect('/admin/adminLogin')
    }
}

exports.isBlock = async(req,res,next)=>{
   const user = await User.findOne({_id:req.session.userId})
   if(user?.isBlocked==true){
    req.session.name=null,
    req.session.email=null,
    req.session.userId=null
    res.render('login',{message:"user is blocked by admin"})
   }else{
    next()
   }
}