const User = require("../../model/userSchema");
const Order = require("../../model/orderSchema");
const Product = require("../../model/productSchema");
const Category = require("../../model/categorySchema");
const Cart = require('../../model/cartSchema')

const loadOrder = async (req, res) => {
    try {
        res.render("myOrde");
    } catch (error) {}
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





module.exports = { loadOrder, placeOrder };
