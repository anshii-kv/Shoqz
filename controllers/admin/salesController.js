const Order = require("../../model/orderSchema");

const salesReport = async (req, res) => {
    try {

        let { filter, startDate, endDate } = req.query;
        
     
        if (!filter) {
            filter = "weekly";
        }

        console.log("Applied Filter:", filter); 

        let dateFilter = {};
        const now = new Date();

        switch (filter) {
            case "today":
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);
                const endOfToday = new Date();
                endOfToday.setHours(23, 59, 59, 999);
                dateFilter.Date = { $gte: startOfToday, $lte: endOfToday };
                break;

            case "weekly":
                const startOfWeek = new Date();
                startOfWeek.setDate(startOfWeek.getDate() - 7); 
                startOfWeek.setHours(0, 0, 0, 0);
                const endOfWeek = new Date();
                endOfWeek.setHours(23, 59, 59, 999);
                dateFilter.Date = { $gte: startOfWeek, $lte: endOfWeek };
                break;

            case "monthly":
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                startOfMonth.setHours(0, 0, 0, 0);
                const endOfMonth = new Date();
                endOfMonth.setHours(23, 59, 59, 999);
                dateFilter.Date = { $gte: startOfMonth, $lte: endOfMonth };
                break;

            case "custom":
                if (startDate && endDate) {
                    const customStart = new Date(startDate);
                    customStart.setHours(0, 0, 0, 0);
                    const customEnd = new Date(endDate);
                    customEnd.setHours(23, 59, 59, 999);
                    dateFilter.Date = { $gte: customStart, $lte: customEnd };
                } else {
                    
                    filter = "weekly";
                    const fallbackStart = new Date();
                    fallbackStart.setDate(fallbackStart.getDate() - 7);
                    fallbackStart.setHours(0, 0, 0, 0);
                    const fallbackEnd = new Date();
                    fallbackEnd.setHours(23, 59, 59, 999);
                    dateFilter.Date = { $gte: fallbackStart, $lte: fallbackEnd };
                }
                break;

            default:
               
                filter = "weekly";
                const defaultStart = new Date();
                defaultStart.setDate(defaultStart.getDate() - 7);
                defaultStart.setHours(0, 0, 0, 0);
                const defaultEnd = new Date();
                defaultEnd.setHours(23, 59, 59, 999);
                dateFilter.Date = { $gte: defaultStart, $lte: defaultEnd };
        }

        console.log("Final Filter:", filter);
        console.log("Date Range:", dateFilter.Date);

        const orders = await Order.find({
            "deliveryDetails.paymentSuccess": true,
            status: "delivered",
            ...dateFilter,
        })
        .populate("user")
        .populate("product")
        .sort({ Date: -1 });

        console.log("Orders found:", orders.length);

      
        const totalRevenue = orders.reduce((acc, order) => acc + (order.subtotal || 0), 0);
        const totalOrders = orders.length;

        const totalDiscounts = orders.reduce((acc, order) => {
            let discount = 0;
            if (order.product && order.product.length > 0) {
                order.product.forEach((p) => {
                    if (p.regularPrice && p.finalamount) {
                        discount += p.regularPrice * p.quantity - p.finalamount * p.quantity;
                    }
                });
            }
            return acc + discount;
        }, 0);

        const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

        
        const tableData = orders.map((order) => {
            let offerDiscount = 0;
            let appliedOffers = [];

            const productDetails = order.product.map((p) => {
                if (p.salePrice && p.finalamount) {
                    const originalLineTotal = p.salePrice * p.quantity;
                    const discountedLineTotal = p.finalamount;
                    offerDiscount += originalLineTotal - discountedLineTotal;
                }

                if (p.appliedOffer) {
                    appliedOffers.push(`${p.name}: ${p.appliedOffer}%`);
                }

                return {
                    name: p.name,
                    quantity: p.quantity,
                    regularPrice: p.regularPrice,
                    salePrice: p.salePrice,
                    finalamount: p.finalamount,
                    appliedOffer: p.appliedOffer || null,
                };
            });

            const originalPrice =
                order.product && order.product.length > 0
                    ? order.product.reduce((sum, p) => sum + p.regularPrice * p.quantity, 0)
                    : order.subtotal + offerDiscount + (order.couponDiscount || 0);

            return {
                orderId: order.displayOrderId || order._id.toString().slice(-6),
                customerName: order.deliveryDetails
                    ? `${order.deliveryDetails.fname} ${order.deliveryDetails.sname}`
                    : order.user
                    ? order.user.name
                    : "Guest",
                date: order.Date ? new Date(order.Date).toLocaleDateString("en-IN") : "",
                totalAmount: order.subtotal || 0,
                couponDiscount: order.couponDiscount || 0,
                offerDiscount,
                appliedOffer: appliedOffers.join(", ") || "No Offer",
                deliveryCharge: order.deliveryCharge || 0,
                finalPrice:
                    order.finalPrice ||
                    (order.subtotal || 0) - (order.couponDiscount || 0) - offerDiscount + (order.deliveryCharge || 0),
                paymentMethod: order.paymentMethod
                    ? order.paymentMethod.toUpperCase()
                    : order.deliveryDetails?.paymentMethod?.toUpperCase() || "N/A",
                originalPrice: originalPrice,
                products: productDetails,
            };
        });

       
        res.render("admin/salesReport", {
            totalRevenue,
            totalOrders,
            totalDiscounts,
            avgOrderValue,
            recentOrders: tableData,
            currentFilter: filter, 
            startDate: startDate || "",
            endDate: endDate || "",
        });

    } catch (error) {
        console.error("Error in salesReport:", error);
        res.status(500).send("Server Error");
    }
};

module.exports = { salesReport };