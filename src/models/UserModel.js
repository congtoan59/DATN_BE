    const mongoose = require('mongoose')

    const userSchema = new mongoose.Schema(
        {
            role_id : {type : String },
            name : {type: String , required:true},
            email : {type: String , required:true , unique:true},
            password : {type: String , required:true},
            phone : {type: Number },
            address : {type: Number },
            ranking : {type:String },
            role: { 
                type: String, 
                enum: ['user', 'manager', 'admin'], 
                default: 'user', 
                required: true 
            },
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