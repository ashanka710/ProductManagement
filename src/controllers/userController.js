const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { isvalidEmail, checkPassword, validateObjectId } = require('../validators/validator')







const getUserById = async (req, res) => {
    let userId = req.params.userId

    const userProfile = await userModel.findById(userId)
    if(!userProfile) return res.status(404).send({ status: false, message: `No user found with this id ${userId}`})

    return res.status(200).send({ status: true, message: "User profile details", data: userProfile})
}



const loginUser = async (req, res) => {
    const user = req.body;
    if (Object.keys(user).length === 0) return res.status(400).send({ status: false, message: "enter a field to login" });

    const { email, password } = user

    if (!isvalidEmail.test(email)) return res.status(400).send({ status: false, message: "email must be present and valid" });
    //if (!checkPassword.test(password)) return res.status(400).send({ status: false, message: "Please Enter Your Password" });

    const loggedInUser = await userModel.findOne({ email: email, password: password })
    const {_id} = loggedInUser
    if (!loggedInUser) return res.status(404).send({ status: false, message: "No user Found With The Input Credentials, Please Confirm The Credentials" });
    const token = jwt.sign({ userId: loggedInUser._id }, "project36", { expiresIn: '1h' });
    const data = {_id, token}
    return res.status(200).send({ status: true, message: "Success", data: data })
}

module.exports = { loginUser, getUserById };