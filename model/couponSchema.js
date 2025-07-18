const mongoose=require("mongoose")
const { Schema } = mongoose;
const CouponSchema =  new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
   
    createdOn: {
        type: Date,
        default: Date.now,
        required: true
    },

    expireOn: {
        type: Date,
        required: true
    },
    offerPrice: {
        type: Number,
        required: false
    },
    discountType:{
        type:String,
        required:true,
    },
    discountPercentage: {
        type: Number,
        required: false
    },
    minimumPurchase: {
        type: Number,
        required: true
    },
    maximumPurchase: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
    },
    userLimit: {
        type: Number,
        default: 1
    },
    userId: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});
const Coupon = mongoose.model("Coupon",CouponSchema)
module.exports=Coupon

