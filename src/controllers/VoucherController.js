const Voucher = require('../models/VoucherModel');
const UserVoucherUsage = require('../models/UserVoucherUsageModel');
const jwt = require('jsonwebtoken');

const createVoucher = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      validTo,
      maxClaim
    } = req.body;

    // Tạo voucher mới
    const newVoucher = new Voucher({
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      validTo,
      maxClaim
    });

    await newVoucher.save();

    res.status(201).json({
      status: 'OK',
      message: 'Tạo voucher thành công',
      data: newVoucher
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Lỗi khi tạo voucher',
      error: error.message
    });
  }
};


//NHẬN VOUCHER
const claimVoucher = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    // const token = req.headers.token
    const { voucherId } = req.body;

    if (!token) {
      return res.status(401).json({
        status: 'Error',
        message: 'Không tìm thấy token'
      });
    }

    // Giải mã token để lấy thông tin user
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const userId = decoded.id;

    // Tìm voucher
    const voucher = await Voucher.findById(voucherId);
    if (!voucher || !voucher.isActive) {
      return res.status(404).json({
        status: 'Error',
        message: 'Voucher không tồn tại hoặc đã hết hiệu lực'
      });

    }
    // Kiểm tra xem voucher đã đạt số lần claim tối đa chưa
    if (voucher.claimCount >= voucher.maxClaim) {
      return res.status(400).json({
        status: 'Error',
        message: 'Voucher đã được claim đủ số lần tối đa'
      });
    }

    // Kiểm tra số lượng voucher đã nhận trong ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userVoucherUsage = await UserVoucherUsage.findOne({
      user: userId,
      date: { $gte: today }
    });

    // Nếu chưa có bản ghi cho ngày hôm nay
    if (!userVoucherUsage) {
      await UserVoucherUsage.create({
        user: userId,
        vouchersUsedToday: [{
          voucher: voucherId
        }],
        date: today
      });

      return res.status(200).json({
        status: 'OK',
        message: 'Co the nhan voucher',
        data: voucher
      });
    }

    // Kiểm tra số lượng voucher đã nhận trong ngày
    if (userVoucherUsage.vouchersUsedToday.length >= 10) {
      return res.status(400).json({
        status: 'Error',
        message: 'Bạn đã nhận đủ 3 voucher trong ngày'
      });
    }

    // Kiểm tra xem voucher đã được nhận chưa
    const isVoucherAlreadyClaimed = userVoucherUsage.vouchersUsedToday.some(
      item => item.voucher.toString() === voucherId
    );

    if (isVoucherAlreadyClaimed) {
      return res.status(400).json({
        status: 'Error',
        message: 'Bạn đã nhận voucher này rồi'
      });
    }

    // Thêm voucher mới vào danh sách
    userVoucherUsage.vouchersUsedToday.push({ voucher: voucherId });
    await userVoucherUsage.save();

    voucher.claimCount += 1;
    await voucher.save();
    res.status(200).json({
      status: 'OK',
      message: 'Nhận voucher thành công',
      data: voucher
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Lỗi khi nhận voucher',
      error: error.message
    });
  }
};


// Reset voucher hàng ngày
const resetDailyVoucherUsage = async () => {
  try {
    // Xóa tất cả bản ghi UserVoucherUsage cũ
    await UserVoucherUsage.deleteMany({
      date: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    console.log('Đã reset voucher usage hàng ngày');
  } catch (error) {
    console.error('Lỗi khi reset voucher usage:', error);
  }
};

// Lấy danh sách voucher có thể nhận
const getAvailableVouchers = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('token', token);

    // const token = req.headers.token

    if (!token) {
      return res.status(401).json({
        status: 'Error',
        message: 'Không tìm thấy token'
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const userId = decoded.id;

    // Lấy vouchers đang hoạt động
    const availableVouchers = await Voucher.find({
      isActive: true,
      validTo: { $gte: new Date() }
    });

    // Kiểm tra vouchers đã nhận trong ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userVoucherUsage = await UserVoucherUsage.findOne({
      user: userId,
      date: { $gte: today }
    });
    //   console.log(userVoucherUsage)
    //   Đánh dấu các voucher đã nhận
    const processedVouchers = availableVouchers.map(voucher => {
      const isClaimedToday = userVoucherUsage?.vouchersUsedToday.some(
        item => item.voucher.toString() === voucher._id.toString()
      );
      console.log(availableVouchers)
      return {
        ...voucher.toObject(),
        isClaimedToday: isClaimedToday || false,
        canClaim: !isClaimedToday &&
          (!userVoucherUsage || userVoucherUsage.vouchersUsedToday.length < 5)
      };
    });

    res.status(200).json({
      status: 'OK',
      data: processedVouchers
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Lỗi khi lấy danh sách voucher',
      error: error.message
    });
  }
};
const getAllVouchers = async (req, res) => {
  try {
    // Lấy tất cả các voucher từ cơ sở dữ liệu
    const allVouchers = await Voucher.find();

    res.status(200).json({
      status: 'OK',
      data: allVouchers
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Lỗi khi lấy danh sách voucher',
      error: error.message
    });
  }
};





module.exports = {
  createVoucher,
  claimVoucher,
  resetDailyVoucherUsage,
  getAvailableVouchers,
  getAllVouchers
};