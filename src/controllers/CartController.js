const Cart = require('../models/CartModel')
const Product = require('../models/ProductModel')


const addToCart = async (req, res) => {
    try {
        const { productId, quantity, size } = req.body;
        const userId = req.user.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [{
                    product: productId,
                    quantity,
                    size,
                    price: product.price
                }]
            });
        } else {
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId && item.size === size
            );

            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                cart.items.push({
                    product: productId,
                    quantity,
                    size,
                    price: product.price
                });
            }
        }

        cart.calculateTotalPrice();

        await cart.save();

        await cart.populate('items.product');

        res.status(200).json({
            message: 'Product added to cart successfully',
            cart
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error adding product to cart',
            error: error.message
        });
    }
};

const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'items.product',
                populate: {
                    path: 'imageUrls',
                    model: 'ProductImage'
                }
            });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching cart',
            error: error.message
        });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { cartItemId, quantity, size } = req.body;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cartItemIndex = cart.items.findIndex(
            item => item._id.toString() === cartItemId
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        if (quantity) cart.items[cartItemIndex].quantity = quantity;
        if (size) cart.items[cartItemIndex].size = size;

        cart.calculateTotalPrice();

        await cart.save();

        res.status(200).json({
            message: 'Cart item updated successfully',
            cart
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating cart item',
            error: error.message
        });
    }
};

const removeCartItem = async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const userId = req.user.id;

        // Tìm giỏ hàng
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Xóa item bằng phương thức remove của mongoose
        const itemIndex = cart.items.findIndex(
            item => item._id.toString() === cartItemId
        );


        cart.items.splice(itemIndex, 1);

        cart.calculateTotalPrice();

        await cart.save();

        res.status(200).json({
            message: 'Cart item removed successfully',
            cart
        });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({
            message: 'Error removing cart item',
            error: error.message
        });
    }
};

const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user.id });
        res.status(200).json({
            message: 'Đã xóa giỏ hàng'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi xóa giỏ hàng',
            error: error.message
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
};