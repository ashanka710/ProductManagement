const productModel = require('../models/productModel')

const productsListing = async (req, res) => {
    const product = req.data

    const products = await productModel.create(product)
    return res.status(201).send({status: false, message: "Product created successfully", data: products})
}


module.exports = { productsListing }