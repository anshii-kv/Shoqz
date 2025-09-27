const User = require("../../model/userSchema");
const Order = require("../../model/orderSchema");
const Product = require("../../model/productSchema");
const Category = require("../../model/categorySchema");
const Cart = require("../../model/cartSchema");
const Razorpay = require('razorpay')
const Wallet = require("../../model/walletSchema")
const Coupon = require("../../model/couponSchema");
const CategoryOffer = require("../../model/categoryOffer");

async function generateDisplayOrderId() {
    const year = new Date().getFullYear();

    const lastOrder = await Order.findOne({ displayOrderId: { $regex: `^DORD-${year}` } }).sort({ Date: -1 });

    let orderNumber = 1;
    if (lastOrder && lastOrder.displayOrderId) {
        const lastNumber = parseInt(lastOrder.displayOrderId.split("-").pop());
        if (!isNaN(lastNumber)) {
            orderNumber = lastNumber + 1;
        }
    }

    return `DORD-${year}-${String(orderNumber).padStart(5, "0")}`;
}

const orderlist = async (req, res) => {
    try {
        const user = req.session.userId;
        const userdata = await User.findOne({ _id: user });
        console.log(userdata);

        const orders = await Order.find({ user }).populate("product.category").sort({ Date: -1 });
        res.render("myOrde", { orders, userdata, user });
    } catch (error) {
        console.log(error.message);
    }
};




// const placeOrder = async (req, res) => {
//   console.log('ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo');
//   console.log(req.body);
  
//   try {
//     // console.log("1111 Incoming order data:", req.body);
//     const { total, coupon } = req.body;
//     const userId = req.session.userId;
//     console.log("2222 User ID:", userId, " Total:", total, " CouponCode:",coupon  );

//     const productList = [];
//     let productImage = [];

//     for (let item of req.body.products) {
//       console.log("3333 Checking product:", item.productId);

//       const product = await Product.findOne({ _id: item.productId });
//       if (!product) {
//         console.log("3333.1 Product not found:", item.productId);
//         return res.status(404).json({ message: "Product not found" });
//       }
//       console.log("3333.2 Product found:", product.name);

//       // ✅ push images
//       if (Array.isArray(product.productImage)) {
//         productImage.push(...product.productImage);
//       } else if (typeof product.productImage === "string") {
//         productImage.push(product.productImage);
//       }
//       console.log("3333.3 Collected images:", productImage);

//       // ✅ check stock
//       let sizeFound = false;
//       for (let size of product.sizes) {
//         if (item.size === size.size) {
//           sizeFound = true;
//           console.log("3333.4 Size matched:", item.size, " Available qty:", size.quantity);
//           if (item.quantity > size.quantity) {
//             console.log("3333.5 Stock insufficient for size:", item.size);
//             return res.status(400).json({ message: "Stock unavailable for size " + item.size });
//           }
//           size.quantity -= item.quantity;
//           console.log("3333.6 Stock updated, remaining:", size.quantity);
//         }
//       }
//       if (!sizeFound) {
//         console.log("3333.7 Size not found for product:", item.size);
//         return res.status(400).json({ message: `Size ${item.size} not found for product` });
//       }
//       await product.save();
//       console.log("3333.8 Product saved after stock update");

//       productList.push({
//         productId: item.productId,
//         name: item.productName,
//         quantity: item.quantity,
//         price: item.price,
//         category: product.category,
//         description: product.description,
//         regularPrice: product.regularPrice,
//         salePrice: product.salePrice,
//         productImage: product.productImage,
//       });
//       console.log("3333.9 Product pushed to order list");
//     }

//     // ✅ Coupon discount logic
//     let couponDiscount = 0;
//     if (coupon) {
//       // console.log("4444 Checking coupon:", couponCode);
//       const existCoupon = await Coupon.findOne({ code: coupon.code.toUpperCase(), status: "active" });
//       console.log("4444.1 Coupon result:", existCoupon);

//       if (existCoupon && existCoupon.expireOn > new Date()) {
//         console.log("4444.2 Coupon is valid. Min:", existCoupon.minimumPurchase, " Max:", existCoupon.maximumPurchase);
//         couponDiscount=coupon.discount
//         // if (total >= coupon.minimumPurchase && total <= existCoupon.maximumPurchase) {
//         //   if (existCoupon.discountType === "percentage") {
//         //     couponDiscount = Math.floor((total * existCoupon.discountPercentage) / 100);
//         //   } else if (existCoupon.discountType === "fixed") {
//         //     couponDiscount = existCoupon.offerPrice;
//         //   }
//         //   console.log("4444.3 Coupon discount applied:", couponDiscount);
        
//         // }
//       // }
//         //  else {
//         //   console.log("4444.4 Total not in coupon range");
//         // }
//       } else {
//         console.log("4444.5 Coupon invalid or expired");
//       }
//     } else {
//       console.log("4444 No coupon provided");
//     }

//     // ✅ Delivery charge
//     const deliveryCharge = 60;
//     console.log("5555 Delivery charge:", deliveryCharge);

//     // ✅ Final price calculation
//     const finalPrice = total ;
//     console.log("6666 Final price:", finalPrice);

//     // ✅ Create order
//     const newOrder = new Order({
//       user: userId,
//       deliveryDetails: {
//         fname: req.body.address.fname,
//         sname: req.body.address.sname,
//         mobile: req.body.address.mobile,
//         email: req.body.address.email,
//         address: req.body.address.address,
//         city: req.body.address.city,
//         pin: req.body.address.pin,
//       },
//       paymentMethod: req.body.paymentMethod,
//       product: productList,
//       subtotal: total,
//       couponDiscount,
//       deliveryCharge,
//       finalPrice,
//       Date: new Date(),
//       exprdate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
//       couponDiscount:coupon.discount?coupon.discount:0,
//       status: "Pending",
//       productImage: productImage,
//     });
//     console.log("7777 New order object created");

//     // ✅ Generate display order id
//     const orderDisplay = await generateDisplayOrderId();
//     newOrder.displayOrderId = orderDisplay;
//     console.log("8888 Display order id generated:", orderDisplay);

//     await newOrder.save();
//     console.log("9999 Order saved successfully");

//     // ✅ Clear cart
//     await Cart.deleteOne({ userId });
//     console.log("1010 Cart cleared for user:", userId);

//     res.status(200).json({
//       message: "Order Successful",
//       orderId: newOrder._id,
//       discount: couponDiscount,
//       finalPrice,
//     });
//   } catch (error) {
//     console.error("Order placement error (xxxx):", error);
//     res.status(500).send("Internal Server Error");
//   }
// };

const placeOrder = async (req, res) => {
  try {
    const { total, coupon,paymentMethod } = req.body;
    const userId = req.session.userId;
const productList = [];
    let subtotal = 0;
    let totalOfferDiscount = 0;

    for (let item of req.body.products) {
      const product = await Product.findById(item.productId)
        .populate("productOffer")
        .populate({
          path: "category",
          populate: { path: "offer" }
        });

      if (!product) {
        return res.status(404).json({success:false, message: "Product not found" });
      }

      // ✅ stock check
      let sizeFound = false;
      for (let size of product.sizes) {
        if (item.size === size.size) {
          sizeFound = true;
          if (item.quantity > size.quantity) {
            return res.status(400).json({ success:false,message: `Stock unavailable for size ${item.size}` });
          }
          size.quantity -= item.quantity;
        }
      }
      if (!sizeFound) {
        return res.status(400).json({success:false, message: `Size ${item.size} not found for product` });
      }
      await product.save();

      // ✅ offers
      const productOfferValue = product.productOffer?.offer || 0;
      const categoryOfferValue = product.category?.offer?.offer || 0;
      const maxDiscount = Math.max(productOfferValue, categoryOfferValue);

      // ✅ price calculation
      const basePrice = product.salePrice || product.regularPrice || 0;
      const priceBeforeDiscount = basePrice * item.quantity;
      const discountAmount = (priceBeforeDiscount * maxDiscount) / 100;
      const finalLineAmount = priceBeforeDiscount - discountAmount;

      subtotal += priceBeforeDiscount;
      totalOfferDiscount += discountAmount;

      productList.push({
        productId: item.productId,
        name: product.productName,
        quantity: item.quantity,
        price: basePrice,
        category: product.category._id,
        description: product.description,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        finalamount: finalLineAmount, // ✅ line total after discount
        productOffer: productOfferValue,
        categoryoffer: categoryOfferValue,
        productImage: product.productImage,
      });
    }

    // ✅ coupon discount
    let couponDiscount = 0;
    if (coupon) {
      const existCoupon = await Coupon.findOne({
        code: coupon.code.toUpperCase(),
        status: "active"
      });

      if (existCoupon && existCoupon.expireOn > new Date()) {
        if (existCoupon.discountType === "percentage") {
          couponDiscount = Math.floor((subtotal * existCoupon.discountPercentage) / 100);
        } else if (existCoupon.discountType === "fixed") {
          couponDiscount = existCoupon.offerPrice;
        }
      }
    }

    // ✅ delivery charge
    const deliveryCharge = 60;
const  couponDiscounts =coupon?.discount?coupon.discount:0
    // ✅ final price
    const finalPrice = subtotal - couponDiscounts - totalOfferDiscount + deliveryCharge;
    

      if (paymentMethod === "wallet") {
      const wallet = await Wallet.findOne({ userId });

      if (!wallet) {
        return res.status(400).json({ message: "Wallet not found" });
      }

      if (wallet.balance < finalPrice) {
        return res.status(400).json({success:false, message: "Insufficient wallet balance" });
      }

      // ✅ Deduct balance
      wallet.balance -= finalPrice;
      wallet.Transactionhistory.push({
        amount: finalPrice,
        transactiontype: "Order Payment",
        description: "Payment for order",
        type: "debit"
      });
      await wallet.save();
    }
   
    console.log('jjjjjjjjjjjjjjjjj',totalOfferDiscount);
    // return;
    
    const newOrder = new Order({
      user: userId,
      deliveryDetails: {
        fname: req.body.address.fname,
        sname: req.body.address.sname,
        mobile: req.body.address.mobile,
        email: req.body.address.email,
        address: req.body.address.address,
        city: req.body.address.city,
        pin: req.body.address.pin,
      },
      paymentMethod: req.body.paymentMethod,
      product: productList,
      subtotal,
      couponDiscount:coupon?.discount?coupon.discount:0,
      appliedOffer: totalOfferDiscount,
      deliveryCharge,
      finalPrice,
      Date: new Date(),
      exprdate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: "Pending",
    });

    const orderDisplay = await generateDisplayOrderId();
    newOrder.displayOrderId = orderDisplay;

    await newOrder.save();

    await Cart.deleteOne({ userId });

    res.status(200).json({success:true,




















      
      message: "Order Successful",
      orderId: newOrder._id,
      appliedOffer: totalOfferDiscount,
      couponDiscount,
      finalPrice,
        ...(paymentMethod === "wallet" && { walletBalance: (await Wallet.findOne({ userId })).balance })
    });

  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).send("Internal Server Error");
  }
};




// const cancelOrder = async (req, res) => {
//   try {
//     const userId = req.session.userId;
//     const { orderId, productId } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

 
//     const productIndex = order.product.findIndex(
//       (p) => p.productId.toString() === productId
//     );

//     if (productIndex === -1) {
//       return res.status(404).json({ message: "Product not found in order" });
//     }

   
//     order.product.splice(productIndex, 1);

    
//     const cancelledProductPrice = order.subtotal; 
//     order.subtotal -= cancelledProductPrice;
//     await order.save();

 
//     const refundAmount = cancelledProductPrice;
//     const transaction = {
//       amount: refundAmount,
//       transactiontype: "Refund",
//       description: "Refund for cancelled order",
//       type: "credit",
//     };

   
//     await Order.findByIdAndUpdate(orderId, {
//       $set: { status: "waiting for approval" },
//     });


//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     let wallet = await Wallet.findById(user.walletId);
//     if (!wallet) {
//       wallet = new Wallet({
//         userId,
//         balance: 0,
//         Transactionhistory: [],
//       });
//       await wallet.save();

     
//       user.walletId = wallet._id;
//       await user.save();
//     }

//     wallet.balance += refundAmount;
//     wallet.Transactionhistory.push(transaction);
//     await wallet.save();

//     res.json({ success: true, message: "Order cancelled and refund credited" });
//   } catch (error) {
//     console.error("Cancel Order Error:", error.message);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };






const orderdetails = async (req, res) => {
  try {
    const { id, productId } = req.params;

    const order = await Order.findOne({ _id: id })
      .populate("product.category")
      .populate("user");

    if (!order) {
      return res.status(404).render("error", { message: "Order not found" });
    }

    order.product = order.product.filter(
      (p) => p.productId && p.productId.toString() === productId
    );

    const subtotal =
      order.subtotal ||
      order.product.reduce((sum, p) => sum + p.price * p.quantity, 0);

    const deliveryCharge = subtotal > 1000 ? 0 : 50;
    const finalTotal = subtotal + deliveryCharge;

    res.render("orderDetail", {
      order,
      subtotal,
      deliveryCharge,
      finalTotal,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).render("error", { message: "Internal server error" });
  }
};


const returnOrder = async (req, res) => {
  try {
    console.log("Return request received:", req.body);

    const userId = req.session.userId;
    const orderId = req.body.orderId;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

 
    if (Date.now() > order.exprdate) {
      return res.json({ datelimit: true, message: "Return period expired" });
    }


    const walletAmount = order.subtotal;
    const transaction = {
      amount: walletAmount,
      transactiontype: "Refund",
      description: "Refund for Returned Order",
      type: "credit", 
    };

   
    await Order.findByIdAndUpdate(orderId, { $set: { status: "waiting for approval" } });

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

 
    let wallet = await Wallet.findById(user.walletId);

    if (!wallet) {
      wallet = new Wallet({
        userId: user._id,
        balance: 0,
        Transactionhistory: [],
      });
      await wallet.save();

      user.walletId = wallet._id;
      await user.save();
    }

  
    wallet.balance += walletAmount;
    wallet.Transactionhistory.push(transaction);
    await wallet.save();

    res.json({ success: true, message: "Order returned and amount refunded to wallet" });

  } catch (error) {
    console.error("Return Order Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const downloadInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate("user")
            .populate("product.productId")
            .populate("product.category");

        if (!order) {
            return res.status(404).send("Order not found");
        }

        const subtotal = order.product.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = 0;
        const discount = 0;
        const taxRate = 0;
        const taxAmount = (subtotal + shipping - discount) * taxRate;
        const totalAmount = subtotal + shipping - discount + taxAmount;

        const invoiceData = {
            customerName: `${order.deliveryDetails.fname} ${order.deliveryDetails.sname}`,
            customerAddress: order.deliveryDetails.address,
            customerCity: order.deliveryDetails.city,
            customerPin: order.deliveryDetails.pin,
            customerPhone: order.deliveryDetails.mobile,
            customerEmail: order.deliveryDetails.email,

            invoiceDate: new Date().toLocaleDateString("en-IN"),
            orderDate: order.Date ? order.Date.toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"),
            orderId: order._id.toString().slice(-10).toUpperCase(),
            paymentMethod: order.paymentMethod || "Credit Card",
            deliveryDate: order.exprdate ? order.exprdate.toLocaleDateString("en-IN") : "TBD",

            products: order.product.map((item) => ({
                name: item.name,
                category: item.category?.name || "General",
                quantity: item.quantity,
                unitPrice: item.price,
                total: item.price * item.quantity,
                image: item.productId?.productImage?.[0]
                    ? `/productImages/${item.productId.productImage[0]}`
                    : "https://via.placeholder.com/50x50/bdd5eb/ffffff?text=IMG",
            })),

            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            discount: discount.toFixed(2),
            taxRate: (taxRate * 100).toFixed(0),
            taxAmount: taxAmount.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            paymentStatus: order.paymentStatus || "Paid",
        };

        res.render("invoice", { invoice: invoiceData });
    } catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).send("Error generating invoice");
    }
};


const verifyPayment = async (req, res) => {
  console.log('ppppppppppppppppp');
  
    try {
        console.log(req.body,' anshi Body')
        const {
            address,
            paymentMethod,
            products,
            subtotal,
            coupon
            
        } = req.body;

        const fullProducts = [];
        const userId = req.session.userId;
        for (const p of products) {
            const prodDoc = await Product.findById(p.productId)
                .populate("category").populate("productOffer").populate("categoryOffer")
                .lean();

            if (!prodDoc) {
                throw new Error(`Product not found: ${p.productId}`);
            }
fullProducts.push({
  productId: prodDoc._id,
  name: prodDoc.productName,
  quantity: p.quantity,
  price: p.price,
  category: prodDoc.category._id,
  description: prodDoc.description,
  regularPrice: prodDoc.regularPrice,
  salePrice: prodDoc.salePrice,
  productOffer: prodDoc.productOffer?.discountValue || 0,   
  categoryOffer: prodDoc.categoryOffer?.discountValue || 0, 
  finalamount: p.price * p.quantity,
  productImage: prodDoc.productImage,
});

        } 
        
        

const displayOrderId = await generateDisplayOrderId();
        const order = new Order({
            deliveryDetails: {
                fname: address.fname,
                sname: address.sname,
                mobile:address.mobile,
                email: address.email,
                address: address.address,
                city:address.city,
                pin: address.pin,
            },
            displayOrderId,
            user: userId, 
            paymentMethod,
            product: fullProducts,
            subtotal,
            finalPrice:subtotal+60,
            deliveryCharge:60,
            couponDiscount:coupon?.discount?coupon?.discount:0,
            Date: new Date(),
            status: "Pending"
        });
        console.log(order,"Order")
       await order.save();
console.log(userId,"use");

       await Cart.deleteOne({userId:userId})

return res.status(200).json({
    success: true,
    message: "Order placed successfully",
    orderId: order._id
});


    } catch (error) {
    console.log(error,"err");
    
        res.status(500).json({ success: true, message: "error full" });
    }
};

// const Order = require("../models/orderModel");

const cancelOrders = async (req, res) => {
  try {
    const { orderId, productId } = req.body;
    const userId = req.session.userId;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Cancel specific product or whole order
    if (productId) {
      const productIndex = order.product.findIndex(
        (p) => p.productId.toString() === productId
      );

      if (productIndex === -1) {
        return res.status(404).json({ success: false, message: "Product not found in order" });
      }

      // Remove product
      const cancelledProduct = order.product[productIndex];
      order.product.splice(productIndex, 1);

      // If no products left → mark order cancelled
      if (order.product.length === 0) {
        order.status = "Cancelled";
      }

      // Refund only if Razorpay
      if (order.paymentMethod === "razorpay") {
        await refundToWallet(userId, cancelledProduct.finalamount, "Refund for Cancelled Product");
      }

    } else {
      // Cancel full order
      order.status = "Cancelled";

      // Refund only if Razorpay
      if (order.paymentMethod === "razorpay") {
        await refundToWallet(userId, order.finalPrice, "Refund for Cancelled Order");
      }
    }

    await order.save();

    return res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({ success: false, message: "Server error while cancelling order" });
  }
};



 const paymentFailedGet = async(req,res)=>{
  try {
    res.render('paymentFailGet')
  } catch (error) {
    
  }
 }
const paymentFailed = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(req.params,"siyad1");
    

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.status = "Payment Failed";
    await order.save();

    res.json({ success: true, message: "Order marked as failed", orderId });
  } catch (err) {
    console.error("Payment fail update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const retryPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("RetryPayment orderId:", orderId);

    const existingOrder = await Order.findById(orderId);
    console.log("RetryPayment Order:", existingOrder);

    if (!existingOrder) {
      return res.json({ success: false, message: "Order not found" });
    }

    if (existingOrder.status !== "Payment Failed") {
      return res.json({ success: false, message: "Retry not allowed for this order" });
    }

    console.log("RetryPayment Keys:", process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: existingOrder.subtotal * 100,
      currency: "INR",
      receipt: `retry_${Date.now()}`,
      payment_capture: 1,
    };

    console.log("RetryPayment Options:", options);

    const razorpayOrder = await razorpay.orders.create(options);

    return res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount / 100,
      currency: razorpayOrder.currency,
    });

  } catch (err) {
    console.error("Retry Payment Error:", err.response ? err.response : err);
    res.status(500).json({ success: false, message: err.message || "Server error during retry" });
  }
};

const paymentSucess = async(req,res)=>{
  try {
    const {orderId}=req.params
    console.log(orderId,"new order");
    const exisistingOrders = await Order.findById(orderId)
    if(exisistingOrders){
        // exisistingOrders.status = "Pending"
        await Order.findByIdAndUpdate(orderId,{status:"Pending"})
    }
res.json({sucess:true,message:"payemnet sucess"})
    console.log(exisistingOrders,"koran")
  } catch (error) {
    
  }
}
module.exports = { orderlist, placeOrder,cancelOrders, orderdetails, returnOrder, downloadInvoice,verifyPayment,paymentFailed,paymentFailedGet,retryPayment,paymentSucess};


// const placeOrder = async (req, res) => {
//   try {
//     const { total, coupon, paymentMethod } = req.body;
//     const userId = req.session.userId;

//     const productList = [];
//     let subtotal = 0;
//     let totalOfferDiscount = 0;

//     // ✅ your existing product + discount loop
//     for (let item of req.body.products) {
//       const product = await Product.findById(item.productId)
//         .populate("productOffer")
//         .populate({
//           path: "category",
//           populate: { path: "offer" }
//         });

//       if (!product) {
//         return res.status(404).json({ message: "Product not found" });
//       }

//       // ✅ stock check
//       let sizeFound = false;
//       for (let size of product.sizes) {
//         if (item.size === size.size) {
//           sizeFound = true;
//           if (item.quantity > size.quantity) {
//             return res.status(400).json({ message: `Stock unavailable for size ${item.size}` });
//           }
//           size.quantity -= item.quantity;
//         }
//       }
//       if (!sizeFound) {
//         return res.status(400).json({ message: `Size ${item.size} not found for product` });
//       }
//       await product.save();

//       // ✅ offers
//       const productOfferValue = product.productOffer?.offer || 0;
//       const categoryOfferValue = product.category?.offer?.offer || 0;
//       const maxDiscount = Math.max(productOfferValue, categoryOfferValue);

//       // ✅ price calculation
//       const basePrice = product.salePrice || product.regularPrice || 0;
//       const priceBeforeDiscount = basePrice * item.quantity;
//       const discountAmount = (priceBeforeDiscount * maxDiscount) / 100;
//       const finalLineAmount = priceBeforeDiscount - discountAmount;

//       subtotal += priceBeforeDiscount;
//       totalOfferDiscount += discountAmount;

//       productList.push({
//         productId: item.productId,
//         name: product.productName,
//         quantity: item.quantity,
//         price: basePrice,
//         category: product.category._id,
//         description: product.description,
//         regularPrice: product.regularPrice,
//         salePrice: product.salePrice,
//         finalamount: finalLineAmount,
//         productOffer: productOfferValue,
//         categoryoffer: categoryOfferValue,
//         productImage: product.productImage,
//       });
//     }

//     // ✅ coupon discount
//     let couponDiscount = 0;
//     if (coupon) {
//       const existCoupon = await Coupon.findOne({
//         code: coupon.code.toUpperCase(),
//         status: "active"
//       });

//       if (existCoupon && existCoupon.expireOn > new Date()) {
//         if (existCoupon.discountType === "percentage") {
//           couponDiscount = Math.floor((subtotal * existCoupon.discountPercentage) / 100);
//         } else if (existCoupon.discountType === "fixed") {
//           couponDiscount = existCoupon.offerPrice;
//         }
//       }
//     }

//     // ✅ delivery charge
//     const deliveryCharge = 60;
//     const couponDiscounts = coupon?.discount ? coupon.discount : 0;

//     // ✅ final price
//     const finalPrice = subtotal - couponDiscounts - totalOfferDiscount + deliveryCharge;

//     // ---------------- WALLET CHECK ----------------
//     if (paymentMethod === "wallet") {
//       const wallet = await Wallet.findOne({ userId });

//       if (!wallet) {
//         return res.status(400).json({ message: "Wallet not found" });
//       }

//       if (wallet.balance < finalPrice) {
//         return res.status(400).json({ message: "Insufficient wallet balance" });
//       }

//       // ✅ Deduct balance
//       wallet.balance -= finalPrice;
//       wallet.Transactionhistory.push({
//         amount: finalPrice,
//         transactiontype: "Order Payment",
//         description: "Payment for order",
//         type: "debit"
//       });
//       await wallet.save();
//     }

//     // ✅ create order
//     const newOrder = new Order({
//       user: userId,
//       deliveryDetails: {
//         fname: req.body.address.fname,
//         sname: req.body.address.sname,
//         mobile: req.body.address.mobile,
//         email: req.body.address.email,
//         address: req.body.address.address,
//         city: req.body.address.city,
//         pin: req.body.address.pin,
//       },
//       paymentMethod,
//       product: productList,
//       subtotal,
//       couponDiscount: couponDiscounts,
//       appliedOffer: totalOfferDiscount,
//       deliveryCharge,
//       finalPrice,
//       Date: new Date(),
//       exprdate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
//       status: "Pending",
//     });

//     const orderDisplay = await generateDisplayOrderId();
//     newOrder.displayOrderId = orderDisplay;

//     await newOrder.save();
//     await Cart.deleteOne({ userId });

//     res.status(200).json({
//       message: "Order Successful",
//       orderId: newOrder._id,
//       appliedOffer: totalOfferDiscount,
//       couponDiscount,
//       finalPrice,
//       ...(paymentMethod === "wallet" && { walletBalance: (await Wallet.findOne({ userId })).balance })
//     });

//   } catch (error) {
//     console.error("Order placement error:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };
