    const mongoose = require('mongoose')

    const userSchema = new mongoose.Schema(
        {
            role_id : {type : String },
            name : {type: String , required:true},
            email : {type: String , required:true , unique:true},
            password : {type: String , required:true},
            phone : {type: Number , required:true},
            address : {type: Number },
            ranking : {type:String },
            isAdmin : {type: Boolean ,default:false , required:true},
            access_token : {type: String ,default:false , required:true},
            refresh_token : {type: String ,default:false , required:true},
            deleted_at : {type: Date ,default:null },

        },
        {
            timestamps:true
        }
    )

    const User = mongoose.model("User" , userSchema)

    module.exports = User;