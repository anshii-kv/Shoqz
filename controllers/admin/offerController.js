

const Product = require("../../model/productSchema");
const productOffer = require("../../model/productOffer");
const Category=require("../../model/categorySchema");
const Offer = require("../../model/productOffer")
const CategoryOffer = require('../../model/categoryOffer')


const productOfferget = async(req,res)=>{
  try {
    console.log("ho");
    const offers = await productOffer.find().populate('product')
    console.log(offers,"off");
    const products = await Product.find({})
    const countOffers = await Offer.countDocuments()
    const now = new Date();
    const activeOffers = offers.filter(a=>!a.expires || a.expires>now)
  
   
    const expiringOffers = activeOffers.filter(o => {
      if (!o.expires) return false;
      const diff = (o.expires - now) / (1000 * 60 * 60 * 24); 
      return diff <= 3; 
    });

    
    const averageDiscount = activeOffers.length > 0 
      ? (activeOffers.reduce((sum, o) => sum + o.offer, 0) / activeOffers.length).toFixed(2)
      : 0;

    const stats = {
      activeOffers: activeOffers.length,
      expiringOffers: expiringOffers.length,
      averageDiscount
    };
    res.render('admin/productOffer',{offers,products,countOffers,stats})
  } catch (error) {
    res.status(500).send("Server errorRRR")
  }
}
// const updateProductOffer = async (req, res) => {
//   try {
//     console.log(req.body,"offerparams");
//     const{product,offer,expires}=req.body;
//     const productId=await Product.findById(product)
//     console.log(productId,"i");
//     const newOffer = new productOffer({
//          product:productId,
//       offer:Number(offer),
//       expires:expires? new Date(expires):undefined
//     })
//     console.log(newOffer,"eeeeeeeeeeeeeeeeeeeeeeee");
    
//     await newOffer.save();
//     console.log("5555555555555555555555555555");
    
//     productId.productOffer = newOffer._id;
//     await productId.save();
   
 
    
//     res.status(200).json({success: true, message: "Product offer updated successfully",  product  });
//   } catch (error) {
//     console.error("Error updating product offer:", error);
//     res.status(500).json({ success: false, message: "Server error while updating offer" });
//   }
// };
    
   const updateProductOffer = async (req, res) => {
  try {
    console.log(req.body, "offerparams");
    const { product, offer, expires } = req.body;

    // Find the product
    const productDoc = await Product.findById(product).populate("productOffer");
    if (!productDoc) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // If product already has a productOffer, update it
    if (productDoc.productOffer) {
      const updatedOffer = await productOffer.findByIdAndUpdate(
        productDoc.productOffer._id,
        {
          offer: Number(offer),
          expires: expires ? new Date(expires) : undefined,
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Product offer updated successfully",
        product: productDoc._id,
        offer: updatedOffer,
      });
    }

    // Otherwise, create a new one
    const newOffer = new productOffer({
      product: productDoc._id,
      offer: Number(offer),
      expires: expires ? new Date(expires) : undefined,
    });

    await newOffer.save();

    productDoc.productOffer = newOffer._id;
    await productDoc.save();

    res.status(200).json({
      success: true,
      message: "Product offer created successfully",
      product: productDoc._id,
      offer: newOffer,
    });
  } catch (error) {
    console.error("Error updating product offer:", error);
    res.status(500).json({ success: false, message: "Server error while updating offer" });
  }
};
   
 
  
const categoryOffer = async (req, res) => {
  try {
    const categories = await Category.find().lean();
const totalOffer = await CategoryOffer.countDocuments();
//  const now = new Date();
// const activeOffer = categories.filter(a=>!a.expires||a.expirees>now)
    
    const offers = await CategoryOffer.find().populate("category").lean();
   
const categoriesWithCount = await Promise.all(
  categories.map(async (cat) => {
    const count = await Product.countDocuments({ category: cat._id });
    return { ...cat, productCount: count };
  })
);

res.render("admin/categoryOffer", { categories: categoriesWithCount, offers ,totalOffer});

    // res.render("admin/categoryOffer", { categories, offers });
  } catch (error) {
    console.error("Error loading category offers:", error);
    res.status(500).send("Internal Server Error");
  }
};


const removeProductOffer = async(req,res)=>{
    try {
        console.log(req.params,"sheena sadanandan");
       const products = req.params.id
      
       await Offer.findByIdAndDelete(products)
    

        return res.status(200).json({
            success: true,
            message: "Product offer removed successfully",
          
        });

    } catch (error) {
        console.error("Error removing product offer:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};





// const addCategoryOffer = async (req, res) => {
//   try {
//    const { category, offer, expires } = req.body;
//    console.log(req.body,"11111111111111111111");


// const newOffer = await CategoryOffer.create({
//   category,
//   offer,
//   expires: new Date(expires),
// });
// console.log(newOffer,"22222222222222222222222222222222222222");

// await Category.findByIdAndUpdate(category, { offer: newOffer._id });


//      return res.status(201).json({ success: true, message: "Category offer created", offer: newOffer });
//   } catch (error) {
//     console.error("Error creating category offer:", error);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };


const addCategoryOffer = async (req, res) => {
  try {
    const { category, offer, expires } = req.body;
    console.log(req.body, "incoming category offer request");

    // Find the category
    const categoryDoc = await Category.findById(category).populate("offer");
    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // If category already has an offer → update it
    if (categoryDoc.offer) {
      const updatedOffer = await CategoryOffer.findByIdAndUpdate(
        categoryDoc.offer._id,
        {
          offer: Number(offer),
          expires: expires ? new Date(expires) : categoryDoc.offer.expires,
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Category offer updated successfully",
        offer: updatedOffer,
      });
    }

    // Otherwise, create a new offer
    const newOffer = await CategoryOffer.create({
      category: categoryDoc._id,
      offer: Number(offer),
      expires: new Date(expires),
    });

    // Attach new offer to category
    categoryDoc.offer = newOffer._id;
    await categoryDoc.save();

    return res.status(201).json({
      success: true,
      message: "Category offer created successfully",
      offer: newOffer,
    });
  } catch (error) {
    console.error("Error creating/updating category offer:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const removeCategoryOffer = async (req, res) => {
    try {
      console.log("anshi");
      console.log(req.params,"999999999999999");
      const custid = req.params.id
      await CategoryOffer.findByIdAndDelete(custid)
      
       

        return res.status(200).json({ success: true, message: "Category offer removed successfully" });
    } catch (error) {
        console.error("Error removing category offer:", error);
        return res.status(500).json({ error: "Failed to remove category offer" });
    }
};

const editOffer = async(req,res)=>{
  try {
    console.log(req.params,"hey param");
    console.log(req.body,"hey body");
    const{productId,offerPercentage,expiryDate}=req.body;
    const offerid = req.params.id
    console.log(offerid);
    const updateOffer = await Offer.findByIdAndUpdate(offerid,{
      product:productId,
      offer:offerPercentage,
      expires:expiryDate
    },{new:true})
    
    res.status(200).json({success:true,message:"Ofer updated succesfully"})
  } catch (error) {
    res.status(400).json({sucess:false,message:"Internal Server Error"})
  }
}
module.exports = { updateProductOffer ,removeProductOffer,addCategoryOffer,removeCategoryOffer,productOfferget,editOffer,categoryOffer};


