
const mongoose = require("mongoose");
const {Schema}= mongoose;

const OrderSchema = new Schema({
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
        paymentSuccess: {
            type: Boolean,
            default: true,
        },
    },
    displayOrderId: { type: String, unique: true ,required:true},
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    paymentMethod: {
        type: String,
    },
    product: [
        {
            productId: {
                type: Schema.Types.ObjectId,
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
                type: Schema.Types.ObjectId,
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
                default: 0,
            },

            finalamount: {
                type: Number,
                default: 0,
                required: false,
            },
            productImage: {
                type: [String],
                required: true,
            },
            approvalStatus:{
                type:Number,
                default:0
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
    paymentId: {
      type: String,
    },
   couponDiscount: {
  type: Number,
  default: 0,
},
deliveryCharge: {
  type: Number,
  default: 0,
},
finalPrice: {
  type: Number,
  default: 0,
},
});

// module.exports = mongoose.model("order", OrderSchema);
const order = mongoose.model("Order",OrderSchema);
module.exports=order
