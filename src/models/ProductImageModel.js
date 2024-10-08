const mongoose = require('mongoose')

const productImageSchema = new mongoose.Schema(
    {
        product :{
            type : mongoose.Schema.Types.ObjectId ,
            ref : 'Product',
            require:true
        },
        url :{type:String , required:true},
        alt :{type:String , },
        isFeatured :{type:Boolean , default:false },
        order :{type:String , default :0 },
        deleted_at:{type : Date , default:null}
    },
    {
        timestamps:true
    }

)

const ProductImage = mongoose.model('ProductImage' , productImageSchema)
module.exports = ProductImage 