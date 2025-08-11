const Coupon = require("../../model/couponSchema");
const mongoose = require("mongoose");
const Category = require("../../model/categorySchema");
const Product = require("../../model/productSchema");
const Order = require("../../model/orderSchema");
const User = require("../../model/userSchema");

const loadCoupon = async (req, res) => {
    try {
        console.log("hejiejklejlk");
        
        const coupons = await Coupon.find({});
        console.log(coupons,"coupons");
        
        res.render("admin/coupon", { coupons });
    } catch (error) {}
};

const loadaddCoupon = async (req, res) => {
    try {
        res.render("admin/addCoupon");
    } catch (error) {}
};

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
            description,
        } = req.body;

        console.log(req.body,"coupon addededdd");

        const existing = await Coupon.findOne({ code });
        if (existing) {
            return res.status(400).json({ success: false, message: "Coupon code already exists." });
        }

        const newCoupon = new Coupon({
            code,
            discountType,
            discountPercentage: discountType === "percentage" ? discountPercentage : undefined,
            offerPrice: discountType === "fixed" ? offerPrice : undefined,
            minimumPurchase,
            maximumPurchase,
            userLimit,
            createdOn: createdOn || new Date(),
            expireOn,
            status: "active",
            isActive: true,
            description,
        });

        await newCoupon.save();

        return res.status(200).json({ success: true, message: "Coupon added successfully!" });
    } catch (error) {
        console.error("Error adding coupon:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteCoupon = async (req, res) => {
    try {
        const item = req.params.id;
        console.log(item);

        const coupn = await Coupon.findByIdAndDelete(item);
        if (!coupn) {
            return res.json({ success: false, message: "Coupon not found" });
        }
        return res.json({ success: true, message: "coupon deleted succesfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete coupon" });
    }
};

const toggleCouponStatus = async (req, res) => {
    try {
        const couponId = req.params.id;
        console.log(couponId,"idididiididiidiidiiidiidi");
        
        const couponData = await Coupon.findById(couponId);
        console.log(couponData,"data data dasdfghhjjjata");
        
        if (!couponData) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        const coupon = await Coupon.findByIdAndUpdate(
            couponId,
            { 
               
                status: 'active' ? 'inactive' : 'active'
            },
            { new: true }
        );

        const statusText = coupon.status ? "activated" : "deactivated";
        console.log("222222222222222222222222222");
        
        res.status(200).json({
            success: true,
            message:(` Coupon successfully ${statusText}`,
            coupon)
        });
    } catch (err) {
        console.error("Toggle failed:", err);
        res.status(500).json({ success: false, message: "Failed to toggle coupon status" });
    }
};

const editCoupon = async (req, res) => {
    try {

        const couponId = req.params.couponId;

        const coupon = await Coupon.findOne({ _id: couponId });
        res.render("admin/editCoupon", { coupon });
    } catch (error) {}
};
const editedCoupon = async (req, res) => {
    try {
        const couponId = req.params.id;
        const data = req.body;
        console.log(req.body,"bodyyyyyyyyyyyyy");
        
        await Coupon.findByIdAndUpdate(couponId, {
            code: data.code,
            discountType: data.discountType,
            discountPercentage: data.discountPercentage,
            offerPrice: data.offerPrice,
            minimumPurchase: data.minimumPurchase,
            maximumPurchase: data.maximumPurchase,
            userLimit: data.userLimit,
            createdOn: data.createdOn,
            expireOn: data.expireOn,
            description: data.description,
            status:data.status
        });

        res.json({ success: true, message: "Coupon updated successfully" });
    } catch (error) {
        console.error("Error updating coupon:", error);
        res.status(500).json({ success: false, message: "Failed to update coupon" });
    }
};

module.exports = {
    loadCoupon,
    addCoupon,
    loadaddCoupon,
    deleteCoupon,
    toggleCouponStatus,
    editCoupon,
    editedCoupon,
};
