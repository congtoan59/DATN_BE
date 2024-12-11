const Order = require('../models/OrderModel')

// Tính tổng thu nhập từ các đơn hàng đã thanh toán
const getTotalRevenue = async (req, res) => {
    try {
        const totalRevenue = await Order.aggregate([
            {
                $match: {
                    $or: [
                        { isPaid: true }, // Đã thanh toán
                        { deliveryStatus: "Đơn hàng giao thành công" }, // Trạng thái giao thành công
                    ],
                }, // Lọc các đơn hàng đã thanh toán
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalPrice" } // Tổng giá trị các đơn hàng
                }
            }
        ]);

        res.status(200).json({
            success: true,
            totalRevenue: totalRevenue[0] ? totalRevenue[0].total : 0,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tính doanh thu theo từng sản phẩm
const getRevenueByProduct = async (req, res) => {
    try {
        const revenueByProduct = await Order.aggregate([
            { $match: { isPaid: true } }, // Lọc các đơn hàng đã thanh toán
            { $unwind: "$orderItems" }, // Tách các items trong đơn hàng
            {
                $group: {
                    _id: "$orderItems.product", // Nhóm theo từng sản phẩm
                    totalRevenue: { $sum: { $multiply: ["$orderItems.amount", "$orderItems.price"] } }, // Doanh thu của mỗi sản phẩm
                    totalAmount: { $sum: "$orderItems.amount" } // Tổng số lượng sản phẩm đã bán
                }
            },
            {
                $lookup: {
                    from: "Product", // Tên collection trong MongoDB
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            }
        ]);

        res.status(200).json({
            success: true,
            revenueByProduct,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const getMonthlyRevenue = async (req, res) => {
    try {
        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    $or: [
                        { isPaid: true },
                        { deliveryStatus: "Đơn hàng giao thành công" },
                    ],
                },
            },
            {
                $group: {
                    _id: { $month: "$createdAt" }, // Nhóm theo tháng
                    totalRevenue: { $sum: "$totalPrice" },
                },
            },
            {
                $sort: { _id: 1 }, // Sắp xếp theo tháng
            },
        ]);

        const revenueByMonth = Array(12).fill(0); // Khởi tạo mảng 12 tháng với giá trị 0

        monthlyRevenue.forEach((item) => {
            revenueByMonth[item._id - 1] = item.totalRevenue; // Cập nhật doanh thu theo tháng
        });

        res.status(200).json({ success: true, revenueByMonth });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = { getTotalRevenue, getRevenueByProduct, getMonthlyRevenue };
