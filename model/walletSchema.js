const mongoose = require('mongoose');
const {Schema} = mongoose;
const walletSchema = new Schema({
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
    required: true
  },
    balance:{
        type:Number
    },
    Transactionhistory:[{
        createdAt:{
            type:Date,
            default:Date.now
        },
        amount:{
            type:Number
        },
        transactiontype:{
            type:String
        },
        date:{
            type:Date,
            default:Date.now
        },
       description:{
        type:String

       },
       type:{
        type:String,
        enum:["credit","debit"]
       }
        
    }]
})


const Wallet = mongoose.model("wallet",walletSchema)
module.exports=Wallet;

