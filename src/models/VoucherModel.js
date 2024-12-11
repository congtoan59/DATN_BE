const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validTo: {
    type: Date
  },
  quantity: {
    type: Number,
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  claimCount: {
    type: Number,
    default: 0, 
  },
  maxClaim: {
    type: Number,
    required: true, 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Voucher', VoucherSchema);