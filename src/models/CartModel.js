const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                require: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            size: {
                type: String,
                enum: ["S", "M", "L", "XL"],
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    totalPrice: {
        type: Number,
        default: 0
    }
},
    {
        timestamps: true
    });

cartSchema.methods.calculateTotalPrice = function () {
    this.totalPrice = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
};
cartSchema.methods.clearCart = async function () {
    this.items = [];
    this.totalPrice = 0;
    await this.save();
  };

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
