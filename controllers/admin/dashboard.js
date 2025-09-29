const User = require('../../model/userSchema');
const Product = require('../../model/productSchema');
const Order = require('../../model/orderSchema');
const Category = require('../../model/categorySchema');
const PDFDocument = require("pdfkit");


const getStartDate = (period) => {
    const now = new Date();
    switch (period) {
        case 'weekly':
            const day = now.getDay(); 
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
            return new Date(now.setDate(diff));
        case 'monthly':
            return new Date(now.getFullYear(), now.getMonth(), 1);
        case 'yearly':
            return new Date(now.getFullYear(), 0, 1);
        default:
            return new Date(0);
    }
};

const generateSalesData = async (period = 'monthly') => {
    const now = new Date();

 
    let startDate;
    if (period === 'weekly') {
        const day = now.getDay(); 
        const diff = (day === 0 ? -6 : 1 - day);
        startDate = new Date(now);
        startDate.setDate(now.getDate() + diff);
        startDate.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'yearly') {
        startDate = new Date(now.getFullYear(), 0, 1);
    }

    console.log("Start date:", startDate);

   
    let orders = [];

    if (period === 'weekly') {
    
        orders = await Order.aggregate([
            { $match: { status: "delivered", Date: { $gte: startDate } } },
            { $unwind: "$product" },
            {
                $project: {
                    dayOfWeek: { $isoDayOfWeek: "$Date" }, // 1=Mon, 7=Sun
                    total: { $multiply: ["$product.quantity", "$product.price"] }
                }
            },
            {
                $group: {
                    _id: "$dayOfWeek",
                    sales: { $sum: "$total" }
                }
            }
        ]);
    } else {
       
        orders = await Order.aggregate([
            { $match: { status: "delivered", Date: { $gte: startDate } } },
            { $unwind: "$product" },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: { $multiply: ["$product.quantity", "$product.price"] } },
                    orderDates: { $push: "$Date" }
                }
            }
        ]);
    }

    let labels = [];
    let sales = [];

    if (period === 'weekly') {
        labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        sales = new Array(7).fill(0);

        orders.forEach(o => {
            sales[o._id - 1] = o.sales;
        });

        console.log("Weekly sales array:", sales);
    } else if (period === 'monthly') {
        const month = now.getMonth();
        const year = now.getFullYear();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        labels = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);
        sales = new Array(daysInMonth).fill(0);

        if (orders.length > 0) {
            orders[0].orderDates.forEach(date => {
                const day = new Date(date).getDate() - 1;
                if (day >= 0 && day < daysInMonth) {
                    sales[day] += orders[0].totalSales / orders[0].orderDates.length;
                }
            });
        }
    } else if (period === 'yearly') {
        labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        sales = new Array(12).fill(0);

        if (orders.length > 0) {
            orders[0].orderDates.forEach(date => {
                const month = new Date(date).getMonth();
                if (month >= 0 && month < 12) {
                    sales[month] += orders[0].totalSales / orders[0].orderDates.length;
                }
            });
        }
    }

    return { labels, sales };
};

const loadDashboard = async (req, res) => {
    try {
       
        const countUser = await User.countDocuments();
        const countProduct = await Product.countDocuments();
        const countOrder = await Order.countDocuments();

        const category = await Category.find({ isListed: true }).lean();
        
     
        const revenueOrder = await Order.aggregate([
            { $match: { status: "delivered" } },
            { $group: { _id: null, totalRevenue: { $sum: "$subtotal" } } },
        ]);
        const revenue = revenueOrder.length > 0 ? revenueOrder[0].totalRevenue : 0;

       
        const topCategories = await Order.aggregate([
            { $match: { status: "delivered" } },
            { $unwind: "$product" },
            {
                $group: {
                    _id: "$product.category",
                    itemsSold: { $sum: "$product.quantity" },
                    totalSales: { $sum: { $multiply: ["$product.quantity", "$product.price"] } },
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    categoryName: "$category.name",
                    itemsSold: 1,
                    totalSales: 1,
                },
            },
            { $sort: { totalSales: -1 } },
        ]);

      
        const topProducts = await Order.aggregate([
            { $match: { status: "delivered" } },
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "products",
                    localField: "product.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            { $unwind: "$productDetails" },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            {
                $group: {
                    _id: "$productDetails._id",
                    productName: { $first: "$productDetails.productName" },
                    categoryName: { $first: "$category.name" },
                    itemsSold: { $sum: "$product.quantity" },
                    totalSales: { $sum: { $multiply: ["$product.quantity", "$product.price"] } },
                },
            },
            { $sort: { totalSales: -1 } },
            { $limit: 5 },
        ]);

        const salesData = await generateSalesData("monthly");
        
        console.log("=== DASHBOARD CHART DATA ===");
        console.log("Labels:", salesData.labels);
        console.log("Sales:", salesData.sales);
        console.log("Labels length:", salesData.labels.length);
        console.log("Sales length:", salesData.sales.length);
        console.log("============================");

        res.render("admin/dashboard", {
            countUser,
            countProduct,
            countOrder,
            revenue,
            topCategories,
            topProducts,
            chartLabels: salesData.labels,
            chartSales: salesData.sales,
            category
        });

    } catch (err) {
        console.log("Dashboard Error:", err);
        res.status(500).send("Server Error");
    }
};

const filterGraph = async (req, res) => {
    try {
        const { period } = req.params;
        const data = await generateSalesData(period);
        res.json(data); 
    } catch (err) {
        console.log("Filter Graph Error:", err);
        res.status(500).json({ error: "Failed to fetch sales data" });
    }
};

module.exports = { loadDashboard, filterGraph };

// const pagination = async(req,res)=>{
//     const page = parseInt(req.query.page)|| 1;
//     const limit = 8;
//     let skip = (page-1)*limit;
//     const products = await Product.find().skip(skip).limit(limit).sort({createdAt:-1})
//     const totalProducts = await Product.countDocuments();
// const totalPages = Math.ceil(totalProducts / limit);

// }

// const search = req.query.search||"";
// const products = await Product.find({$or:[
//     {name:{$regex:query,$option:i}}
// ]})


// const page = parseInt(req.query.page) || 1;
// const limit = 8;
// const skip = (page - 1) * limit;
// const search = req.query.search || "";

// const query = search
//     ? { name: { $regex: search, $options: "i" } }  
//     : {};

// const products = await Product.find(query)
//     .skip(skip)
//     .limit(limit)
//     .sort({ createdAt: -1 });

// const totalProducts = await Product.countDocuments(query);
// const totalPages = Math.ceil(totalProducts / limit);

// res.json({ products, totalPages, currentPage: page });
