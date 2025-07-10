const mongoose = require("mongoose");
const Category = require("../../model/categorySchema");
const Product = require("../../model/productSchema");

const loadCategory = async (req, res) => {
    try {
        const search = req.query.search || "";

        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        const query = {};

        if (search.trim()) {
            query.name = { $regex: search, $options: "i" };
        }
        const categoeryData = await Category.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / limit);
        res.render("admin/category", {
            category: categoeryData,
            currentPage: page,
            totalPages: totalPages,
            totalCategories: totalCategories,
            search: search,
        });
    } catch (error) {
        console.log(error);
        res.redirect("/admin/adminError");
    }
};

const addCategory = async (req, res) => {
    try {
        const name = req.body.name.trim();
        const description = req.body.description;
        const nameToLowerCase = name.toLowerCase();
        console.log(nameToLowerCase);
        const exisitingCategory = await Category.findOne({
            name: { $regex: new RegExp("^" + nameToLowerCase + "$", "i") },
        });

        console.log(exisitingCategory, "exist");
        if (exisitingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }
        const newCategory = new Category({
            name,
            description,
        });
        await newCategory.save();
        return res.json({ message: "Category added succesfully" });
    } catch (error) {
        console.log(error);
    }
};

const getListCategory = async (req, res) => {
    try {
        let id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: false } });
        res.redirect("/admin/category");
    } catch (error) {
        res.redirect("/admin/adminError");
    }
};

const getUnlistCategory = async (req, res) => {
    try {
        let id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: true } });
        res.redirect("/admin/category");
    } catch (error) {
        res.redirect("/admin/adminError");
    }
};

const getEditCategory = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(req.query.id);

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).send("Category not found");
        }
        res.render("admin/edit-category", { category });
    } catch (error) {
        console.error(error);
        res.redirect("/adminError");
    }
};

const categoryAdd = async (req, res) => {
    try {
        res.render("admin/addCategory");
    } catch (error) {}
};

const editCategory = async (req, res) => {
    try {
        console.log("heyy", req.body);
        const id = req.params.id;
        const { name, description } = req.body;
        const exisitingCategory = await Category.findOne({ name: name });
        if (!exisitingCategory) {
            return res.status(400).json({ error: "Category exists,please choose another name" });
        }
        console.log(name, description);
        const updateCategory = await Category.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    name: name,
                    description: description,
                },
            },
            { new: true }
        );

        if (updateCategory) {
            console.log("hey");
            return res.status(200).json({ message: "Category edited" });
        } else {
            return res.status(404).json({ error: "Category not found" });
        }
    } catch (error) {
        console.log(error);
    }
};

const updateProductPricesWithCategoryOffer = async (categoryId, offerPercentage) => {
    try {
        const products = await Product.find({ category: categoryId });

        for (const product of products) {
            if (product.productOffer && product.productOffer > 0) {
                continue;
            }

            const discountAmount = (product.price * offerPercentage) / 100;
            const offerPrice = product.price - discountAmount;

            product.categoryOfferApplied = true;
            product.offerPrice = Math.round(offerPrice);

            await product.save();
        }
    } catch (error) {
        console.error("Error updating product prices with category offer:", error);
        throw error;
    }
};
const addCategoryOffer = async (req, res) => {
    try {
        const { categoryId, offerPercentage } = req.body;

        if (!categoryId || !offerPercentage) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const percentage = parseInt(offerPercentage);

        if (isNaN(percentage) || percentage < 1 || percentage > 90) {
            return res.status(400).json({ error: "Offer percentage must be between 1 and 90" });
        }

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        category.offer.discount_percentage = percentage;

        category.offerActive = true;

        await category.save();

        await updateProductPricesWithCategoryOffer(categoryId, percentage);

        return res.status(200).json({ success: true, message: "Category offer added successfully" });
    } catch (error) {
        console.error("Error adding category offer:", error);
        return res.status(500).json({ error: "Failed to add category offer" });
    }
};

const removeCategoryOffer = async (req, res) => {
    try {
        const { categoryId } = req.body;

        if (!categoryId) {
            return res.status(400).json({ error: "Category ID is required" });
        }

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        category.offer.discount_percentage = 0;

        await category.save();

        return res.status(200).json({ success: true, message: "Category offer removed successfully" });
    } catch (error) {
        console.error("Error removing category offer:", error);
        return res.status(500).json({ error: "Failed to remove category offer" });
    }
};



module.exports = {
    loadCategory,
    addCategory,
    getListCategory,
    getUnlistCategory,
    getEditCategory,
    categoryAdd,
    editCategory,
    addCategoryOffer,
    updateProductPricesWithCategoryOffer,
    removeCategoryOffer,
};
