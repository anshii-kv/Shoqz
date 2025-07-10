const mongoose = require("mongoose");
const user=require('../model/userSchema')



const useraddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },

  address: [
    {
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
       isDefault: { type: Boolean, default: false }, // ✅ Add this
    type: { type: String, default: "other" } // ✅ Optional
    },
  ],
});

const Address = mongoose.model("Address", useraddressSchema);

module.exports = Address;