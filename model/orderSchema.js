const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const OrderModel = new mongoose.Schema({
  
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
      brand: {
        type: String,
        required: true,
      },
      category: {
        type:mongoose.Types.ObjectId ,
        ref:"Category",
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
  paymentId: {
    type: String,
  },
});

module.exports = mongoose.model("order", OrderModel);