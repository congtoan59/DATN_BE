const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
const authMiddleware = (req , res , next) =>{
    
    const token = req.headers.token
    console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN , function(err, user) {
        if(err){
            return res.status(404).json({
                message: 'The authmetication',
                status :'Error 1'
            })
        }
        const {payload} = user
        
        if(payload?.isAdmin){
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
    authMiddleware
}