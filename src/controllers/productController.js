const productModel = require('../models/productModel')
const {validateObjectId} = require('../validators/validator')



const productsListing = async(req, res) => {
    const product = req.data

    const products = await productModel.create(product)
    return res.status(201).send({ status: false, message: "Product created successfully", data: products })
}

const getproductById = async function(req, res) {
    try {
        const productId = req.params.productId

        if (!productId) return res.status(400).send({ status: false, message: "productId is required" })
        if (!validateObjectId(productId)) return res.status(400).send({ status: false, message: "productId must be valid" })
  
        const product = await productModel.findById(productId)
        if (!product || product.isDeleted == true) return res.status(404).send({ status: false, message: "product not found" })
        
        return res.status(200).send({ status: true, message: 'Success', data: product })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const deleteProduct = async (req, res) => {
    const productId = req.params.productId

    if(!validateObjectId(productId)) return res.status(400).send({ status: false, message: "productId must be present and valid"})

    const product = await productModel.findById(productId)
    if(!product) return res.status(404).send({status: false, message: "No product found"})
    if(product.isDeleted === true) return res.status(400).send({ status: false, message: "product is already deleted"})
    
    product.isDeleted = true
    await product.save()
    return res.status(200).send({status: true, message: "Product is successfully deleted"})
}


module.exports = { productsListing, getproductById, deleteProduct }