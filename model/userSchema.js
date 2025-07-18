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
        unique: true,
        sparse: true,
        default: null,
    },
    googleId: {
        type: String,
        unique: true,
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
    cart: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Cart",
            },
        },
    ],
    wallet: {
        type: Number,
        default: 0,
    },

    walletHistory: [
        {
            date: {
                type: Date,
            },
            amount: {
                type: Number,
            },
            description: {
                type: String,
            },
        },
    ],
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
    referalCode: {
        type: String,
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
});

const User = mongoose.model("User", userSchema);

module.exports = User;
