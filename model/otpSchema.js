const  mongoose = require ("mongoose")
const {Schema}  = mongoose;

const otpSchema =  new Schema ({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:Number,
        required:true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60, 
    },
})
const otp = mongoose.model("otp",otpSchema);
module.exports=otp;