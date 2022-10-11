const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { uploadFile } = require("../aws/aws.js");
const { isvalidEmail, checkPassword, validateObjectId } = require('../validators/validator')


//===================================================post api user=============================================================>
const register = async (req, res) => {
  try {
    let data = req.body;
    let { fname, lname, password, email, profileImage, phone } = req.body;
    let files = req.files;

    //Validation for First Name
    if (!isValid(fname))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide the First Name" });
    if (!nameRegex(fname))
      return res.status(400).send({
        status: false,
        msg: "Please give correct format of First name",
      });

    //Validation for the Last Name
    if (!isValid(lname))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide the Last Name" });
    if (!nameRegex(lname))
      return res
        .status(400)
        .send({ status: false, msg: "Please give corrct format of Lase name" });

    //Validation for Email
    if (!isValid(email))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide the Email" });
    if (!mailRegex(email))
      return res
        .status(400)
        .send({ status: false, msg: "Please give correct format of email" });
    const checkUser = await userModel.findOne({ email: email });
    if (checkUser) {
      return res
        .status(400)
        .send({ status: false, msg: "EmailId already taken" });
    }

    //Validation for Phone Number
    if (!isValid(phone))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide the phone Number" });
    if (!mobileRegex(phone))
      return res.status(400).send({
        status: false,
        msg: "Please give correct format of Phone Number",
      });
    const checkphone = await userModel.findOne({ phone: phone });
    if (checkphone) {
      return res
        .status(400)
        .send({ status: false, msg: "Phone Number is already taken" });
    }

    //Validation for password
    if (!isValid(password))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide the phone Number" });
    if (!passwordRegex(password))
      return res
        .status(400)
        .send({ status: false, msg: "Please give correct format of password" });
    const encryptedPass = await bcrypt.hash(password, 10); //encrypting password
    req.body.password = encryptedPass;

    //Validation for Address
    if (req.body.address) {
      req.body.address = JSON.parse(address);
      let { shipping, billing } = req.body.address;

      //Validation for Shipping Address
      if (!shipping)
        return res
          .status(400)
          .send({ status: false, msg: "Please enter shopping address" });
      if (shipping.street) {
        //validation for shtreet
        shipping.street = shipping.street.trim();
        if (!isValid(shipping.street))
          return res
            .status(400)
            .send({
              status: false,
              msg: "shipping street name must be present",
            });
        if (!addressValid(shipping.street))
          return res
            .status(400)
            .send({ status: false, msg: "shipping street name is requires" });
      } else {
        return res
          .status(400)
          .send({ status: false, msg: "shipping street name is required" });
      }

      if (shipping.city) {
        //Validation for city
        shipping.city = shipping.city.trim();
        if (!isValid(shipping.city))
          return res
            .status(400)
            .send({ status: false, msg: "shipping city name must be present" });
        if (!nameRegex(shipping.city))
          return res.status(400).send({
            status: false,
            msg: "Please enter valid shipping city name",
          });
      } else {
        return res
          .status(400)
          .send({ status: false, msg: "Shipping  City name is required" });
      }

      if (!shipping.pincode) {
        //validation for piincode
        if (!isValid(shipping.pincode))
          return res
            .status(400)
            .send({ status: false, msg: "shipping pincode is must" });
        if (!pinValid(shipping.pincode))
          return res
            .status(400)
            .send({ status: false, msg: "shipping pincode us must" });
      } else {
        return res
          .status(400)
          .send({ status: false, msg: "Shipping  Pincode is required" });
      }

      //Validation for Billing
      if (!billing)
        return res
          .status(400)
          .send({ status: false, msg: "Please Enter billing address" });
      if (billing.street) {
        //validation for street
        billing.street = billing.street.trim();
        if (!isValid(billing.street))
          return status(400).send({
            status: false,
            msg: "billing street must be preset",
          });
        if (!addressValid(billing.street))
          return res.status(400).send({
            status: false,
            msg: "Please enter valid billing street name",
          });
      } else {
        return res
          .status(400)
          .send({ status: false, msg: "Billing Street name is required" });
      }

      if (billing.city) {
        billing.city = billing.city.trim();
        if (!isValid(billing.city))
          return res.status({
            status: false,
            msg: "billing city name must be present",
          });
        if (!nameRegex(billing.city))
          return res
            .status(400)
            .send({
              status: false,
              msg: "Please Enter Valid billing city name",
            });
      } else {
        return res
          .status(400)
          .send({ status: false, message: "Billing city name is required" });
      }

      if (billing.pincode) {
        //validation for pincode
        if (!isValid(billing.pincode))
          return res
            .status(400)
            .send({ status: false, msg: "billing pincode must be present" });
        if (!pinValid(billing.pincode))
          return res
            .status(400)
            .send({ status: false, msg: "billing pincode is not valid" });
      } else {
        return res
          .status(400)
          .send({ status: false, msg: "Billing pincode is required" });
      }
    } else {
      return res
        .status(400)
        .send({ status: false, msg: "Please enter address" });
    }
    //validation for product Image
    if (files && files.length > 0) {
      if (!imageValid(files[0].originalname))
        return res.status(400).send({
          status: false,
          message: "file format can only png, gif, webp, jpeg, jpg",
        });
      var imageUrl = await uploadFile(files[0]);
      req.body.profileImage = imageUrl;
    } else {
      return res
        .status(400)
        .send({ status: false, message: "profileImage is required" });
    }

    //creating collection in DB
    const saveData = await userModel.create(req.body);
    return res
      .status(201)
      .send({ status: true, msg: "Success", data: saveData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
//===================================================post api user=============================================================>

//Start===================================================get api user=============================================================>


// const getUserById = async (req, res) => {
//     let userId = req.params.userId

//     const userProfile = await userModel.findById(userId)
//     if(!userProfile) return res.status(404).send({ status: false, message: `No user found with this id ${userId}`})

//     return res.status(200).send({ status: true, message: "User profile details", data: userProfile})
// }
const getUserById = async function(req,res){
    try{
        let userId = req.params.userId
        //validation for userId
        if(!isValid(userId))
        return res.status(400).send({ status: false, message: "UserId must be present it cannot remain empty" });
        if(!isValidObjectId(userId))
        return res.status(400).send({ status: false, message: "Please provide valid userId" });

        //find user in DB
        let checkUserId = await userModel.findById(userId);
        if(!checkUserId){
            return res.status(404).send({ status: false, message: "No User found" });
        }

        //authorization 
        if(req.decodedToken != userId)
            return res.status(403).send({ status: false, message: "Error, authorization failed" })

        return res.status(200).send({ status: true, message: "User profile details", data: checkUserId })

    }catch(err){
        return res.status(500).send({ status: false, message: error.message });
    }
}

//End===================================================get api user=============================================================>

// const loginUser = async (req, res) => {
//     const user = req.body;
//     if (Object.keys(user).length === 0) return res.status(400).send({ status: false, message: "enter a field to login" });

//     const { email, password } = user

//     if (!isvalidEmail.test(email)) return res.status(400).send({ status: false, message: "email must be present and valid" });
//     //if (!checkPassword.test(password)) return res.status(400).send({ status: false, message: "Please Enter Your Password" });

//     const loggedInUser = await userModel.findOne({ email: email, password: password })
//     const {_id} = loggedInUser
//     if (!loggedInUser) return res.status(404).send({ status: false, message: "No user Found With The Input Credentials, Please Confirm The Credentials" });
//     const token = jwt.sign({ userId: loggedInUser._id }, "project36", { expiresIn: '1h' });
//     const data = {_id, token}
//     return res.status(200).send({ status: true, message: "Success", data: data })
// }

const loginUser = async function(req,res){
    try{
        let data = req.body;

        if (!isValidRequest(data))
          return res
            .status(400)
            .send({
              status: false,
              msg: "Please Prove email and passworrd to login",
            });
        let { email, password } = data;
        //validation for email
        if(!isValid(email) || !isValid(password))
        return res
          .status(400)
          .send({ status: false, message: "Credential must be present" });

        //find Email in Db
        let user = await userModel.findOne({email: email});
        if(!user){
            return res.status(400).send({ status: false, message: "Credential is not correct", });
        }
        let isValidPassword = bcrypt.compare(password.trim(),user.password);
        if(!isValidPassword){
            return res
              .status(400)
              .send({ status: false, message: "Password is not correct" });
        }


        //token genration
        let token = jwt.sign({
            userId : user._id.toString(),
            batch : "plutonium",
            organization : "functionup"
        },
        "project5-group36",{
            'expiresIn': '24h'
        });

        const finalData = {
            userId : user._id,
            token : token,
        }

        res.status(200).send({status:false,message: "User login successfull", data: finalData })
        
    }catch(err){console.log(err.message)}
    

}

module.exports = { loginUser, getUserById };