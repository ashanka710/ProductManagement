const OrderModel = require('../models/orderModel');
const UserModel = require('../models/userModel');
const CartModel = require('../models/cartModel');

const createOrder = async function (req, res) {
  try {
    const userId = req.params.userId;

    // finding user details
    const findUser = await UserModel.findOne({ _id: userId });
    if (!findUser)
      return res.status(404).send({
        status: false,
        message: `User details not found with this provided userId: ${userId}`,
      });

    const data = req.body;
    const { cartId } = data;

    // finding cart details
    const findCart = await CartModel.findOne({ _id: cartId, userId: userId });
    if (!findCart)
      return res.status(404).send({
        status: false,
        message: `Cart details are not found with the cartId: ${cartId}`,
      });

    // if cart exist => getting the total number of quantity of products
    if (findCart) {
      let array = findCart.items;
      var count = 0;
      for (let i = 0; i < array.length; i++) {
        if (array[i].quantity) {
          count += findCart.items[i].quantity;
        }
      }
    }

    // for no products in the items or cart
    if (findCart.items.length == 0)
      return res.status(400).send({
        status: false,
        message: "You have not added any products in your cart",
      });

    let response = {
      userId: findCart.userId,
      items: findCart.items,
      totalPrice: findCart.totalPrice,
      totalItems: findCart.totalItems,
      totalQuantity: count,
    };

    // creating the order
    const orderCreated = await OrderModel.create(response);

    // for the final response as per the readme file
    let finalResponse = {
      _id: orderCreated._id,
      userId: orderCreated.userId,
      items: orderCreated.items,
      totalPrice: orderCreated.totalPrice,
      totalItems: orderCreated.totalItems,
      totalQuantity: orderCreated.totalQuantity,
      cancellable: orderCreated.cancellable,
      status: orderCreated.status,
      createdAt: orderCreated.createdAt,
      updatedAt: orderCreated.updatedAt,
    };

    // just to update the cart DB after order is placed
    const updatedCart = await CartModel.findOneAndUpdate(
      { _id: cartId, userId: userId },
      { $set: { items: [], totalPrice: 0, totalItems: 0 } },
      { new: true }
    );
    return res
      .status(201)
      .send({ status: true, message: "Success", data: finalResponse });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.createOrder = createOrder;