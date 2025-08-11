const Admin = require ("../../model/userSchema");
const mongoose = require ("mongoose");
const bcrypt = require ('bcrypt');
const User = require("../../model/userSchema")
const Offer =require("../../model/offer")

const Order =require("../../model/orderSchema")


const loadLogin =async(req,res)=>{
    try{
        console.log(req.session.admin,'dfsdfl')
    if(req.session.admin){
        return res.redirect('/admin/')
    }
    res.render("admin/admin-login",{message:null})
}
catch(error){
    console.log(error)
}
}



const adminLogin =async (req,res)=>{
    try {
        // console.log(req.body);
        console.log('1')
        const {email,password}=req.body;
        console.log('2')
        const adminMatch = await User.findOne({email,isAdmin:true});
        console.log(adminMatch);
        if(!adminMatch){
            return res.status(404).json({message:'Admin not found'})
        }
        console.log('daaaa')
        const isPasswordVaild = await bcrypt.compare(password, adminMatch.password);
        console.log(isPasswordVaild,'valid')
        if (!isPasswordVaild){
            return res.status(401).json({message:"Password does not match"})
        }
        console.log(adminMatch,'dflsdfjdslfjsdofjsldjf')
        req.session.name = adminMatch.name;
        req.session.admin=adminMatch._id;
        req.session.adminEmail=adminMatch.email;
        console.log("heyyy");
        
        return res.status(200).json({message:"AdminLogin successfully"})
        
    } catch (error) {
        console.log(error);
          return res.status(500).json({ message: 'Something went wrong' }); 
    }
}


const error = async (req, res) => {
    try {
        res.render('adminError');
    } catch (err) {
        console.error('Error rendering error page:', err.message, err.stack);
    }
};

 const logout = async (req,res)=>{
    try {
        console.log("heyy")
       req.session.destroy(err=>{
        if(err){
            console.log("Error destroying session",err);
            return res.redirect('/pageerror')
        }
        res.redirect('/admin/adminLogin')
       }) 
       req.session.name = null
       req.session.email = null
       req.session.admin= null
    } catch (error) {
        console.log("unexpected errror during logout",error);
        
    }
 }

module.exports = {
    loadLogin,
    adminLogin,
   logout,
   error,
   
    
   
}