const Coupon = require("../../model/couponSchema")
const mongoose = require("mongoose");
const Category = require("../../model/categorySchema");
const Product = require("../../model/productSchema");
const Order=require("../../model/orderSchema")
const User = require('../../model/userSchema');


const loadCoupon = async(req,res)=>{
    try {
        const coupons = await Coupon.find({});
        res.render('admin/coupon',{coupons})
    } catch (error) {
        
    }
}

const loadaddCoupon=async(req,res)=>{
    try {
        res.render('admin/addCoupon')
    } catch (error) {
        
    }
}

const addCoupon = async (req, res) => {
    try {
      
        const {
            code,
            discountType,
            discountPercentage,
            offerPrice,
            minimumPurchase,
            maximumPurchase,
            userLimit,
            createdOn,
            expireOn,
            description
        } = req.body;

        console.log(req.body);
        
        const existing = await Coupon.findOne({ code });
        if (existing) {
            return res.status(400).json({ success: false, message: "Coupon code already exists." });
        }

       
        const newCoupon = new Coupon({
            code,
            discountType,
            discountPercentage: discountType === 'percentage' ? discountPercentage : undefined,
            offerPrice: discountType === 'fixed' ? offerPrice : undefined,
            minimumPurchase,
            maximumPurchase,
            userLimit,
            createdOn: createdOn || new Date(),
            expireOn,
            status: "active", 
            description
        });

        await newCoupon.save();

        return res.status(200).json({ success: true, message: "Coupon added successfully!" });

    } catch (error) {
        console.error("Error adding coupon:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteCoupon =async(req,res)=>{
    try {
       const item = req.params.id
       console.log(item);
       
     const coupn=  await Coupon.findByIdAndDelete(item)
       if(!coupn){
        return res.json({success:false,message:"Coupon not found"})
       }
       return res.json({success:true,message:"coupon deleted succesfully"})
       
       
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete coupon" });
        
    }
}

const toggleCouponStatus = async (req, res) => {
  try {
    const couponId = req.params.id;

    // Toggle the boolean isActive field atomically
    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      [
        { $set: { isActive: { $not: "$isActive" } } }
      ],
      { new: true } // return the updated document
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    const status = coupon.isActive ? "activated" : "deactivated";
    res.status(200).json({
      success: true,
      message: `Coupon successfully ${status}`,
      coupon,
    });
  } catch (err) {
    console.error("Toggle failed:", err);
    res.status(500).json({ success: false, message: "Failed to toggle coupon status" });
  }
};


const editCoupon = async(req,res)=>{
    try {
      const couponId = req.params.couponId;
       const coupon = await Coupon.findOne({_id:couponId});
        res.render('admin/editCoupon',{coupon})
    } catch (error) {
        
    }
}
module.exports={
    loadCoupon,
    addCoupon,
    loadaddCoupon,
    deleteCoupon,
    toggleCouponStatus,
    editCoupon,
}