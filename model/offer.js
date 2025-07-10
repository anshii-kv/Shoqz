const mongoose = require("mongoose");
const OfferSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    activationdate:{
        type:Date,
        required:true
    },
    expireddate:{
        type:Date,
        required:true
    },
    is_Blocked:{
        type:Boolean,
        required:false
    }
})

const Offer = mongoose.model("Offer",OfferSchema)
module.exports=Offer;