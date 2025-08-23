const mongoose = require("mongoose");
const productOfferSchema = new mongoose.Schema({
     product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    },
    offer:{
        type:Number,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expires: {
    type: Date,
    default: () => Date.now() + (3 * 24 * 60 * 60 * 1000)
}

})

const productOffer = mongoose.model("productOffer",productOfferSchema)
module.exports=productOffer;