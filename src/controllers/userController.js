let userModel = require('../model/userModel');
let jwt = require('jsonwebtoken')
const { isvalidEmail, checkPassword } = require('../validators/validation')











const loginUser = async (req, res) => {
    const user = req.body;
    if (Object.keys(user).length === 0) return res.status(400).send({ status: false, message: "enter a field to login" });

    const { email, password } = user

    if (!isvalidEmail.test(email)) return res.status(400).send({ status: false, message: "email must be present and valid" });
    if (!checkPassword.test(password)) return res.status(400).send({ status: false, message: "Please Enter Your Password" });

    const loggedInUser = await userModel.findOne({ email: email, password: password }).select({ _id: 1 })
    if (!loggedInUser) return res.status(404).send({ status: false, message: "No user Found With The Input Credentials, Please Confirm The Credentials" });

    const token = jwt.sign({ userId: loggedInUser }, "project36", { expiresIn: '1h' });
    return res.status(200).send({ status: true, message: "Success", data: { token, loggedInUser } })
}

module.exports = { loginUser };