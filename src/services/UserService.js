const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { genneralAccessToken , genneralRefreshToken } = require("./JwtServices");
const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { name, email, password, confirmPassword, phone } = newUser;

    try {
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser != null) {
        resolve({
          status: "OK",
          message: "The Email is already",
        });
      }
      const hash = bcrypt.hashSync(password, 10);
      // console.log(hash);

      const createUser = await User.create({
        name,
        email,
        password: hash,
        phone,
      });
      if (createUser) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createUser,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { name, email, password, confirmPassword, phone } = userLogin;

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
        isAdmin: checkUser.isAdmin,
      });
      const refresh_token = await genneralRefreshToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
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
          _id: id
        });
        console.log(checkUser);
        
        if (checkUser === null) {
          resolve({
            status: "OK",
            message: "The User is not defined",
          });
        }
  
        const updateUser = await User.findByIdAndUpdate(id , data ,{new :true})
        console.log(updateUser);
        
      
        resolve({
          status: "OK",
          message: "SUCCESS",
          data :updateUser
          
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
          _id: id
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
          data :allUser
          
        });
      } catch (error) {
        reject(error);
      }
    });
  };
// const User =  (newUser) => {
//     return new Promise( async(resolve, reject) => {
//         const { name, email, password, phone } = newUser

//         try {
//             const checkUser = await User.findOne({
//                 email:email
//             })
//             if(checkUser != null ) {
//                 resolve({
//                     status :'OK',
//                     message : 'The Email is already'
//                 })
//             }
//             const hash = bcrypt.hashSync(password,10)
//             // console.log(hash);

//             const createUser = await User.create({
//                 name,
//                 email,
//                 password :hash,
//                 phone
//             })
//             if(createUser){
//                 resolve({
//                     status :'OK',
//                     message:'SUCCESS',
//                     data:createUser,
//                 })

//             }
//         } catch (error) {
//             reject(error)
//         }
//     })
// }
module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser
};
