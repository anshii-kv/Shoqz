const mongoose = require("mongoose");
// const Category = require("./categorySchema");
const { Schema } = mongoose;
const { ObjectId } = require("mongodb");

const cartSchema = new mongoose.Schema({
    userId:{
        type:ObjectId,
        ref:"User",
        required:true,
    },
    product:[
        {
        productId:{
            type:ObjectId,
            ref:"Product",
            required:true,
        },
        name:{
            type:String,
            required:true,
        },
        price:{
            type:Number,
            default:1,
        },
        Category:{
            type:String,
            required:true,
        },
        quantity:{
            type:Number,
            default:1
        },
        total:{
            type:Number,
            default:0
        },
          size: { // Added size field
                type: String,
                required: true,
            },
    },
    ],
    coupondiscount:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Coupon",
    default:null
  },
   shippingCharge: {
    type: Number,
    default: 0,
  },
})
const Cart=mongoose.model("Cart",cartSchema);
module.exports=Cart;