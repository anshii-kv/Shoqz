const mongoose = require("mongoose");
const Category = require("../../model/categorySchema");
const Product = require("../../model/productSchema");
const Order=require("../../model/orderSchema")


const loadOrder= async(req,res)=>{
    try {
        res.render('admin/oderDetails')
    } catch (error) {
        
    }
}
module.exports={loadOrder}