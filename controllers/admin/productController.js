const Product = require("../../model/productSchema");
const Category = require("../../model/categorySchema");
const User = require("../../model/userSchema");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const mongoose = require("mongoose");

const loadProducts = async (req, res) => {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = 2;
        const skip = (page - 1) * limit;

        const query = {};
        if (search.trim()) {
            query.productName = { $regex: search, $options: "i" };
        }

        const categories = await Category.find({});
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(query)
            .populate("category")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.render("admin/products", {
            products,
            categories,
            currentPage: page,
            totalPages,
            totalProducts,
            search,
        });
    } catch (error) {
        console.error("Error loading products:", error);
        res.status(500).render("admin/error", { message: "Failed to load products" });
    }
};

const toggleProductStatus = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        product.isBlocked = !product.isBlocked;
        await product.save();

        const statusMessage = product.isBlocked ? "unlisted" : "listed";

        return res.status(200).json({
            success: true,
            message: `Product has been ${statusMessage} successfully`,
            product,
        });
    } catch (error) {
        console.error("Error toggling product status:", error);
        return res.status(500).json({ success: false, message: "Failed to update product status" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        await Product.findByIdAndDelete(productId);
        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, message: "Failed to delete product" });
    }
};

const loadProductAddPage = async (req, res) => {
    try {
        const admin = req.session.admin;
        if (!admin) return res.redirect("/admin/addProduct");

        const category = await Category.find({ isListed: true });
        res.render("admin/addProduct", { cat: category });
    } catch (error) {
        console.log(error);
    }
};

const addProducts = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        

        if (!req.body.name || !req.body.description || !req.body.price || !req.body.originalPrice || !req.body.category) {
            return res.json({
                ok: false,
                msg: "Missing required fields",
            });
        }

        console.log(req.files, "Files");
        console.log(req.files.length, "Length");
        if (!req.files || req.files.length < 3) {
            return res.json({
                ok: false,
                msg: `At least 3 images are required. Received: ${req.files ? req.files.length : 0}`,
            });
        }

        const {
            name,

            color,
            description,
            price,
            originalPrice,
            category,
            availableSize,
        } = req.body;

        const availableSizes = JSON.parse(req.body.availableSize || "[]");
        const sizes = availableSizes.map((item) => ({
            size: item.size,
            quantity: parseInt(item.stock),
        }));

        const productExists = await Product.findOne({
            productName: name,
        });

        if (productExists) {
            return res.json({
                ok: false,
                msg: "Product already exists, please try with another name",
            });
        }

        const images = [];
        const uploadDir = path.join("public", "uploads", "product-images");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            console.log(`Processing file ${i + 1}:`, file.originalname, file.mimetype, file.size);

            const originalImagePath = file.path;
            const resizedImagePath = path.join(uploadDir, file.filename);

            try {
                await sharp(originalImagePath).resize({ width: 440, height: 440 }).toFile(resizedImagePath);

                images.push(file.filename);
                console.log(`Successfully processed image ${i + 1}: ${file.filename}`);
            } catch (imageError) {
                console.error(`Error processing image ${i + 1}:`, imageError);
                return res.json({
                    ok: false,
                    msg: `Error processing image ${i + 1}: ${imageError.message}`,
                });
            }
        }

        if (images.length < 3) {
            return res.json({
                ok: false,
                msg: `At least 3 images are required after processing. Processed: ${images.length}`,
            });
        }

        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
            return res.json({
                ok: false,
                msg: "Invalid category name",
            });
        }

        const finalAmount = parseFloat(price);
        console.log(images,'Images')
        const newProduct = new Product({
            productName: name,
            description: description,

            regularPrice: parseFloat(originalPrice),
            salePrice: parseFloat(price),
            finalamount: finalAmount,
            category: categoryDoc._id,
            sizes: sizes,
            color: color || "",
            productImage: images,
            status: "Available",
        });

        await newProduct.save();
        console.log("Product saved successfully with ID:", newProduct._id);

        return res.json({
            ok: true,
            msg: "Product added successfully!",
            red: "/admin/products",
            productId: newProduct._id,
        });
    } catch (error) {
        console.error("Error saving product:", error);
        return res.json({
            ok: false,
            msg: "An error occurred while adding the product: " + error.message,
        });
    }
};



const loadUpdatePage = async (req, res) => {
    try {
        const productId = req.params.id;
        const findAdmin = req.session.admin;

        if (!findAdmin) {
            return res.redirect("/admin/adminLogin");
        }

        const category = await Category.find({});
        const product = await Product.findById(productId).populate('category')

        if (!product) {
            return res.status(404).send("Product not found");
        }

        return res.render("admin/update", { product, category });
    } catch (error) {
        console.error("Error loading update page:", error);
        return res.status(500).send("Server error");
    }
};

const updateProduct = async (req, res) => {
    try {
        console.log(req.body, "hee");
        const productId = req.body.productId;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const {
            productName,
            description,
            regularPrice,
            salePrice,
            productOffer,
            category,
            status,
            sizes,
            quantities,
            existingImages = [],
            croppedImages = [],
        } = req.body;

        if (!productName || !description || !regularPrice || !salePrice || !category || !status) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }

        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ success: false, message: "Invalid category ID" });
        }
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({ success: false, message: "Category not found" });
        }

        const regPrice = parseFloat(regularPrice);
        const salPrice = parseFloat(salePrice);
        if (isNaN(regPrice) || regPrice <= 0) {
            return res.status(400).json({ success: false, message: "Regular price must be a positive number" });
        }
        if (isNaN(salPrice) || salPrice <= 0) {
            return res.status(400).json({ success: false, message: "Sale price must be a positive number" });
        }
        if (salPrice > regPrice) {
            return res.status(400).json({ success: false, message: "Sale price cannot be greater than regular price" });
        }

        const offer = parseFloat(productOffer) || 0;
        if (offer < 0 || offer > 100) {
            return res.status(400).json({ success: false, message: "Product offer must be between 0 and 100" });
        }

        const validStatuses = ["Available", "Out of Stock", "Discontinued"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid product status" });
        }

        if (!sizes || !quantities || sizes.length !== quantities.length || sizes.length === 0) {
            return res.status(400).json({ success: false, message: "At least one size variant with stock is required" });
        }

        const sizeVariants = [];
        let totalStock = 0;
        const uniqueSizes = new Set();

        for (let i = 0; i < sizes.length; i++) {
            const size = sizes[i].trim();
            const quantity = parseInt(quantities[i]) || 0;

            if (uniqueSizes.includes(size)) {
                return res.status(400).json({ success: false, message: "Duplicate sizes are not allowed" });
            }
            if (quantity < 0) {
                return res.status(400).json({ success: false, message: "Stock quantity cannot be negative" });
            }

            uniqueSizes.add(size);
            sizeVariants.push({ size, quantity });
            totalStock += quantity;
        }

        if (totalStock === 0) {
            return res.status(400).json({ success: false, message: "Total stock must be greater than 0" });
        }

        let productImages = [...existingImages];

        for (let i = 0; i < croppedImages.length; i++) {
            if (croppedImages[i]) {
                const base64Data = croppedImages[i].replace(/^data:image\/[a-z]+;base64,/, "");
                const buffer = Buffer.from(base64Data, "base64");
                const filename = `product_${Date.now()}_${i}.jpg`;
                const filePath = path.join(__dirname, "../public/Uploads/product-images", filename);

                await sharp(buffer)
                    .resize({ width: 440, height: 440, fit: "cover" })
                    .jpeg({ quality: 80 })
                    .toFile(filePath);

                productImages.push(filename);
            }
        }

        const imagesToRemove = product.productImage.filter((img) => !existingImages.includes(img));
        for (const img of imagesToRemove) {
            const filePath = path.join(__dirname, "../public/Uploads/product-images", img);
            try {
                await fs.unlink(filePath);
            } catch (err) {
                console.error(`Failed to delete image ${img}:`, err);
            }
        }

        if (productImages.length === 0) {
            return res.status(400).json({ success: false, message: "At least one product image is required" });
        }

        product.productName = productName.trim();
        product.description = description.trim();
        product.regularPrice = regPrice;
        product.salePrice = salPrice;
        product.productOffer = offer;
        product.category = category;
        product.status = status;
        product.sizes = sizeVariants;
        product.productImage = productImages;
        product.updatedAt = Date.now();

        await product.save();
        return res.redirect("/admin/products");
    } catch (error) {
        console.error("Error updating product:", error);
    }
};

module.exports = {
    loadProductAddPage,
    addProducts,
    loadProducts,
    toggleProductStatus,
    deleteProduct,
    loadUpdatePage,
    updateProduct,
};

