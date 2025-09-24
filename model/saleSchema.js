const mongoose = require("mongoose");
const {Schema}=mongoose;
const salesSchema = new Schema({
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        required:true
    },
    amount:{
        type:Number,
        required:true,
    },
    discount:{
        type:Number,
        default:0,
    },
    coupon:{
        type:Number,
        default:0,
    },
    date:{
        type:Date,
        default:Date.now
    }
})
const Sales = mongoose.model("sales",salesSchema);
module.exports=Sales;