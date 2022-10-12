const bcrypt = require('bcrypt')
const { uploadFile } = require("../utils/aws");
const userModel = require('../models/userModel')
const { nameRegex, addressValid, mailRegex, mobileRegex, passwordRegex, pinValid, imageValid, } = require('./validator')

const userValidation = async (req, res, next) => {
  try {
    const data = req.body;
    const { fname, lname, password, email, phone } = data;
    const files = req.files;

    //Validation for First Name
    if (!nameRegex(fname)) return res.status(400).send({ status: false, msg: "fname must be present and in correct format" });

    //Validation for the Last Name
    if (!nameRegex(lname)) return res.status(400).send({ status: false, msg: "lname must be present and in correct format" });

    //Validation for Email
    if (!mailRegex(email)) return res.status(400).send({ status: false, msg: "email must be present and valid" });
    const checkUser = await userModel.findOne({ email: email });
    if (checkUser) return res.status(400).send({ status: false, msg: "EmailId already taken" });

    //Validation for Phone Number
    if (!mobileRegex(phone)) return res.status(400).send({ status: false, msg: "Please give only valid Indian phone number" });
    const checkphone = await userModel.findOne({ phone: phone });
    if (checkphone) return res.status(400).send({ status: false, msg: "Phone Number is already taken" });

    //Validation for password
    if (!passwordRegex(password)) return res.status(400).send({ status: false, msg: "Password must be present in between 8 to 15 mixed with upper, lower and symbol letter" });
    const encryptedPass = await bcrypt.hash(password, 10); //encrypting password
    req.body.password = encryptedPass;

    //Validation for Address
    if (data.address) {
      data.address = JSON.parse(data.address);
      if (typeof data.address !== "object") return res.status(400).send({ status: false, msg: "address must be present and an object" });

      const { shipping, billing } = data.address;

      //Validation for Shipping Address
      if (typeof shipping !== "object") return res.status(400).send({ status: false, msg: "shipping must be present and an object" });

      //validation for street
      if (!addressValid(shipping.street)) return res.status(400).send({ status: false, msg: "shipping street must be present and in correct format" });

      //Validation for city
      if (!nameRegex(shipping.city)) return res.status(400).send({ status: false, msg: "shipping city must be present and in correct format" });

      //validation for pincode
      if (!pinValid(shipping.pincode)) return res.status(400).send({ status: false, msg: "shipping pincode must be present and valid" });

      //Validation for billing Address
      if (typeof billing !== "object") return res.status(400).send({ status: false, msg: "billing must be present and an object" });

      //validation for street
      if (!addressValid(billing.street)) return res.status(400).send({ status: false, msg: "billing street must be present and in correct format" });

      //Validation for city
      if (!nameRegex(billing.city)) return res.status(400).send({ status: false, msg: "billing city must be present and in correct format" });

      //validation for pincode
      if (!pinValid(billing.pincode)) return res.status(400).send({ status: false, msg: "billing pincode must be present and valid" });
    } else {
      return res.status(400).send({ status: false, msg: "address must be present and an object" });
    }

    //validation for product Image
    if (files && files.length > 0) {
      let uploadedFileURL = await uploadFile(files[0])
      data.profileImage = uploadedFileURL
    }
    else {
      return res.status(400).send({ msg: "No file found, profile must be present" })
    }
    req.data = data
    next()
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }

}

const updateValidation = async (req, res, next) => {
  const userId = req.params.userId
  const data = req.body
  const files = req.files;

  const user = await userModel.findById(userId)
  if (!user) return res.status(400).send({ status: false, message: "User not found" })
  if (Object.keys(data).length === 0 && !files) return res.status(400).send({ status: false, message: "Please provide field to update" })

  const filter = {}

  if (data.fname) {
    if (!nameRegex(data.fname)) return res.status(400).send({ status: false, msg: "fname must be present and in correct format" });
    filter.fname = data.fname
  }

  if (data.lname) {
    if (!nameRegex(data.lname)) return res.status(400).send({ status: false, msg: "lname must be present and in correct format" });
    filter.lname = data.lname
  }
  if (data.email) {
    if (!mailRegex(data.email)) return res.status(400).send({ status: false, msg: "email must be present and valid" });
    const checkUser = await userModel.findOne({ email: data.email });
    if (checkUser) return res.status(400).send({ status: false, msg: "EmailId already taken" });
    filter.email = data.email
  }

  if (data.phone) {
    if (!mobileRegex(data.phone)) return res.status(400).send({ status: false, msg: "Please give only valid Indian phone number" });
    const checkphone = await userModel.findOne({ phone: data.phone });
    if (checkphone) return res.status(400).send({ status: false, msg: "Phone Number is already taken" });
    filter.phone = data.phone
  }

  if (data.password) {
    if (!passwordRegex(data.password)) return res.status(400).send({ status: false, msg: "Password must be present in between 8 to 15 mixed with upper, lower and symbol letter" });
    const encryptedPass = await bcrypt.hash(data.password, 10); //encrypting password
    filter.password = encryptedPass;
  }

  if (data.address) {
    data.address = JSON.parse(data.address)
    if (typeof data.address !== "object") return res.status(400).send({ status: false, message: "address must be in an object form" })

    if (data.address.shipping) {
      if (typeof data.address.shipping !== "object") return res.status(400).send({ status: false, msg: "shipping must be present and an object" });

      if (data.address.shipping.street) {
        if (!addressValid(data.address.shipping.street)) return res.status(400).send({ status: false, msg: "shipping street must be present and in correct format" });
        filter["address.shipping.street"] = data.address.shipping.street
      }

      if (data.address.shipping.city) {
        if (!nameRegex(data.address.shipping.city)) return res.status(400).send({ status: false, msg: "shipping city must be present and in correct format" });
        filter["address.shipping.city"] = data.address.shipping.city
      }

      if (data.address.shipping.pincode) {
        if (!pinValid(data.address.shipping.pincode)) return res.status(400).send({ status: false, msg: "shipping pincode must be present and valid" });
        filter["address.shipping.pincode"] = data.address.shipping.pincode
      }

    }

    if (data.address.billing) {
      if (typeof data.address.billing !== "object") return res.status(400).send({ status: false, msg: "billing must be present and an object" });

      if (data.address.billing.street) {
        if (!addressValid(data.address.billing.street)) return res.status(400).send({ status: false, msg: "billing street must be present and in correct format" });
        filter["address.billing.street"] = data.address.billing.street
      }

      if (data.address.billing.city) {
        if (!nameRegex(data.address.billing.city)) return res.status(400).send({ status: false, msg: "billing city must be present and in correct format" });
        filter["address.billing.city"] = data.address.billing.city
      }

      if (data.address.billing.pincode) {
        if (!pinValid(data.address.billing.pincode)) return res.status(400).send({ status: false, msg: "billing pincode must be present and valid" });
        filter["address.billing.pincode"] = data.address.billing.pincode
      }

    }
  }
  if (files && files.length > 0) {
    let uploadedFileURL = await uploadFile(files[0])
    filter.profileImage = uploadedFileURL
  }
  req.filter = filter
  next()
}

module.exports = { userValidation, updateValidation }