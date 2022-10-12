const productModel = require('../models/productModel');
const getproductById = async function(req, res) {
    try {
        let productId = req.qurey.productId
        if (!productId) return res.status(400).send({ status: false, message: "ProductId is required" })
        if (!isValid(productId)) return res.status(400).send({ status: false, message: "ProductId is required" })
        if (!productId.match(ObjectId)) return res.status(400).send({ status: false, message: "ProductId is required" })
        let product = productModel.findById(productId)
        if (product || product.isDeleted == true)
            return res.status(404).send({ status: false, message: "Product not found" })
        return res.status(200).send({ status: true, message: 'Success', data: product })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const deleteproduct = async function(req, res) {
    try {
        const product = req.qurey.peoductId
        if (!product) return res.status(400).send({ status: false, message: "ProductId is required" })
        if (!isValid(product)) return res.status(400).send({ status: false, message: "ProductId is required" })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
module.exports = { getproductById, deleteproduct }