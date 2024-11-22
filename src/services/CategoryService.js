const Category = require("../models/CategoryModel");

// Tạo Danh Mục !
const createCategory = async (newCategory) => {
  try {
    const { name, description } = newCategory;

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return {
        status: "OK",
        message: "Danh mục đã tồn tại !",
      };
    }

    const createdCategory = await Category.create({
      name,
      description,
    });
    return {
      status: "OK",
      message: "Tạo Danh mục thành công",
      data: createdCategory,
    };
  } catch (error) {
    console.log("Lỗi khi tạo Danh mục :", error);
  }
};

// Sửa Danh Mục !
const updateCategory = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkCategory = await Category.findOne({
        _id: id,
      });
      console.log(checkCategory);

      if (checkCategory === null) {
        resolve({
          status: "OK",
          message: "The User is not defined",
        });
      }

      const updateCategory = await Category.findByIdAndUpdate(id, data, {
        new: true,
      });
      console.log(updateCategory);

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updateCategory,
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Xóa Danh Mục !
const deleteCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkCategory = await Category.findOne({
        _id: id,
      });

      if (checkCategory === null) {
        resolve({
          status: "OK",
          message: "The Product is not defined",
        });
      }

      await Category.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "DELETE USER Category",
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Xóa Mềm Danh Mục !
const softDeleteCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const category = await Category.findById(id);

      if (!category) {
        resolve({
          status: "ERROR",
          message: "Không tìm thấy sản phẩm",
        });
      }

      category.deleted_at = new Date();
      await category.save();

      resolve({
        status: "OK",
        message: "Đã xóa mềm sản phẩm thành công",
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Khôi Phục Danh Mục !
const restoreCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const category = await Category.findById(id);
      if (!category) {
        resolve({
          status: "ERROR",
          message: "Không tìm thấy sản phẩm",
        });
      }
      category.deleted_at = null;
      await category.save();
      resolve({
        status: "OK",
        message: "Khôi phục sản phẩm thành công",
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Lấy Tất Cả Danh Mục Đã Xóa !
const getDeletedCategorys = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const deletedCategorys = await Category.find({
        deleted_at: { $ne: null },
      });
      resolve({
        status: "OK",
        message: "Lấy danh sách sản phẩm đã xóa thành công",
        data: deletedCategorys,
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Lấy tất cả Danh mục !
const getAllCategory = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allCategory = await Category.find();
      resolve({
        status: "OK",
        message: "All User SUCCESS",
        data: allCategory,
      });
    } catch (error) {
      reject(error);
    }
  });
};
// GET DETAIL SẢN PHẨM
const getDetailCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkCategory = await Category.findOne({ _id: id });
      resolve({
        status: "OK",
        message: `DETAIL CATEGORY ${checkCategory.name}`,
        data: checkCategory,
      });
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  softDeleteCategory,
  restoreCategory,
  getDeletedCategorys,
  getAllCategory,
  getDetailCategory,
};
