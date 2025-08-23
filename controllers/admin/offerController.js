
// const Product = require("../../model/productSchema");
// const Offer = require("../../model/offer")
// const updateProductOffer = async(req,res)=>{
//     try {
//         console.log(req.body,"rammu");
//         console.log(req.params,"params");
//         console.log(productOffer,offerDescription,"reqbody");
//         const productIId = req.params.productId;
        
//         const{productOffer,offerDescription}=req.body;
//         const exists = await Offer.findOne({productOffer})
//         console.log(exists,"exists");
//         const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }
       
       
//     // apply offer
//     product.productOffer = productOffer;
//     product.offerDescription = offerDescription;

//     // recalculate final amount
//     const discount = (product.regularPrice * productOffer) / 100;
//     product.finalamount = product.regularPrice - discount;
// console.log(discount,"sharun");

//     await product.save();
//        return res.status(200).json({success:true,message:"offer added"})
        
        
        
//     } catch (error) {
//         return res.status(500).json({success:false,message:"server error offer didnt added"})
//     }
// }
// module.exports={updateProductOffer}

const Product = require("../../model/productSchema");
const productOffer = require("../../model/productOffer");
const Category=require("../../model/categorySchema")
// const updateProductOffer = async (req, res) => {
//     try {
//         console.log(req.body, "rammu");
//         console.log(req.params, "params");
        
//         const { productOffer, offerDescription } = req.body;
//         const productId = req.params.productId;

        
//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).json({ success: false, message: "Product not found" });
//         }

//         product.productOffer = productOffer;
//         product.offerDescription = offerDescription || '';

//         const bestOffer = Math.max(productOffer, product.categoryoffer || 0);
//         product.salePrice = product.regularPrice - (product.regularPrice * bestOffer) / 100;

//         await product.save();

     
//         res.json({
//             success: true,
//             message: "Product offer updated successfully",
//             product
//         });

//     } catch (error) {
//         console.error("Error updating product offer:", error);
//         res.status(500).json({ success: false, message: "Server error while updating offer" });
//     }
// };


const productOfferget = async(req,res)=>{
  try {
    console.log("ho");
    const offers = await productOffer.find().populate('product')
    console.log(offers,"off");
    const products = await Product.find({})
    
    
    res.render('admin/productOffer',{offers,products})
  } catch (error) {
    res.status(500).send("Server errorRRR")
  }
}
const updateProductOffer = async (req, res) => {
  try {
    console.log(req.body,"offerparams");
    const{product,offer,expires}=req.body;
    const productId=await Product.findById(product)
    console.log(productId,"i");
    const newOffer = new productOffer({
         product:productId,
      offer:Number(offer),
      expires:expires? new Date(expires):undefined
    })
    await newOffer.save();
    product.productOffer = newOffer._id;
    await productId.save();
   
 
    
    res.status(200).json({success: true, message: "Product offer updated successfully",  product  });
  } catch (error) {
    console.error("Error updating product offer:", error);
    res.status(500).json({ success: false, message: "Server error while updating offer" });
  }
};
    
      
     
  



const removeProductOffer = async(req,res)=>{
    try {
        console.log(req.params,"sheena sadanandan");
       const products = req.params.id
       console.log(products,"anshi sadan kv");
       const productId = await Product.findById(products)
       console.log(productId.productOffer,"offer");
       
    console.log(productId,'ashima sadana');
    
   
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                $set: {
                    productOffer: 0,
                    offerDescription: "",
                    finalamount: 0   
                }
            },
            { new: true } 
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        console.log(updatedProduct.productOffer, "offer after delete");

        return res.status(200).json({
            success: true,
            message: "Product offer removed successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error("Error removing product offer:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// const addCategoryOffer = async (req, res) => {
//    try {
//     console.log(req.body,"i am in");
//     const{categoryId,offerPercentage}=req.body
//    const category=await Category.findById(categoryId)
//    console.log(category,"in out");
//    if(!category){
//     return res.status(400).json({success:false,message:"Category not found"})
//    }
//     category.categoryoffer=offerPercentage;
//     await category.save()
//    } catch (error) {
    
//    }
// };

const addCategoryOffer = async (req, res) => {
  try {
    const { categoryId, offerPercentage } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // update category
    category.offer.discount_percentage = offerPercentage || 0;
    await category.save();

    // update all products in this category
    const products = await Product.find({ category: categoryId });
    for (let product of products) {
      product.categoryoffer = offerPercentage; // ✅ store in product DB

      const bestOffer = Math.max(product.productOffer || 0, product.categoryoffer || 0);
      product.bestOffer = bestOffer;

      product.finalamount = product.regularPrice - (product.regularPrice * bestOffer) / 100;

      await product.save();
    }

    res.json({
      success: true,
      message: `Category offer of ${offerPercentage}% added successfully`,
      category,
    });
  } catch (error) {
    console.error("Error adding category offer:", error);
    res.status(500).json({ success: false, message: "Server error while adding category offer" });
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

module.exports = { updateProductOffer ,removeProductOffer,addCategoryOffer,removeCategoryOffer,productOfferget};


