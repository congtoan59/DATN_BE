const express = require("express");
const router = express.Router();

const orderController = require("../controllers/OrderController");

const {
  authMiddleware,
  authUserMiddleware,
} = require("../middleware/authMiddleware");


router.post('/createe', authUserMiddleware, orderController.createOrder)
// router.get('/:id', authUserMiddleware, orderController.getOrderById)
router.get('/getAll', authMiddleware, orderController.getAllOrder)
router.get('/user/:userId', authUserMiddleware, orderController.getOrdersByUser)
router.put('/status/:orderId', authMiddleware, orderController.updateOrderStatus)
router.delete('/cancel/:id', authUserMiddleware, orderController.cancelOrder)
router.get('/getOrder/:id', authUserMiddleware, orderController.getOrderById)

module.exports = router;
