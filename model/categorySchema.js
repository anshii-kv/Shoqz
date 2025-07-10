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
        discount_percentage: {
            type: Number,
            default: 0
        },
        valid_until: {
            type: Date
        },
        description: {
            type: String
        },
        
    }
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;

