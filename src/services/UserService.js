const User = require("../models/UserModel");
const JwtService = require('../services/JwtServices')
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const emailTemplate = require('../views/emailTemplate');

const { genneralAccessToken, genneralRefreshToken } = require("./JwtServices");
const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { name, email, password, role } = newUser;
    console.log('newUser', newUser);


    try {
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser) {
        return resolve({
          status: "ERR",
          message: "Email đã tồn tại",
        });
      }
      const hash = bcrypt.hashSync(password, 10);
      const createUser = await User.create({
        name,
        email,
        password: hash,
        role: role || 'user',

      });
      resolve({
        status: "OK",
        message: "User created successfully",
        data: createUser,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;

    try {
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser === null) {
        resolve({
          status: "OK",
          message: "The User is not defined",
        });
      }
      const comparePassword = bcrypt.compareSync(password, checkUser.password);
      if (!comparePassword) {
        resolve({
          status: "OK",
          message: "The Password or user is incorrect!",
        });
      }
      const access_token = await genneralAccessToken({
        id: checkUser.id,
        role: checkUser.role,
        name: checkUser.name,
      });
      const refresh_token = await genneralRefreshToken({
        id: checkUser.id,
        role: checkUser.role,
        name: checkUser.name,

      });
      resolve({
        status: "OK",
        message: "SUCCESS",
        access_token,
        refresh_token
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({
        id: id
      });
      if (checkUser === null) {
        resolve({
          status: "OK",
          message: "The User is not defined",
        });
      }

      if (data.role) {
        delete data.role;
      }

      const updateUser = await User.findByIdAndUpdate(id, data, { new: true })


      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updateUser

      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({
        id: id
      });

      if (checkUser === null) {
        resolve({
          status: "OK",
          message: "The User is not defined",
        });
      }

      await User.findByIdAndDelete(id)
      resolve({
        status: "OK",
        message: "DELETE USER SUCCESS",

      });
    } catch (error) {
      reject(error);
    }
  });
};

const getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await User.find()
      resolve({
        status: "OK",
        message: "All User SUCCESS",
        data: allUser

      });
    } catch (error) {
      reject(error);
    }
  });
};

const getDetailsUser = (_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        _id: _id
      }).select('-password');

      if (user === null) {
        resolve({
          status: "OK",
          message: "The User is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: user

      });
    } catch (error) {
      reject(error);
    }
  });
};
const verifyTokenAndGetUser = async (token) => {

  try {
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);


    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }


    return { user };
  } catch (error) {
    throw error;
  }
};
const resetPwd = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        email: email
      }).select('-password');

      if (user === null) {
        resolve({
          status: "OK",
          message: "Khôgn tồn tại email",
        });
      } else {

        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'hthien.fv@gmail.com',
            pass: 'ghvg vunu cslm ldds',
          }
        });
        //Gửi mail đi
        const resetToken = JwtService.generateResetToken(email)
        const resetLink = `http://localhost:5173/changepwd/${resetToken}`;
        const cusName = user.name
        const emailContent = emailTemplate(resetLink, cusName)
        await transporter.sendMail({
          from: 'no-reply@Sixstars.com',
          to: email,
          subject: 'Password Reset Request',
          html: emailContent
        }, (error, info) => {
          if (error) {
            console.error('Error:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        }
        )
        resolve({
          status: "200",
          message: "Vui long kiểm tra gmail của bạn!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}

const changePwd = (newPassword, token) => {
  console.log(token);

  return new Promise(async (resolve, reject) => {
    try {

      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(400).json({ message: 'Token không hợp lệ' });
        } else {
          console.log('Token OK!!!', newPassword)
        }


        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log(hashedPassword)
        await User.updateOne({ email: decoded.email }, { password: hashedPassword });
        const data = await User.findOne({ email: decoded.email })
        resolve({
          status: "200",
          message: "Mật khẩu đã được thay đổi!",
          email: data.email
        });
      });
    } catch (error) {
      reject(error);
    }
  })
}


module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  verifyTokenAndGetUser,
  changePwd,
  resetPwd
};
