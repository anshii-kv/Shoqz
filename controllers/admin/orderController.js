const mongoose = require("mongoose");
const Category = require("../../model/categorySchema");
const Product = require("../../model/productSchema");
const Order=require("../../model/orderSchema")
const User = require('../../model/userSchema');

const loadOrder = async (req, res) => {
  try {
    console.log(req.query,'df')
    const page = parseInt(req.query.page) || 1; 
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    

    const totalOrders = await Order.countDocuments();

    const totalPages = Math.ceil(totalOrders / limit);
    console.log(limit,skip,'skip')
    const orders = await Order.find()
      .populate('product.productId')
      .sort({ Date: -1 })
      .skip(skip)
      .limit(limit);
const maxButtons = 5;
let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
let endPage = Math.min(totalPages, startPage + maxButtons - 1);


if (endPage - startPage + 1 < maxButtons) {
  startPage = Math.max(1, endPage - maxButtons + 1);
}
    res.render('admin/oderDetails', {
      orders,
      currentPage: page,
      totalPages,
      totalOrders,
      startPage,
  endPage
    });
  } catch (error) {
    console.error("Error loading orders:", error);
    res.status(500).send("Internal Server Error");
  }
};



const changeStatus = async (req, res) => {
  try {
    console.log(req.body,"body");
    
    const { orderId, status } = req.body;
    console.log(status,orderId,"status");
    if (!orderId || !status) {
      return res.status(400).send("Invalid request: Missing orderId or status");
    }
    await Order.findByIdAndUpdate({_id:orderId}, {$set:{status} });

   return res.status(200).json({message:"status has chnaged succesfully"})
     res.redirect('/admin/orderDetails');
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send("Internal Server Error");
  }
};
const approveOrder = async (req, res) => {
  try {
    const userId = req.session.userId;


    const order = await Order.findById(req.body.orderId);

    if (!order) return res.status(404).send("Order not found");

    const amount = order.subtotal;
    const reason = `Return amount of order ${order._id}`;
    const date = new Date();

    await Order.updateOne({ _id: req.body.orderId }, { $set: { status: 'return' } });

    await User.updateOne(
      { _id: userId },
      {
        $inc: { wallet: amount },
        $push: {
          walletHistory: {
            date: date,
            amount: amount,
            description: reason
          }
        }
      }
    );

    res.redirect('/admin/orderDetails');
  } catch (error) {
    console.error("Error approving order return:", error);
    res.status(500).send("Internal Server Error");
  }
};

const loadviewOrder=async(req,res)=>{
  try {
   const orderId = req.params.orderId
   const order = await Order.findById({_id:orderId})
  
   
    
    res.render('admin/viewOrder',{order})
  } catch (error) {
    
  }
}
module.exports={loadOrder,changeStatus,approveOrder,loadviewOrder}