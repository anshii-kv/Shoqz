const User = require("../../model/userSchema");
const Address = require("../../model/addressSchema");


// const address = async(req,res)=>{
//   try {
//     const loadlogin = req.session.userId;
//     const userid = await User.findOne({ _id: req.session.userId });
//     console.log(userid);
    
//     res.render("address", { loadlogin,user:req.session.userId });
//   } catch (error) {
//     console.log(error.message);
//   }
// };
const address = async (req, res) => {
  try {
    const loadlogin = req.session.userId;
    const userId = req.session.userId;

    const user = await User.findById(userId);
    const addressData = await Address.findOne({ user: userId });

    const addresses = addressData ? addressData.address : [];
console.log(addresses);

   return res.render("address", {
      loadlogin,
      user: userId,
      userAddresses:addresses
    });

  } catch (error) {
    console.log("Error loading address page:", error.message);
    res.status(500).send("Internal Server Error");
  }
};


// const addAddress = async(req,res)=>{
//     try {
//     const userData = await User.findOne({ _id: req.session.userId });
//     const { fname, sname, mobile, email, address, city, pin } = req.body;
//     console.log(req.body);
    
//     const user = req.session.userId;

//     if (userData) {
//       const Data = await Address.findOneAndUpdate(
//         { user: user },
//         {
//           $push: {
//             address: {
//               fname: fname,
//               sname: sname,
//               mobile: mobile,
//               email: email,
//               address: address,
//               city: city,
//               pin: pin,
//             },
//           },
//         },
//         { new: true, upsert: true }
//       );
//       console.log(Data)
//     res.json({ success: true, message: "Address added successfully" });
//     } else {
//       res.json({ success: false, message: "User not found" });
//     }
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

const addAddress = async (req, res) => {
  try {
    const userId = req.session.userId;
    const userData = await User.findById(userId);
    let { fname, sname, mobile, email, address, city, pin, isDefault, type } = req.body;
    const addreses = await Address.findOne({user:userId})
    console.log(addreses,"ammuuuuu");
    
    if(addreses?.address?.length>0){
      console.log("anshiammu");
      
      isDefault=false
    }
    console.log(isDefault,"default");
    
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    console.log("Saving address for user:", userId);

    const result = await Address.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          address: {
            fname,
            sname,
            mobile,
            email,
            address,
            city,
            pin,
            isDefault,
            type,
          },
        },
      },
      { new: true, upsert: true }
    );

    console.log("Saved Address doc:", result);

    return res.json({ success: true, message: "Address saved" });
  } catch (error) {
    console.error("Error saving address:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};




const editAddress = async (req, res) => {
  try {
    const { fname, sname, mobile, email, address, city, pin, addressId } = req.body;
    
    // Validate required fields
    if (
      !fname || fname.trim().length === 0 ||
      !sname || sname.trim().length === 0 ||
      !mobile || mobile.trim().length === 0 ||
      !email || email.trim().length === 0 ||
      !address || address.trim().length === 0 ||
      !city || city.trim().length === 0 ||
      !pin || pin.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields!"
      });
    }

    // Check if user is logged in
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Update the address
    const updatedAddress = await Address.updateOne(
      { 
        user: req.session.userId, 
        "address._id": addressId // Use addressId if you're tracking by ID
        // OR use fname if that's your identifier: "address.fname": fname
      },
      {
        $set: {
          "address.$.fname": fname.trim(),
          "address.$.sname": sname.trim(),
          "address.$.mobile": mobile.trim(),
          "address.$.email": email.trim(),
          "address.$.address": address.trim(),
          "address.$.city": city.trim(),
          "address.$.pin": pin.trim(),
          // Add other fields if needed
          ...(req.body.addressType && { "address.$.addressType": req.body.addressType }),
          ...(req.body.isDefault !== undefined && { "address.$.isDefault": req.body.isDefault })
        }
      }
    );

    // Check if the update was successful
    if (updatedAddress.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    if (updatedAddress.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes were made to the address"
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: "Address updated successfully!"
    });

  } catch (error) {
    console.log("Error updating address:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error occurred while updating address"
    });
  }
};
const deleteAddress= async (req, res) => {
  try {
    const Id = req.body.addressId;
    
    const Deletedaddress = await Address.updateOne(
      {
        user: req.session.userId,
      },
      { $pull: { address: { _id: Id } } }
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};
module.exports={address,addAddress,editAddress,editAddress,deleteAddress}
