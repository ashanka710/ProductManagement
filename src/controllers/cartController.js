const cartModel = require('../models/cartModel')
const getCart = async(req, res) => {
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

const deleteCart = async(req, res) => {
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
};
module.exports = { getCart, deleteCart, }