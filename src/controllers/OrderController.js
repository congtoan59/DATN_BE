const Order = require("../models/OrderModel");
const Cart = require("../models/CartModel");
const Product = require("../models/ProductModel");
const Voucher = require('../models/VoucherModel')
const { genneralAccessToken } = require("../services/JwtServices");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('Req body', req.body);

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: "Error",
        message: "Không tìm thấy token",
      });
    }


    const user = jwt.verify(token, process.env.ACCESS_TOKEN);

    const {
      orderItems,
      shippingAdress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      code
    } = req.body;

    let finalTotalPrice = totalPrice;
    let appliedVoucher = null;
    if (code) {
      const voucher = await Voucher.findOne({ code: code });
      console.log('voucher', voucher);


      if (!voucher) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: "Error",
          message: "Voucher không tồn tại",
        });
      }

      // Kiểm tra voucher có hợp lệ không
      if (!voucher.isActive || voucher.validTo < new Date()) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: "Error",
          message: "Voucher không hợp lệ",
        });
      }

      // Kiểm tra điều kiện voucher
      if (voucher.minOrderValue && itemsPrice < voucher.minOrderValue) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: "Error",
          message: `Voucher chỉ áp dụng cho đơn hàng từ ${voucher.minOrderValue} trở lên`,
        });
      }

      // Kiểm tra số lần sử dụng voucher
      if (voucher.claimCount >= voucher.maxClaim) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: "Error",
          message: "Voucher đã hết lượt sử dụng",
        });
      }

      // Tính toán giảm giá

      if (voucher.discountType === 'percentage') {
        const discount = itemsPrice * (voucher.discountValue / 100);
        finalTotalPrice = itemsPrice - discount;
      } else if (voucher.discountType === 'fixed') {
        finalTotalPrice = totalPrice - voucher.discountValue;
      }

      // Tăng số lần sử dụng voucher
      voucher.claimCount += 1;
      await voucher.save({ session });

      // Đánh dấu voucher đã được sử dụng
      appliedVoucher = voucher._id;
    }

    // Kiểm tra số lượng sản phẩm trong kho
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          status: "Error",
          message: `Sản phẩm ${item.name} không tồn tại`,
        });
      }

      if (product.countInStock < item.amount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: "Error",
          message: `Sản phẩm ${product.name} không đủ số lượng. Chỉ còn ${product.countInStock} sản phẩm`,
        });
      }

      // Trừ số lượng sản phẩm trong kho
      product.countInStock -= item.amount;
      await product.save({ session });
    }

    const newOrder = new Order({
      orderItems,
      shippingAdress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice: finalTotalPrice,
      appliedVoucher,
      user: user.id,
      isPaid: false,
      isDelivered: false,
    });

    const savedOrder = await newOrder.save({ session });



    const cart = await Cart.findOne({ user: user.id });
    if (cart) {
      await cart.clearCart();
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "OK",
      message: "Đặt hàng thành công !",
      data: savedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Complete Error:', error);

    res.status(500).json({
      status: "Error",
      message: "Lỗi khi tạo đơn hàng",
      errorDetails: error.message,
      errorStack: error.stack
    });
  }
};

const getAllOrder = async (req, res) => {
 
  try {
    // const token = req.headers.token;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'Erorr',
        message: 'Không tìm thấy token !'
      })
    }

    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('orderItems.product', 'name imageUrls')
      .sort({ createdAt: -1 });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const newAccessToken = genneralAccessToken({
      id: decoded.id,
      role: decoded.role,
      name: decoded.name
    });
    res.status(200).json({
      status: 'OK',
      message: 'Success',
      data: orders,
      access_token: newAccessToken
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Lỗi server'
    });
  }
}

const getOrdersByUser = async (req, res) => {
  try {
    const token = req.headers.token;
    const userId = req.headers.id

    if (!token) {
      return res.status(401).json({
        status: 'Error',
        message: 'Không tìm thấy token !'
      })
    }

    const user = jwt.verify(token, process.env.ACCESS_TOKEN)

    if (user.id != userId && !user.role) {
      return res.status(403).json({
        status: 'Error',
        message: 'Không có quyền truy cập !'
      })
    }
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'orderItems.product',
        populate: {
          path: 'imageUrls',
          model: 'ProductImage'
        }
      });

    // Tạo access token mới
    const newAccessToken = await genneralAccessToken({
      id: user.id,
      role: user.role,
      name: user.name
    });

    res.status(200).json({
      status: 'OK',
      message: 'Success',
      data: orders,
      access_token: newAccessToken
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Lỗi server'
    });
  }
}

const updateOrderStatus = async (req, res) => {
  console.log(req.body);

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'Error',
        message: 'Không tìm thấy token'
      });
    }

    const { deliveryStatus } = req.body;
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: 'Error',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const validStatuses = [
      'Chờ xác nhận đơn hàng',
      'Đơn hàng đang chuẩn bị',
      'Đơn hàng đang được vận chuyển',
      'Đơn hàng giao thành công',
      'Đơn hàng đã bị từ chối'
    ];

    if (deliveryStatus && validStatuses.includes(deliveryStatus)) {
      // Thêm trạng thái mới vào lịch sử
      order.statusHistory.push({
        status: deliveryStatus,
        updatedAt: new Date()
      });

      order.deliveryStatus = deliveryStatus;
      // Nếu từ chối đơn hàng, hoàn lại số lượng sản phẩm
      if (deliveryStatus === 'Đơn hàng đã bị từ chối') {
        order.rejectedAt = new Date();
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            product.countInStock += item.amount;
            await product.save();
          }
        }
      }

      const updatedOrder = await order.save();

      return res.status(200).json({
        status: 'OK',
        message: 'Cập nhật trạng thái đơn hàng thành công',
        data: updatedOrder
      });
    } else {
      return res.status(400).json({
        status: 'Error',
        message: 'Trạng thái giao hàng không hợp lệ'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'Error',
      message: 'Lỗi server'
    });
  }
};

const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const token = req.headers.token;
    const orderId = req.params.id;

    if (!token) {
      return res.status(401).json({
        status: 'Error',
        message: 'Không tìm thấy token'
      });
    }
    const user = jwt.verify(token, process.env.ACCESS_TOKEN);
    const order = await Order.findById(orderId).populate('orderItems.product');
    if (!order) {
      return res.status(404).json({
        status: 'Error',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.user.toString() !== user.id && !user.role === 'user') {
      return res.status(403).json({
        status: 'Error',
        message: 'Không có quyền hủy đơn hàng này'
      });
    }

    if (order.isPaid || !order.deliveryStatus === "Chờ xác nhận đơn hàng" || !order.deliveryStatus === "Đơn hàng đã bị từ chối") {
      return res.status(400).json({
        status: 'Error',
        message: 'Không thể hủy đơn hàng đã thanh toán hoặc đã giao'
      });
    }
    for (const item of order.orderItems) {
      const product = item.product;
      if (product) {
        product.countInStock += item.amount;
        await product.save({ session });
      }
    }

    await Order.findByIdAndDelete(orderId, { session });

    await session.commitTransaction();
    session.endSession();
    const newAccessToken = await genneralAccessToken({
      id: user.id,
      role: user.role,
      name: user.name
    });

    res.status(200).json({
      status: 'OK',
      message: 'Hủy đơn hàng thành công',
      access_token: newAccessToken
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      status: 'Error',
      message: 'Lỗi server'
    });
  }

}

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate({
        path: 'orderItems.product',
        populate: {
          path: 'imageUrls',
          model: 'ProductImage'
        }
      });


    if (!order) {
      return res.status(404).json({
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Kiểm tra xem người dùng có quyền xem đơn hàng này không
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Bạn không có quyền xem đơn hàng này'
      });
    }

    res.status(200).json({
      status: 'OK',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi lấy chi tiết đơn hàng',
      error: error.message
    });
  }
};



module.exports = {
  createOrder,
  getAllOrder,
  getOrdersByUser,
  updateOrderStatus,
  cancelOrder,
  getOrderById,
};
