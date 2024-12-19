const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
const authMiddleware = (req, res, next) => {

    const token = req.headers.token
    // const token = req.headers.authorization?.split(' ')[1];

    console.log(token);

    if (!token) {
        return res.status(401).json({
            message: 'Không tìm thấy Token',
            status: 'error'
        })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(404).json({
                message: 'The authmetication 1',
                status: 'Error 1'
            })
        }
        req.user = user;
        if (user.role === 'admin' || user.role === 'manager') {
            next()
        } else {
            return res.status(404).json({
                message: 'The Authmetication 2',
                status: 'error'
            })
        }
    });

}
const authUserMiddleware = (req, res, next) => {

    const token = req.headers.token
    // const token = req.headers.authorization?.split(' ')[1];

    const userId = req.params.id

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(404).json({
                message: 'The authmetication 3',
                status: 'Error'
            })
        }
        req.user = user;
        if (user.role === 'user' || user.role === 'admin' || user.role === 'manager' || user?.id === userId) {
            next()
        }
        else {
            return res.status(404).json({
                message: 'The Authmetication 4',
                status: 'error'
            })
        }
    });
}

module.exports = {
    authMiddleware,
    authUserMiddleware
}