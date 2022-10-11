const jwt = require("jsonwebtoken")
const userModel = require('../models/userModel')
const {validateObjectId} = require('../validators/validator')



const authentication = async (req, res, next) => {
    try {
        let token = req.headers.authorization
        token = token.split(" ")
        if(!token[1]) return res.status(400).send({ status: false, message: "token is not present"})
        jwt.verify(token[1], "project36", (error, decodedToken) => {
            if(error) return res.status(401).send({status: false, message: "Token is invalid"})
            else {
                req.decodedToken = decodedToken
                next()
            }
        })

    } catch (error) {
        return res.status(500).send({status: false, error: error.message})
    }
}


const authorization = async function (req, res, next) {
    try {
        let decoded = req.decodedToken
        let paramsUserId = req.params.userId
        if (!validateObjectId(paramsUserId)) return res.status(400).send({ status: false, msg: "please enter valid userId" })

        let userLoggedIn = decoded.userId
        let user = await userModel.findById(paramsUserId)
        if (!user) return res.status(404).send({ status: false, message: "user not Found" })

        if (user._id !== userLoggedIn) {
            return res.status(403).send({ status: false, message: "You are not an authorised Person" })
        }
        next()
        
    }catch (error) {
        return res.status(500).send({status: false, error: error.message})
    }
}

module.exports = {authentication, authorization}