const express = require('express')
const router = express.Router()

//=========================controllers require================================//
const { getUserById, loginUser, register, updateUser } = require("../controllers/userController")
const { productsListing, getproductById, updateProduct, deleteProduct, getProductDetails } = require('../controllers/productController')
const { createCart, updateCart, getCart, deleteCart } = require("../controllers/cartController")
const { createOrder, updateOrder } = require('../controllers/orderController')


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
router.put('/users/:userId/cart', authentication, authorization, updateCart)
router.get("/users/:userId/cart", authentication, authorization, getCart)
router.delete("/users/:userId/cart", authentication, authorization, deleteCart)

//=========================Order routes================================//
router.post("/users/:userId/orders", authentication, authorization, createOrder);
router.put("/users/:userId/orders", authentication, authorization, updateOrder);

module.exports = router