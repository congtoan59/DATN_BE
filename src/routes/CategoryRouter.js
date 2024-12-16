const express = require("express");
const router = express.Router();

const CategoryController = require("../controllers/CategoryController");

router.post("/create", CategoryController.createCategory);
router.put("/update-category/:id", CategoryController.updateCategory);
router.delete("/delete-category/:id", CategoryController.deleteCategory);
router.get("/", CategoryController.getAllCategory);
router.put("/soft-delete/:id", CategoryController.softDeleteCategory);
router.put("/restore/:id", CategoryController.restoreCategory);
router.get("/deleted", CategoryController.getDeletedCategorys);
router.get("/detail/:id", CategoryController.getDetailCategory);

module.exports = router;
