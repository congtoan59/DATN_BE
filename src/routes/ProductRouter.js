const express = require("express");
const router = express.Router();

const ProductController = require("../controllers/ProductController");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/create", upload.single("image"), ProductController.createProduct);
router.put("/update-product/:id", ProductController.updateProduct);
router.delete("/delete-product/:id", ProductController.deleteProduct);
router.get("/", ProductController.getAllProduct);
router.get("/fillter/:fillter", ProductController.getFillterProduct);
router.get("/detail/:id", ProductController.getDetailProduct);
router.put("/soft-delete/:id", ProductController.softDeleteProduct);
router.put("/restore/:id", ProductController.restoreProduct);
router.get("/deleted", ProductController.getDeletedProducts);
router.get('/category/:categoryName', ProductController.getProductsByCategory);

module.exports = router;
