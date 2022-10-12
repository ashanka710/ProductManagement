const productModel = require('../models/productModel')
const { stringChecking, isValidSizes, installmentsRegex } = require('./validator')
const { uploadFile } = require("../utils/aws");

const productValidation = async (req, res, next) => {
    try {
        const data = req.body
        const files = req.files

        const { title, description, currencyId, currencyFormat } = data

        if (!stringChecking(title)) return res.status(400).send({ status: false, message: "title must be present and non empty string" })
        const checkingTitle = await productModel.findOne({ title: title })
        if (checkingTitle) return res.status(400).send({ status: false, message: "title must be unique" })

        if (!stringChecking(description)) return res.status(400).send({ status: false, message: "description must be present and non empty string" })

        if(!data.price) return res.status(400).send({ status: false, message: "price must be present"})
        data.price  = JSON.parse(data.price)
        if(typeof data.price !== "number") return res.status(400).send({ status: false, message: "price must be present and non empty number" })

        if (typeof currencyId != "string" || currencyId !== "INR") return res.status(400).send({ status: false, message: "currencyId must be present and only INR" })

        if (typeof currencyFormat != "string" || currencyFormat !== "₹") return res.status(400).send({ status: false, message: "currencyFormat must be present and only ₹" })

        if (data.isFreeShipping) {
            data.isFreeShipping = JSON.parse(data.isFreeShipping)
            if (typeof data.isFreeShipping !== 'boolean') return res.status(400).send({ status: false, message: "isFreeShipping is in boolean" })
        } else {
            data.isFreeShipping = false
        }

        if (data.style) {
            if (!stringChecking(data.style)) return res.status(400).send({ status: false, message: "style should be in string only" })
        }

        if (data.availableSizes) {
            data.availableSizes = JSON.parse(data.availableSizes)
            if (!isValidSizes(data.availableSizes)) return res.status(400).send({ status: false, message: `availableSizes should be only ["S", "XS", "M", "X", "L", "XXL", "XL"] ` })
        }

        if (data.installments) {
            data.installments = JSON.parse(data.installments)
            if (!installmentsRegex.test(data.installments)) return res.status(400).send({ status: false, message: "installments should be in number only" })
        }

        data.isDeleted = false

        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0])
            data.productImage = uploadedFileURL
        }
        else {
            return res.status(400).send({ msg: "No file found, productImage must be present" })
        }
        req.data = data
        next()
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { productValidation }