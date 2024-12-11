const express = require('express');
const router = express.Router();
const VoucherController = require('../controllers/VoucherController');
const { authMiddleware, authUserMiddleware } = require('../middleware/authMiddleware');

// Tạo voucher (chỉ dành cho admin)
router.post('/create', authMiddleware, VoucherController.createVoucher);

// Nhận voucher
router.post('/claim', authUserMiddleware, VoucherController.claimVoucher);

// // Lấy danh sách voucher có thể nhận
router.get('/available', authUserMiddleware, VoucherController.getAvailableVouchers);

router.get('/getAllVoucher', authUserMiddleware, VoucherController.getAllVouchers);

module.exports = router;