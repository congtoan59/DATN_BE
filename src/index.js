const express = require('express')
const dotenv = require('dotenv')
const { default: mongoose } = require('mongoose')
const routes = require('./routes')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const nodemailer = require('nodemailer')
const cron = require('node-cron');
// const { resetDailyVoucherUsage } = require('./controllers/VoucherController');
dotenv.config()

const app = express()
const port = process.env.PORT || 3001


app.get('/' , (req , res) => {
    return res.send('Hello')
})
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({
    origin : 'http://localhost:5173', 
    credentials: true 
}))
routes(app)

mongoose.connect(`${process.env.MONGO_DB}`)
.then(() => {
    console.log('Connect DB success!');
    
})
.catch((err) => {
    console.log(err);
    
})

// Chạy vào lúc 0h hàng ngày để reset voucher
cron.schedule('0 0 * * *', () => {
    resetDailyVoucherUsage();
  });

app.listen(port , () => {
    console.log('Server is running in port ', +port );
    
})