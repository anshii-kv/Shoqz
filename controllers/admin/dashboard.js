const User = require('../../model/userSchema')

const loadDashboard = async (req,res)=>{
    try {
        console.log('dashboard')
        return res.render('admin/dashboard')
    } catch (error) {
        console.log(error);
        
    }
}
module.exports = {loadDashboard};