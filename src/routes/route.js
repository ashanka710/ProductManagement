const express = require('express')
const router = express.Router()

//=========================controllers require================================//
const { getUserById, loginUser, register, updateUser } = require("../controllers/userController")
const { productsListing, getproductById, updateProduct, deleteProduct, getProductDetails } = require('../controllers/productController')
const { createCart, getCart, deleteCart } = require("../controllers/cartController")


//=========================middlewares, validation================================//
const { authentication, authorization } = require("../middelwares/auth")
const { userValidation, updateValidation } = require('../validators/userValidation')
const { productValidation, pUpdateValidation } = require('../validators/productValidation')


//=========================user routes================================//
router.post('/register', userValidation, register)
router.post('/login', loginUser)
router.get('/user/:userId/profile', authentication, authorization, getUserById)
router.put('/user/:userId/profile', authentication, authorization, updateValidation, updateUser)


//=========================product routes================================//
router.post('/products', productValidation, productsListing)
router.get('/products', getProductDetails)
router.get('/products/:productId', getproductById)
router.put('/products/:productId', pUpdateValidation, updateProduct)
router.delete('/products/:productId', deleteProduct)

//=========================cart routes================================//
router.post('/users/:userId/cart', authentication, authorization, createCart)
router.get("/users/:userId/cart", getCart)
router.delete("/users/:userId/cart", deleteCart)


module.exports = router