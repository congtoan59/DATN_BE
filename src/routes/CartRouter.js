const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController')
const { authMiddleware, authUserMiddleware } = require('../middleware/authMiddleware')


router.post('/add', authUserMiddleware, CartController.addToCart);

router.get('/', authUserMiddleware, CartController.getCart);

router.put('/update', authMiddleware, CartController.updateCartItem);

router.delete('/remove/:cartItemId', authUserMiddleware, CartController.removeCartItem);

module.exports = router;