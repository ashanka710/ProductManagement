const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const { validateObjectId } = require('../validators/validator')


const createCart = async (req, res) => {
    try {
        const userId = req.params.userId
        const data = req.body

        const { cartId, productId } = data


        if (!productId || !validateObjectId(productId)) return res.status(404).send({ status: false, message: "productId must be present and valid" })

        if (cartId || (!cartId && cartId != undefined)) {
            if (!cartId || !validateObjectId(cartId)) return res.status(404).send({ status: false, message: "cartId must be valid and non empty" })
        }


        const product = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
        if (!product) return res.status(404).send({ status: false, message: `No product found with this id: ${productId}` })

        let cart = await cartModel.findOne({ _id: cartId })
        if (!cart) {
            const user = await cartModel.findOne({ userId: userId })
            if (user) return res.status(404).send({ status: false, message: `user id: ${userId} must be unique for creating new cart` })
            cart = new cartModel({
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: 1
                }],
                totalPrice: product.price,
                totalItems: 1,
            })
            await cart.save()
            return res.status(201).send({ status: true, message: "Cart created successfully", data: cart })
        }
        else {
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId == productId) {
                    cart.items[i].quantity += 1
                    cart.totalPrice += product.price
                    await cart.save()
                    return res.status(200).send({ status: true, message: "product added in cart", data: cart })
                }
            }
            const pushedCart = await cartModel.findOneAndUpdate(
                { _id: cartId },
                {
                    $push: { "items": { productId: productId, quantity: 1 } },
                    $inc: { totalItems: 1, "totalPrice": product.price }
                },
                { new: true }
            )
            return res.status(201).send({ status: true, message: "product pushed in cart", data: pushedCart })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const getCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (req.token.userId != userId)
            return res.status(403).send({ status: false, message: "Not Authorised" })
        const userCart = await cartModel.findOne({ userId: userId }).populate({
            path: "items.productId",
            select: {
                _id: 1,
                title: 1,
                description: 1,
                price: 1,
                productImage: 1,
                style: 1,
            },
        });
        if (!userCart) {
            return res.status(404).send({ status: false, message: "no cart Found" });
        }

        res.status(200).send({ status: true, message: "Success", data: userCart });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
};

const deleteCart = async (req, res) => {
    try {
        const userId = req.params.userId

        const cart = {
            items: [],
            totalItems: 0,
            totalPrice: 0,
        };
        if (req.token.userId != userId)
            return res.status(403).send({ status: false, message: "Not Authorised" })
        const updatedCart = await cartModel.findOneAndUpdate({ userId: userId }, cart);
        if (!updatedCart) {
            return res.status(404).send({ status: false, message: "No cart Found" });
        }
        res.status(204).send({ status: true, message: "cart is deleted" });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}



module.exports = { createCart, getCart, deleteCart, }