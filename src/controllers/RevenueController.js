const Order = require('../models/OrderModel')
const Product = require('../models/ProductModel')

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
const getBestSeller = async (req, res) => {
    try {
      // Lấy tham số limit từ query (mặc định là 10)
      const limit = parseInt(req.query.limit) || 10;

      const bestSellingProducts = await Order.aggregate([
          { 
              $unwind: "$orderItems" // Tách từng sản phẩm trong mảng `orderItems` 
          },
          {
              $group: {
                  _id: "$orderItems.product", // Nhóm theo sản phẩm
                  totalAmount: { $sum: "$orderItems.amount" }, // Tính tổng số lượng
              }
          },
          {
              $lookup: {
                  from: "products", // Liên kết với collection Product để lấy thêm thông tin sản phẩm
                  localField: "_id", // `product` từ Order
                  foreignField: "_id", // `_id` trong Product
                  as: "productDetails"
              }
          },
          {
              $sort: { totalAmount: -1 } // Sắp xếp giảm dần theo tổng số lượng
          },
          {
              $limit: limit // Giới hạn số sản phẩm trả về
          },
          {
              $project: {
                  _id: 0,
                  productId: "$_id",
                  totalAmount: 1,
                  productDetails: { $arrayElemAt: ["$productDetails", 0] } // Lấy chi tiết sản phẩm đầu tiên
              }
          }
      ]);

      res.status(200).json({
          success: true,
          data: bestSellingProducts
      });
  } catch (error) {
    console.error("Error fetching best-selling products:", error);
    res.status(500).json({
        success: false,
        message: "Failed to fetch best-selling products",
        error: error.message
    });
  }
}

const getSlowSeller =async (req, res) => {
    try {
        // Lấy tham số limit từ query (mặc định là 10)
        const limit = parseInt(req.query.limit) || 10;

        const slowSellingProducts = await Order.aggregate([
            { 
                $unwind: "$orderItems" // Tách từng sản phẩm trong mảng `orderItems` 
            },
            {
                $group: {
                    _id: "$orderItems.product", // Nhóm theo sản phẩm
                    totalAmount: { $sum: "$orderItems.amount" }, // Tính tổng số lượng
                }
            },
            {
                $lookup: {
                    from: "products", // Liên kết với collection Product để lấy thêm thông tin sản phẩm
                    localField: "_id", // `product` từ Order
                    foreignField: "_id", // `_id` trong Product
                    as: "productDetails"
                }
            },
            {
                $sort: { totalAmount: 1 } // Sắp xếp tăng dần theo tổng số lượng
            },
            {
                $limit: limit // Giới hạn số sản phẩm trả về
            },
            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    totalAmount: 1,
                    productDetails: { $arrayElemAt: ["$productDetails", 0] } // Lấy chi tiết sản phẩm đầu tiên
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: slowSellingProducts
        });
    } catch (error) {
        console.error("Error fetching slow-selling products:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch slow-selling products",
            error: error.message
        });
    }
};


const getLowProducts = async (req, res) => {
    try {
        // Lấy ngưỡng lọc (threshold) từ query params, mặc định là 10
        const threshold = parseInt(req.query.threshold) || 10;

        // Truy vấn các sản phẩm có số lượng tồn kho nhỏ hơn hoặc bằng threshold
        const lowStockProducts = await Product.find({ 
            countInStock: { $lte: threshold }, // Lọc số lượng tồn kho <= threshold
            deleted_at: null, // Không lấy sản phẩm bị xóa mềm
            isActive: true // Chỉ lấy sản phẩm đang hoạt động
        })
        .sort({ countInStock: 1 }) // Sắp xếp tăng dần theo số lượng tồn kho
        .select('name price countInStock description'); // Chỉ lấy các trường cần thiết

        res.status(200).json({
            success: true,
            data: lowStockProducts,
        });
    } catch (error) {
        console.error("Error fetching low-stock products:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch low-stock products",
            error: error.message,
        });
    }
};




module.exports = { getTotalRevenue, getRevenueByProduct, getMonthlyRevenue,getBestSeller, getSlowSeller, getLowProducts };
