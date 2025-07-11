const express = require ('express')
const router = express();
const usercontroller=require('../controllers/user/userController')
const addressController = require('../controllers/user/addressController');
const orderController = require("../controllers/user/orderController")
const {userAuth} = require ('../middlewares/userAuth')
const passport = require('../config/passport');
const orderSchema = require('../model/orderSchema');
router.use(express.json());

router.set("views","./views/user")

router.get("/",usercontroller.loadHomepage)

router.get("/contact",usercontroller.loadContact);

router.get("/about", usercontroller.loadAboutpage);

router.get("/pageNotfound",usercontroller.pageNotfound);


router.get("/signup",usercontroller.loadSignuppage);

router.post("/signup",usercontroller.signup);


router.get("/login",usercontroller.loadloginpage)

// router.get("/signupOtp",usercontroller.loadsignupOtp)





router.post("/login",usercontroller.login)

router.get("/logout",usercontroller.logout)



router.post("/verify-otp",usercontroller.verifyOtp)



router.post("/resend-otp",usercontroller.resendOtp)

router.get('/verifyOtp',usercontroller.loadVerifyOtp)

router.post('/verifiedOtp',usercontroller.verifiedOtp)

router.get("/forgot-password",usercontroller.loadForgotpassword)

router.post("/forgot-password",usercontroller.loadForgot)

 router.get("/resetpassword-otp",usercontroller.loadSignuppage)
 
router.post("/resetpassword-otp",usercontroller.verifyOtp)

router.get("/forgotpasswordotp",usercontroller.loadforgotpasswordotp)


router.post('/verifyforgototp',usercontroller.loadverifyforgototp)

router.get('/changepassword',usercontroller.loadchangepassword);

router.post('/changepassword',usercontroller.changepassword);





router.get('/shop',usercontroller.getShopPage);

router.get('/product/:id', usercontroller.loadProductDetails);






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


router.get("/cart",usercontroller.loadCart)

router.post("/addtocart",usercontroller.addToCart)

router.post('/update-quantity', usercontroller.updateQuantity);

router.post('/remove-item', usercontroller.removeFromCart);

router.get('/checkout',usercontroller.loadCheckout);





router.get('/profile',usercontroller.loadProfile);

router.post('/update-profile',usercontroller.updateProfile)

router.get('/editProfile',usercontroller.loadEditProfile)

router.post('/edit-profile',usercontroller.editProfile)


router.get('/changepass',usercontroller.changePassword)

router.post('/changePass',usercontroller.postChangePass)

router.get('/address',addressController.address)

router.post('/addAddress',addressController.addAddress)

router.patch('/editAddress',addressController.editAddress)

router.delete('/deleteAddress',addressController.deleteAddress)

router.get('/thankyou/:orderId',usercontroller.loadThankyou)

router.get('/order',orderController.loadOrder)

router.post('/submitOrder',orderController.placeOrder)
module.exports=router;