const express = require ('express')
const Razorpay = require('razorpay')
const router = express();
const auth=require('../middlewares/auth')
router.use(express.json());


const createOrder = async(req,res)=>{
   console.log(req.body,"anshi anshi");
   console.log(process.env.RAZORPAY_KEY_ID,"keyyyyy");
   console.log(process.env.RAZORPAY_SECURITY_KEY,'Secrte') 
   
        const razorpay = new Razorpay({
            key_id:process.env.RAZORPAY_KEY_ID,
            key_secret:process.env.RAZORPAY_KEY_SECRET,
        });

         
        const options = {
            amount:req.body.subtotal * 100,
            receipt:"any unique id for every order",
            payment_capture:1
        }
         try {
            const response = await razorpay.orders.create(options)
            console.log(response,"responesedf");
            
            res.json({
            success: true,
            order_id: response.id,
            amount: response.amount,
            currency: response.currency,
        });
    } catch (error) {
        res.status(400).send("Notable to create order.Please try again!.")
    }


}

module.exports={createOrder}