const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
const authMiddleware = (req , res , next) =>{
    
    const token = req.cookies.access_token

    if(!token){
        return res.status(401).json({
            message :'Không tìm thấy Token',
            status : 'error'
        })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN , function(err, user) {
        if(err){
            return res.status(404).json({
                message: 'The authmetication',
                status :'Error 1'
            })
        }
        if(user?.isAdmin){
            next()
        }else {
            return res.status(404).json({
                message :'The Authmetication',
                status :'error'
            })
        }
      });
}
const authUserMiddleware = (req , res , next) =>{
    
    const token = req.headers.token
    const userId = req.params.id
    
    console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN , function(err, user) {
        if(err){
            return res.status(404).json({
                message: 'The authmetication',
                status :'Error'
            })
        }
        if(user?.isAdmin || user?.id === userId){
            next()
        }else {
            return res.status(404).json({
                message :'The Authmetication',
                status :'error'
            })
        }
      });
}

module.exports = {
    authMiddleware,
    authUserMiddleware
}