const express = require("express");
const router = express.Router();
const revenueController = require("../controllers/RevenueController");

const {
    authMiddleware,
    authUserMiddleware,
} = require("../middleware/authMiddleware");

router.get('/total', authMiddleware, revenueController.getTotalRevenue);
router.get('/products', authMiddleware, revenueController.getRevenueByProduct);
router.get('/monthly', authMiddleware, revenueController.getMonthlyRevenue);
router.get('/best', authMiddleware, revenueController.getBestSeller);
router.get('/slow', authMiddleware, revenueController.getSlowSeller);
router.get('/low', authMiddleware, revenueController.getLowProducts);


module.exports = router;