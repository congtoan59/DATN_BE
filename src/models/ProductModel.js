const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, unique: true},
        type: {type: String, required: true},
        price: {type: Number, required: true},
        countInStock: {type: Number, required: true},
        description: {type: String, required: true},
        deleted_at: {type: Date, default: null}
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Thêm virtual để lấy danh sách ảnh
productSchema.virtual('images', {
    ref: 'ProductImage',
    localField: '_id',
    foreignField: 'product'
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;