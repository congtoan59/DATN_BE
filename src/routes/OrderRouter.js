const express = require("express");
const router = express.Router();

const orderController = require("../controllers/OrderController");

const {
  authMiddleware,
  authUserMiddleware,
} = require("../middleware/authMiddleware");


router.post('/createe', authUserMiddleware, orderController.createOrder)
router.get('/:id', authUserMiddleware, orderController.getOrderById)
router.get('/getAll', authUserMiddleware, orderController.getAllOrder)
router.get('/user/:userId', authMiddleware, orderController.getOrdersByUser)
router.put('/status/:orderId', authMiddleware, orderController.updateOrderStatus)
router.delete('/cancel/:id', authUserMiddleware, orderController.updateOrderStatus)

module.exports = router;
