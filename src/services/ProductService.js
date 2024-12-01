const Product = require("../models/ProductModel");
const ProductImage = require("../models/ProductImageModel");
const Category = require("../models/CategoryModel");
const User = require("../models/ProductModel");
const cloudinary = require("cloudinary").v2;

const { genneralAccessToken, genneralRefreshToken } = require("./JwtServices");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// TẠO MỚI SẢN PHẨM
const createProduct = async (newProduct) => {
  try {
    const { name, category, price, countInStock, description, images } =
      newProduct;

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return {
        status: "Failed",
        message: "Sản phẩm đã tồn tại",
      };
    }

    // Tạo sản phẩm mới
    const createdProduct = await Product.create({
      name,
      category,
      price,
      countInStock,
      description,
      images: [],
    });

    const imagePromises = images.map(async (imageUrl, index) => {
      const productImage = await ProductImage.create({
        product: createdProduct._id,
        url: imageUrl,
        alt: `${name} image ${index + 1}`,
        order: index,
      });
      return productImage._id;
    });

    const imageIds = await Promise.all(imagePromises);

    createdProduct.images = imageIds;
    await createdProduct.save();

    await Category.findByIdAndUpdate(category, {
      $push: { products: createdProduct._id },
    });

    const populatedProduct = await Product.findById(createdProduct._id)
      .populate("images")
      .exec();

    return {
      status: "OK",
      message: "Tạo sản phẩm thành công",
      data: populatedProduct,
    };
  } catch (error) {
    console.log("Lỗi khi tạo sạn phẩm :", error);
  }
};

//SỬA SẢN PHẨM

const updateProduct = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id,
      });
      console.log(checkProduct);

      if (checkProduct === null) {
        resolve({
          status: "OK",
          message: "The User is not defined",
        });
      }

      const updateProduct = await Product.findByIdAndUpdate(id, data, {
        new: true,
      });
      console.log(updateProduct);

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updateProduct,
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
        _id: id,
      });

      if (checkProduct === null) {
        resolve({
          status: "OK",
          message: "The Product is not defined",
        });
      }

      await Product.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "DELETE USER PRODUCT",
      });
    } catch (error) {
      reject(error);
    }
  });
};

// XÓA MỀM

const softDeleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findById(id);

      if (!product) {
        resolve({
          status: "ERROR",
          message: "Không tìm thấy sản phẩm",
        });
      }

      product.deleted_at = new Date();
      await product.save();

      resolve({
        status: "OK",
        message: "Đã xóa mềm sản phẩm thành công",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getDeletedProducts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const deletedProducts = await Product.find({ deleted_at: { $ne: null } });
      resolve({
        status: "OK",
        message: "Lấy danh sách sản phẩm đã xóa thành công",
        data: deletedProducts,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const restoreProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findById(id);
      if (!product) {
        resolve({
          status: "ERROR",
          message: "Không tìm thấy sản phẩm",
        });
      }
      product.deleted_at = null;
      await product.save();
      resolve({
        status: "OK",
        message: "Khôi phục sản phẩm thành công",
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
        .populate({
          path: "imageUrls",
          select: "url alt",
        })
        .populate("category");
      resolve({
        status: "OK",
        message: "All User SUCCESS",
        data: allProduct,
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
      var FillterProduct = {};
      if ((fillter = "up")) {
        FillterProduct = await Product.find().sort({ price: 1 });
      }
      if ("down") {
        FillterProduct = await Product.find().sort({ price: -1 });
      }

      resolve({
        status: "OK",
        message: "Fillter User SUCCESS",
        data: FillterProduct,
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
      const checkProduct = await Product.findOne({ _id: id }).populate({
        path: "imageUrls",
        select: "url alt",
      });
      resolve({
        status: "OK",
        message: `DETAIL PRODUCT ${checkProduct.name}`,
        data: checkProduct,
      });
    } catch (error) {
      reject(error);
    }
  });
};
// Lấy sản phẩm theo danh mục
const getProductsByCategory = (categoryName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const category = await Category.findOne({ name: categoryName });

      if (!category) {
        return resolve({
          status: "FAILED",
          message: "Category not found",
          data: [],
        });
      }
      const products = await Product.find({
        category: category._id,
        deleted_at: null,
      })
        .populate("imageUrls")
        .populate("category")
        .exec();

      resolve({
        status: "OK",
        message: "Get products by category successfully",
        data: products,
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
  getDetailProduct,
  softDeleteProduct,
  getDeletedProducts,
  restoreProduct,
  getProductsByCategory,
};
