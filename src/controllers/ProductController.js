const ProductService = require('../services/ProductService')

// TẠO SẢN PHẨM CONTROL
const createProduct = async (req , res ) => {
    try {
        
        const {name , type , price , countInStock , description } = req.body
        
        
      
        if(!name  || !type || !price || !countInStock || !description ){
            return res.status(200).json({
                status:'Err' ,
                message:'The input is required'
            })
        }
        const response = await ProductService.createProduct(req.body)
        
        
        return res.status(200).json(response)
        
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}

// UPDATE SẢN PHẨM CONTROL
const updateProduct = async (req , res ) => {
    try {
        const productId = req.params.id
        const data = req.body
        
        if(!productId){
            return res.status(200).json({
                status : 'Err',
                message : 'The productId is required'
            })
        }
        
        const response = await ProductService.updateProduct(productId ,data)
        return res.status(200).json(response)
        
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}

// XÓA SẢN PHẨM CONTROL
const deleteProduct = async (req , res ) => {
    try {
        const productId = req.params.id
        if(!productId){
            return res.status(200).json({
                status : 'Err',
                message : 'The userId is required'
            })
        }
        
        const response = await ProductService.deleteProduct(productId )
        return res.status(200).json(response)
        
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}

// GET ALL SẢN PHẨM 
const getAllProduct = async (req , res ) => {
    try {
        const response = await ProductService.getAllProduct()
        return res.status(200).json(response)
        
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}
// GET FILLTER
const getFillterProduct = async (req , res ) => {
    
    

    try {
        const fillter = req.params.fillter

        const response = await ProductService.getFillterProduct(fillter)
        return res.status(200).json(response)
        
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}

//GET DETAIL SẢN PHẨM 
const getDetailProduct = async (req , res ) => {
    try {
        const productId = req.params.id
        
        
        if(!productId){
            return res.status(200).json({
                status : 'Err',
                message : 'The ProductId is required'
            })
        }
        
        const response = await ProductService.getDetailProduct(productId )
        return res.status(200).json(response)
        
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}

module.exports = {
   createProduct,
   updateProduct,
   deleteProduct,
   getAllProduct,
   getFillterProduct,
   getDetailProduct
}