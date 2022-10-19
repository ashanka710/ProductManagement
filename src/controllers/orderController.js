const orderModel = require('../models/orderModel')
const cartModel = require('../models/cartModel')
const { validateObjectId } = require("../validators/validator")


const createOrder = async function (req, res) {
    try {
        const userId = req.params.userId;
        const data = req.body

        let { cartId, cancellable } = data

        if (!cartId || !validateObjectId(cartId)) return res.status(400).send({ status: false, message: "cartId must be present and valid" })


        // finding cart details
        const findCart = await cartModel.findOne({ _id: cartId, userId: userId });
        if (!findCart) return res.status(404).send({ status: false, message: `Cart details are not found with the cartId: ${cartId}` })


        // if cart exist => getting the total number of quantity of products
        if (findCart) {
            if (findCart.items.length == 0) return res.status(400).send({ status: false, message: "You have not added any products in your cart" })
            var count = 0;
            for (let i = 0; i < findCart.items.length; i++) {
                if (findCart.items[i].quantity) {
                    count += findCart.items[i].quantity;
                }
            }
        }

        if (cancellable) {
            if (typeof cancellable != "boolean") return res.status(400).send({ status: false, message: "cancellable should be in true or false only" })
        }

        let response = {
            userId: findCart.userId,
            items: findCart.items,
            totalPrice: findCart.totalPrice,
            totalItems: findCart.totalItems,
            totalQuantity: count,
            cancellable: cancellable,
            status: "pending"
        }

        // creating the order
        const orderCreated = await orderModel.create(response)

        // just to update the cart DB after order is placed
        const updatedCart = await cartModel.findOneAndUpdate(
            { _id: cartId, userId: userId },
            { $set: { items: [], totalPrice: 0, totalItems: 0 } }
        )

        return res.status(201).send({ status: true, message: "Order created successfully", data: orderCreated });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}





const updateOrder = async (req, res) => {
    try {
        const userId = req.params.userId

        const data = req.body
        let { orderId, status } = data

        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Please provide field to update" })

        const order = await orderModel.findOneAndUpdate({ _id: orderId, userId: userId })
        if (!order) return res.status(400).send({ status: false, message: "Order doesn't belong to this user, provide correct orderId" })

        if (status === "cancled") {
            if (order.cancellable === true) {
                status = "cancled"
            }else {
                return res.status(400).send({ status: false, message: "Order is not cancellable" })
            }
        } else if (status === "completed") {
            status = "completed"
        } else {
            return res.status(400).send({ status: false, message: "status should be present and cancled or completed only" })
        }

        const updateOrder = await orderModel.findOneAndUpdate({ _id: orderId, userId: userId }, {status: status}, {new: true})
        return res.status(200).send({ status: false, message: "Updated order succesfully", data:  updateOrder})

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }


}



module.exports = { createOrder, updateOrder }