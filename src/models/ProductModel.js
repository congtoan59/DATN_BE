const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, unique: true},
        price: {type: Number, required: true},
        countInStock: {type: Number, required: true},
        description: {type: String, required: true},
        images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductImage' }],
        category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
        deleted_at: {type: Date, default: null},
        
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

productSchema.virtual('imageUrls', {
    ref: 'ProductImage',
    localField: '_id',
    foreignField: 'product'
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;