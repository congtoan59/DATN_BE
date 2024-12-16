const UserService = require('../services/UserService')
const JwtService = require('../services/JwtServices')
const User = require("../models/UserModel")
const jwt = require('jsonwebtoken');
const createUser = async (req, res) => {
    try {
        console.log(req.body);
        const { name, email, password, confirmPassword } = req.body
        const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const isCheckMail = reg.test(email)
        if (!name || !email || !password || !confirmPassword) {
            return res.status(200).json({
                status: 'Err',
                message: 'The input is required'
            })
        } else if (!isCheckMail) {
            return res.status(200).json({
                status: 'Err',
                message: 'Định dạng email không hợp lệ'
            })
        } else if (password !== confirmPassword) {
            return res.status(200).json({
                status: 'Err',
                message: 'Mật khẩu phải trùng với mật khẩu xác nhận.'
            })
        }
        const response = await UserService.createUser(req.body)
        if (response.status === "ERR") {
            return res.status(200).json(response);
        }
        return res.status(200).json(response)

    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}
const loginUser = async (req, res) => {
    try {
        console.log(req.body);
        const { email, password } = req.body
        const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const isCheckMail = reg.test(email)
        if (!email || !password) {
            return res.status(200).json({
                status: 'Err',
                message: 'The input is required'
            })
        } else if (!isCheckMail) {
            return res.status(200).json({
                status: 'Err',
                message: 'The input is Email'
            })
        }
        const response = await UserService.loginUser(req.body)
        const { refresh_token, ...newReponse } = response
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false, // Bảo mật phía client
            samesite: 'strict',
            path: '/'
        })
        return res.status(200).json(newReponse)

    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id
        const data = req.body

        if (!userId) {
            return res.status(200).json({
                status: 'Err',
                message: 'The userId is required'
            })
        }

        const response = await UserService.updateUser(userId, data)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id
        if (!userId) {
            return res.status(200).json({
                status: 'Err',
                message: 'The userId is required'
            })
        }

        const response = await UserService.deleteUser(userId)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}
const getAllUser = async (req, res) => {
    try {
        const response = await UserService.getAllUser()
        return res.status(200).json(response)

    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}
const getDetailsUser = async (req, res) => {
    try {
        const userId = req.params.id

        if (!userId) {
            return res.status(200).json({
                status: 'Err',
                message: 'The userId is required'
            })
        }

        const response = await UserService.getDetailsUser(userId)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}
const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refresh_token
        if (!token) {
            return res.status(200).json({
                status: 'Err',
                message: 'The token is required'
            })
        }

        const response = await JwtService.refreshTokenJwtService(token)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        res.clearCookie('refresh_token')

        return res.status(200).json({
            status: 'OK',
            message: 'Logout succsess'
        })

    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}
const verifyToken = async (req, res) => {
    try {
        // const token = req.headers.token;
        const token = req.headers.authorization?.split(' ')[1];

        console.log(token);


        const { user, newAccessToken } = await UserService.verifyTokenAndGetUser(token);

        res.status(200).json({
            status: 'OK',
            message: 'Xác thực thành công',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            access_token: newAccessToken
        });

    } catch (error) {
        // Xử lý các lỗi token
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'Error',
                message: 'Token không hợp lệ'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'Error',
                message: 'Token đã hết hạn'
            });
        }

        // Lỗi chung
        res.status(500).json({
            status: 'Error',
            message: 'Lỗi xác thực',
            error: error.message
        });
    }
};
const resetPwd = async (req, res) => {

    try {
        const email = req.body.email
        console.log(email);

        if (!email) {
            return res.status(200).json({
                status: 'Err',
                message: 'The Email is required'
            })
        }

        const response = await UserService.resetPwd(email)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}

const changePwd = async (req, res) => {
    try {
        const newPassword = req.body.newPassword;
        // const token = req.headers.token;
        const token = req.headers.authorization?.split(' ')[1];
        const change = await UserService.changePwd(newPassword, token)
        res.status(200).json({
            data: change
        })

    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailsUser,
    refreshToken,
    logoutUser,
    verifyToken,
    resetPwd,
    changePwd
}