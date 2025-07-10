const User = require("../../model/userSchema");
const Order =require("../../model/orderSchema");

const loadOrder = async(req,res)=>{
    try {
        res.render("myOrde")
    } catch (error) {
        
    }
}

module.exports={loadOrder};