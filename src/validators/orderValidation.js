const OrderModel = require("../model/orderModel");
const UserModel = require("../model/userModel");
const CartModel = require("../model/cartModel");

const {
  isValidObjectId,
  isValid,
  isValidRequest,
} = require("../validator/validator");

const orderValidation = async function (req, res) {
  try {
    const userId = req.params.userId;
    const data = req.body;
    const { cartId } = data;

    // validation for userId
    if (!isValidObjectId(userId))
      return res.status(400).send({
        status: false,
        message: `The given userId: ${userId} is not in proper format`,
      });
    //Finding users details
    if (!findUser)
      return res.status(404).send({
        status: false,
        message: `User details not found with this provided userId: ${userId}`,
      });

    //checking for the empty body
    if (!isValidRequest(data))
      return res
        .status(400)
        .send({ status: true, message: "Request body cannot remain empty" });

    // validation for cartId
    if (!isValid(cartId))
      return res
        .status(400)
        .send({ status: false, message: "CartId is required" });
    if (!isValidObjectId(cartId))
      return res.status(400).send({
        status: false,
        message: `The given cartId: ${cartId} is not in proper format`,
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports.orderValidation = orderValidation;