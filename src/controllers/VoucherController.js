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
const getMyVoucher = async (req, res) => {
  try {
    // const token = req.headers.token;
    const token = req.headers.authorization?.split(' ')[1];


    if (!token) {
      return res.status(401).json({
        status: 'Error',
        message: 'Không tìm thấy token'
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const userId = decoded.id;

    // Lấy danh sách voucher mà user đã nhận hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userVoucherUsage = await UserVoucherUsage.findOne({
      user: userId,
      date: { $gte: today }
    }).populate('vouchersUsedToday.voucher'); // Lấy thông tin chi tiết voucher

    if (!userVoucherUsage || userVoucherUsage.vouchersUsedToday.length === 0) {
      return res.status(200).json({
        status: 'OK',
        message: 'Bạn chưa nhận voucher nào hôm nay',
        data: []
      });
    }

    // Chuẩn bị danh sách voucher
    const allVouchers = userVoucherUsage.vouchersUsedToday.map(item => ({
      voucherId: item.voucher._id,
      code: item.voucher.code,
      discountType: item.voucher.discountType,
      discountValue: item.voucher.discountValue,
      isUsed: item.isUsed || false, // Nếu `isUsed` không có, mặc định là false
      usedAt: item.isUsed ? item.usedAt : null // Chỉ hiện `usedAt` nếu đã sử dụng
    }));

    res.status(200).json({
      status: 'OK',
      message: 'Danh sách tất cả voucher đã nhận hôm nay',
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

const cancelClaimVoucher = async (req, res) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.status(401).json({
        status: 'Error',
        message: 'Không tìm thấy token'
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const userId = decoded.id;

    const { voucherId } = req.body;

    if (!voucherId) {
      return res.status(400).json({
        status: 'Error',
        message: 'Vui lòng cung cấp voucherId để hủy claim'
      });
    }

    // Lấy userVoucherUsage của user hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userVoucherUsage = await UserVoucherUsage.findOne({
      user: userId,
      date: { $gte: today }
    });

    if (!userVoucherUsage) {
      return res.status(404).json({
        status: 'Error',
        message: 'Không tìm thấy thông tin voucher đã nhận hôm nay'
      });
    }

    // Tìm và xóa voucher khỏi vouchersUsedToday
    const initialLength = userVoucherUsage.vouchersUsedToday.length;

    userVoucherUsage.vouchersUsedToday = userVoucherUsage.vouchersUsedToday.filter(
      item => item.voucher.toString() !== voucherId
    );

    if (userVoucherUsage.vouchersUsedToday.length === initialLength) {
      return res.status(404).json({
        status: 'Error',
        message: 'Voucher không tồn tại trong danh sách đã nhận hôm nay'
      });
    }

    await userVoucherUsage.save();

    // Giảm claimCount trên model Voucher
    const voucher = await Voucher.findById(voucherId);
    if (voucher) {
      voucher.claimCount = Math.max(0, voucher.claimCount - 1); // Không cho claimCount < 0
      await voucher.save();
    }

    res.status(200).json({
      status: 'OK',
      message: 'Hủy claim voucher thành công',
      data: { voucherId }
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Lỗi khi hủy claim voucher',
      error: error.message
    });
  }
};
const getVoucherDetails = async (req, res) => {
  try {
    const { voucherId } = req.params;

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({
        status: 'Error',
        message: 'Voucher không tồn tại'
      });
    }

    res.status(200).json({
      status: 'OK',
      data: voucher
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Lỗi khi lấy chi tiết voucher',
      error: error.message
    });
  }
};
const updateVoucher = async (req, res) => {
  try {
    const { voucherId } = req.params;
    const updateData = req.body;

    // Tìm và cập nhật voucher
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      voucherId,
      updateData,
      {
        new: true,  // Trả về voucher mới sau khi cập nhật
        runValidators: true  // Chạy validation khi update
      }
    );

    if (!updatedVoucher) {
      return res.status(404).json({
        status: 'Error',
        message: 'Không tìm thấy voucher để cập nhật'
      });
    }

    res.status(200).json({
      status: 'OK',
      message: 'Cập nhật voucher thành công',
      data: updatedVoucher
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Lỗi khi cập nhật voucher',
      error: error.message
    });
  }
};

// Xóa voucher
const deleteVoucher = async (req, res) => {
  try {
    const { voucherId } = req.params;

    // Tìm và xóa voucher
    const deletedVoucher = await Voucher.findByIdAndDelete(voucherId);

    if (!deletedVoucher) {
      return res.status(404).json({
        status: 'Error',
        message: 'Không tìm thấy voucher để xóa'
      });
    }

    // Xóa các bản ghi liên quan trong UserVoucherUsage (nếu cần)
    await UserVoucherUsage.deleteMany({ 'vouchersUsedToday.voucher': voucherId });

    res.status(200).json({
      status: 'OK',
      message: 'Xóa voucher thành công',
      data: deletedVoucher
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Lỗi khi xóa voucher',
      error: error.message
    });
  }
};

module.exports = {
  createVoucher,
  claimVoucher,
  resetDailyVoucherUsage,
  getAvailableVouchers,
  getAllVouchers,
  getMyVoucher,
  cancelClaimVoucher,
  getVoucherDetails,
  deleteVoucher,
  updateVoucher
};