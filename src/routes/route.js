const express = require('express')
const router = express.Router()
const { getUserById, loginUser } = require("../controllers/userController")
const { authentication} = require("../middelwares/auth")



router.get('/user/:userId/profile', authentication, getUserById)
router.post('/login', loginUser)

module.exports = router