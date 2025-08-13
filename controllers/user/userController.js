const User = require("../../model/userSchema");
const Otp = require("../../model/otpSchema");
const bcrypt = require("bcrypt");
const sendEmail = require("../../emailService/sendEmail");
const Categories = require("../../model/categorySchema");
const Product = require("../../model/productSchema");
const Cart = require("../../model/cartSchema");
const Address = require("../../model/addressSchema");
const Order = require("../../model/orderSchema");
const mongoose = require("mongoose");
const Coupon = require("../../model/couponSchema");
const Wishlist = require("../../model/wishlistSchema");
const Category = require("../../model/categorySchema");
const { verifyPayment } = require("./orderController");
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000);
}

const loadHomepage = async (req, res) => {
    try {
        const products = await Product.find({ isBlocked: false }).limit(4);
        console.log(products,"hwy home");
        
        return res.render("home", { products });
    } catch (error) {
        console.error("Error loading homepage:", error);
        res.status(500).send("Server error");
    }
};

const loadContact = async (req, res) => {
    try {
        return res.render("contact");
    } catch (error) {
        res.status(500).send("Server error");
    }
};

const loadAboutpage = async (req, res) => {
    try {
        return res.render("about");
    } catch (error) {
        res.status(500).send("Server error");
    }
};

const pageNotfound = async (req, res) => {
    try {
        res.render("page-404");
    } catch {
        res.redirect("/pageNotfound");
    }
};

const loadSignuppage = async (req, res) => {
    try {
        return res.render("signup");
    } catch (error) {
        res.status(500).send("Server error");
    }
};

const signup = async (req, res) => {
    try {
        const { name, email, phone, password, cpassword } = req.body;

      

        if (!name || !email || !password || !cpassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password != cpassword) {
            console.log("password doesn't match");
            return res.status(400).json({ message: "Passwords don't match" });
        }
        const existUser = await User.findOne({ email });

        if (existUser) {
            console.log("user already exist");
            return res.status(400).json({ message: "User already  exist" });
        }

        const otp = generateOtp();
        console.log("OTP", otp);
        await Otp.updateOne(
            { email },
            {
                $set: {
                    otp: otp,
                    createdAt: new Date(),
                },
            },
            { upsert: true }
        );

        await sendEmail({
            to: email,
            subject: "Signup Verification",
            text: "Otp",
            html: `Your otp is ${otp}`,
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        req.session.email = email;
        req.session.name = name;
        req.session.phone = phone;
        req.session.password = hashedPassword;
        req.session.userData = {
            email,
            name,
            phone,
            hashedPassword,
        };
        return res.status(200).json({ message: "Successful" });
    } catch (error) {
        console.error("Error for save user", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
};

const loadVerifyOtp = async (req, res) => {
    try {
        res.render("verifyOtp");
    } catch (error) {
        res.status(500).send("Server error");
    }
};

const verifiedOtp = async (req, res) => {
    try {
        const otp = Number(req?.body?.otp);
        const email = req.session.email;
        const name = req.session.name;
        const password = req.session.password;
        const phone = req.session.phone;
        const existOtp = await Otp.findOne({ email });

        if (existOtp?.otp === otp) {
            const savedata = new User({
                name: name,
                email: email,
                phone: phone,
                password: password,
            });

            await savedata.save();
            console.log("added user");
            return res.status(200).json({ message: "otp verified" });
        } else {
            return res.status(400).json({ message: "otp not valid" });
        }
    } catch (error) {
        console.log("error on verify otp", error);
    }
};

const loadloginpage = async (req, res) => {
    try {
        return res.render("login");
    } catch (error) {
        res.status(500).send("Server error");
    }
};

const login = async (req, res) => {
    try {
        console.log(req.body);
        const { email, password } = req.body;
        const userMatch = await User.findOne({ email, isAdmin: false });
        if (!userMatch) {
            return res.status(200).json({ message: "User not found" });
        }
        const isPasswordVaild = await bcrypt.compare(password, userMatch.password);
        if (!isPasswordVaild) {
            return res.status(200).json({ message: "Password does not match" });
        }
        if (userMatch.isBlocked) {
            return res.status(200).json({ message: "User blocked by admin" });
        }
        req.session.name = userMatch.name;
        console.log("Usermathc", userMatch);
        req.session.userId = userMatch._id;
        console.log(req.session.userId, "Iddlfsd");
        req.session.email = userMatch.email;
        console.log(req.session.name, "name");
        console.log(req.session.email,'Poga')
        return res.status(200).json({ message: "Login Succesfully" });
    } catch (error) {
        console.log("error");
    }
};

const verifyOtp = async (req, res) => {
    try {
        const otp = Number(req?.body?.otp);
        const email = req.session.email;
        const name = req.session.name;
        const password = req.session.password;
        const phone = req.session.phone;
        const existOtp = await Otp.findOne({ email });
        console.log(existOtp, "hello");

        if (existOtp?.otp === otp) {
            const savedata = new User({
                name: name,
                email: email,
                phone: phone,
                password: password,
            });

            await savedata.save();
            console.log("added user");
            return res.status(200).json({ message: "otp verified" });
        } else {
            return res.status(400).json({ message: "otp not valid" });
        }
    } catch (error) {
        console.log("error on verify otp", error);
    }
};

const resendOtp = async (req, res) => {
    try {
        console.log(req.session.email);
        const email = req.session.email;
        const existEmail = await Otp.findOne({ email });
        const otpp = generateOtp();
        if (existEmail) {
            existEmail.otp = otpp;
            await existEmail.save();
        } else {
            const saveddata = new Otp({
                otpp: otpp,
                email: email,
            });
            await saveddata.save();
        }
    } catch (error) {
        res.status(500).send("Server error");
    }
};

const logout = async (req, res) => {
    try {
        console.log("ghyt");
        
        req.session.name = null;
        req.session.phone = null;
        req.session.password = null;
        req.session.email = null;
        return res.redirect("/login");
    } catch (error) {
        res.status(500).send("Server error");
    }
};

const loadForgotpassword = async (req, res) => {
    try {
        return res.render("forgotpassword");
    } catch (error) {
        res.status(500).send("Server error");
    }
};

const loadForgot = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            console.log("email not found");
        }
        console.log(email);
        const usermatch = await User.findOne({ email });
        console.log(usermatch);
        req.session.email = email;
        if (!usermatch) {
            return res.status(400).json({ message: "email not found" });
        }
        const otp = generateOtp();
        await sendEmail({
            to: email,
            subject: "Signup Verification",
            text: "Otp",
            html: `Your otp is ${otp}`,
        });
        const otpsave = new Otp({
            email: email,
            otp: otp,
        });
        await otpsave.save();
        return res.status(200).json({ message: "otp sended to email" });
    } catch (error) {
        console.log(error, "error duing verifying email for forgototp");
    }
};

const loadforgotpasswordotp = async (req, res) => {
    try {
        res.render("forgotpasswordotp");
    } catch (error) {
        console.log(error);
    }
};

const loadSignuppOtp = async (req, res) => {
    try {
        res.render("signupOtp");
    } catch (error) {
        console.log(error, "error");
    }
};

const loadverifyforgototp = async (req, res) => {
    try {
        const email = req.session.email;
        const otp = req.body.otp;
        [];
        const findotp = await Otp.findOne({ email });
        console.log(typeof findotp.otp, typeof otp);
        if (findotp.otp == Number(otp)) {
            return res.status(200).json({ message: "otp verified" });
        }
        return res.status(400).json({ message: "otp not verified" });
    } catch (error) {}
};

const loadchangepassword = async (req, res) => {
    try {
        res.render("changepassword");
    } catch (error) {
        console.log(error);
    }
};

const changepassword = async (req, res) => {
    try {
        console.log("heyyy");

        const email = req.session.email;
        const password = req.body.password;

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed Password:", hashedPassword);
        await User.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } }, { new: true });
        res.status(200).json({ message: "password changed" });
    } catch (error) {
        console.log("its an error", error);
        res.status(500).send("Server error");
    }
};

const getShopPage = async (req, res) => {
    try {
        console.log(req.query);

        const searchQuery = req.query.search || "";
        const selectedCategory = req.query.category || "";
        const sortBy = req.query.sort || "latest";
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : "";
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : "";
        const page = parseInt(req.query.page) || 1;
        const limit = 12; 
        const skip = (page - 1) * limit;

        let filter = { isBlocked: false };

        
        if (searchQuery.trim()) {
            filter.productName = { $regex: searchQuery.trim(), $options: "i" };
        }

 
        if (selectedCategory) {
            filter.category = selectedCategory;
        }

   
        if (minPrice !== "" || maxPrice !== "") {
            filter.finalamount = {};
            if (minPrice !== "" && minPrice >= 0) {
                filter.finalamount.$gte = minPrice;
            }
            if (maxPrice !== "" && maxPrice >= 0) {
                filter.finalamount.$lte = maxPrice;
            }

          
            if (minPrice !== "" && maxPrice !== "" && minPrice > maxPrice) {
                return res.render("shop", {
                    title: "Shop",
                    products: [],
                    categories: await Categories.find({ isListed: false }),
                    category: selectedCategory,
                    currentPage: 1,
                    totalPages: 1,
                    paginationUrl: "/shop?",
                    selectedCategory: selectedCategory,
                    sortBy: sortBy,
                    searchQuery: searchQuery,
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    error: "Minimum price cannot be greater than maximum price",
                });
            }
        }

      
        let sortOptions = {};
        switch (sortBy) {
            case "priceLow":
                sortOptions = { finalamount: 1 };
                break;
            case "priceHigh":
                sortOptions = { finalamount: -1 };
                break;
            case "nameAZ":
                sortOptions = { productName: 1 };
                break;
            case "nameZA":
                sortOptions = { productName: -1 };
                break;
            case "latest":
            default:
                sortOptions = { createdAt: -1 };
                break;
        }

       
        const [categories, totalProducts, products] = await Promise.all([
            Categories.find({ isListed: false }).lean(),
            Product.countDocuments(filter),
            Product.find(filter)
                .populate("category", "name categoryOffer") 
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
        ]);

        const totalPages = Math.ceil(totalProducts / limit) || 1;

        let paginationUrl = "/shop?";
        const queryParams = [];

        if (searchQuery.trim()) queryParams.push(`search=${encodeURIComponent(searchQuery.trim())}`);
        if (selectedCategory) queryParams.push(`category=${selectedCategory}`);
        if (sortBy !== "latest") queryParams.push(`sort=${sortBy}`);
        if (minPrice !== "") queryParams.push(`minPrice=${minPrice}`);
        if (maxPrice !== "") queryParams.push(`maxPrice=${maxPrice}`);

        paginationUrl += queryParams.join("&");
        if (queryParams.length > 0) paginationUrl += "&";

        const processedProducts = products.map((product) => {
            let categoryOffer = 0;

      
            if (product.category && typeof product.category === "object") {
                categoryOffer = product.category.categoryOffer || 0;
            }

      
            const productOffer = product.productOffer || 0;
            const bestOffer = Math.max(productOffer, categoryOffer);

    
            let finalAmount = product.finalamount;
            if (!finalAmount && bestOffer > 0) {
                finalAmount = product.salePrice * (1 - bestOffer / 100);
            } else if (!finalAmount) {
                finalAmount = product.salePrice;
            }

            return {
                ...product,
                categoryoffer: categoryOffer,
                finalamount: Math.round(finalAmount * 100) / 100, 
            };
        });

        res.render("shop", {
            title: "Shop",
            products: processedProducts,
            categories: categories,
            category: selectedCategory,
            currentPage: page,
            totalPages: totalPages,
            paginationUrl: paginationUrl,
            selectedCategory: selectedCategory,
            sortBy: sortBy,
            searchQuery: searchQuery,
            minPrice: minPrice,
            maxPrice: maxPrice,
            totalProducts: totalProducts, 
        });
    } catch (error) {
        console.error("Error in shop page controller:", error);
        res.status(500).render("user/error", {
            title: "Error",
            message: "Something went wrong. Please try again later.",
        });
    }
};

const loadProductDetails = async (req, res,next) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId).populate("category");
        if (!product) {
            return res.status(404).render("error", {
                message: "Product not found",
                user: req.session.user ? await User.findById(req.session.user) : null,
            });
        }

        const userData = req.session.user ? await User.findById(req.session.user):null;

        const relatedProducts = await Product.find({
            category: product.category._id,
            _id: { $ne: productId },
            isListed: true,
            isBlocked: false,
        })
            .limit(4)
            .lean();

        res.render("productDetails", {
            product: product.toObject(),
            user: userData,
            relatedProducts,
            currentPage: "product details",
        });
    } catch (err) {
        next(err)
        // console.error("Error loading product details:", err);
        // res.status(500).render("er  ror", { 
        //     message: "Error loading product details",
        //     user: req.session.user ? await User.findById(req.session.user) : null,
        // });
    }
};

const addToCart = async (req, res) => {
    console.log("hello anshii");
    try {
        let responseData;
        const { userId } = req.session;


        if (!userId) {
            responseData = { session: false, error: "Please login first" };
        } else {
            const userdata = await User.findOne({ _id: userId });
            if (!userdata) {
                responseData = { session: false, error: "User not found" };
            } else {
                const { productId, size, quantity } = req.body;
                console.log(req.body);

                if (!productId || !size || !quantity) {
                    responseData = {
                        success: false,
                        error: "Product ID, size, and quantity are required",
                    };
                } else {
                    const requestedQuantity = parseInt(quantity, 10);

                    if (requestedQuantity < 1 || requestedQuantity > 4) {
                        responseData = {
                            success: false,
                            error: "Quantity must be between 1 and 4",
                        };
                    } else {
                        const productdata = await Product.findById(productId);

                        if (!productdata || productdata.isBlocked) {
                            responseData = {
                                quantity: false,
                                error: "Product not found or unavailable",
                            };
                        } else {
                            const sizeInfo = productdata.sizes.find((s) => s.size === size);
                            if (!sizeInfo || sizeInfo.quantity === 0) {
                                responseData = {
                                    quantity: false,
                                    error: `Size ${size} is out of stock`,
                                };
                            } else {
                                const existingproduct = await Cart.findOne({
                                    userId: userId,
                                    "product.productId": productId,
                                    "product.size": size,
                                });

                                if (existingproduct) {
                                    const currentProduct = existingproduct.product.find(
                                        (p) => p.productId == productId && p.size === size
                                    );

                                    const newQuantity = currentProduct.quantity + requestedQuantity;

                                    if (newQuantity > 4) {
                                        responseData = {
                                            success: false,
                                            error: "Quantity limit exceeded. Maximum 4 items allowed per product size.",
                                        };
                                    } else if (newQuantity > sizeInfo.quantity) {
                                        responseData = {
                                            success: false,
                                            error: `Only ${sizeInfo.quantity} items available in stock for size ${size}`,
                                        };
                                    } else {
                                        const currentPrice = productdata.salePrice || productdata.regularPrice;

                                        const updatedCart = await Cart.findOneAndUpdate(
                                            {
                                                userId: userId,
                                                "product.productId": productId,
                                                "product.size": size,
                                            },
                                            {
                                                $inc: { "product.$.quantity": requestedQuantity },
                                                $set: {
                                                    "product.$.price": currentPrice,
                                                    "product.$.total": currentPrice * newQuantity,
                                                },
                                            },
                                            { new: true }
                                        );

                                        responseData = {
                                            success: true,
                                            stock: true,
                                            message: "Product quantity updated in cart",
                                            updatedCart,
                                        };
                                    }
                                } else {
                                    if (requestedQuantity > sizeInfo.quantity) {
                                        responseData = {
                                            success: false,
                                            error: `Only ${sizeInfo.quantity} items available in stock for size ${size}`,
                                        };
                                    } else {
                                        const currentPrice = productdata.salePrice || productdata.regularPrice;

                                        const cartdata = await Cart.findOneAndUpdate(
                                            {
                                                userId: userId,
                                            },
                                            {
                                                $set: { userId: userId },
                                                $push: {
                                                    product: {
                                                        productId: productId,
                                                        name: productdata.productName,
                                                        price: currentPrice,
                                                        Category: productdata.category,
                                                        quantity: requestedQuantity,
                                                        total: currentPrice * requestedQuantity,
                                                        size: size,
                                                    },
                                                },
                                            },
                                            { upsert: true, new: true }
                                        );

                                        responseData = {
                                            success: true,
                                            stock: true,
                                            message: "Product added to cart successfully",
                                            cartdata,
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        console.log("hihelo");

        return res.json(responseData);
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

const loadCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        console.log("Cart Load - userId:", userId);

        if (!userId) {
            return res.redirect("/login");
        }

        const cartData = await Cart.findOne({ userId: userId }).populate("product.productId");

        if (!cartData || cartData.product.length === 0) {
            return res.render("cart", {
                cartdata: null,
                subtotal: 0,
                total: 0,
                user: userId,
                messages: { message: "Your cart is empty." },
            });
        }

        cartData.product = cartData.product.filter((item) => item.productId && item.quantity > 0);
        console.log(cartData, "HEYYYYYY");

        if (cartData.product.length === 0) {
            return res.render("cart", {
                cartdata: null,
                subtotal: 0,
                total: 0,
                user: userId,
                messages: { message: "Your cart is empty." },
            });
        }

        let subtotal = 0;
        let total = 0;

        cartData.product.forEach((item) => {
            const product = item.productId;
            const quantity = item.quantity;
            const price = product.salePrice || product.regularPrice;
            const itemTotal = price * quantity;

            subtotal += itemTotal;
            total += itemTotal;
        });

        console.log("Subtotal:", subtotal);
        console.log("Total:", total);
        console.log("anshi", cartData);
        res.render("cart", {
            cartdata: cartData,
            subtotal,
            total,
            user: userId,
        });
    } catch (err) {
        console.error("Error in loadCart:", err);
        res.status(500).send("Server Error");
    }
};

const updateQuantity = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Please log in to update cart" });
        }

        const { productId, count } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.json({ success: false, error: "Invalid product ID" });
        }
        if (!Number.isInteger(count) || (count !== 1 && count !== -1)) {
            return res.json({ success: false, error: "Invalid count value" });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.json({ success: false, error: "Cart not found" });
        }

        const cartItem = cart.product.find((item) => item.productId.toString() === productId);
        if (!cartItem) {
            return res.json({ success: false, error: "Item not found in cart" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.json({ success: false, error: "Product not found" });
        }

        const selectedSize = product.sizes.find((s) => s.size === cartItem.size);
        if (!selectedSize) {
            return res.json({ success: false, error: "Selected size not available" });
        }

        if (count === -1 && cartItem.quantity <= 1) {
            return res.json({ success: false, error: "Quantity cannot be decreased further." });
        }

        if (count === 1 && cartItem.quantity + 1 > selectedSize.quantity) {
            return res.json({ success: false, error: `Only ${selectedSize.quantity} items in stock.` });
        }
if (count === 1 && cartItem.quantity + 1 > 4) {
    return res.json({ 
        success: false, 
        error: "Quantity must be between 1 and 4." 
    });
}

        cartItem.quantity += count;
        cartItem.total = cartItem.price * cartItem.quantity;

        await cart.save();

        return res.json({
            success: true,
            quantity: cartItem.quantity,
            itemTotal: cartItem.total.toFixed(2),
        });
    } catch (error) {
        console.error("Error in updateCartQuantity:", error.message);
        return res.status(500).json({ success: false, error: "Error updating cart" });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Please log in to update cart" });
        }

        const { productId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.json({ success: false, error: "Invalid product ID" });
        }

        const result = await Cart.findOneAndUpdate(
            { userId },
            { $pull: { product: { productId: productId } } },
            { new: true }
        );

        if (!result) {
            return res.json({ success: false, error: "Cart or item not found" });
        }

        let subtotal = 0;
        if (result.product.length > 0) {
            const populatedCart = await Cart.findOne({ userId }).populate("product.productId");
            populatedCart.product.forEach((item) => {
                const product = item.productId;
                const quantity = item.quantity;
                const price = Product.salePrice || Product.regularPrice;
                subtotal += price * quantity;
            });
        }

        return res.json({
            success: true,
            message: "Item removed from cart",
            cartEmpty: result.product.length === 0,
            subtotal: subtotal.toFixed(2),
        });
    } catch (error) {
        console.error("Error in removeFromCart:", error.message);
        return res.json({ success: false, error: "Error removing item" });
    }
};

const loadCheckout = async (req, res) => {
  try {
 
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }

    const userId = req.session.userId;

    
    const cartData = await Cart.findOne({ userId }).populate('product.productId');

    if (!cartData || !cartData.product || cartData.product.length === 0) {
      return res.render('checkout', {
        cartItems: [],
        shippingCharge: 0,
        coupondiscount: 0,
        subtotal: 0,
        userAddresses: [],
        defaultAddress: null
      });
    }

  
    const subtotal = cartData.product.reduce((sum, item) => sum + item.total, 0);

   
    const addressData = await Address.findOne({ user: userId });
    const userAddresses = addressData ? addressData.address : [];
    const defaultAddress = userAddresses.find(addr => addr.isDefault) || null;

   
    res.render('checkout', {
      cartItems: cartData.product,
      shippingCharge: cartData.shippingCharge || 0,
      coupondiscount: cartData.coupondiscount || 0,
      subtotal,
      userAddresses,
      defaultAddress
    });

  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).send("Internal Server Error");
  }
};






const coupon = async (req, res) => {
    try {
        const { couponCode } = req.body;
    } catch (error) {}
};


const wishlist = async (req, res) => {
    try {
        console.log("hiiiii");
        
        const user = req.session.userId;
        console.log(user,"aloo userr");
        
        const wishlist = await Wishlist.find({userId:user})
        console.log(wishlist,"here my wishlist");
        
       res.render("wishlist",{wishlistdata:wishlist})  
    } catch (error) {}
};





const addToWishlist = async (req, res) => {
  try {
    const { size, productId } = req.body;

    const user = req.session.userId;
    console.log(user,"userId not");
    

    const product = await Product.findById(productId);
    console.log(product,"here is the products");
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }


    const selectedSizeObj = product.sizes.find(s => s.size === size);

    if (!selectedSizeObj) {
      return res.status(400).json({ success: false, message: 'Selected size not available for this product' });
    }
    console.log('Selected Size:', selectedSizeObj);

   
   const existProduct = await Wishlist.findOne({productId:product})
   if(existProduct){
    return res.status(400).json({success:false,message:"Product already exists in the wishlist"})
   }


   const wishlistItem = new Wishlist({
      userId: req.session.userId,
      productId: product._id,
      productName: product.productName,
      regularPrice: product.regularPrice,
      salePrice: product.salePrice,
      sizes: [selectedSizeObj], 
      productImage: product.productImage
    });

   
    await wishlistItem.save();

    res.json({ success: true, message: 'Added to wishlist', data: wishlistItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



const wishlistaddToCart = async(req,res)=>{
    try {
        // console.log(req.body,"helo sir");
        const{productId,size,quantity}=req.body
        const user = req.session.userId
        const wishlist = await Wishlist.findOne({productId:productId,userId:user})
        // console.log(wishlist,"i love you");
        const products = await Product.findById(productId)
         let existingCartItem= await Cart.findOne({ userId:user,
            "product.productId": productId,
            "product.size": size})
            if(existingCartItem){
                console.log(existingCartItem,"mealso");
                
                return res.status(400).json({success:false,message:"product already exists in the cart"})
            }
    //console.log(products._id,products.productName,products.category,products.regularPrice,products.finalamount,size,quantity,"sinan");
       // console.log(req.session.user,"hey user are you there");
       let cart = await Cart.findOne({userId:user});
       if(!cart){
        cartItem= new Cart({
            userId:user,
            product:[]
        });
       }
          cartItem.product.push({
            productId: products._id,
            name: products.productName,
            Category: products.category,
            price: products.regularPrice,
            total: products.finalamount,
            size: size,
            quantity: quantity
        });
         await cartItem.save()
         await Wishlist.deleteOne({ productId, userId: user });
          res.json({success:true,message:"item added to cart"})
        
        // console.log(cartItem,"can you please show me the cart items here");

        
       
        // console.log("ashmikapp");
        
       
      
        
    } catch (error) {
        
    }
}

const paymentFailed= async(req,res)=>{
    try {
        console.log(req.body,"payemnt datas here");
        
    } catch (error) {
        
    }
}



// const wishlistaddToCart = async(req,res)=>{
//     try {
//         console.log(req.body,"helo sir");
//         const{productId}=req.body
//         const user = req.session.userId
//         const product = await Wishlist.findOne({productId:productId,userId:user})
//         console.log(product,"i love you");
//         console.log(product._id,product.productName,product.description,product.category,product.regularPrice,product.finalamount,product.productImage,"product details");
//         const products = await Product.findById(productId)
//         console.log(products,"sharun");
        
//         const cartItem = new Cart({
//             userId:req.session.user,
//             product:[{

//                 productId:products._id,
//                 productName:products.productName,
//                 description:products.description,
//                 category:products.category,
//                 regularPrice:products.regularPrice,
//                 finalamount:products.finalamount,
//                 productImage:products.productImage,
//                 size:sizes.size
//          } ],
//         })
//         console.log(cartItem,"can you please show me the cart items here");
        
//         await cartItem.save()
//         res.json({success:true,message:"item added to cart"})
      
        
//     } catch (error) {
//        console.error(error);
//         res.status(500).json({ success: false, message: "Server error" }); 
//     }
// }



const loadProfile = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId).lean();
        res.render("profile", { user });
    } catch (error) {
        console.error(error);
        res.redirect("/error");
    }
};

const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone } = req.body;

        if (!userId) return res.status(400).json({ success: false, message: "Unauthorized" });

        await User.findByIdAndUpdate(userId, { name, phone });

        return res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Profile update error:", error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};
// apply coupon
// const applycoupon = async (req, res) => {
//   try {
//     const couponId = req.body.id;

//     const userId = req.session.userId;

//     const currentdate = new Date();

//     const coupondata = await Coupon.findOne({
//       _id: couponId,
//       expiryDate: { $gt: currentdate },
//     });

//     const Exist = coupondata.useduser.includes(userId);

//     if (!Exist) {
//       const existingcart = await Cart.findOne({ user: userId });

//       if (existingcart && existingcart.coupondiscount == null) {
//         const adduser = await Coupon.findByIdAndUpdate(
//           { _id: couponId },
//           { $push: { useduser: userId } }
//         );

//         const addcart = await Cart.findOneAndUpdate(
//           { user: userId },
//           { $set: { coupondiscount: coupondata._id } }
//         );

//         res.json({ coupon: true ,coupondata });
//       } else {
//         res.json({ coupon: "Already Applied" });
//       }
//     } else {
//       res.json({ coupon: "AlreadyUsed" });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const loadEditProfile = async (req, res) => {
    try {
        res.render("editProfile");
    } catch (error) {}
};

const editProfile = async (req, res) => {
    try {
        const { userId, name, phone } = req.body;

        if (!userId) return res.status(200).json({ success: false, message: "Unauthorized" });

        await User.findByIdAndUpdate({ userId }, { name, phone });

        return res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Profile update error:", error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

const changePassword = async (req, res) => {
    try {
        res.render("changepass");
    } catch (error) {}
};
const postChangePass = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const loadThankyou = async (req, res) => {
    try {
        const id = req.query.orderId;
        const orderData = await Order.findById(id);
        console.log(id);

        if (!orderData) {
            return res.status(404).send("Order not found");
        }

        res.render("thankyou", { order: orderData });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

const transactionHistory = async (req, res) => {
    try {
        res.render("transactionHistory");
    } catch (error) {}
};


const applyCoupon = async(req,res)=>{
    try {
       const coupons = await Coupon.find({status:'active'});
       res.json({success:true,coupons:coupons})
        
    } catch (error) {
        
    }
}

const coupons = async(req,res)=>{
    try {
        const { couponCode } = req.body;
        const userId = req.session.user?._id;
        const subtotal = req.session.subtotal; 

        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), status: 'active' });

        if (!coupon) {
            return res.json({ success: false, message: 'Coupon not found or inactive' });
        }

        const now = new Date();
        if (now > coupon.expireOn) {
            return res.json({ success: false, message: 'Coupon has expired' });
        }

        if (subtotal < coupon.minimumPurchase || subtotal > coupon.maximumPurchase) {
            return res.json({
                success: false,
                message: `Order must be between ₹${coupon.minimumPurchase} and ₹${coupon.maximumPurchase}`
            });
        }

        if (coupon.userId.includes(userId)) {
            return res.json({ success: false, message: 'You have already used this coupon' });
        }

       
        let discount = 0;
        if (coupon.discountType === 'fixed') {
            discount = coupon.offerPrice;
        } else if (coupon.discountType === 'percentage') {
            discount = Math.floor((subtotal * coupon.discountPercentage) / 100);
        }

        
        await Coupon.updateOne(
            { _id: coupon._id },
            { $push: { userId: userId } }
        );

        return res.json({
            success: true,
            discount,
            freeShipping: false, 
            message: `Coupon applied. You saved ₹${discount}`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
module.exports = {
    loadHomepage,
    loadContact,
    loadAboutpage,
    pageNotfound,
    loadSignuppage,
    signup,
    loadVerifyOtp,
    loadloginpage,
    login,

    verifyOtp,
    verifiedOtp,
    resendOtp,
    logout,
    loadForgotpassword,
    loadForgot,
    loadforgotpasswordotp,
    loadverifyforgototp,
    loadchangepassword,
    changepassword,
    getShopPage,
    loadProductDetails,
    loadCart,
    addToCart,
    loadSignuppOtp,
    updateQuantity,
    removeFromCart,
    loadCheckout,

    loadProfile,
    loadEditProfile,
    updateProfile,
    editProfile,
    changePassword,
    postChangePass,
    loadThankyou,
    transactionHistory,
    coupon,
    wishlist,
    applyCoupon,
    coupons,
    addToWishlist,
    wishlistaddToCart,
    verifyPayment,
    paymentFailed,
};
