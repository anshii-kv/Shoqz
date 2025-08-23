const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    isListed: {
        type: Boolean,
        default: true,
    },
    
    offer: {
       type:mongoose.Schema.Types.ObjectId,
       ref:'category'
        
    }
},
 { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;

