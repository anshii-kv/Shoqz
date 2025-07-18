const User = require("../../model/userSchema");

const user = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search || "";

        let query = {};

        if (searchQuery) {
            query = {
                $or: [
                    { name: { $regex: searchQuery, $options: "i" } },
                    { email: { $regex: searchQuery, $options: "i" } },
                    { phone: { $regex: searchQuery, $options: "i" } },
                ],
            };
        }

        const totalCustomers = await User.countDocuments(query);

        const totalPages = Math.ceil(totalCustomers / limit);

        const data = await User.find(query).skip(skip).limit(limit).sort({ name: 1 });

        res.render("admin/customer", {
            data,
            currentPage: page,
            totalPages,
            totalCustomers,
            searchQuery,
            showing: {
                start: totalCustomers > 0 ? skip + 1 : 0,
                end: Math.min(skip + limit, totalCustomers),
                total: totalCustomers,
            },
        });
    } catch (error) {
        console.error("hii", error);
        res.status(500).send("Server Error");
    }
};

const blockCustomer = async (req, res) => {
    try {
        let id = req.query.id;
        await User.findOneAndUpdate({ _id: id }, { $set: { isBlocked: true } });
        res.redirect("/admin/user");
    } catch (error) {
        console.log("hello", error);
    }
};

const unblockCustomer = async (req, res) => {
    try {
        let id = req.query.id;
        await User.findOneAndUpdate({ _id: id }, { $set: { isBlocked: false } });
        res.redirect("/admin/user");
    } catch (error) {
        console.log(error);
    }
};

module.exports = { user, blockCustomer, unblockCustomer };
