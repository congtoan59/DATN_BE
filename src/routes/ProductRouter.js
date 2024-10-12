const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/ProductController')
const { authMiddleware } = require('../middleware/authMiddleware')

router.post('/create', ProductController.createProduct)
router.put('/update-product/:id' ,ProductController.updateProduct)
router.delete('/delete-product/:id',ProductController.deleteProduct)
router.get('/',ProductController.getAllProduct)
router.get('/fillter/:fillter',ProductController.getFillterProduct)
router.get('/detail/:id', ProductController.getDetailProduct)

module.exports = router