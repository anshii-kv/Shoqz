const User = require("../../model/userSchema");
const Order = require("../../model/orderSchema");
const Product = require("../../model/productSchema");
const Category = require("../../model/categorySchema");
const Cart = require("../../model/cartSchema");
const Razorpay = require('razorpay')

// const razorpay = new Razorpay({
//     key_id:process.env.KEY_ID,
//     key_secret:process.env.RAZORPAY_SECURITY_KEY
// })

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

const placeOrder = async (req, res) => {
    try {
        const orderData = req.body;
        const userId = req.session.userId;
        const productList = [];
        let productImage = [];
        for (let item of orderData.products) {
            const product = await Product.findOne({ _id: item.productId });
            if (Array.isArray(product.productImage)) {
                productImage.push(...product.productImage);
            } else if (typeof product.productImage === "string") {
                productImage.push(product.productImage);
            }
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
                description: product.description,
                regularPrice: product.regularPrice,
                salePrice: product.salePrice,
                productImage: product.productImage,
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
            productImage: productImage,
        });
        var orderDisplay = await generateDisplayOrderId();

        newOrder.displayOrderId = orderDisplay;

        await newOrder.save();

        await Cart.deleteOne({ userId: userId });

        res.status(200).json({ message: "Order Successful", orderId: newOrder._id });
    } catch (error) {
        console.error("Order placement error:", error);
        res.status(500).send("Internal Server Error");
    }
};

const cancelOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        console.log(req.body, "cancelorder");

        const orderId = req.body.orderId;
        const productIdToCancel = req.body.productId;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        console.log(order, "Order");
        const productIndex = order.product.findIndex((p) => p.productId.toString() === productIdToCancel);
        if (productIndex === -1) {
            return res.status(404).json({ message: "Product not found in the order" });
        }

        // Option 1: Remove the product from the order
        order.product.splice(productIndex, 1);
        await order.save();

        const WalletAmount = order.subtotal;
        const WalletData = {
            amount: WalletAmount,
            date: Date.now(),
            discription: "Refund for order Cancelling order ",
        };

        const data = await Order.findOneAndUpdate({ _id: orderId, user: userId }, { $set: { status: "Cancelled" } });

        if (data) {
            await User.findOneAndUpdate(
                { _id: userId },
                { $inc: { wallet: WalletAmount }, $push: { walletHistory: WalletData } }
            );

            res.json({ success: true });
        }
        //  else {
        //     res.json({
        //         success: false,
        //         message: "Order not found or not owned by the user",
        //     });
        // }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

const orderdetails = async (req, res) => {
    try {
        console.log(req.params,"another error");
        
        const { id, productId } = req.params;

console.log(id,productId,"new error");

        const order = await Order.findOne({ _id: id }).populate("product.category").populate("user");
        console.log(order, "order are consoloing here");

        if (!order) {
            return res.status(404).render("error", { message: "Order not found" });
        }
        order.product = order.product.filter((p) => {
            console.log(p.productId, productId, "dfdf");
            return p.productId && p.productId.toString() === productId;
        });

        console.log(order, "ammu");

        res.render("orderDetail", { order });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).render("error", { message: "Internal server error" });
    }
};
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
            await Order.findByIdAndUpdate({ _id: orderId }, { $set: { status: "waiting for approval" } });

            res.json({ return: true });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal Server Error" });
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
    try {
        console.log(req.body,'Body')
        const {
            address,
            paymentMethod,
            products,
            subtotal,
            paymentResponse
        } = req.body;

        const fullProducts = [];
        const userId = req.session.userId;
        for (const p of products) {
            const prodDoc = await Product.findById(p.productId)
                .populate("category")
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
                productOffer: prodDoc.productOffer || 0,
                categoryoffer: prodDoc.categoryoffer || 0,
                finalamount: p.price * p.quantity,
                productImage: prodDoc.productImage,
            });
        } 

        const order = new Order({
            deliveryDetails: {
                fname: address.fname,
                sname: address.sname,
                mobile: address.mobile,
                email: address.email,
                address: address.address,
                city: address.city,
                pin: address.pin,
            },
            displayOrderId: paymentResponse.razorpay_order_id,
            user: userId, 
            paymentMethod,
            product: fullProducts,
            subtotal,
            Date: new Date(),
            status: "Pending"
        });
        console.log(order,"Order")
       await order.save();

return res.status(200).json({
    success: true,
    message: "Order placed successfully",
    orderId: order._id
});


    } catch (error) {
        console.error(error);
        res.status(500).json({ success: true, message: error.message });
    }
};



module.exports = { orderlist, placeOrder, cancelOrder, orderdetails, returnOrder, downloadInvoice,verifyPayment};
