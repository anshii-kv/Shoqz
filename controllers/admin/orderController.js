const mongoose = require("mongoose");
const Category = require("../../model/categorySchema");
const Product = require("../../model/productSchema");
const Order=require("../../model/orderSchema")
const User = require('../../model/userSchema');

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
const approveOrder = async (req, res) => {
  try {
    const userId = req.session.userId;
console.log(userId,'anshiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii');
console.log,(req.body.orderId,'chakiiiiiiiiiiiiiiiiiiiiiiiiiiiiii');

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
module.exports={loadOrder,changeStatus,approveOrder}