const User = require('../../model/userSchema')

const loadDashboard = async (req,res)=>{
    try {
        return res.render('admin/dashboard')
    } catch (error) {
        console.log(error);
        
    }
}
module.exports = {loadDashboard};