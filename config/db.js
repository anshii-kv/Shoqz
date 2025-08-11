const mongoose = require ("mongoose");
const env = require('dotenv').config();

// const  connectDB=async()=>{
//     try{
//        await mongoose.connect(process.env.MONGODB_URI);
//        console.log("mongodb connected")
//     }catch(error){
//          console.log("connect error",error.message);
//         //  process.exit(1);
//     }
// }

// module.exports=connectDB;
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/Footwear');
    console.log("MongoDB connected");
  } catch (error) {
    console.log("Connection error:", error.message);
    process.exit(1);
  }
};
connectDB();