const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    deliveryDetails: {
        fname: {
            type: String,
            required: true,
        },
        sname: {
            type: String,
            required: true,
        },
        mobile: {
            type: Number,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        pin: {
            type: String,
            required: true,
        },
    },
    displayOrderId: { type: String, unique: true }, 
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    paymentMethod: {
        type: String,
    },
    product: [
        {
            productId: {
                type: mongoose.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },

            category: {
                type: mongoose.Types.ObjectId,
                ref: "Category",
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            regularPrice: {
                type: Number,
                required: true,
            },
            salePrice: {
                type: Number,
                required: true,
            },
            productOffer: {
                type: Number,
                default: 0,
            },

            categoryoffer: { 
              type: Number, 
              default: 0
             },

            finalamount: {
                type: Number,
                default: 0,
                require: false,
            },
               productImage: {
        type: [String],
        required: true,
    },
        },
    ],
    subtotal: {
        type: Number,
    },
    Date: {
        type: Date,
    },
    exprdate: {
        type: Date,
    },
    status: {
        type: String,
    },
    // paymentId: {
    //   type: String,
    // },
 
});

module.exports = mongoose.model("order", OrderSchema);
