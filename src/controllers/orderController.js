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
        const orderCreated = await (
            (await orderModel.create(response))
        ).populate({
            path: "items.productId",
            select: {
                _id: 1,
                title: 1,
                description: 1,
                price: 1,
                productImage: 1,
                style: 1
            },
        });
     

        // just to update the cart DB after order is placed
        const updatedCart = await cartModel.findOneAndUpdate(
            { _id: cartId, userId: userId },
            { $set: { items: [], totalPrice: 0, totalItems: 0 } }
        )

        return res.status(201).send({ status: true, message: "Success", data: orderCreated });
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

        if (!orderId || !validateObjectId(orderId)) return res.status(400).send({ status: false, message: "orderId must be present and valid" })

        const order = await orderModel.findOne({ _id: orderId, userId: userId, isDeleted: false })
        if (!order) return res.status(400).send({ status: false, message: "Order doesn't belong to this user or deleted, provide correct orderId" })

        if (order.status == "cancelled") return res.status(400).send({ status: false, message: "Your's order is already cancelled" })

        if (status === "cancelled") {
            if (order.cancellable === true) {
                data.status = status
                data.isDeleted = true
                data.deletedAt = Date.now()
            } else {
                return res.status(400).send({ status: false, message: "Order is not cancellable" })
            }
        } else if (status === "completed") {
            data.status = status
            data.isDeleted = false
            data.deletedAt = null
        } else {
            return res.status(400).send({ status: false, message: "status should be present and cancelled or completed only" })
        }

        const updateOrder = await orderModel.findOneAndUpdate({ _id: orderId, userId: userId }, data, { new: true })
        if (updateOrder.status == "cancelled") return res.status(200).send({ status: true, message: "Success" })

        return res.status(200).send({ status: true, message: "Success", data: updateOrder })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }


}



module.exports = { createOrder, updateOrder }