const UserRouter = require('./UserRouter')
const ProductRouter = require('./ProductRouter')
const CategoryRouter = require('./CategoryRouter')
const OrderRouter = require('./OrderRouter')
const CartRouter = require('./CartRouter')
const VoucherRouter = require('./VoucherRouter')
const RevenueController = require('./RevenueRouter')
const routes = (app) => {
    app.use('/api/user', UserRouter)
    app.use('/api/product', ProductRouter)
    app.use('/api/category', CategoryRouter)
    app.use('/api/cart', CartRouter)
    app.use('/api/order', OrderRouter)
    app.use('/api/voucher', VoucherRouter)
    app.use('/api/revenue', RevenueController)
}

module.exports = routes