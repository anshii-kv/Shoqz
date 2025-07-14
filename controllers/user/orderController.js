const User = require("../../model/userSchema");
const Order = require("../../model/orderSchema");
const Product = require("../../model/productSchema");
const Category = require("../../model/categorySchema");
const Cart = require('../../model/cartSchema')

const orderlist = async (req, res) => {
  try {
    const user = req.session.userId;
    const userdata = await User.findOne({ _id: user });
console.log(userdata);

    // const orders = await Order.find({ user: user }).sort({ Date: -1 });
const orders = await Order.find({ user })
  .populate('product.productId')
  .populate('product.category')
  .sort({ Date: -1 });

    res.render("myOrde", { orders, userdata, user });
  } catch (error) {
    console.log(error.message);
  }
};

const placeOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const userId = req.session.userId;
    const productList = [];

    for (let item of orderData.products) {
      const product = await Product.findOne({ _id: item.productId });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      let sizeFound = false;

      for (let size of product.sizes) {
        if (item.size === size.size) {
          sizeFound = true;

          if (item.quantity > size.quantity) {
            return res.status(400).json({ message: "Stock unavailable for size " + item.size });
          }

         
          size.quantity -= item.quantity;
        }
      }

      if (!sizeFound) {
        return res.status(400).json({ message: `Size ${item.size} not found for product` });
      }

      await product.save();

    
      productList.push({
        productId: item.productId,
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
        category: product.category,
      });
    }

   
    const newOrder = new Order({
      user: userId,
      deliveryDetails: {
        fname: orderData.address.fname,
        sname: orderData.address.sname,
        mobile: orderData.address.mobile,
        email: orderData.address.email,
        address: orderData.address.address,
        city: orderData.address.city,
        pin: orderData.address.pin,
      },
      paymentMethod: orderData.paymentMethod,
      product: productList,
      subtotal: orderData.subtotal,
      Date: new Date(),
      exprdate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 
      status: "Pending",
    });

  
    await newOrder.save();

    
    await Cart.deleteOne({ userId: userId });

   
    res.status(200).json({ message: "Order Successful",orderId:newOrder._id });

  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).send("Internal Server Error");
  }
};


const cancelOrder = async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderId = req.body.orderId;
    const orders = await Order.findById({ _id: orderId })
    
    const WalletAmount = orders.subtotal
    const WalletData = {
      amount:WalletAmount,
      date:Date.now(),
      discription:"Refund for order Cancelling order "
    }

    const data = await Order.findOneAndUpdate(
      { _id: orderId, user: userId },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (data) {
      await User.findOneAndUpdate({_id:userId},
        {$inc:{wallet:WalletAmount},$push:{walletHistory:WalletData}})

      res.json({ success: true });
    } else {
      res.json({
        success: false,
        message: "Order not found or not owned by the user",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


const orderdetails = async(req,res)=>{
  try {
    console.log(req.params.id,'idsd')
    let id = req.params.id
    console.log(id,'dfls')
    
   
    const order = await Order.findOne({_id:id})
      .populate({
        path: "product.productId",
        populate: {
          path: "category",
          model: "Category"
        }
      })
      .populate("user");
    
    if (!order) {
      return res.status(404).render('error', { message: 'Order not found' });
    }
    
    console.log(order,'ammu');
    
    res.render('orderDetail',{order})
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).render('error', { message: 'Internal server error' });
  }
}
const returnOrder = async (req, res) => {
  try {
    console.log("hrlo");
    console.log(req.body);
    
    const userId = req.session.userId;

    const orderId = req.body.orderId;
console.log(orderId);

    const orders = await Order.findById({ _id: orderId });


    console.log("hiiii");
    

    if (Date.now() > orders.exprdate) {

      res.json({ datelimit: true });
    } else {
      await Order.findByIdAndUpdate(
        { _id: orderId },
        { $set: { status: "waiting for approval" } }
      );
       
      
      res.json({ return: true });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = { orderlist, placeOrder ,cancelOrder,orderdetails,returnOrder};
