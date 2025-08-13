
const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishlistSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
   productId:{
    type:Schema.Types.ObjectId,
    ref:"Product"
   } ,
    productName: {
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
    sizes: [
      {
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
      }
    ],
     productImage: {
      type: [String],
      required: true,
    },
})

const Wishlist = mongoose.model('Wishlist',wishlistSchema);
module.exports=Wishlist