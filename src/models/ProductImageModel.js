const mongoose = require('mongoose')

const productImageSchema = new mongoose.Schema(
    {
        product :{
            type : mongoose.Schema.Types.ObjectId ,
            ref : 'Product',
            required:true
        },
        url :{type:String , required:true},
        alt :{type:String ,  required: false },
        isFeatured :{type:Boolean , default:false },
        order :{type: Number , default :0 },
        deleted_at:{type : Date , default:null}
    },
    {
        timestamps:true
    }

)

const ProductImage = mongoose.model('ProductImage' , productImageSchema)
module.exports = ProductImage 