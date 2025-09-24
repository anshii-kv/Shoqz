const Order = require("../../model/orderSchema");
const Category = require("../../model/categorySchema");

const salesReport = async (req, res) => {
  try {
    // ✅ Fetch last 10 delivered orders (not just payment success)
    const orders = await Order.find({
      "deliveryDetails.paymentSuccess": true,
      status: "delivered"   // ensure only delivered
    })
      .populate("user")
      .populate("product.category")
      .sort({ Date: -1 })
      .limit(10);

    // ✅ Totals
    const totalRevenue = orders.reduce((acc, order) => acc + (order.subtotal || 0), 0);
    const totalOrders = await Order.countDocuments({
      "deliveryDetails.paymentSuccess": true,
      status: "delivered"
    });
    console.log(totalOrders,"ktotal");
    

    // ✅ Discounts
    const totalDiscounts = orders.reduce((acc, order) => {
      let discount = 0;
      order.product.forEach((p) => {
        if (p.regularPrice && p.finalamount) {
          discount += (p.regularPrice * p.quantity) - (p.finalamount * p.quantity);
        }
      });
      return acc + discount;
    }, 0);

    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

    
    const tableData = orders.map(order => {
    
      let offerDiscount = 0;
      if (order.product && order.product.length > 0) {
        order.product.forEach(p => {
          if (p.regularPrice && p.finalamount) {
            offerDiscount += (p.regularPrice * p.quantity) - (p.finalamount * p.quantity);
          }
        });
      }

      return {
        orderId: order.displayOrderId || order._id.toString().slice(-6),
        customerName: order.deliveryDetails 
            ? `${order.deliveryDetails.fname} ${order.deliveryDetails.sname}` 
            : (order.user ? order.user.name : "Guest"),
        date: order.Date ? new Date(order.Date).toLocaleDateString() : "",
        totalAmount: order.subtotal || 0,
        couponDiscount: order.couponDiscount || 0,
        offerDiscount,
        deliveryCharge: order.deliveryCharge || 0,
        finalPrice:
          order.finalPrice ||
          ((order.subtotal || 0) -
           (order.couponDiscount || 0) -
           offerDiscount +
           (order.deliveryCharge || 0)),
        paymentMethod: order.paymentMethod
          ? order.paymentMethod.toUpperCase()
          : (order.deliveryDetails?.paymentMethod?.toUpperCase() || "N/A"),
      };
    });

    console.log(orders);
    for(let  or of orders){
console.log(or.product);

    }
    

    res.render("admin/salesReport", {
      totalRevenue,
      totalOrders,
      totalDiscounts,
      avgOrderValue,
      recentOrders: tableData,  
    });

  } catch (error) {
    console.error("Error in salesReport:", error);
    res.status(500).send("Server Error");
  }
};


module.exports = { salesReport };
