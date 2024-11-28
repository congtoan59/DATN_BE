const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    orderItems: [
        {
            name: { type: String, required: true },
            amount: { type: Number, required: true },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
        },
    ],
    shippingAdress: {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: { type: Number, required: true }
    },
    paymentMethod: { type: String, required: true },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPaid: { type: Boolean, required: true },
    paidAt: { type: Date },
    deliveryStatus: {
        type: String,
        enum: [
            'Chờ xác nhận đơn hàng',
            'Đơn hàng đang chuẩn bị',
            'Đơn hàng đã được giao',
            'Đơn hàng giao thành công',
        ],
        default: 'Chờ xác nhận đơn hàng',
    },
    deliveredAt: { type: Date },
},
    {
        timestamps: true,
    }
)

const Order = mongoose.model('Order', orderSchema);
module.exports = Order