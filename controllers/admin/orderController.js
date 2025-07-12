const mongoose = require("mongoose");
const Category = require("../../model/categorySchema");
const Product = require("../../model/productSchema");
const Order=require("../../model/orderSchema")


const loadOrder=  async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('product.productId')
      .sort({ Date: -1 });
console.log("hoiii");

    res.render('admin/oderDetails', { orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Internal Server Error");
  }
};


const changeStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).send("Invalid request: Missing orderId or status");
    }

    await Order.findByIdAndUpdate(orderId, { status });

    
    res.redirect('/admin/orderDetails');
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send("Internal Server Error");
  }
};
const approveOrder = async(req,res)=>{
    try {
        console.log(req.body);
        const updated = await Order.updateOne({_id:req.body.orderId},{$set:{status:'return'}})
        res.redirect('/admin/orderDetails')

        
    } catch (error) {
        
    }
}
module.exports={loadOrder,changeStatus,approveOrder}