const express = require ('express')
const router = express();
const usercontroller=require('../controllers/user/userController')
const addressController = require('../controllers/user/addressController');
const orderController = require("../controllers/user/orderController")
const {userAuth} = require ('../middlewares/userAuth')
const passport = require('../config/passport');
const orderSchema = require('../model/orderSchema');
const auth=require('../middlewares/auth');
const razorpay=require("../util/razorpay")
router.use(express.json());

router.set("views","./views/user")

router.get("/",usercontroller.loadHomepage)

router.get("/contact",usercontroller.loadContact);

router.get("/about", usercontroller.loadAboutpage);

router.get("/pageNotfound",usercontroller.pageNotfound);


router.get("/signup",auth.User,usercontroller.loadSignuppage);

router.post("/signup",usercontroller.signup);


router.get("/login",auth.User,usercontroller.loadloginpage)

// router.get("/signupOtp",usercontroller.loadsignupOtp)





router.post("/login",usercontroller.login)

router.get("/logout",auth.isUser,usercontroller.logout)



router.post("/verify-otp",usercontroller.verifyOtp)



router.post("/resend-otp",usercontroller.resendOtp)

router.get('/verifyOtp',auth.isBlock,auth.toLogin,usercontroller.loadVerifyOtp)

router.post('/verifiedOtp',usercontroller.verifiedOtp)

router.get("/forgot-password",auth.isBlock,auth.toLogin,usercontroller.loadForgotpassword)

router.post("/forgot-password",usercontroller.loadForgot)

 router.get("/resetpassword-otp",auth.isBlock,auth.toLogin,usercontroller.loadSignuppage)
 
router.post("/resetpassword-otp",usercontroller.verifyOtp)

router.get("/forgotpasswordotp",auth.isBlock,auth.toLogin,usercontroller.loadforgotpasswordotp)


router.post('/verifyforgototp',usercontroller.loadverifyforgototp)

router.get('/changepassword',auth.isBlock,auth.toLogin,usercontroller.loadchangepassword);

router.post('/changepassword',usercontroller.changepassword);





router.get('/shop',usercontroller.getShopPage);

router.get('/product/:id',usercontroller.loadProductDetails);






router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        console.log(req.user,"string")
        req.session.name = req.user.name;
        req.session.email = req.user.email;
        req.session.userId = req.user._id
        res.redirect('/');
    }
); 


router.get("/cart",auth.isBlock,auth.toLogin,usercontroller.loadCart)

router.post("/addtocart",usercontroller.addToCart)

router.post('/update-quantity', usercontroller.updateQuantity);

router.post('/remove-item', usercontroller.removeFromCart);

router.get('/checkout',auth.isBlock,auth.toLogin,usercontroller.loadCheckout);

router.post('/coupon',usercontroller.coupon)

router.get('/wishlist',auth.isBlock,auth.toLogin,usercontroller.wishlist)

router.post('/wishlist/add',usercontroller.addToWishlist)

router.post('/add-to-cart',usercontroller.wishlistaddToCart)

router.get('/profile',auth.isBlock,auth.toLogin,usercontroller.loadProfile);

router.post('/update-profile',usercontroller.updateProfile)

router.get('/editProfile',auth.isBlock,auth.toLogin,usercontroller.loadEditProfile)

router.post('/edit-profile',usercontroller.editProfile)


router.get('/changepass',auth.isBlock,auth.toLogin,usercontroller.changePassword)

router.post('/changePass',usercontroller.postChangePass)

router.get('/address',auth.isBlock,auth.toLogin,addressController.address)

router.post('/addAddress',addressController.addAddress)

router.patch('/editAddress',addressController.editAddress)

router.delete('/deleteAddress',addressController.deleteAddress)

router.get('/thankyou',usercontroller.loadThankyou)

router.get('/order',auth.isBlock,auth.toLogin,orderController.orderlist)

router.post('/cancel-order',orderController.cancelOrder)

router.get('/order-details/:id/:productId',auth.isBlock,auth.toLogin,orderController.orderdetails)

router.post('/submitOrder',orderController.placeOrder)
// router.post('/apply-coupon',usercontroller.applycoupon)

router.patch('/returnOrder',orderController.returnOrder)

router.post('/paymentFailed',usercontroller.paymentFailed)

router.get('/download-invoice/:orderId',auth.toLogin, orderController.downloadInvoice);


router.post('/createOrder',razorpay.createOrder)
router.post('/placeOrder',orderController.verifyPayment)
router.get('/transactionHistory',auth.toLogin,usercontroller.transactionHistory);

router.get('/user/coupons/available',usercontroller.applyCoupon);

router.post('/applyCoupon',usercontroller.coupons)

module.exports=router;