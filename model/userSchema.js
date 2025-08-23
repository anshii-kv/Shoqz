const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: false,
        sparse: true,
        default: null,
    },
    googleId: {
        type: String,
        default: undefined,
    },
    password: {
        type: String,
        required: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    referralCode:{
        type:String,
       
    },
    cart: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Cart",
            },
        },
    ],
    walletId: {
        type:  Schema.Types.ObjectId,
        ref:"wallet"
    },

  
    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: "Wishlist",
        },
    ],
    orderHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Order",
        },
    ],
    createdOn: {
        type: Date,
        default: Date.now,
    },
 

    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
    },
    address: [
        {
            fname: String,
            sname: String,
            mobile: Number,
            email: String,
            address: String,
            city: String,
            pin: String,
        },
    ],
    coupon:[
       {
        type: Schema.Types.ObjectId,
        ref: "Coupon"
    } 
    ]
});

const User = mongoose.model("User", userSchema);

module.exports = User;
