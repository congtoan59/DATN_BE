const mongoose = require('mongoose');

const UserVoucherUsageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vouchersUsedToday: [{
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voucher'
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Tạo index để dễ dàng truy vấn và quản lý
UserVoucherUsageSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('UserVoucherUsage', UserVoucherUsageSchema);