const express = require('express');
const router = express.Router();
const VoucherController = require('../controllers/VoucherController');
const { authMiddleware, authUserMiddleware } = require('../middleware/authMiddleware');

// Tạo voucher (chỉ dành cho admin)
router.post('/create', authMiddleware, VoucherController.createVoucher);
router.delete('/deleteVoucher/:voucherId', authMiddleware, VoucherController.deleteVoucher);
router.put('/updateVoucher/:voucherId', authMiddleware, VoucherController.updateVoucher);

// Nhận voucher
router.post('/claim', authUserMiddleware, VoucherController.claimVoucher);
// // Lấy danh sách voucher có thể nhận
router.get('/available', authUserMiddleware, VoucherController.getAvailableVouchers);

router.get('/getAllVoucher', authUserMiddleware, VoucherController.getAllVouchers);
router.get('/myvoucher', authUserMiddleware, VoucherController.getMyVoucher);
router.post('/cancel', authUserMiddleware, VoucherController.cancelClaimVoucher);
router.get('/:voucherId', authUserMiddleware, VoucherController.getVoucherDetails);


module.exports = router;