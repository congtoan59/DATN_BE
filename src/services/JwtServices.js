const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const genneralAccessToken = (payload) => {
    const access_token = jwt.sign({
        ...payload
    }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
    return access_token;
}



const genneralRefreshToken = (payload) => {
    const refresh_token = jwt.sign({
        ...payload
    }, process.env.REFRESH_TOKEN, { expiresIn: '7d' });
    return refresh_token;
}

const generateResetToken = (email) => {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' }); 
    return token;
};
  

const refreshTokenJwtService = (token) => {
    return new Promise((resolve, reject) => {
        try {
            jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
                if (err) {
                    resolve({
                        status: 'Error',
                        message: 'The authentication 1'
                    });
                }
                const access_token = await genneralAccessToken({
                    id: user?.id,
                    isAdmin: user?.isAdmin,
                    name: user?.name
                });

                resolve({
                    status: "OK",
                    message: "SUCCESS",
                    access_token
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    genneralAccessToken,
    genneralRefreshToken,
    generateResetToken,
    refreshTokenJwtService
};