const express = require('express')
const router = express.Router()
const { getUserById, loginUser } = require("../controllers/userController")
const { authentication, authorization} = require("../middelwares/auth")



router.get('/user/:userId/profile', authentication, authorization, getUserById)
router.post('/login', loginUser)

module.exports = router