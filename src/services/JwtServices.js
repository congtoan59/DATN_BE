const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()


const genneralAccessToken = (payload) => {
    const access_token = jwt.sign({
        payload
    },process.env.ACCESS_TOKEN , {expiresIn : '15m'})
    return access_token
}
const genneralRefreshToken = (payload) => {
    console.log('payload' , payload);
    
    const refresh_token = jwt.sign({
        payload
    },process.env.REFRESH_TOKEN , {expiresIn : '7d'})
    return refresh_token
}
const refreshTokenJwtService = (token) => {
        return new Promise( (resolve, reject) => {
          try {
            jwt.verify(token , process.env.REFRESH_TOKEN ,async (err ,user) => {
                if(err){
                    resolve({
                        status:'Error',
                        message: 'The authemtication'
                    })
                }
                const {payload} = user
                const access_token = await genneralAccessToken({
                    id:payload?.id,
                    isAdmin:payload?.isAdmin,
                    name:payload?.name
                })
                console.log(access_token);
                
                resolve({
                  status: "OK",
                  message: "SUCCESS",
                  access_token
                  
                });
            })
          } catch (error) {
            reject(error);
          }
        });
}

module.exports = {
    genneralAccessToken,
    genneralRefreshToken,
    refreshTokenJwtService
}