const Order = require("../models/OrderModel");
const Cart = require("../models/CartModel");
const Product = require("../models/ProductModel");
const Voucher = require('../models/VoucherModel')
const { genneralAccessToken } = require("../services/JwtServices");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')

// const createOrder = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const token = req.headers.authorization?.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({
//         status: "Error",
//         message: "Không tìm thấy token",
//       });
//     }

//     const user = jwt.verify(token, process.env.ACCESS_TOKEN);
//     const {
//       orderItems,
//       shippingAdress,
//       paymentMethod,
//       itemsPrice,
//       shippingPrice,
//       totalPrice,
//       // voucher
//     } = req.body;

//     // if (voucher) {
//     //   const voucherDetail = await Voucher.findById(voucher);

//     //   if (!voucherDetail || !voucherDetail.isActive) {
//     //     await session.abortTransaction();
//     //     session.endSession();
//     //     return res.status(400).json({
//     //       status: "Error",
//     //       message: "Voucher không hợp lệ"
//     //     });
//     //   }
//     //   if (voucherDetail.minOrderValue && totalPrice < voucherDetail.minOrderValue) {
//     //     await session.abortTransaction();
//     //     session.endSession();
//     //     return res.status(400).json({
//     //       status: "Error",
//     //       message: `Voucher chỉ áp dụng cho đơn hàng từ ${voucherDetail.minOrderValue.toLocaleString()} VNĐ`
//     //     });
//     //   }

//     //   // Tính lại giá trị đơn hàng sau khi áp dụng voucher
//     //   let discountAmount = 0;
//     //   if (voucherDetail.discountType === 'percentage') {
//     //     discountAmount = (totalPrice * voucherDetail.discountValue) / 100;
//     //     if (voucherDetail.maxDiscountAmount && discountAmount > voucherDetail.maxDiscountAmount) {
//     //       discountAmount = voucherDetail.maxDiscountAmount;
//     //     }
//     //   } else if (voucherDetail.discountType === 'fixed') {
//     //     discountAmount = voucherDetail.discountValue;
//     //   }

//     //   const finalTotalPrice = totalPrice - discountAmount;


//       // Kiểm tra số lượng sản phẩm trong kho
//       for (const item of orderItems) {
//         const product = await Product.findById(item.product);

//         if (!product) {
//           await session.abortTransaction();
//           session.endSession();
//           return res.status(404).json({
//             status: "Error",
//             message: `Sản phẩm ${item.name} không tồn tại`,
//           });
//         }

//         if (product.countInStock < item.amount) {
//           await session.abortTransaction();
//           session.endSession();
//           return res.status(400).json({
//             status: "Error",
//             message: `Sản phẩm ${product.name} không đủ số lượng. Chỉ còn ${product.countInStock} sản phẩm`,
//           });
//         }

//         // Trừ số lượng sản phẩm trong kho
//         product.countInStock -= item.amount;
//         await product.save({ session });
//       }

//       const newOrder = new Order({
//         orderItems,
//         shippingAdress,
//         paymentMethod,
//         itemsPrice,
//         shippingPrice,
//         totalPrice: finalTotalPrice,
//         // voucher: voucher,
//         user: user.id,
//         isPaid: false,
//         isDelivered: false,
//       });
//       voucherDetail.claimCount += 1;
//       await voucherDetail.save({ session });

//       const savedOrder = await newOrder.save({ session });
//       const cart = await Cart.findOne({ user: user.id });
//       if (cart) {
//         await cart.clearCart();
//       }

//       await session.commitTransaction();
//       session.endSession();

//       res.status(200).json({
//         status: "OK",
//         message: "Đặt hàng thành công !",
//         data: savedOrder,
//       });
//     }
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     res.status(500).json({
//       status: "Error",
//       message: "Lỗi khi tạo đơn hàng",
//       error: error.message
//     });
//   }
// };
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
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
    } = req.body;

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
      totalPrice,
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

    res.status(500).json({
      status: "Error",
      message: "Lỗi khi tạo đơn hàng",
      error: error.message
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
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({
        status: 'Error',
        message: 'Không tìm thấy token'
      });
    }

    const { isPaid, deliveryStatus } = req.body;
    const orderId = req.headers.id;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: 'Error',
        message: 'Không tìm thấy đơn hàng'
      });
    }
    if (isPaid !== undefined) {
      order.isPaid = isPaid;
      if (isPaid) order.paidAt = Date.now();
    }

    const validStatuses = [
      'Chờ xác nhận đơn hàng',
      'Đơn hàng đang chuẩn bị',
      'Đơn hàng đã được giao',
      'Đơn hàng giao thành công',
    ];
    if (deliveryStatus && validStatuses.includes(deliveryStatus)) {
      order.deliveryStatus = deliveryStatus;

      if (deliveryStatus === 'Đơn hàng đã được giao') {
        order.deliveredAt = Date.now();
      } else if (deliveryStatus) {
        return res.status(400).json({
          status: 'Error',
          message: 'Trạng thái giao hàng không hợp lệ',
        });
      }
    }
    const updatedOrder = await order.save();

    // Tạo access token mới
    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN);
    const newAccessToken = await genneralAccessToken({
      id: decoded.id,
      isAdmin: decoded.isAdmin,
      name: decoded.name
    });

    res.status(200).json({
      status: 'OK',
      message: 'Success',
      data: updatedOrder,
      access_token: newAccessToken
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Lỗi server'
    });
  }
}

const cancelOrder = async (req, res) => {
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
    const order = await Order.findById(orderId);
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

    if (order.isPaid || !order.deliveryStatus === "Chờ xác nhận đơn hàng") {
      return res.status(400).json({
        status: 'Error',
        message: 'Không thể hủy đơn hàng đã thanh toán hoặc đã giao'
      });
    }

    await Order.findByIdAndDelete(orderId);

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
