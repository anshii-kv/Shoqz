const express = require ('express');
const multer = require('multer');
const upload = multer();
const router= express.Router();
const admincontroller = require('../controllers/admin/admincontroller')
const dashboard = require('../controllers/admin/dashboard')
const customerController = require('../controllers/admin/customerController')
const categoryController =require('../controllers/admin/categoryController')
const productController = require('../controllers/admin/productController')
const path = require("path");
const { adminAuth } = require('../middlewares/userAuth');
const orderController=require("../controllers/admin/orderController")
const couponController=require("../controllers/admin/couponController")
const auth=require('../middlewares/auth');
const salesController = require('../controllers/admin/salesController')
const offerController = require('../controllers/admin/offerController')
const { generatePDF } = require("../controllers/admin/pdfcontroller");
const { generateExcel } = require("../controllers/admin/pdfcontroller");
router.get("/adminLogin",auth.admin,admincontroller.loadLogin);

router.post("/login",admincontroller.adminLogin);

router.get('/',dashboard.loadDashboard);

router.get('/adminError',admincontroller.error);

router.post('/logout',auth.isAdmin,admincontroller.logout)


router.post("/export-pdf", generatePDF);
router.get("/export-excel",generateExcel)


router.get('/user',auth.isAdmin,customerController.user)

router.patch('/blockCustomer',customerController.blockCustomer )

router.patch('/unblockCustomer',customerController.unblockCustomer)





router.get("/category",auth.adminLogin,categoryController.loadCategory)

router.get('/addingCategory',auth.adminLogin,categoryController.categoryAdd)

router.post("/addCategory",categoryController.addCategory);

router.get("/listCategory",auth.adminLogin,categoryController.getListCategory)

router.get('/unlistCategory',auth.adminLogin,categoryController.getUnlistCategory)

router.get('/editCategory',auth.adminLogin,categoryController.getEditCategory);

router.put('/category/:id',categoryController.editCategory)

// router.delete('/deleteCategory',categoryController.deleteCategory)

router.post('/category-offers/create',offerController.addCategoryOffer);

// `/admin/category-offers/delete/${offerId}`
router.delete('/category-offers/delete/:id', offerController.removeCategoryOffer);



router.get('/Offer',auth.adminLogin,offerController.productOfferget)

router.get('/categoryOffer',auth.adminLogin,offerController.categoryOffer)

router.post("/product-offers/create",offerController.updateProductOffer)

router.patch("/product/editOffer/:id",offerController.editOffer)

router.delete('/product-offers/delete/:id',offerController.removeProductOffer)

router.get('/addProduct',auth.adminLogin,productController.loadProductAddPage)

router.get("/products",auth.adminLogin,productController.loadProducts)

router.patch('/products/toggle-status/:id', productController.toggleProductStatus);

router.delete('/products/delete/:id', productController.deleteProduct);

router.get('/updateProduct',auth.adminLogin,productController.loadUpdatePage);

// router.patch("/products/toggle-status/:id",productController.toggleProductStatus);


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/productImages'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype) {
    cb(null, true); 
  } else {
   cb(new Error('Only images are allowed'));
  }
};



const uploads = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
})


router.post('/products/add-products', uploads.array("croppedImages", 4), productController.addProducts);
router.post('/updateProduct',uploads.array("croppedImages", 4),productController.updateProduct)




router.get('/orderDetails',auth.adminLogin,orderController.loadOrder)
router.post('/changeStatus',orderController.changeStatus)
router.post('/rejectOrder',orderController.rejectOrder)

router.post('/approveOrder',orderController.approveOrder)

router.get('/viewOrder/:orderId',orderController.loadviewOrder)

router.get('/coupon',auth.adminLogin,couponController.loadCoupon)


router.get('/addcoupons',auth.adminLogin,couponController.loadaddCoupon)

router.post('/addCoupon',couponController.addCoupon)

router.delete('/coupon/:id',couponController.deleteCoupon);

router.patch('/coupon/:id/status',couponController.toggleCouponStatus);



router.get('/editcoupon/:couponId',auth.adminLogin,couponController.editCoupon)

router.post('/editCoupon/:id',couponController.editedCoupon)

router.get('/salesReport',salesController.salesReport);
router.get("/sales/:period", dashboard.filterGraph)

module.exports = router;

