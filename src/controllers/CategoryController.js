const Category = require("../models/CategoryModel");
const CategoryService = require("../services/CategoryService");

// Tạo Danh Mục Controller
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(200).json({
        status: "Error",
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    const response = await CategoryService.createCategory(req.body);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).sjon({
      message: error.message,
    });
  }
};

// Sửa Danh Mục Controller
const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const data = req.body;

    if (!categoryId) {
      return res.status(200).json({
        status: "Err",
        message: "The productId is required",
      });
    }

    const response = await CategoryService.updateCategory(categoryId, data);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};
// Xóa Danh Mục Controller
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    if (!categoryId) {
      return res.status(200).json({
        status: "Err",
        message: "The userId is required",
      });
    }

    const response = await CategoryService.deleteCategory(categoryId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};
// Xóa Mềm Danh Mục Controller
const softDeleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    if (!categoryId) {
      return res.status(400).json({
        status: "ERROR",
        message: "CategoryId là bắt buộc",
      });
    }

    const response = await CategoryService.softDeleteCategory(categoryId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};
// Khôi Phục Danh Mục Controller
const restoreCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    if (!categoryId) {
      return res.status(400).json({
        status: "ERROR",
        message: "categoryId là bắt buộc",
      });
    }

    const response = await CategoryService.restoreCategory(categoryId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

const getDeletedCategorys = async (req, res) => {
    try {
      const response = await CategoryService.getDeletedCategorys();
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        status: "ERROR",
        message: error.message,
      });
    }
  };

// Lấy Tất Cả  Danh Mục Controller
const getAllCategory = async (req, res) => {
  try {
    const response = await CategoryService.getAllCategory();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  softDeleteCategory,
  getAllCategory,
  getDeletedCategorys,
  restoreCategory,
};
