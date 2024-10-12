const Product = require("../models/ProductModel");
const User = require("../models/ProductModel");

const { genneralAccessToken , genneralRefreshToken } = require("./JwtServices");

// TẠO MỚI SẢN PHẨM
const createProduct = (newProduct) => {
  return new Promise(async (resolve, reject) => {
    
    const {name ,image, type , price , countInStock , description } = newProduct;
    try {
      const checkProduct = await Product.findOne({
        name: name,
      });
      if (checkProduct != null) {
        resolve({
          status: "OK",
          message: "Sản phẩm đã tồn tại",
        });
      }
      const newProduct = await Product.create({
        name ,
        image, 
        type , 
        price , 
        countInStock , 
        description 
      });
      if (newProduct) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: newProduct,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};


//SỬA SẢN PHẨM 

const updateProduct= (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id
      });
      console.log(checkProduct);
      
      if (checkProduct === null) {
        resolve({
          status: "OK",
          message: "The User is not defined",
        });
      }

      const updateProduct = await Product.findByIdAndUpdate(id , data ,{new :true})
      console.log(updateProduct);
      
    
      resolve({
        status: "OK",
        message: "SUCCESS",
        data :updateProduct
        
      });
    } catch (error) {
      reject(error);
    }
  });
};

// XÓA SẢN PHẨM
const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id
      });
      
      if (checkProduct === null) {
        resolve({
          status: "OK",
          message: "The Product is not defined",
        });
      }

      await Product.findByIdAndDelete(id)
      resolve({
        status: "OK",
        message: "DELETE USER PRODUCT",
        
      });
    } catch (error) {
      reject(error);
    }
  });
};


// GET ALL SẢN PHẨM

const getAllProduct = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allProduct = await Product.find()
      resolve({
        status: "OK",
        message: "All User SUCCESS",
        data : allProduct
        
      });
    } catch (error) {
      reject(error);
    }
  });
};
// GET FILLTER 
const getFillterProduct = (fillter) => {
  return new Promise(async (resolve, reject) => {
    try {
      var FillterProduct = {}
      if(fillter = 'up'){
        FillterProduct = await Product.find().sort({price: 1})
      }if('down'){
        FillterProduct = await Product.find().sort({price: -1}) 
      }
        
      resolve({
        status: "OK",
        message: "Fillter User SUCCESS",
        data : FillterProduct 
        });
        
    } catch (error) {
      reject(error);
    }
  });
};

// GET DETAIL SẢN PHẨM
const getDetailProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id
      });
      resolve({
        status: "OK",
        message: `DETAIL PRODUCT ${checkProduct.name}`,
        data: checkProduct
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getFillterProduct,
  getDetailProduct
};
