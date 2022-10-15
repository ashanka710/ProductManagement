const express = require('express')
const router = express.Router()

const { getUserById, loginUser, register, updateUser } = require("../controllers/userController")
const { authentication, authorization } = require("../middelwares/auth")
const { userValidation, updateValidation } = require('../validators/userValidation')


const { productsListing, getproductById, updateProduct, deleteProduct, getProductDetails } = require('../controllers/productController')
const { productValidation, pUpdateValidation } = require('../validators/productValidation')


router.post('/register', userValidation, register)
router.post('/login', loginUser)
router.get('/user/:userId/profile', authentication, authorization, getUserById)
router.put('/user/:userId/profile', authentication, authorization, updateValidation, updateUser)

router.post('/products', productValidation, productsListing)
router.get('/products/:productId', getproductById)
router.put('/products/:productId', pUpdateValidation, updateProduct)
router.delete('/products/:productId', deleteProduct)
router.get('/products',getProductDetails)

module.exports = router