const Product = require("../models/ProductModel");
const ProductService = require("../services/ProductService");

// TẠO SẢN PHẨM CONTROL
const createProduct = async (req, res) => {
  try {
    const { name, category , price, countInStock, description, images } = req.body;
    if (!name || !category || !price || !countInStock || !description) {
      return res.status(200).json({
        status: "Err",
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        status: "ERR",
        message: "Vui lòng tải lên ít nhất một ảnh",
      });
    }
    const response = await ProductService.createProduct(req.body);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};


// UPDATE SẢN PHẨM CONTROL
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const data = req.body;

    if (!productId) {
      return res.status(200).json({
        status: "Err",
        message: "The productId is required",
      });
    }

    const response = await ProductService.updateProduct(productId, data);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

// XÓA SẢN PHẨM CONTROL
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(200).json({
        status: "Err",
        message: "The userId is required",
      });
    }

    const response = await ProductService.deleteProduct(productId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};
// XÓA MỀM SẢN PHẨM
const softDeleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({
        status: "ERROR",
        message: "productId là bắt buộc",
      });
    }

    const response = await ProductService.softDeleteProduct(productId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

const getDeletedProducts = async (req, res) => {
  try {
    const response = await ProductService.getDeletedProducts();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

const restoreProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({
        status: "ERROR",
        message: "productId là bắt buộc",
      });
    }

    const response = await ProductService.restoreProduct(productId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

// GET ALL SẢN PHẨM
const getAllProduct = async (req, res) => {
  try {
    const response = await ProductService.getAllProduct();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};
// GET FILLTER
const getFillterProduct = async (req, res) => {
  try {
    const fillter = req.params.fillter;

    const response = await ProductService.getFillterProduct(fillter);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

//GET DETAIL SẢN PHẨM
const getDetailProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(200).json({
        status: "Err",
        message: "The ProductId is required",
      });
    }

    const response = await ProductService.getDetailProduct(productId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};
const getProductsByCategory = async (req, res) => {
  const { categoryName } = req.params;

  try {
    const result = await ProductService.getProductsByCategory(categoryName);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: "FAILED", message: error.message });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getFillterProduct,
  getDetailProduct,
  softDeleteProduct,
  restoreProduct,
  getDeletedProducts,
  getProductsByCategory
  
};
