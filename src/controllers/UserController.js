const UserService = require('../services/UserService')
const createUser = async (req , res ) => {
    try {
        console.log(req.body);
        const {name , email , password , confirmPassword , phone } = req.body
        const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const isCheckMail = reg.test(email)
        if(!name || !email || !password || !confirmPassword || !phone){
            return res.status(200).json({
                status:'Err' ,
                message:'The input is required'
            })
        }else if(!isCheckMail){
            return res.status(200).json({
                status:'Err' ,
                message:'The input is Email'
            })
        }else if(password !== confirmPassword){
            return res.status(200).json({
                status:'Err' ,
                message:'The password is equal confirmPassword'
            })
        }
        const response = await UserService.createUser(req.body)
        return res.status(200).json(response)
        
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}
const loginUser = async (req , res ) => {
    try {
        console.log(req.body);
        const {name , email , password , confirmPassword , phone } = req.body
        const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const isCheckMail = reg.test(email)
        if(!name || !email || !password || !confirmPassword || !phone){
            return res.status(200).json({
                status:'Err' ,
                message:'The input is required'
            })
        }else if(!isCheckMail){
            return res.status(200).json({
                status:'Err' ,
                message:'The input is Email'
            })
        }else if(password !== confirmPassword){
            return res.status(200).json({
                status:'Err' ,
                message:'The password is equal confirmPassword'
            })
        }
        const response = await UserService.loginUser(req.body)
        return res.status(200).json(response)
        
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}
const updateUser = async (req , res ) => {
    try {
        const userId = req.params.id
        const data = req.body
        
        if(!userId){
            return res.status(200).json({
                status : 'Err',
                message : 'The userId is required'
            })
        }
        
        const response = await UserService.updateUser(userId ,data)
        return res.status(200).json(response)
        
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}
const deleteUser = async (req , res ) => {
    try {
        const userId = req.params.id
        if(!userId){
            return res.status(200).json({
                status : 'Err',
                message : 'The userId is required'
            })
        }
        
        const response = await UserService.deleteUser(userId )
        return res.status(200).json(response)
        
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}
const getAllUser = async (req , res ) => {
    try {
        const response = await UserService.getAllUser()
        return res.status(200).json(response)
        
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}
module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser
}